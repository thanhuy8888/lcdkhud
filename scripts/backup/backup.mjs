// scripts/backup/backup.mjs — Automated consistent DB + Storage backup (encrypted AES-256-GCM)
// Note: Does NOT print PII, passwords, or service_role keys to logs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encryptBufferAES256GCM, decryptBufferAES256GCM, formatVnTimestamp, s3Request, sha256Hex } from './lib.mjs';

const STORAGE_BUCKET = 'lcdkhud-files';
const TABLES = ['chi_doan', 'nhan_su', 'ke_hoach', 'moc_cong_tac', 'bao_cao', 'hoat_dong', 'doan_vien', 'sinh_hoat', 'diem_danh', 'tep_tin', 'profiles'];

function requireEnv(env, keys) {
  const missing = keys.filter(k => !env[k] || !String(env[k]).trim());
  if (missing.length) {
    throw new Error(`Thiếu biến môi trường bắt buộc để backup: ${missing.join(', ')}`);
  }
}

async function listAllStorageObjects(supabaseUrl, serviceKey, bucket, prefix = '') {
  const results = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ prefix, limit, offset, sortBy: { column: 'name', order: 'asc' } })
    });
    if (!res.ok) {
      throw new Error(`Storage list lỗi HTTP ${res.status}`);
    }
    const items = await res.json();
    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        const sub = await listAllStorageObjects(supabaseUrl, serviceKey, bucket, fullPath);
        results.push(...sub);
      } else {
        results.push({ path: fullPath, size: item.metadata?.size ?? null, updated_at: item.updated_at || null });
      }
    }
    if (items.length < limit) break;
    offset += limit;
  }
  return results;
}

async function downloadStorageObject(supabaseUrl, serviceKey, bucket, objectPath) {
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/authenticated/${bucket}/${encoded}`, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`
    }
  });
  if (!res.ok) {
    throw new Error(`Tải Storage object "${objectPath}" lỗi HTTP ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function fetchTableCounts(supabaseUrl, serviceKey) {
  const counts = {};
  for (const tbl of TABLES) {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tbl}?select=id`, {
      method: 'HEAD',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        prefer: 'count=exact'
      }
    });
    if (res.ok) {
      const range = res.headers.get('content-range') || '';
      const total = range.includes('/') ? Number(range.split('/')[1]) : null;
      counts[tbl] = Number.isFinite(total) ? total : null;
    } else {
      counts[tbl] = null;
    }
  }
  return counts;
}

export async function applyRetention(s3Cfg, retentionDays = 14) {
  const cutoffMs = Date.now() - Math.max(1, Number(retentionDays)) * 86400 * 1000;
  const listRes = await s3Request({
    method: 'GET',
    ...s3Cfg,
    query: 'list-type=2&prefix=lcdkhud-backups/'
  });
  if (!listRes.ok) {
    throw new Error(`Không liệt kê được bucket retention (HTTP ${listRes.status}).`);
  }
  const xml = await listRes.text();
  const keyMatches = [...xml.matchAll(/<Contents>[\s\S]*?<Key>([^<]+)<\/Key>[\s\S]*?<LastModified>([^<]+)<\/LastModified>[\s\S]*?<\/Contents>/g)];
  let deleted = 0;
  for (const m of keyMatches) {
    const key = m[1];
    const modifiedMs = Date.parse(m[2]);
    if (Number.isFinite(modifiedMs) && modifiedMs < cutoffMs) {
      const delRes = await s3Request({ method: 'DELETE', ...s3Cfg, key });
      if (!delRes.ok) throw new Error(`Xoá bản cũ "${key}" lỗi HTTP ${delRes.status}`);
      deleted++;
    }
  }
  return deleted;
}

export async function runBackup(env = process.env) {
  const startedAt = new Date();
  requireEnv(env, [
    'SUPABASE_DB_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'BACKUP_ENCRYPTION_KEY',
    'BACKUP_S3_ENDPOINT',
    'BACKUP_S3_BUCKET',
    'BACKUP_S3_ACCESS_KEY_ID',
    'BACKUP_S3_SECRET_ACCESS_KEY'
  ]);

  const retentionDays = Number(env.BACKUP_RETENTION_DAYS || 14);
  const s3Cfg = {
    endpoint: env.BACKUP_S3_ENDPOINT,
    bucket: env.BACKUP_S3_BUCKET,
    region: env.BACKUP_S3_REGION || 'auto',
    accessKeyId: env.BACKUP_S3_ACCESS_KEY_ID,
    secretAccessKey: env.BACKUP_S3_SECRET_ACCESS_KEY
  };

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lcdkhud-backup-'));
  try {
    const dumpPath = path.join(tmpDir, 'db_public.dump');
    const authDumpPath = path.join(tmpDir, 'db_auth_users.sql');

    // 1. Consistent PostgreSQL logical dump (--no-owner --no-privileges for clean restore across projects)
    execFileSync('pg_dump', [
      '--format=custom',
      '--compress=6',
      '--no-owner',
      '--no-privileges',
      '--schema=public',
      `--file=${dumpPath}`,
      env.SUPABASE_DB_URL
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    const dumpBuf = fs.readFileSync(dumpPath);
    const dbDumpSha256 = sha256Hex(dumpBuf);

    // Optional Auth users id/email mapping dump for full identity recovery
    let authDumpBuf = null;
    if (env.BACKUP_INCLUDE_AUTH_MAP !== 'false') {
      execFileSync('pg_dump', [
        '--data-only',
        '--inserts',
        '--no-owner',
        '--no-privileges',
        '--table=auth.users',
        `--file=${authDumpPath}`,
        env.SUPABASE_DB_URL
      ], { stdio: ['ignore', 'pipe', 'pipe'] });
      authDumpBuf = fs.readFileSync(authDumpPath);
    }

    // 2. Consistent Storage binary download & checksum verification
    const countsBefore = await fetchTableCounts(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const objects = await listAllStorageObjects(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, STORAGE_BUCKET);
    const storageEntries = [];
    for (const obj of objects) {
      const bin = await downloadStorageObject(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, STORAGE_BUCKET, obj.path);
      storageEntries.push({
        path: obj.path,
        size: bin.length,
        sha256: sha256Hex(bin),
        updated_at: obj.updated_at,
        content_base64: bin.toString('base64')
      });
    }
    const countsAfter = await fetchTableCounts(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const concurrentChanges = TABLES.filter(t => countsBefore[t] !== countsAfter[t]);

    // 3. Build manifest + compressed encrypted archive
    const manifest = {
      format_version: '1.0',
      created_at_utc: startedAt.toISOString(),
      created_at_vn: formatVnTimestamp(startedAt),
      retention_days: retentionDays,
      concurrent_count_drift_tables: concurrentChanges,
      table_counts: countsAfter,
      db_dump_size: dumpBuf.length,
      db_dump_sha256: dbDumpSha256,
      auth_users_included: Boolean(authDumpBuf),
      auth_users_sha256: authDumpBuf ? sha256Hex(authDumpBuf) : null,
      storage_bucket: STORAGE_BUCKET,
      storage_objects: storageEntries.map(({ path: p, size, sha256, updated_at }) => ({ path: p, size, sha256, updated_at }))
    };

    const rawBundle = Buffer.from(JSON.stringify({
      manifest,
      db_dump_base64: dumpBuf.toString('base64'),
      auth_users_sql_base64: authDumpBuf ? authDumpBuf.toString('base64') : null,
      storage_files: storageEntries.map(({ path: p, content_base64 }) => ({ path: p, content_base64 }))
    }));
    const gzipped = zlib.gzipSync(rawBundle);
    const encrypted = encryptBufferAES256GCM(gzipped, env.BACKUP_ENCRYPTION_KEY);
    const encSha256 = sha256Hex(encrypted);

    // Self-verify local decryption before upload
    const verifyGunzip = decryptBufferAES256GCM(encrypted, env.BACKUP_ENCRYPTION_KEY);
    if (sha256Hex(zlib.gunzipSync(verifyGunzip)) !== sha256Hex(rawBundle)) {
      throw new Error('Kiểm tra tự giải mã bản backup thất bại.');
    }

    // 4. Upload to external private S3 storage
    const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
    const remoteKey = `lcdkhud-backups/lcdkhud_${stamp}.bak.enc`;
    const putEnc = await s3Request({ method: 'PUT', ...s3Cfg, key: remoteKey, body: encrypted });
    if (!putEnc.ok) throw new Error(`Upload backup lên S3 thất bại (HTTP ${putEnc.status}).`);

    const putSha = await s3Request({
      method: 'PUT',
      ...s3Cfg,
      key: `${remoteKey}.sha256`,
      body: Buffer.from(`${encSha256}  ${path.basename(remoteKey)}\n`),
      contentType: 'text/plain;charset=utf-8'
    });
    if (!putSha.ok) throw new Error(`Upload checksum SHA-256 thất bại (HTTP ${putSha.status}).`);

    // 5. Verify uploaded object via HEAD before applying retention
    const headRes = await s3Request({ method: 'HEAD', ...s3Cfg, key: remoteKey });
    const remoteLen = Number(headRes.headers.get('content-length') || 0);
    if (!headRes.ok || remoteLen !== encrypted.length) {
      throw new Error(`Xác minh file backup trên kho lưu trữ thất bại (HEAD=${headRes.status}, size=${remoteLen}/${encrypted.length}).`);
    }

    const pruned = await applyRetention(s3Cfg, retentionDays);
    const result = {
      ok: true,
      remoteKey,
      encryptedBytes: encrypted.length,
      sha256: encSha256,
      storageCount: storageEntries.length,
      prunedOldBackups: pruned,
      durationMs: Date.now() - startedAt.getTime()
    };
    console.log(JSON.stringify(result));
    return result;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runBackup(process.env).catch(err => {
    console.error('[BACKUP FAILED]', err.message);
    process.exit(1);
  });
}
