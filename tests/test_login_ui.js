// tests/test_login_ui.js
// Automated verification for the redesigned login UI
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('--- KIỂM TRA GIAO DIỆN VÀ TRẢI NGHIỆM ĐĂNG NHẬP (UI/UX) ---');

const authContent = fs.readFileSync('assets/auth.js', 'utf8');
const cssContent = fs.readFileSync('assets/styles.css', 'utf8');

const ctx = {
  console,
  assert,
  window: { APP_CONFIG: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test_key' } },
  document: {
    getElementById: () => null
  },
  PAGES: {},
  DB: { users: [] },
  dlgBody: { innerHTML: '', querySelector: () => null },
  dlg: { showModal: () => {}, close: () => {} },
  esc: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  setTimeout: () => {},
  clearTimeout: () => {}
};
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.self = ctx;

vm.createContext(ctx);
vm.runInContext(authContent + '\nwindow.auth = auth;', ctx);

const authModule = ctx.auth;
assert(authModule, 'Không tìm thấy auth module');

// 1. Kiểm tra trạng thái sẵn sàng (ready)
authModule.status = 'ready';
const loginHtml = authModule.renderTrangDangNhap();

// Kiểm tra cấu trúc 2 cột
assert(loginHtml.includes('login-layout'), 'Thiếu container login-layout');
assert(loginHtml.includes('login-brand-panel'), 'Thiếu cột nhận diện login-brand-panel');
assert(loginHtml.includes('login-form-panel'), 'Thiếu cột form login-form-panel');

// Nhận diện thương hiệu
assert(loginHtml.includes('assets/logo.webp'), 'Thiếu logo đơn vị');
assert(loginHtml.includes('Liên chi đoàn Khoa các Khoa học Ứng dụng'), 'Thiếu tên LCĐ đầy đủ');
assert(loginHtml.includes('Trường Quốc tế – ĐHQGHN'), 'Thiếu tên Trường Quốc tế');
assert(loginHtml.includes('Sổ tay<br>Liên chi đoàn') || loginHtml.includes('Sổ tay Liên chi đoàn'), 'Thiếu tiêu đề chính Sổ tay Liên chi đoàn');
assert(loginHtml.includes('Theo dõi công tác, hoạt động và đánh giá KPI chi đoàn.'), 'Thiếu mô tả chức năng');
assert(loginHtml.includes('Nhiệm kỳ 2025 – 2027'), 'Thiếu thông tin nhiệm kỳ');
assert(loginHtml.includes('login-art-svg'), 'Thiếu họa tiết minh họa timeline tĩnh');

// Vùng form
assert(loginHtml.includes('<h2 class="login-form-title">Đăng nhập</h2>'), 'Thiếu tiêu đề Đăng nhập');
assert(loginHtml.includes('Sử dụng email đã được cấp để tiếp tục.'), 'Thiếu mô tả hướng dẫn email');
assert(loginHtml.includes('id="loginUser"'), 'Thiếu input email');
assert(loginHtml.includes('type="email"'), 'Input email phải có type="email"');
assert(loginHtml.includes('autocomplete="email"'), 'Input email phải có autocomplete="email"');
assert(loginHtml.includes('id="loginPass"'), 'Thiếu input password');
assert(loginHtml.includes('type="password"'), 'Input password phải có type="password"');
assert(loginHtml.includes('autocomplete="current-password"'), 'Input password phải có autocomplete="current-password"');
assert(loginHtml.includes('Quên mật khẩu?'), 'Thiếu liên kết Quên mật khẩu?');
assert(loginHtml.includes('login-pass-btn'), 'Thiếu nút hiện/ẩn mật khẩu');
assert(loginHtml.includes('aria-label="Hiện mật khẩu"'), 'Nút mật khẩu thiếu aria-label');
assert(loginHtml.includes('aria-pressed="false"'), 'Nút mật khẩu thiếu aria-pressed');
assert(loginHtml.includes('login-submit-btn'), 'Thiếu nút submit Đăng nhập');
assert(loginHtml.includes('Chưa có tài khoản? Vui lòng liên hệ BCH Liên chi đoàn.'), 'Thiếu ghi chú liên hệ BCH');

// Bỏ emoji và rò rỉ kỹ thuật
assert(!loginHtml.includes('✉️'), 'Không được để emoji thư trong input email');
assert(!loginHtml.includes('🔑'), 'Không được để emoji chìa khóa trong input');
assert(!loginHtml.includes('👁️'), 'Không được để emoji mắt trong HTML tĩnh');
assert(!loginHtml.includes('🙈'), 'Không được để emoji khỉ trong HTML tĩnh');
assert(!loginHtml.includes('Supabase Auth'), 'Không để lộ thông tin kỹ thuật Supabase Auth trong footer người dùng');
assert(!loginHtml.includes('phân quyền máy chủ'), 'Không để lộ thông tin kỹ thuật phân quyền máy chủ trong footer');
assert(!loginHtml.includes('demo-chip'), 'Không còn nút demo');

console.log('✓ Trạng thái Ready (Form đăng nhập & Brand Panel): ĐẠT');

// 2. Kiểm tra trạng thái Unconfigured & Loading
authModule.status = 'unconfigured';
const uncfgHtml = authModule.renderTrangDangNhap();
assert(uncfgHtml.includes('login-brand-panel'), 'Unconfigured state phải giữ brand panel');
assert(uncfgHtml.includes('login-card-unconfigured'), 'Unconfigured state phải dùng card có kiểu đồng nhất');

authModule.status = 'loading';
const loadHtml = authModule.renderTrangDangNhap();
assert(loadHtml.includes('login-brand-panel'), 'Loading state phải giữ brand panel');
assert(loadHtml.includes('login-loading-spinner'), 'Loading state phải có spinner đồng bộ');

console.log('✓ Trạng thái Chưa cấu hình & Đang tải xác thực: ĐẠT');

// 3. Kiểm tra CSS
assert(cssContent.includes('.login-layout'), 'CSS thiếu .login-layout');
assert(cssContent.includes('grid-template-columns: 48fr 52fr') || cssContent.includes('48fr 52fr'), 'Bố cục desktop phải là tỉ lệ ~48/52');
assert(cssContent.includes('#0C2948'), 'Cột nhận diện phải có nền navy #0C2948');
assert(cssContent.includes('#F8FAFC'), 'Cột form nền sáng #F8FAFC');
assert(cssContent.includes('max-width: 380px'), 'Form tối đa 380px');
assert(cssContent.includes('height: 48px'), 'Input/Button chuẩn 48px');
assert(cssContent.includes('font-size: 16px'), 'Input font-size 16px để chống auto-zoom trên iOS');
assert(cssContent.includes('#1267A5'), 'Màu nút chính thương hiệu #1267A5');
assert(cssContent.includes('@media (max-width: 960px)'), 'Thiếu breakpoint responsive 960px');
assert(cssContent.includes('@media (max-width: 360px)'), 'Thiếu breakpoint co giãn cho màn hình nhỏ 360px/320px');

console.log('✓ Quy chuẩn CSS bố cục, typography, màu sắc và responsive: ĐẠT');

// 4. Kiểm tra tương tác toggle password
const fakeBtn = {
  attrs: {},
  innerHTML: '',
  setAttribute(k, v) { this.attrs[k] = v; }
};
const fakeInp = { type: 'password' };
ctx.document.getElementById = (id) => (id === 'loginPass' ? fakeInp : null);

authModule.togglePasswordVisibility('loginPass', fakeBtn);
assert.strictEqual(fakeInp.type, 'text');
assert.strictEqual(fakeBtn.attrs['aria-label'], 'Ẩn mật khẩu');
assert.strictEqual(fakeBtn.attrs['aria-pressed'], 'true');
assert(fakeBtn.innerHTML.includes('<svg'), 'Phải render SVG icon khi đổi trạng thái');

authModule.togglePasswordVisibility('loginPass', fakeBtn);
assert.strictEqual(fakeInp.type, 'password');
assert.strictEqual(fakeBtn.attrs['aria-label'], 'Hiện mật khẩu');
assert.strictEqual(fakeBtn.attrs['aria-pressed'], 'false');

console.log('✓ Tương tác hiện/ẩn mật khẩu qua SVG và Accessible Attributes: ĐẠT');

console.log('=== TOÀN BỘ KIỂM TRA UI/UX LOGIN ĐẠT 100% ===');
