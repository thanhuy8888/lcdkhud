// scripts/backup/restore.mjs — Non-production restore verification script (local/staging ONLY)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { decryptBufferAES256GCM, s3Request, sha256Hex } from './lib.mjs';

export function verifyRestoreGuard(env = process.env) {
  const targetEnv = String(env.RESTORE_TARGET_ENV || '').trim().toLowerCase();
  if (!['local', 'staging'].includes(targetEnv)) {
    throw new Error('CHẶN AN TOÀN: RESTORE_TARGET_ENV bắt buộc phải là "local" hoặc "staging". Tuyệt đối không khôi phục đè lên production.');
  }
  if (env.RESTORE_CONFIRM_NON_PROD !== 'YES') {
    throw new Error('CHẶN AN TOÀN: Yêu cầu RESTORE_CONFIRM_NON_PROD=YES để xác nhận môi trường thử nghiệm tách biệt.');
  }
  const dbUrl = String(env.TARGET_DB_URL || '');
  const supaUrl = String(env.TARGET_SUPABASE_URL || '');
  if (env.RESTORE_PROD_HOST && (dbUrl.includes(env.RESTORE_PROD_HOST) || supaUrl.includes(env.RESTORE_PROD_HOST))) {
    throw new Error('CHẶN AN TOÀN: Phát hiện chuỗi kết nối trùng với host Production!');
  }
  if (!dbUrl || !env.BACKUP_ENCRYPTION_KEY) {
    throw new Error('Thiếu TARGET_DB_URL hoặc BACKUP_ENCRYPTION_KEY.');
  }
}

export async function unpackAndVerifyBackup(encBuffer, encryptionKey) {
  const gz = decryptBufferAES256GCM(encBuffer, encryptionKey);
  const jsonBuf = zlib.gunzipSync(gz);
  const bundle = JSON.parse(jsonBuf.toString('utf8'));
  const { manifest } = bundle;
  if (!manifest || !bundle.db_dump_base64) {
    throw new Error('Gói backup không chứa manifest hoặc bản dump PostgreSQL hợp lệ.');
  }
  const dumpBuf = Buffer.from(bundle.db_dump_base64, 'base64');
  if (sha256Hex(dumpBuf) !== manifest.db_dump_sha256) {
    throw new Error('Sai lệch mã băm SHA-256 của bản dump cơ sở dữ liệu.');
  }

  const verifiedFiles = [];
  const manifestMap = new Map((manifest.storage_objects || []).map(o => [o.path, o]));
  for (const f of bundle.storage_files || []) {
    const bin = Buffer.from(f.content_base64, 'base64');
    const expected = manifestMap.get(f.path);
    if (!expected || expected.sha256 !== sha256Hex(bin) || expected.size !== bin.length) {
      throw new Error(`Sai lệch checksum hoặc kích thước tệp Storage: ${f.path}`);
    }
    verifiedFiles.push({ path: f.path, buffer: bin, sha256: expected.sha256, size: expected.size });
  }
  return { manifest, dumpBuf, authSql: bundle.auth_users_sql_base64 ? Buffer.from(bundle.auth_users_sql_base64, 'base64') : null, verifiedFiles };
}

export async function runRestore(env = process.env) {
  const startedAt = Date.now();
  verifyRestoreGuard(env);

  let encBuf;
  if (env.BACKUP_FILE_PATH) {
    encBuf = fs.readFileSync(env.BACKUP_FILE_PATH);
  } else if (env.BACKUP_S3_KEY) {
    const res = await s3Request({
      method: 'GET',
      endpoint: env.BACKUP_S3_ENDPOINT,
      bucket: env.BACKUP_S3_BUCKET,
      region: env.BACKUP_S3_REGION || 'auto',
      accessKeyId: env.BACKUP_S3_ACCESS_KEY_ID,
      secretAccessKey: env.BACKUP_S3_SECRET_ACCESS_KEY,
      key: env.BACKUP_S3_KEY
    });
    if (!res.ok) throw new Error(`Không tải được tệp backup từ S3 (HTTP ${res.status}).`);
    encBuf = Buffer.from(await res.arrayBuffer());
  } else {
    throw new Error('Cần cung cấp BACKUP_FILE_PATH hoặc BACKUP_S3_KEY.');
  }

  const { manifest, dumpBuf, verifiedFiles } = await unpackAndVerifyBackup(encBuf, env.BACKUP_ENCRYPTION_KEY);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lcdkhud-restore-'));
  try {
    const dumpPath = path.join(tmpDir, 'restore_public.dump');
    fs.writeFileSync(dumpPath, dumpBuf);

    // Khôi phục DB vào local/staging
    execFileSync('pg_restore', [
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      '-d', env.TARGET_DB_URL,
      dumpPath
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    // Khôi phục Storage objects nếu có cấu hình Target Supabase Storage
    let restoredStorage = 0;
    if (env.TARGET_SUPABASE_URL && env.TARGET_SUPABASE_SERVICE_ROLE_KEY) {
      const bucket = manifest.storage_bucket || 'lcdkhud-files';
      for (const f of verifiedFiles) {
        const encoded = f.path.split('/').map(encodeURIComponent).join('/');
        const up = await fetch(`${env.TARGET_SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${bucket}/${encoded}`, {
          method: 'POST',
          headers: {
            apikey: env.TARGET_SUPABASE_SERVICE_ROLE_KEY,
            authorization: `Bearer ${env.TARGET_SUPABASE_SERVICE_ROLE_KEY}`,
            'x-upsert': 'true',
            'content-type': 'application/octet-stream'
          },
          body: f.buffer
        });
        if (!up.ok) throw new Error(`Khôi phục Storage object ${f.path} lỗi HTTP ${up.status}`);
        restoredStorage++;
      }
    }

    const rtoMs = Date.now() - startedAt;
    const report = {
      ok: true,
      targetEnv: env.RESTORE_TARGET_ENV,
      backupCreatedAtVn: manifest.created_at_vn,
      restoredTableCounts: manifest.table_counts,
      verifiedStorageFiles: verifiedFiles.length,
      restoredStorageFiles: restoredStorage,
      rtoMs,
      rpoHoursMax: 24
    };
    console.log(JSON.stringify(report, null, 2));
    return report;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runRestore(process.env).catch(err => {
    console.error('[RESTORE FAILED]', err.message);
    process.exit(1);
  });
}
