// scripts/backup/lib.mjs — Shared encryption (AES-256-GCM), hashing, and S3 SigV4 helpers
import crypto from 'node:crypto';

const MAGIC = Buffer.from('LCDKHBK1', 'ascii'); // 8 bytes
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function encryptBufferAES256GCM(plainBuf, passphrase) {
  if (!passphrase || String(passphrase).length < 16) {
    throw new Error('BACKUP_ENCRYPTION_KEY phải có độ dài tối thiểu 16 ký tự.');
  }
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = crypto.scryptSync(passphrase, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plainBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, salt, iv, tag, enc]);
}

export function decryptBufferAES256GCM(cipherBuf, passphrase) {
  if (!passphrase) {
    throw new Error('Thiếu khóa giải mã BACKUP_ENCRYPTION_KEY.');
  }
  const minLen = MAGIC.length + SALT_LEN + IV_LEN + TAG_LEN;
  if (!Buffer.isBuffer(cipherBuf) || cipherBuf.length < minLen) {
    throw new Error('Tệp backup mã hóa bị hỏng hoặc quá ngắn.');
  }
  const head = cipherBuf.subarray(0, MAGIC.length);
  if (!head.equals(MAGIC)) {
    throw new Error('Định dạng tệp backup không khớp chuẩn LCDKHBK1.');
  }
  let pos = MAGIC.length;
  const salt = cipherBuf.subarray(pos, pos + SALT_LEN); pos += SALT_LEN;
  const iv = cipherBuf.subarray(pos, pos + IV_LEN); pos += IV_LEN;
  const tag = cipherBuf.subarray(pos, pos + TAG_LEN); pos += TAG_LEN;
  const body = cipherBuf.subarray(pos);

  const key = crypto.scryptSync(passphrase, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

function hmac(key, msg) {
  return crypto.createHmac('sha256', key).update(msg).digest();
}

export function signS3Request({
  method,
  endpoint,
  bucket,
  key = '',
  query = '',
  region = 'auto',
  accessKeyId,
  secretAccessKey,
  body = Buffer.alloc(0),
  contentType = 'application/octet-stream'
}) {
  const baseUrl = new URL(endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint);
  const cleanKey = key ? '/' + key.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/') : '';
  const path = `${baseUrl.pathname.replace(/\/$/, '')}/${encodeURIComponent(bucket)}${cleanKey}`;
  const fullUrl = `${baseUrl.origin}${path}${query ? '?' + query : ''}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);

  const headers = {
    host: baseUrl.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate
  };
  if (method === 'PUT') headers['content-type'] = contentType;

  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys.map(k => `${k}:${headers[k]}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalQuery = query
    ? query.split('&').filter(Boolean).sort().join('&')
    : '';

  const canonicalRequest = [
    method,
    path,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256Hex(canonicalRequest)
  ].join('\n');

  const kDate = hmac('AWS4' + secretAccessKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return { url: fullUrl, headers };
}

export async function s3Request(opts) {
  const signed = signS3Request(opts);
  const res = await fetch(signed.url, {
    method: opts.method,
    headers: signed.headers,
    body: opts.method === 'PUT' || opts.method === 'POST' ? opts.body : undefined
  });
  return res;
}

export function formatVnTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(' ', 'T') + '+07:00';
}
