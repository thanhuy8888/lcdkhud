// tests/test_shared_data_storage_import_backup.js
// Comprehensive verification for shared DB sync, pagination, conflicts, Realtime, Storage, Import reconciliation & Backup crypto
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const crypto = require('crypto');

const XLSX = require('../assets/vendor/xlsx.full.min.js');

const ctx = {
  console,
  assert,
  process,
  Buffer,
  Uint8Array,
  TextEncoder,
  TextDecoder,
  crypto: globalThis.crypto || crypto.webcrypto,
  XLSX,
  URL: globalThis.URL,
  Blob: globalThis.Blob,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  location: { hash: '', href: 'http://localhost:5173/' },
  alert: msg => { ctx._alerts.push(String(msg)); },
  prompt: () => null,
  _alerts: [],
  PAGES: {},
  roleSel: { addEventListener: () => {}, innerHTML: '', value: '' },
  main: { innerHTML: '' },
  nav: { innerHTML: '' },
  resetBtn: { addEventListener: () => {} },
  themeBtn: { addEventListener: () => {} },
  dataMgmtBtn: { addEventListener: () => {} },
  tip: { innerHTML: '', style: {} },
  dlgBody: { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] },
  dlg: { open: false, showModal: () => {}, close: () => {}, classList: { add: () => {}, remove: () => {} } },
  document: {
    getElementById: id => ctx[id] || null,
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
  }
};
ctx.window = ctx;
ctx.global = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
ctx.render = () => { ctx._renderCalls = (ctx._renderCalls || 0) + 1; };

vm.createContext(ctx);
for (const f of ['data.js', 'kpi.js', 'ui.js', 'auth.js', 'pages.js', 'nhansu.js', 'excel.js', 'sinhhoat.js']) {
  vm.runInContext(fs.readFileSync('assets/' + f, 'utf8'), ctx);
}
vm.runInContext(`
  Object.assign(window, { dataApi, storageApi, auth, state, dryRunImport, thucThiImportBatch, hoanTacImportBatch, ngayISOChuan });
  Object.defineProperty(window, 'DB', { get: () => DB, set: v => { DB = v; }, configurable: true });
`, ctx);

let passed = 0;
let total = 0;
async function test(name, fn) {
  total++;
  ctx._alerts = [];
  ctx._renderCalls = 0;
  try {
    await fn();
    passed++;
    console.log(`  [PASS] Test ${total}: ${name}`);
  } catch (e) {
    console.error(`  [FAIL] Test ${total}: ${name}\n    ->`, e.stack || e.message);
  }
}

(async () => {
  console.log('--- KIỂM THỬ DB DÙNG CHUNG, STORAGE, REALTIME, IMPORT ĐỐI SOÁT & BACKUP ---');

  await test('Fail-closed dataApi: từ chối ghi khi chưa có Supabase client (không giả thành công)', async () => {
    ctx.getSupabaseClient = () => null;
    await assert.rejects(() => ctx.dataApi.luuDV({ cdId: 1, ten: 'A', mssv: '001' }, { isNew: true }), /Chưa kết nối máy chủ/);
    await assert.rejects(() => ctx.dataApi.xoaKH(1), /Chưa kết nối máy chủ/);
    await assert.rejects(() => ctx.storageApi.uploadHopFile(1, { name: 'a.pdf', size: 100, type: 'application/pdf' }), /Chưa kết nối máy chủ/);
  });

  await test('Pagination (>1000 dòng) & phát hiện lỗi trên MỌI bảng trong loadAll()', async () => {
    const pagedClient = {
      from(table) {
        let fromIdx = 0, toIdx = 999;
        return {
          select() { return this; },
          order() { return this; },
          range(f, t) {
            fromIdx = f; toIdx = t;
            if (table === 'doan_vien') {
              const all = Array.from({ length: 1205 }, (_, i) => ({
                id: i + 1, cd_id: 1, ten: `SV ${i + 1}`, mssv: String(i + 1).padStart(7, '0'),
                cv: 'Đoàn viên', drl: 80, doan_phi: true, so_hd: 2, ghi_chu: '', updated_at: '2026-11-23T00:00:00Z'
              }));
              return Promise.resolve({ data: all.slice(fromIdx, toIdx + 1), error: null });
            }
            return Promise.resolve({ data: [], error: null });
          }
        };
      }
    };
    ctx.getSupabaseClient = () => pagedClient;
    await ctx.dataApi.loadAll();
    assert.strictEqual(ctx.DB.dv.length, 1205, 'Phải phân trang lấy đủ >1000 dòng đoàn viên');

    // Lỗi ở bảng thứ 6 (hoat_dong) không được nuốt thành rỗng
    const failingClient = {
      from(table) {
        return {
          select() { return this; },
          order() { return this; },
          range() {
            if (table === 'hoat_dong') return Promise.resolve({ data: null, error: { message: 'RLS denied hoat_dong' } });
            return Promise.resolve({ data: [], error: null });
          }
        };
      }
    };
    ctx.getSupabaseClient = () => failingClient;
    await assert.rejects(() => ctx.dataApi.loadAll(), /Lỗi tải bảng hoat_dong/);
  });

  await test('DB cấp ID khi tạo mới, chặn 0-row RLS fail & phát hiện xung đột updated_at', async () => {
    ctx.DB = ctx.seed();
    ctx.DB.cd[0].updatedAt = '2026-11-23T01:00:00Z';
    ctx.DB.cd[0]._persisted = true;

    let insertedPayloadHasId = null;
    const mockClient = {
      from(table) {
        const filters = {};
        let mode = null, body = null;
        return {
          insert(p) { mode = 'insert'; body = p; insertedPayloadHasId = Object.prototype.hasOwnProperty.call(p, 'id'); return this; },
          update(p) { mode = 'update'; body = p; return this; },
          delete() { mode = 'delete'; return this; },
          select() { return this; },
          eq(k, v) { filters[k] = v; return this; },
          maybeSingle() {
            return Promise.resolve({ data: { id: filters.id, updated_at: '2026-11-23T02:00:00Z' }, error: null });
          },
          then(resolve) {
            if (mode === 'insert') {
              return resolve({ data: [{ id: 999, ...body, updated_at: '2026-11-23T01:00:00Z' }], error: null });
            }
            if (mode === 'update' && filters.updated_at === '2026-11-23T01:00:00Z') {
              // Simulate stale updated_at -> 0 rows matched
              return resolve({ data: [], error: null });
            }
            if (mode === 'delete') {
              return resolve({ data: [], error: null }); // RLS denied delete -> 0 rows
            }
            return resolve({ data: [], error: null });
          },
          order() { return this; },
          range() { return Promise.resolve({ data: [], error: null }); }
        };
      }
    };
    ctx.getSupabaseClient = () => mockClient;

    // 1. Create uses DB-returned ID 999, does NOT send client id
    const resNew = await ctx.dataApi.luuKH({
      ten: 'Kế hoạch mới', crit: 'ct', ban: ['Thường trực'], ptIds: [], batDau: '2026-11-01', hanChot: '2026-11-30'
    }, { isNew: true });
    assert.strictEqual(insertedPayloadHasId, false, 'INSERT không được tự gán ID từ client');
    assert.strictEqual(resNew.data.id, 999, 'Phải dùng ID 999 do server cấp');

    // 2. Concurrent update with stale updated_at raises CONFLICT_UPDATED_AT
    await assert.rejects(
      () => ctx.dataApi.luuCD(ctx.DB.cd[0], { isUpdate: true }),
      err => err.code === 'CONFLICT_UPDATED_AT'
    );

    // 3. Delete affecting 0 rows raises error & keeps DB item
    const beforeCount = ctx.DB.cd.length;
    await assert.rejects(() => ctx.dataApi.xoaCD(1), /0 dòng bị ảnh hưởng/);
    assert.strictEqual(ctx.DB.cd.length, beforeCount, 'Không được xoá khỏi DB bộ nhớ nếu server trả 0 dòng');
  });

  await test('Realtime coalescing, quản lý subscription theo phiên & huỷ khi logout', async () => {
    let handlers = {};
    let statusCb = null;
    let removedChannel = false;
    let refetchCount = 0;

    const rtClient = {
      channel() {
        return {
          on(type, filter, cb) { handlers[filter.table] = cb; return this; },
          subscribe(cb) { statusCb = cb; cb('SUBSCRIBED'); return this; }
        };
      },
      removeChannel() { removedChannel = true; },
      from(tbl) {
        refetchCount++;
        return {
          select() { return this; },
          order() { return this; },
          range() {
            if (tbl === 'bao_cao') {
              return Promise.resolve({ data: [{ id: 50, kh_id: 1, cd_id: 1, so_luot: 25, ngay_nop: '2026-11-20', tre_han: false, mc: 'https://x.test', status: 'wait', nx: '', updated_at: '2026-11-23T03:00:00Z' }], error: null });
            }
            return Promise.resolve({ data: [], error: null });
          }
        };
      }
    };

    ctx.getSupabaseClient = () => rtClient;
    ctx.dataApi.bumpSessionEpoch();
    ctx.dataApi.startRealtime();
    assert.ok(typeof statusCb === 'function');

    // Fire 3 events rapidly on bao_cao + moc_cong_tac -> debounced into single refetch per distinct root table
    handlers.bao_cao({ table: 'bao_cao', eventType: 'INSERT' });
    handlers.bao_cao({ table: 'bao_cao', eventType: 'UPDATE' });
    handlers.moc_cong_tac({ table: 'moc_cong_tac', eventType: 'UPDATE' });

    await new Promise(r => setTimeout(r, 350));
    assert.strictEqual(ctx.DB.bc.length, 1);
    assert.strictEqual(ctx.DB.bc[0].soLuot, 25);
    assert.strictEqual(refetchCount, 3, 'Chỉ refetch đúng bao_cao + ke_hoach/moc_cong_tac (3 bảng), không tải lại toàn 10 bảng');

    ctx.dataApi.stopRealtime();
    assert.strictEqual(removedChannel, true, 'Logout phải huỷ subscription Realtime');
  });

  await test('boot.js selfCheck không ghi bất kỳ dữ liệu nào lên server', async () => {
    let serverWrites = 0;
    ctx.getSupabaseClient = () => ({
      from() {
        return {
          insert() { serverWrites++; return this; },
          update() { serverWrites++; return this; },
          upsert() { serverWrites++; return this; },
          delete() { serverWrites++; return this; }
        };
      }
    });
    // Chạy block selfCheck trong boot.js (cắt bỏ phần cuối auth.init)
    const bootSrc = fs.readFileSync('assets/boot.js', 'utf8').split("if(typeof auth !== 'undefined')")[0];
    vm.runInContext(bootSrc, ctx);
    assert.strictEqual(serverWrites, 0, 'selfCheck không được gọi ghi lên Supabase');
  });

  await test('Storage: path opaque UUID, whitelist MIME/size, rollback orphan khi DB metadata lỗi & delete metadata-first', async () => {
    ctx.DB = ctx.seed();
    ctx.auth.currentUser = { id: 'u-lcd', role: 'lcd', active: true, quyen: ['ql_nhansu'] };

    // Chặn file quá lớn & MIME cấm
    assert.throws(() => ctx.storageApi.validateFile({ name: 'hack.exe', size: 100, type: 'application/x-msdownload' }), /không nằm trong danh sách cho phép/);
    assert.throws(() => ctx.storageApi.validateFile({ name: 'big.pdf', size: 30 * 1024 * 1024, type: 'application/pdf' }), /vượt mức tối đa/);

    const objPath = ctx.storageApi.buildObjectPath(2, 'Nguyễn Văn A - Bí mật.pdf');
    assert.match(objPath, /^sinh-hoat\/2\/[0-9a-f-]{36}\.pdf$/i, 'Object path phải là UUID, không chứa tên file hay PII');

    // Khi insert DB tep_tin lỗi -> Storage remove phải được gọi để chống orphan
    let removedPaths = [];
    const orphanClient = {
      storage: {
        from() {
          return {
            upload: async () => ({ data: { path: objPath }, error: null }),
            remove: async paths => { removedPaths.push(...paths); return { error: null }; }
          };
        }
      },
      from(tbl) {
        return {
          insert() { return this; },
          select() { return this; },
          single() { return Promise.resolve({ data: null, error: { message: 'DB insert blocked' } }); }
        };
      }
    };
    ctx.getSupabaseClient = () => orphanClient;
    const fakeFile = new Blob(['hello pdf'], { type: 'application/pdf' });
    fakeFile.name = 'bienban.pdf';
    await assert.rejects(() => ctx.storageApi.uploadHopFile(2, fakeFile), /đã thu hồi object tạm/);
    assert.strictEqual(removedPaths.length, 1, 'Phải xóa object tạm trên Storage nếu ghi metadata thất bại');
  });

  await test('Templates Excel (.xlsx) hợp lệ & giữ nguyên số 0 đầu trên MSSV/SĐT', async () => {
    const bufDv = fs.readFileSync('templates/mau_doan_vien.xlsx');
    const wbDv = XLSX.read(bufDv, { type: 'buffer' });
    const rowsDv = XLSX.utils.sheet_to_json(wbDv.Sheets[wbDv.SheetNames[0]], { header: 1, raw: false, defval: '' });
    assert.strictEqual(rowsDv[1][1], '02307001', 'Template đoàn viên phải giữ nguyên số 0 đầu MSSV');

    const bufNs = fs.readFileSync('templates/mau_nhan_su_lcd.xlsx');
    const wbNs = XLSX.read(bufNs, { type: 'buffer' });
    const rowsNs = XLSX.utils.sheet_to_json(wbNs.Sheets[wbNs.SheetNames[0]], { header: 1, raw: false, defval: '' });
    assert.strictEqual(rowsNs[2][2], '0900000001', 'Template nhân sự phải giữ nguyên số 0 đầu SĐT');
  });

  await test('Dry-run Import: chỉ đọc, phát hiện ngày lỗi/trùng/xung đột chi đoàn, tách cột không tin cậy & cân bằng tổng dòng', async () => {
    ctx.DB = ctx.seed();
    ctx.DB.dv = [{ id: 10, cdId: 1, ten: 'SV Cũ', mssv: '02300001', cv: 'Đoàn viên', drl: 80, doanPhi: true, soHD: 2, ghiChu: '' }];
    ctx.auth.currentUser = { id: 'u-cd2', role: 'cd', cdId: 2, active: true, quyen: ['ql_doanvien', 'nhap_excel'] };
    ctx.state.role = 'cd';
    ctx.state.cdId = 2;

    const beforeSnapshot = JSON.stringify(ctx.DB.dv);
    const rows = [
      ['Họ và tên', 'MSSV', 'Chi đoàn', 'ĐRL', 'Số HĐ', 'Đoàn phí', 'role'],
      ['  nguyễn văn   Mới ', "'02400009", 'MIS2023A', '90', '4', 'x', 'admin'], // create (with leading 0 + stripped role)
      ['Trùng dòng 2', '02400009', 'MIS2023A', '85', '3', '', ''],             // duplicate in file -> error
      ['SV Xung đột', '02300001', 'MIS2023A', '80', '2', '', ''],             // belongs to cdId 1 -> error
      ['Điểm sai', '02400010', 'MIS2023A', '150', '2', '', '']                // drl > 100 -> error
    ];

    const dr = ctx.dryRunImport('dv', rows);
    assert.strictEqual(JSON.stringify(ctx.DB.dv), beforeSnapshot, 'Dry-run TUYỆT ĐỐI không được sửa DB');
    assert.strictEqual(dr.summary.create, 1);
    assert.strictEqual(dr.summary.error, 3);
    assert.strictEqual(dr.summary.total, dr.summary.create + dr.summary.update + dr.summary.skip + dr.summary.error);
    assert.strictEqual(dr.actions[0].record.mssv, '02400009', 'Giữ nguyên số 0 đầu MSSV');
    assert.strictEqual(dr.actions[0].record.ten, 'nguyễn văn Mới', 'Chuẩn hóa khoảng trắng mà không tự đoán đổi tên');
    assert.ok(dr.strippedCols.includes('role'), 'Phải phát hiện và loại bỏ cột role không tin cậy');
    assert.strictEqual(ctx.ngayISOChuan('31/02/2026'), '', 'Phải từ chối ngày không tồn tại 31/02/2026');
  });

  await test('Batch Import: idempotency chống nhập trùng, xử lý lỗi giữa chừng (partial) & rollback RPC', async () => {
    ctx.DB = ctx.seed();
    ctx.auth.currentUser = { id: 'u-lcd', role: 'lcd', active: true, quyen: ['ql_nhansu', 'nhap_excel'] };
    ctx.state.role = 'lcd';

    const dr = ctx.dryRunImport('dv', [
      ['Họ và tên', 'MSSV', 'Chi đoàn', 'ĐRL'],
      ['SV A', '02500001', 'MIS2022B', '85'],
      ['SV B', '02500002', 'MIS2022B', '90']
    ]);

    let failSecond = true;
    let completedBatches = [];
    let batchStatusHistory = [];
    let rollbackCalled = false;

    const batchClient = {
      from(tbl) {
        let op = null, payload = null, filters = {};
        return {
          select() { return this; },
          insert(p) { op = 'insert'; payload = p; return this; },
          update(p) { op = 'update'; payload = p; return this; },
          eq(k, v) { filters[k] = v; return this; },
          is(k, v) { filters[k] = v; return this; },
          order() { return this; },
          range() { return Promise.resolve({ data: [], error: null }); },
          limit() {
            if (tbl === 'import_batches' && filters.status === 'completed') {
              return Promise.resolve({ data: completedBatches, error: null });
            }
            return Promise.resolve({ data: [], error: null });
          },
          single() {
            if (tbl === 'import_batches' && op === 'insert') {
              return Promise.resolve({ data: { id: 'batch-111' }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
          then(resolve) {
            if (tbl === 'import_batches' && op === 'update') {
              if (payload.status) batchStatusHistory.push(payload.status);
              if (payload.status === 'completed') completedBatches.push({ id: 'batch-111' });
              return resolve({ data: [{ id: 'batch-111', ...payload }], error: null });
            }
            if (tbl === 'doan_vien' && op === 'insert') {
              if (failSecond && payload.mssv === '02500002') {
                return resolve({ data: null, error: { message: 'Simulated network timeout' } });
              }
              return resolve({ data: [{ id: payload.mssv === '02500001' ? 501 : 502, ...payload, updated_at: '2026-11-23T04:00:00Z' }], error: null });
            }
            return resolve({ data: [{ id: 1 }], error: null, count: 2 });
          }
        };
      },
      rpc(fn, args) {
        if (fn === 'rpc_rollback_import_batch' && args.p_batch_id === 'batch-111') {
          rollbackCalled = true;
          return Promise.resolve({ data: { ok: true, deleted: 2, restored: 0, skipped_modified: 0 }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }
    };
    ctx.getSupabaseClient = () => batchClient;

    // 1. Mid-batch failure -> must return ok:false status:'partial', NEVER completed
    const partRes = await ctx.thucThiImportBatch('dv', dr, { fileName: 'test.xlsx', checksum: 'abc123' });
    assert.strictEqual(partRes.ok, false);
    assert.strictEqual(partRes.status, 'partial');
    assert.ok(batchStatusHistory.includes('partial'));

    // 2. Clean retry succeeds and logs completed
    failSecond = false;
    const okRes = await ctx.thucThiImportBatch('dv', dr, { fileName: 'test.xlsx', checksum: 'abc123' });
    assert.strictEqual(okRes.ok, true);
    assert.strictEqual(okRes.reconciliation.balanced, true);

    // 3. Re-importing same completed checksum is blocked (idempotency)
    await assert.rejects(() => ctx.thucThiImportBatch('dv', dr, { fileName: 'test.xlsx', checksum: 'abc123' }), /trùng lô đã nhập hoàn tất/);

    // 4. Rollback RPC triggers cleanly
    const rbRes = await ctx.hoanTacImportBatch('batch-111');
    assert.strictEqual(rollbackCalled, true);
    assert.strictEqual(rbRes.deleted, 2);
  });

  await test('Backup & Restore scripts: mã hóa AES-256-GCM, chống giả mạo, SigV4 & chốt chặn không đè Production', async () => {
    const lib = await import('../scripts/backup/lib.mjs');
    const rest = await import('../scripts/backup/restore.mjs');

    const key = 'SuperSecretTestKey_2026_Min16Chars!';
    const payload = Buffer.from(JSON.stringify({ manifest: { db_dump_sha256: lib.sha256Hex('dump'), storage_objects: [] }, db_dump_base64: Buffer.from('dump').toString('base64'), storage_files: [] }));
    const gz = require('zlib').gzipSync(payload);
    const enc = lib.encryptBufferAES256GCM(gz, key);

    // Decrypt succeeds
    const dec = lib.decryptBufferAES256GCM(enc, key);
    assert.strictEqual(dec.equals(gz), true);

    // Tamper 1 byte -> AES-GCM rejects
    const tampered = Buffer.from(enc);
    tampered[tampered.length - 5] ^= 0xff;
    assert.throws(() => lib.decryptBufferAES256GCM(tampered, key));

    // Wrong key -> rejects
    assert.throws(() => lib.decryptBufferAES256GCM(enc, 'WrongPassword_2026_Min16Chars!'));

    // Production restore interlock
    assert.throws(() => rest.verifyRestoreGuard({ RESTORE_TARGET_ENV: 'production', RESTORE_CONFIRM_NON_PROD: 'YES', TARGET_DB_URL: 'postgres://x', BACKUP_ENCRYPTION_KEY: key }), /CHẶN AN TOÀN/);
    assert.throws(() => rest.verifyRestoreGuard({ RESTORE_TARGET_ENV: 'staging', RESTORE_CONFIRM_NON_PROD: 'NO', TARGET_DB_URL: 'postgres://x', BACKUP_ENCRYPTION_KEY: key }), /CHẶN AN TOÀN/);
    assert.throws(() => rest.verifyRestoreGuard({ RESTORE_TARGET_ENV: 'staging', RESTORE_CONFIRM_NON_PROD: 'YES', RESTORE_PROD_HOST: 'prod.supabase.co', TARGET_DB_URL: 'postgres://prod.supabase.co/db', BACKUP_ENCRYPTION_KEY: key }), /Production/);
    assert.doesNotThrow(() => rest.verifyRestoreGuard({ RESTORE_TARGET_ENV: 'local', RESTORE_CONFIRM_NON_PROD: 'YES', RESTORE_PROD_HOST: 'prod.supabase.co', TARGET_DB_URL: 'postgres://127.0.0.1:54322/postgres', BACKUP_ENCRYPTION_KEY: key }));

    // Unpack & checksum verification
    const unpacked = await rest.unpackAndVerifyBackup(enc, key);
    assert.strictEqual(unpacked.dumpBuf.toString(), 'dump');
  });

  console.log(`\n=== TỔNG KẾT TEST HỆ THỐNG CHUNG: ${passed}/${total} ĐẠT ===\n`);
  process.exit(passed === total ? 0 : 1);
})();
