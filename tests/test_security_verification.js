/**
 * Bộ kiểm thử tự động xác minh an toàn bảo mật P0 -> P1 -> P2
 * và bảo toàn nghiệp vụ KPI Liên chi đoàn KHUD.
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- KHỞI ĐỘNG BỘ KIỂM THỬ BẢO MẬT VÀ HỒI QUY KPI ---');

// Tạo context giả lập trình duyệt
const ctx = {
  console,
  assert,
  process,
  URL: globalThis.URL || class MockURL {
    constructor(url) {
      this.href = url;
      this.protocol = url.split(':')[0] + ':';
    }
    static createObjectURL() { return 'blob:mock-url'; }
    static revokeObjectURL() {}
  },
  Blob: globalThis.Blob,
  fetch: globalThis.fetch,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  scrollTo: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};

if (!ctx.URL.createObjectURL) {
  ctx.URL.createObjectURL = () => 'blob:mock-url';
  ctx.URL.revokeObjectURL = () => {};
}

ctx.window = ctx;
ctx.global = ctx;
ctx.self = ctx;
ctx.top = ctx;
ctx.PAGES = {};
ctx.roleSel = { addEventListener: () => {}, innerHTML: '', value: '', appendChild: () => {} };
ctx.main = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
ctx.nav = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
ctx.resetBtn = { addEventListener: () => {}, onclick: null };
ctx.themeBtn = { addEventListener: () => {}, onclick: null };
ctx.dataMgmtBtn = { addEventListener: () => {}, onclick: null };
ctx.tip = { innerHTML: '', style: {} };
ctx.dlgBody = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
ctx.dlg = { showModal: () => {}, close: () => {} };
ctx.document = {
  getElementById: id => ctx[id] || null,
  addEventListener: () => {},
  querySelector: sel => {
    if (sel === '#dlgBody') return ctx.dlgBody;
    if (sel === '#dlg') return ctx.dlg;
    return { innerHTML: '', querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} };
  },
  querySelectorAll: () => [],
  getElementsByTagName: tag => {
    if (tag.toLowerCase() === 'script') {
      return [{ src: 'http://localhost:5173/assets/vendor/supabase.js', getAttribute: () => null }];
    }
    return [];
  },
  currentScript: { tagName: 'SCRIPT', src: 'http://localhost:5173/assets/vendor/supabase.js' },
  head: { appendChild: () => {} },
  createElement: () => ({ href: '', download: '', click: () => {}, remove: () => {}, setAttribute: () => {} }),
  body: {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    appendChild: () => {},
    removeChild: () => {}
  }
};
ctx.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] ?? null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};
ctx.navigator = {
  clipboard: { writeText: () => Promise.resolve() },
  storage: { estimate: () => Promise.resolve({ usage: 1024 }) }
};
ctx.location = { hash: '', reload: () => {} };
ctx.alert = () => {};

vm.createContext(ctx);

// 1. Nạp vendor SheetJS và Supabase
const vendorXlsx = fs.readFileSync(path.join(__dirname, '../assets/vendor/xlsx.full.min.js'), 'utf8');
vm.runInContext(vendorXlsx, ctx);

const vendorSupabase = fs.readFileSync(path.join(__dirname, '../assets/vendor/supabase.js'), 'utf8');
vm.runInContext(vendorSupabase, ctx);

// 2. Nạp các module ứng dụng
const appFiles = ['config', 'data', 'kpi', 'ui', 'auth', 'pages', 'nhansu', 'excel', 'sinhhoat', 'boot'];
for (const file of appFiles) {
  const code = fs.readFileSync(path.join(__dirname, `../assets/${file}.js`), 'utf8');
  vm.runInContext(code, ctx);
}

// 3. Thực thi bộ test bên trong context
const testScript = `
let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log('  [PASS] Test ' + totalTests + ': ' + name);
    passedTests++;
  } catch (err) {
    console.error('  [FAIL] Test ' + totalTests + ': ' + name);
    console.error(err);
    process.exitCode = 1;
  }
}

// ================= TEST 1: XSS ESCAPING & SAFE LINK EDIT =================
runTest('Chống XSS: esc() mã hóa đầy đủ các ký tự đặc biệt kể cả nháy đơn & kép', () => {
  const xssPayload = "<script>alert('xss')</script>\\\"&'";
  const escaped = esc(xssPayload);
  assert.strictEqual(escaped.includes('<'), false, 'Không được chứa <');
  assert.strictEqual(escaped.includes('>'), false, 'Không được chứa >');
  assert.strictEqual(escaped.includes('"'), false, 'Không được chứa "');
  assert.strictEqual(escaped.includes("'"), false, 'Không được chứa nháy đơn');
  assert.strictEqual(escaped, '&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;&quot;&amp;&#39;');
});

runTest('Chống XSS: escJs() thoát nháy và ký tự đặc biệt an toàn cho ngữ cảnh JavaScript', () => {
  const payload = "admin'); alert('hacked";
  const escaped = escJs(payload);
  assert.strictEqual(escaped.includes("\\\\'"), true, 'Phải thoát nháy đơn bằng slash');
});

runTest('Chống XSS: hienThiLink sử dụng data-edit-link-id thay vì nhúng JS động vào onclick', () => {
  const linkHtml = hienThiLink('https://drive.google.com/test', 'Minh chứng', {
    tieuDe: "Minh chứng 'có nháy'",
    url: 'https://drive.google.com/test',
    onSave: () => {}
  });
  assert.strictEqual(linkHtml.includes('onclick="moSuaLink('), false, 'Không được chứa onclick="moSuaLink(');
  assert.strictEqual(linkHtml.includes('data-edit-link-id='), true, 'Phải sử dụng data-edit-link-id');
});

// ================= TEST 2: URL VALIDATION & PROTOCOL GUARDS =================
runTest('URL Guard: isSafeUrl chặn các giao thức nguy hiểm (javascript:, data:, vbscript:, file:)', () => {
  assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
  assert.strictEqual(isSafeUrl('JAVASCRIPT:alert(document.cookie)'), false);
  assert.strictEqual(isSafeUrl('data:text/html;base64,PHNjcmlwdD4='), false);
  assert.strictEqual(isSafeUrl('vbscript:msgbox(1)'), false);
  assert.strictEqual(isSafeUrl('file:///C:/Windows/win.ini'), false);
  assert.strictEqual(isSafeUrl('https://drive.google.com/drive/folders/xyz'), true);
  assert.strictEqual(isSafeUrl('http://example.com/file.pdf'), true);
});

runTest('URL Guard: chuanHoaLink chặn giao thức nguy hiểm và chuẩn hóa URL an toàn', () => {
  assert.strictEqual(chuanHoaLink('javascript:alert(1)'), '');
  assert.strictEqual(chuanHoaLink('data:text/html,abc'), '');
  assert.strictEqual(chuanHoaLink('drive.google.com/test'), 'https://drive.google.com/test');
  assert.strictEqual(chuanHoaLink('https://facebook.com/abc'), 'https://facebook.com/abc');
});

// ================= TEST 3: CHI ĐOÀN TENANT ISOLATION (EXCEL & RBAC) =================
runTest('Phân lập Chi đoàn: Chi đoàn A không được chiếm đoạt hoặc chuyển nhượng đoàn viên của Chi đoàn B', () => {
  DB.dv = [
    { id: 1, cdId: 1, ten: 'Nguyễn Văn A', mssv: '2261100', cv: 'Đoàn viên', drl: 85, soHD: 3, doanPhi: true, ghiChu: '' },
    { id: 2, cdId: 2, ten: 'Trần Thị B', mssv: '2261101', cv: 'Đoàn viên', drl: 90, soHD: 4, doanPhi: true, ghiChu: '' }
  ];

  auth.currentUser = {
    id: 'u_cd2',
    email: 'cd2@example.com',
    role: 'cd',
    cdId: 2,
    quyen: ['ql_doanvien', 'nhap_excel', 'nop_bc'],
    active: true
  };
  state.role = 'cd';
  state.cdId = 2;

  const excelRows = [
    ['Họ và tên', 'MSSV', 'Chi đoàn', 'Chức vụ', 'ĐRL', 'Số HĐ', 'Đoàn phí', 'Ghi chú'],
    ['Nguyễn Văn A Fake', '2261100', 'DH22TUD', 'Bí thư', 99, 10, 'x', 'Chiếm đoạt']
  ];

  const res = apDungDV(excelRows);
  assert.strictEqual(res.loi, undefined, 'Không được có lỗi cú pháp');
  assert.strictEqual(res.ok.includes('bỏ qua 1 MSSV thuộc chi đoàn khác'), true, 'Phải phát hiện và bỏ qua MSSV của chi đoàn khác');

  const dvA = DB.dv.find(d => d.mssv === '2261100');
  assert.strictEqual(dvA.cdId, 1, 'cdId vẫn phải là 1');
  assert.strictEqual(dvA.ten, 'Nguyễn Văn A', 'Tên không bị sửa');
});

runTest('Phân lập Chi đoàn: Chi đoàn không được sửa báo cáo của Chi đoàn khác hoặc sửa báo cáo đã duyệt', () => {
  DB.bc = [
    { id: 1, khId: 1, cdId: 1, soLuot: 10, ngayNop: '2026-10-01', treHan: false, mc: 'link1', status: 'pass', nx: 'Duyệt tốt' },
    { id: 2, khId: 1, cdId: 2, soLuot: 5, ngayNop: '2026-10-01', treHan: false, mc: 'link2', status: 'wait', nx: '' }
  ];

  auth.currentUser = {
    id: 'u_cd2',
    email: 'cd2@example.com',
    role: 'cd',
    cdId: 2,
    quyen: ['nop_bc', 'nhap_excel'],
    active: true
  };
  state.role = 'cd';
  state.cdId = 2;

  const bcRows = [
    ['Mã kế hoạch', 'Chi đoàn', 'Số lượt', 'Ngày nộp', 'Minh chứng'],
    ['KH-01', 'DH22TUD', 50, '2026-10-05', 'https://drive.google.com/hack']
  ];

  const res = apDungBC(bcRows);
  const bc1 = DB.bc.find(b => b.id === 1);
  assert.strictEqual(bc1.cdId, 1, 'Báo cáo CD 1 không bị sửa');
  assert.strictEqual(bc1.soLuot, 10, 'Số lượt của CD 1 không đổi');
});

runTest('Phân quyền Excel: Chi đoàn bị từ chối khi cố nhập Nhân sự LCĐ, Timeline hoặc Điểm danh', () => {
  auth.currentUser = {
    id: 'u_cd2',
    email: 'cd2@example.com',
    role: 'cd',
    cdId: 2,
    quyen: ['ql_doanvien', 'nop_bc', 'nhap_excel'],
    active: true
  };
  state.role = 'cd';
  state.cdId = 2;

  const resNS = apDungNS([['Họ và Tên'], ['Trần Văn X']]);
  assert.strictEqual(Boolean(resNS.loi), true, 'Phải chặn nhập nhân sự LCĐ');

  const resTL = apDungTL([['HOẠT ĐỘNG'], ['Workshop mới']]);
  assert.strictEqual(Boolean(resTL.loi), true, 'Phải chặn nhập timeline');

  const resDD = apDungDD([['Họ và Tên', '2026-10-15'], ['Trần Văn X', 'x']]);
  assert.strictEqual(Boolean(resDD.loi), true, 'Phải chặn nhập điểm danh');
});

// ================= TEST 4: SHEETJS VENDORED & OFFLINE VERIFICATION =================
runTest('SheetJS Offline: Thư viện SheetJS v0.20.3 hoạt động độc lập, không kết nối mạng', () => {
  assert.strictEqual(typeof XLSX, 'object', 'XLSX phải tồn tại');
  assert.strictEqual(typeof XLSX.utils.book_new, 'function', 'Hàm book_new phải tồn tại');
  assert.strictEqual(typeof XLSX.utils.aoa_to_sheet, 'function', 'Hàm aoa_to_sheet phải tồn tại');

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['Tiêu đề 1', 'Tiêu đề 2'], ['Dữ liệu 1', 'Dữ liệu 2']]);
  XLSX.utils.book_append_sheet(wb, ws, 'TestSheet');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  assert.strictEqual(buf.length > 0, true, 'XLSX buffer phải được tạo thành công');
});

// ================= TEST 5: BACKUP & EXPORT PRIVACY =================
runTest('Bảo mật Sao lưu: xuatBackupJSON không rò rỉ users, mật khẩu, roles hay secrets', () => {
  DB.users = [{ username: 'admin', password: '123', secret: 'token' }];
  
  let capturedJson = null;
  const originalBlob = Blob;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  Blob = function([content]) {
    capturedJson = content;
    return { size: content.length };
  };
  URL.createObjectURL = () => 'blob:mock-url';
  URL.revokeObjectURL = () => {};

  try {
    xuatBackupJSON();
    assert.strictEqual(typeof capturedJson, 'string', 'Phải sinh ra chuỗi JSON');
    assert.strictEqual(capturedJson.includes('password'), false, 'Không được chứa trường password');
    assert.strictEqual(capturedJson.includes('secret'), false, 'Không được chứa trường secret');
    assert.strictEqual(capturedJson.includes('users'), false, 'Không được chứa mảng users');
  } finally {
    Blob = originalBlob;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  }
});

// ================= TEST 6: KPI CALCULATION REGRESSION =================
runTest('Hồi quy KPI: Điểm chi đoàn, điểm uỷ viên BCH và công thức xếp loại giữ nguyên chính xác', () => {
  DB = seed();
  
  const k1 = kpi(1);
  assert.strictEqual(typeof k1.tong, 'number', 'kpi().tong phải là số');
  assert.strictEqual(k1.tong >= 0 && k1.tong <= 100, true, 'Tổng điểm phải từ 0 đến 100');
  assert.strictEqual(Array.isArray(k1.chiTiet), true, 'chiTiet phải là mảng 5 tiêu chí');
  assert.strictEqual(k1.chiTiet.length, 5, 'Phải có đúng 5 tiêu chí');

  const bxh = bangXH();
  assert.strictEqual(bxh.length, DB.cd.length, 'Số lượng hàng xếp hạng phải bằng số chi đoàn');
  for (let i = 0; i < bxh.length - 1; i++) {
    assert.strictEqual(bxh[i].tong >= bxh[i + 1].tong, true, 'Bảng xếp hạng phải sắp xếp giảm dần theo điểm');
  }

  const bchList = bangBCH();
  assert.strictEqual(bchList.length > 0, true, 'Phải có uỷ viên BCH');
  bchList.forEach(item => {
    assert.strictEqual(typeof item.tong, 'number');
    assert.strictEqual(item.tong >= 0 && item.tong <= 100, true);
    assert.strictEqual(item.ct.length, 4, 'BCH phải có đúng 4 tiêu chí');
  });

  assert.strictEqual(xepLoai(95)[1], 'Xuất sắc');
  assert.strictEqual(xepLoai(85)[1], 'Tốt');
  assert.strictEqual(xepLoai(70)[1], 'Khá');
  assert.strictEqual(xepLoai(55)[1], 'Trung bình');
  assert.strictEqual(xepLoai(40)[1], 'Yếu');
});

// ================= TEST 7: FAIL-CLOSED & ACCESS CONTROL =================
runTest('Cơ chế Fail-Closed: Khóa quyền truy cập khi chưa xác thực hoặc tài khoản bị khóa', () => {
  auth.currentUser = null;

  assert.strictEqual(isLoggedIn(), false, 'isLoggedIn phải là false khi chưa đăng nhập');
  assert.strictEqual(isAdmin(), false, 'isAdmin phải là false khi chưa đăng nhập');
  assert.strictEqual(coQuyen('ql_kh'), false, 'Không có quyền khi chưa đăng nhập');
  assert.strictEqual(coQuyen('duyet_bc'), false, 'Không có quyền duyệt khi chưa đăng nhập');

  auth.currentUser = { id: 'u1', email: 'test@example.com', active: false, role: 'lcd', quyen: ['ql_kh'] };

  assert.strictEqual(isLoggedIn(), false, 'Tài khoản active: false phải coi như chưa đăng nhập');
  assert.strictEqual(coQuyen('ql_kh'), false, 'Tài khoản active: false không được phép thao tác');

  auth.currentUser = { id: 'u2', email: 'admin@example.com', active: true, role: 'admin', quyen: [] };
  assert.strictEqual(isLoggedIn(), true, 'Admin active: true được đăng nhập');
  assert.strictEqual(isAdmin(), true, 'isAdmin trả về true');
  assert.strictEqual(coQuyen('ql_kh'), true, 'Admin tự động có mọi quyền');
});

console.log('\\n=== TỔNG KẾT KIỂM THỬ: ' + passedTests + '/' + totalTests + ' TESTS ĐẠT HOÀN TOÀN ===\\n');
process.exit(passedTests === totalTests ? 0 : 1);
`;

vm.runInContext(testScript, ctx);
