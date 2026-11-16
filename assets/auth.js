/* Hệ thống Xác thực, Phân quyền và Quản trị Người dùng */
/* ===================== AUTH OBJECT ===================== */
const AUTH_STORAGE_KEY = 'lcdkhud_auth_session';

const ROLE_INFO = {
 admin: { ten: 'Quản trị viên', badge: 'p-crit', icon: '🛡️', desc: 'Toàn quyền cấu hình hệ thống, quản trị tài khoản và cơ sở dữ liệu' },
 lcd:   { ten: 'BCH Liên chi đoàn', badge: 'p-xs', icon: '🏛️', desc: 'Quản lý toàn diện công tác Đoàn, giao chỉ tiêu, duyệt báo cáo và đánh giá KPI' },
 cd:    { ten: 'BCH Chi đoàn', badge: 'p-good', icon: '🚩', desc: 'Quản lý hoạt động chi đoàn, nộp báo cáo minh chứng và theo dõi đoàn viên' },
 bbt:   { ten: 'Ban Biên tập / Giám sát', badge: 'p-warn', icon: '📝', desc: 'Xem thông tin, giám sát số liệu và hỗ trợ truyền thông' }
};

const auth = {
 currentUser: null,

 /** Khởi tạo phiên đăng nhập từ LocalStorage hoặc SessionStorage */
 init(){
  try {
   let raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
   if(raw){
    const sess = JSON.parse(raw);
    const u = (DB.users || []).find(x => x.id === sess.id && x.username === sess.username);
    if(u && u.active !== false){
     this.currentUser = u;
     this.dongBoQuyenState();
     return;
    }
   }
  } catch(e) {}
  this.currentUser = null;
 },

 /** Đồng bộ state hệ thống theo vai trò người dùng */
 dongBoQuyenState(){
  if(!this.currentUser) return;
  const u = this.currentUser;
  if(u.role === 'cd'){
   state.role = 'cd';
   state.cdId = u.cdId || (DB.cd && DB.cd[0] ? DB.cd[0].id : 1);
  } else {
   if(state.role !== 'cd') {
    state.role = 'lcd';
   }
  }
 },

 /** Kiểm tra xem tài khoản có quyền cụ thể hay không */
 coQuyen(quyenId, customUser){
  const u = customUser || this.currentUser;
  if(!u) return false;
  if(u.role === 'admin') return true;
  return Array.isArray(u.quyen) && u.quyen.includes(quyenId);
 },

 /** Bật / Tắt một quyền cụ thể cho một tài khoản (Check trực tiếp trên ma trận) */
 doiQuyenNguoiDung(userId, quyenId, bat){
  const u = (DB.users || []).find(x => x.id === userId);
  if(!u) return;
  if(u.role === 'admin'){
   alert('Quản trị viên (Admin) mặc định luôn có tất cả quyền trong hệ thống.');
   render();
   return;
  }
  if(!Array.isArray(u.quyen)){
   u.quyen = [...(QUYEN_THEO_VAI_TRO[u.role] || QUYEN_THEO_VAI_TRO.cd)];
  }
  if(bat){
   if(!u.quyen.includes(quyenId)) u.quyen.push(quyenId);
  } else {
   u.quyen = u.quyen.filter(x => x !== quyenId);
  }
  save();
  this.hienToast(`Đã ${bat ? 'cấp' : 'thu hồi'} quyền "${quyenId}" cho ${u.ten}`);
 },

 /** Chuẩn hóa quyền của một tài khoản theo vai trò mặc định */
 chuanHoaQuyenUser(userId){
  const u = (DB.users || []).find(x => x.id === userId);
  if(!u) return;
  u.quyen = [...(QUYEN_THEO_VAI_TRO[u.role] || QUYEN_THEO_VAI_TRO.cd)];
  save();
  render();
  this.hienToast(`Đã khôi phục quyền chuẩn cho ${u.ten}`);
 },

 /** Chuẩn hóa toàn bộ quyền của tất cả tài khoản */
 chuanHoaToanBoQuyen(){
  (DB.users || []).forEach(u => {
   u.quyen = [...(QUYEN_THEO_VAI_TRO[u.role] || QUYEN_THEO_VAI_TRO.cd)];
  });
  save();
  render();
  alert('Đã chuẩn hóa toàn bộ quyền hạn của tất cả tài khoản theo vai trò mặc định.');
 },

 /** Lưu cập nhật danh sách quyền cho một tài khoản */
 capNhatQuyenUser(userId, danhSachQuyenMoi){
  const u = (DB.users || []).find(x => x.id === userId);
  if(!u) return { ok: false, msg: 'Không tìm thấy tài khoản!' };
  u.quyen = [...danhSachQuyenMoi];
  save();
  return { ok: true, user: u };
 },

 /** Hiển thị toast thông báo nhanh khi check quyền */
 hienToast(msg){
  let t = document.getElementById('toastBox');
  if(!t){
   t = document.createElement('div');
   t.id = 'toastBox';
   t.className = 'toast-box';
   document.body.appendChild(t);
  }
  t.textContent = '✓ ' + msg;
  t.classList.add('show');
  clearTimeout(this._toastTimer);
  this._toastTimer = setTimeout(() => {
   t.classList.remove('show');
  }, 2200);
 },

 /** Đăng nhập */
 login(username, password, remember = true){
  const uName = String(username || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  if(!uName || !pass){
   return { ok: false, msg: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' };
  }

  const u = (DB.users || []).find(x => x.username.toLowerCase() === uName);
  if(!u || u.password !== pass){
   return { ok: false, msg: 'Tên đăng nhập hoặc mật khẩu không chính xác!' };
  }

  if(u.active === false){
   return { ok: false, msg: 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Admin / BCH LCĐ.' };
  }

  u.lanCuoi = new Date().toLocaleString('vi-VN');
  save();

  this.currentUser = u;
  this.dongBoQuyenState();

  const sessData = JSON.stringify({ id: u.id, username: u.username });
  if(remember){
   localStorage.setItem(AUTH_STORAGE_KEY, sessData);
  } else {
   sessionStorage.setItem(AUTH_STORAGE_KEY, sessData);
  }

  render();
  return { ok: true, user: u };
 },

 /** Đăng xuất */
 logout(){
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  this.currentUser = null;
  state.page = 'tongquan';
  render();
 },

 /** Đổi mật khẩu của người dùng hiện tại */
 doiMatKhau(oldPass, newPass){
  if(!this.currentUser) return { ok: false, msg: 'Chưa đăng nhập!' };
  if(this.currentUser.password !== oldPass){
   return { ok: false, msg: 'Mật khẩu hiện tại không đúng!' };
  }
  if(!newPass || newPass.length < 4){
   return { ok: false, msg: 'Mật khẩu mới phải có tối thiểu 4 ký tự!' };
  }
  this.currentUser.password = newPass;
  const idx = DB.users.findIndex(x => x.id === this.currentUser.id);
  if(idx !== -1) DB.users[idx].password = newPass;
  save();
  return { ok: true };
 },

 /** Admin / LCĐ đặt lại mật khẩu cho tài khoản khác */
 resetMatKhau(userId, newPass){
  const u = (DB.users || []).find(x => x.id === userId);
  if(!u) return { ok: false, msg: 'Không tìm thấy tài khoản!' };
  if(!newPass || newPass.length < 4){
   return { ok: false, msg: 'Mật khẩu mới phải có tối thiểu 4 ký tự!' };
  }
  u.password = newPass;
  save();
  return { ok: true };
 },

 /** Thêm tài khoản mới */
 themTaiKhoan(data){
  const uName = String(data.username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g,'');
  if(!uName || uName.length < 3){
   return { ok: false, msg: 'Tên đăng nhập phải có ít nhất 3 ký tự (chữ thường, số, dấu gạch)!' };
  }
  if((DB.users || []).some(x => x.username.toLowerCase() === uName)){
   return { ok: false, msg: `Tên đăng nhập "${uName}" đã tồn tại trên hệ thống!` };
  }
  if(!data.password || data.password.length < 4){
   return { ok: false, msg: 'Mật khẩu phải có tối thiểu 4 ký tự!' };
  }

  const role = data.role || 'cd';
  const newId = nextId(DB.users);
  const quyen = Array.isArray(data.quyen) && data.quyen.length ? [...data.quyen] : [...(QUYEN_THEO_VAI_TRO[role] || QUYEN_THEO_VAI_TRO.cd)];

  const newUser = {
   id: newId,
   username: uName,
   password: String(data.password).trim(),
   ten: String(data.ten || uName).trim(),
   role: role,
   cdId: role === 'cd' ? (+data.cdId || null) : null,
   email: String(data.email || '').trim(),
   sdt: String(data.sdt || '').trim(),
   active: data.active !== false,
   ngayTao: TODAY,
   lanCuoi: '',
   quyen: quyen
  };

  DB.users.push(newUser);
  save();
  return { ok: true, user: newUser };
 },

 /** Sửa tài khoản */
 suaTaiKhoan(id, data){
  const u = (DB.users || []).find(x => x.id === id);
  if(!u) return { ok: false, msg: 'Không tìm thấy tài khoản!' };

  if(data.ten !== undefined) u.ten = String(data.ten).trim();
  if(data.role !== undefined) {
   const oldRole = u.role;
   u.role = data.role;
   u.cdId = data.role === 'cd' ? (+data.cdId || null) : null;
   if(oldRole !== data.role && (!u.quyen || !u.quyen.length)){
    u.quyen = [...(QUYEN_THEO_VAI_TRO[data.role] || QUYEN_THEO_VAI_TRO.cd)];
   }
  }
  if(data.email !== undefined) u.email = String(data.email).trim();
  if(data.sdt !== undefined) u.sdt = String(data.sdt).trim();
  if(data.active !== undefined) {
   if(this.currentUser && this.currentUser.id === id && !data.active){
    return { ok: false, msg: 'Không thể tự khóa tài khoản đang đăng nhập!' };
   }
   u.active = !!data.active;
  }

  save();
  return { ok: true, user: u };
 },

 /** Xóa tài khoản */
 xoaTaiKhoan(id){
  if(this.currentUser && this.currentUser.id === id){
   return { ok: false, msg: 'Không thể xóa tài khoản bạn đang dùng để đăng nhập!' };
  }
  const u = (DB.users || []).find(x => x.id === id);
  if(!u) return { ok: false, msg: 'Tài khoản không tồn tại!' };
  
  if(u.role === 'admin' && DB.users.filter(x => x.role === 'admin').length <= 1){
   return { ok: false, msg: 'Hệ thống cần tối thiểu 1 tài khoản Quản trị viên (Admin)!' };
  }

  DB.users = DB.users.filter(x => x.id !== id);
  save();
  return { ok: true };
 },

 /** Tự động tạo tài khoản cho các Chi đoàn còn thiếu */
 tuDongTaoTaiKhoanChiDoan(){
  let count = 0;
  (DB.cd || []).forEach(c => {
   const hasUser = (DB.users || []).some(u => u.role === 'cd' && u.cdId === c.id);
   if(!hasUser){
    const uName = 'cd_' + String(c.ma || '').toLowerCase().replace(/[^a-z0-9]/g,'');
    let finalUName = uName;
    let n = 1;
    while((DB.users || []).some(x => x.username.toLowerCase() === finalUName)){
     finalUName = uName + n++;
    }
    const newId = nextId(DB.users);
    DB.users.push({
     id: newId,
     username: finalUName,
     password: 'cd123',
     ten: 'BCH ' + (c.ten || c.ma),
     role: 'cd',
     cdId: c.id,
     email: '',
     sdt: c.sdt || '',
     active: true,
     ngayTao: TODAY,
     lanCuoi: '',
     quyen: [...QUYEN_THEO_VAI_TRO.cd]
    });
    count++;
   }
  });
  if(count > 0) save();
  return count;
 },

 /** Giao diện Đăng nhập đẹp mắt */
 renderLoginScreen(){
  return `
  <div class="login-wrapper">
   <div class="login-box card">
    <div class="login-brand">
     <img src="assets/logo.webp" alt="Logo LCĐ KHUD">
     <div>
      <h2>Đoàn TNCS Hồ Chí Minh</h2>
      <b>Liên chi đoàn Khoa các Khoa học Ứng dụng</b>
      <p>Trường Quốc tế – Đại học Quốc gia Hà Nội</p>
     </div>
    </div>
    
    <div class="login-header">
     <h1>Đăng nhập hệ thống</h1>
     <p class="sub" style="margin-bottom:12px">Sổ tay theo dõi công tác & Đánh giá KPI Chi đoàn</p>
    </div>

    <form id="loginForm" onsubmit="auth.handleLoginSubmit(event)">
     <div id="loginAlert" class="alert-box alert-crit" style="display:none;margin-bottom:12px"></div>

     <div class="form-row">
      <label for="loginUser">Tên đăng nhập</label>
      <div class="input-icon-wrap">
       <span class="input-icon">👤</span>
       <input id="loginUser" type="text" placeholder="Ví dụ: admin, bch.lcd, cd_mis2022b" autocomplete="username" required autofocus>
      </div>
     </div>

     <div class="form-row">
      <label for="loginPass">Mật khẩu</label>
      <div class="input-icon-wrap">
       <span class="input-icon">🔑</span>
       <input id="loginPass" type="password" placeholder="Nhập mật khẩu..." autocomplete="current-password" required>
       <button type="button" class="btn-toggle-pass" onclick="auth.togglePasswordVisibility('loginPass', this)" title="Ẩn / Hiện mật khẩu">👁️</button>
      </div>
     </div>

     <div class="login-opts">
      <label class="chk-label">
       <input type="checkbox" id="rememberMe" checked> Ghi nhớ đăng nhập
      </label>
      <a href="#" onclick="alert('Vui lòng liên hệ Quản trị viên hệ thống hoặc Bí thư LCĐ để được cấp lại mật khẩu.');return false;" class="forgot-link">Quên mật khẩu?</a>
     </div>

     <button type="submit" class="b-p login-submit-btn">Đăng nhập ngay</button>
    </form>

    <div class="demo-acc-section">
     <div class="demo-acc-title">
      <span>💡 Bấm để điền nhanh tài khoản trải nghiệm:</span>
     </div>
     <div class="demo-chips">
      <button type="button" class="demo-chip chip-admin" onclick="auth.fillCredentials('admin','admin123')">
       <b>🛡️ Quản trị viên</b> (admin)
      </button>
      <button type="button" class="demo-chip chip-lcd" onclick="auth.fillCredentials('bch.lcd','lcd123')">
       <b>🏛️ BCH LCĐ</b> (bch.lcd)
      </button>
      <button type="button" class="demo-chip chip-cd" onclick="auth.fillCredentials('cd_mis2022b','cd123')">
       <b>🚩 Chi đoàn MIS2022B</b> (cd_mis2022b)
      </button>
      <button type="button" class="demo-chip chip-cd" onclick="auth.fillCredentials('cd_bda2023a','cd123')">
       <b>🚩 Chi đoàn BDA2023A</b> (cd_bda2023a)
      </button>
     </div>
    </div>

    <div class="login-footer">
     <span>Nhiệm kỳ 2025 – 2027 · Phiên bản quản lý dữ liệu số</span>
    </div>
   </div>
  </div>`;
 },

 togglePasswordVisibility(inputId, btn){
  const inp = document.getElementById(inputId);
  if(!inp) return;
  if(inp.type === 'password'){
   inp.type = 'text';
   btn.textContent = '🙈';
  } else {
   inp.type = 'password';
   btn.textContent = '👁️';
  }
 },

 fillCredentials(u, p){
  const uInp = document.getElementById('loginUser');
  const pInp = document.getElementById('loginPass');
  if(uInp && pInp){
   uInp.value = u;
   pInp.value = p;
   const alertBox = document.getElementById('loginAlert');
   if(alertBox) alertBox.style.display = 'none';
   pInp.focus();
  }
 },

 handleLoginSubmit(e){
  e.preventDefault();
  const uInp = document.getElementById('loginUser');
  const pInp = document.getElementById('loginPass');
  const remInp = document.getElementById('rememberMe');
  const alertBox = document.getElementById('loginAlert');

  const res = this.login(uInp.value, pInp.value, remInp ? remInp.checked : true);
  if(!res.ok){
   if(alertBox){
    alertBox.textContent = res.msg;
    alertBox.style.display = 'block';
   } else {
    alert(res.msg);
   }
  }
 }
};

/* ===================== TRANG QUẢN TRỊ USER & MA TRẬN PHÂN QUYỀN (PAGES.users) ===================== */
PAGES.users = function(){
 const curUser = auth.currentUser;
 if(!curUser || (curUser.role !== 'admin' && curUser.role !== 'lcd')){
  return `
  <div class="card" style="text-align:center;padding:48px 24px">
   <div style="font-size:48px;margin-bottom:12px">🚫</div>
   <h2>Không có quyền truy cập</h2>
   <p class="sub">Trang Quản trị & Phân quyền chỉ dành cho Quản trị viên và Ban Chấp hành Liên chi đoàn.</p>
   <button class="b-p" onclick="go('tongquan')" type="button">Quay lại Trang chủ</button>
  </div>`;
 }

 const users = DB.users || [];
 const totalCount = users.length;
 const adminCount = users.filter(x => x.role === 'admin').length;
 const lcdCount = users.filter(x => x.role === 'lcd').length;
 const cdCount = users.filter(x => x.role === 'cd').length;
 const activeCount = users.filter(x => x.active !== false).length;

 state.userTab = state.userTab || 'matrix'; // 'matrix' | 'list'
 const q = String(state.userQ || '').trim().toLowerCase();
 const roleFilter = state.userRoleFilter || 'all';
 const stFilter = state.userStFilter || 'all';

 const list = users.filter(u => {
  if(roleFilter !== 'all' && u.role !== roleFilter) return false;
  if(stFilter === 'active' && u.active === false) return false;
  if(stFilter === 'locked' && u.active !== false) return false;
  if(q){
   const cdName = u.cdId ? (CD(u.cdId).ten + ' ' + CD(u.cdId).ma) : '';
   const str = (u.username + ' ' + u.ten + ' ' + (u.email||'') + ' ' + cdName).toLowerCase();
   return str.includes(q);
  }
  return true;
 });

 return `
 <div class="card" style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
   <div>
    <h1>👥 Quản trị tài khoản & Ma trận Phân quyền</h1>
    <p class="sub" style="margin-bottom:0">Tích chọn trực tiếp (Check) để cấp hoặc thu hồi từng quyền hạn cụ thể cho từng tài khoản người dùng trong hệ thống.</p>
   </div>
   <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="b-p" onclick="formThemTaiKhoan()" type="button">+ Thêm tài khoản mới</button>
    <button class="b-s" onclick="dongBoTaiKhoanChiDoan()" type="button" title="Tự động kiểm tra và tạo tài khoản cho các Chi đoàn còn thiếu">⚡ Tự động tạo TK Chi đoàn</button>
    <button class="b-s" onclick="auth.chuanHoaToanBoQuyen()" type="button" title="Đưa toàn bộ người dùng về quyền hạn chuẩn theo vai trò">🔄 Chuẩn hóa quyền</button>
    <button class="b-s" onclick="moHuongDanPhanQuyen()" type="button">ℹ️ Giải thích quyền</button>
   </div>
  </div>
 </div>

 <div class="grid g4" style="margin-bottom:14px">
  <div class="tile">
   <div class="lbl">TỔNG TÀI KHOẢN</div>
   <div class="val">${totalCount}</div>
   <div class="foot">Đang hoạt động: <b>${activeCount}</b> / ${totalCount}</div>
  </div>
  <div class="tile">
   <div class="lbl">QUẢN TRỊ VIÊN (ADMIN)</div>
   <div class="val" style="color:var(--crit)">${adminCount}</div>
   <div class="foot">Toàn quyền hệ thống</div>
  </div>
  <div class="tile">
   <div class="lbl">BCH LIÊN CHI ĐOÀN</div>
   <div class="val" style="color:var(--accent)">${lcdCount}</div>
   <div class="foot">Quản lý cấp khoa</div>
  </div>
  <div class="tile">
   <div class="lbl">BCH CHI ĐOÀN LỚP</div>
   <div class="val" style="color:var(--good)">${cdCount}</div>
   <div class="foot">Tài khoản nộp báo cáo</div>
  </div>
 </div>

 <div class="card">
  <header style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
   <!-- Tabs chuyển đổi chế độ xem -->
   <div class="view-pills">
    <button type="button" class="view-pill ${state.userTab==='matrix'?'active':''}" onclick="state.userTab='matrix';render()">
     ☑️ Ma trận Phân quyền (Check trực tiếp)
    </button>
    <button type="button" class="view-pill ${state.userTab==='list'?'active':''}" onclick="state.userTab='list';render()">
     📋 Danh sách tài khoản & Hồ sơ (${list.length})
    </button>
   </div>

   <!-- Bộ lọc & Tìm kiếm -->
   <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="search" placeholder="🔍 Tìm kiếm tài khoản, tên..." value="${esc(state.userQ||'')}" 
     oninput="state.userQ=this.value;render()" style="padding:6px 10px;border-radius:7px;border:1px solid var(--line);font-size:12.5px;min-width:180px">
    
    <select onchange="state.userRoleFilter=this.value;render()" style="padding:6px 10px;border-radius:7px;border:1px solid var(--line);font-size:12.5px">
     <option value="all"${roleFilter==='all'?' selected':''}>Tất cả vai trò</option>
     <option value="admin"${roleFilter==='admin'?' selected':''}>Quản trị viên (Admin)</option>
     <option value="lcd"${roleFilter==='lcd'?' selected':''}>BCH Liên chi đoàn</option>
     <option value="cd"${roleFilter==='cd'?' selected':''}>BCH Chi đoàn</option>
     <option value="bbt"${roleFilter==='bbt'?' selected':''}>Ban Biên tập</option>
    </select>

    <select onchange="state.userStFilter=this.value;render()" style="padding:6px 10px;border-radius:7px;border:1px solid var(--line);font-size:12.5px">
     <option value="all"${stFilter==='all'?' selected':''}>Tất cả trạng thái</option>
     <option value="active"${stFilter==='active'?' selected':''}>Đang hoạt động</option>
     <option value="locked"${stFilter==='locked'?' selected':''}>Bị tạm khóa</option>
    </select>
   </div>
  </header>

  ${state.userTab === 'matrix' ? `
  <!-- ================= TAB 1: MA TRẬN PHÂN QUYỀN (CHECKBOXES) ================= -->
  <div class="perm-guide-hint">
   <span>💡 <b>Cơ chế Check Phân quyền trực tiếp:</b> Tích chọn (☑️) hoặc bỏ chọn (☐) tại từng ô để cấp hoặc thu hồi quyền tức thì cho tài khoản. Dữ liệu sẽ tự động lưu mà không cần tải lại trang.</span>
  </div>

  <div class="scroll">
   <table class="perm-matrix-table">
    <thead>
     <tr>
      <th style="min-width:160px;position:sticky;left:0;background:var(--surface);z-index:2">Tài khoản / Người dùng</th>
      <th style="width:100px">Vai trò</th>
      <th style="width:110px">Chi đoàn</th>
      ${DANH_SACH_QUYEN.map(q => `
       <th class="th-perm-col" title="${esc(q.ten)}: ${esc(q.desc)}">
        <div class="perm-col-title">${esc(q.ma)}</div>
        <span class="perm-col-sub">${esc(q.nhom)}</span>
       </th>`).join('')}
      <th style="text-align:right;min-width:120px">Thao tác</th>
     </tr>
    </thead>
    <tbody>
     ${list.length ? list.map((u) => {
      const rInfo = ROLE_INFO[u.role] || { ten: u.role, badge: 'p-mute', icon: '👤' };
      const cdObj = u.cdId ? CD(u.cdId) : null;
      const isCur = auth.currentUser && auth.currentUser.id === u.id;
      const isAdmin = u.role === 'admin';
      return `
      <tr>
       <td style="position:sticky;left:0;background:var(--surface);z-index:1;box-shadow:2px 0 5px rgba(0,0,0,.04)">
        <div style="display:flex;align-items:center;gap:8px">
         <span style="font-size:16px">${rInfo.icon}</span>
         <div>
          <b style="font-size:13px;display:block">${esc(u.ten)}</b>
          <span class="t2" style="font-family:monospace">@${esc(u.username)}</span>
          ${isCur ? '<span class="pill p-xs" style="font-size:9.5px;padding:0 4px;margin-left:3px">Bạn</span>' : ''}
         </div>
        </div>
       </td>
       <td>
        <span class="pill ${rInfo.badge}" style="font-size:11px">
         ${esc(rInfo.ten)}
        </span>
       </td>
       <td>
        ${cdObj ? `<b style="font-size:12px">${esc(cdObj.ma)}</b>` : '<span class="t2">Toàn khoa</span>'}
       </td>
       ${DANH_SACH_QUYEN.map(q => {
        const hasQ = auth.coQuyen(q.id, u);
        return `
        <td class="perm-cb-cell" title="${esc(q.ten)} cho ${esc(u.ten)}">
         ${isAdmin ? `
          <span class="pill p-good" style="font-size:9.5px;padding:1px 5px" title="Admin toàn quyền">✓ Tất cả</span>
         ` : `
          <label class="perm-check-label">
           <input type="checkbox" ${hasQ ? 'checked' : ''} onchange="auth.doiQuyenNguoiDung(${u.id},'${q.id}',this.checked)">
           <span class="perm-check-mark"></span>
          </label>
         `}
        </td>`;
       }).join('')}
       <td style="text-align:right;white-space:nowrap">
        <button class="b-s" onclick="formPhanQuyen(${u.id})" type="button" title="Mở hộp thoại phân quyền chi tiết">🛡️ Phân quyền</button>
        ${!isAdmin ? `<button class="b-s" onclick="auth.chuanHoaQuyenUser(${u.id})" type="button" title="Đặt lại quyền chuẩn của vai trò">🔄</button>` : ''}
       </td>
      </tr>`;
     }).join('') : '<tr><td colspan="14" class="empty" style="padding:24px">Không tìm thấy tài khoản phù hợp.</td></tr>'}
    </tbody>
   </table>
  </div>
  ` : `
  <!-- ================= TAB 2: DANH SÁCH TÀI KHOẢN CHI TIẾT ================= -->
  <div class="scroll">
   <table>
    <thead>
     <tr>
      <th style="width:40px">STT</th>
      <th>Tên đăng nhập</th>
      <th>Họ và tên / Đại diện</th>
      <th>Vai trò</th>
      <th>Đơn vị / Chi đoàn trực thuộc</th>
      <th>Số quyền hạn</th>
      <th>Trạng thái</th>
      <th>Đăng nhập cuối</th>
      <th style="text-align:right">Thao tác</th>
     </tr>
    </thead>
    <tbody>
     ${list.length ? list.map((u, idx) => {
      const rInfo = ROLE_INFO[u.role] || { ten: u.role, badge: 'p-mute', icon: '👤' };
      const cdObj = u.cdId ? CD(u.cdId) : null;
      const isCur = auth.currentUser && auth.currentUser.id === u.id;
      const qCount = u.role === 'admin' ? DANH_SACH_QUYEN.length : (Array.isArray(u.quyen) ? u.quyen.length : 0);
      return `
      <tr>
       <td class="t2">${idx + 1}</td>
       <td>
        <b style="font-family:monospace;font-size:13.5px">${esc(u.username)}</b>
        ${isCur ? '<span class="pill p-xs" style="margin-left:4px;font-size:10px">Bạn</span>' : ''}
       </td>
       <td>
        <div><b>${esc(u.ten)}</b></div>
        ${u.email ? `<div class="t2" style="font-size:11px">${esc(u.email)}</div>` : ''}
        ${u.sdt ? `<div class="t2" style="font-size:11px">📞 ${esc(u.sdt)}</div>` : ''}
       </td>
       <td>
        <span class="pill ${rInfo.badge}">
         ${rInfo.icon} ${esc(rInfo.ten)}
        </span>
       </td>
       <td>
        ${cdObj ? `<b>${esc(cdObj.ma)}</b> <span class="t2">(${esc(cdObj.nganh)})</span>` : '<span class="t2">Toàn khoa / LCĐ</span>'}
       </td>
       <td>
        <span class="pill ${qCount>=7?'p-good':qCount>=4?'p-xs':'p-warn'}" style="cursor:pointer" onclick="formPhanQuyen(${u.id})" title="Bấm để xem & sửa phân quyền">
         🛡️ <b>${qCount}/${DANH_SACH_QUYEN.length}</b> quyền
        </span>
       </td>
       <td>
        ${u.active !== false 
         ? '<span class="pill p-good">● Hoạt động</span>' 
         : '<span class="pill p-crit">🔒 Đã khóa</span>'}
       </td>
       <td class="t2" style="font-size:11.5px">
        ${u.lanCuoi ? esc(u.lanCuoi) : '<span style="opacity:.6">Chưa đăng nhập</span>'}
       </td>
       <td style="text-align:right;white-space:nowrap">
        <button class="b-s" onclick="formPhanQuyen(${u.id})" type="button" title="Check phân quyền chi tiết">🛡️ Phân quyền</button>
        <button class="b-s" onclick="formSuaTaiKhoan(${u.id})" type="button" title="Sửa thông tin">✏️ Sửa</button>
        <button class="b-s" onclick="formResetMatKhau(${u.id})" type="button" title="Đặt lại mật khẩu">🔑 Đổi MK</button>
        ${!isCur ? `<button class="b-s b-no" onclick="xacNhanXoaTaiKhoan(${u.id})" type="button" title="Xóa tài khoản">🗑️</button>` : ''}
       </td>
      </tr>`;
     }).join('') : '<tr><td colspan="9" class="empty" style="padding:24px">Không tìm thấy tài khoản phù hợp với điều kiện lọc.</td></tr>'}
    </tbody>
   </table>
  </div>
  `}
 </div>`;
};

/* ===================== CÁC MODAL HỘP THOẠI QUẢN TRỊ USER & PHÂN QUYỀN ===================== */

/** Modal Check Phân quyền chi tiết theo nhóm cho từng tài khoản */
function formPhanQuyen(userId){
 const u = (DB.users || []).find(x => x.id === userId);
 if(!u) return;

 const rInfo = ROLE_INFO[u.role] || { ten: u.role, badge: 'p-mute', icon: '👤' };
 const cdObj = u.cdId ? CD(u.cdId) : null;
 const isAdmin = u.role === 'admin';
 const curQuyen = isAdmin ? DANH_SACH_QUYEN.map(q => q.id) : (Array.isArray(u.quyen) ? u.quyen : []);

 dlg.classList.add('dlg-wide');
 dlgBody.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px">
  <div>
   <h2>🛡️ Phân quyền tài khoản: ${esc(u.ten)}</h2>
   <p class="sub" style="margin-bottom:0">
    Tên đăng nhập: <b style="font-family:monospace;color:var(--accent)">@${esc(u.username)}</b> · 
    Vai trò: <span class="pill ${rInfo.badge}" style="font-size:10px">${rInfo.icon} ${esc(rInfo.ten)}</span>
    ${cdObj ? ` · Chi đoàn: <b>${esc(cdObj.ma)}</b>` : ''}
   </p>
  </div>
 </div>

 ${isAdmin ? `
 <div class="alert-box alert-crit" style="margin-bottom:14px">
  🛡️ <b>Tài khoản Quản trị viên (Admin):</b> Mặc định có toàn bộ quyền hạn trong hệ thống để quản trị cơ sở dữ liệu và người dùng.
 </div>` : `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;background:var(--surface-2);padding:8px 12px;border-radius:8px;border:1px solid var(--line);flex-wrap:wrap;gap:8px">
  <span style="font-size:12.5px;color:var(--sec)">Tích chọn (☑️) các quyền hạn bạn muốn cấp cho tài khoản này:</span>
  <div style="display:flex;gap:6px">
   <button type="button" class="b-s" onclick="toggleAllPerms(true)">Chọn tất cả</button>
   <button type="button" class="b-s" onclick="toggleAllPerms(false)">Bỏ chọn tất cả</button>
   <button type="button" class="b-s" onclick="resetPermsToRole('${u.role}')">Theo chuẩn vai trò</button>
  </div>
 </div>`}

 <form id="fPhanQuyen" onsubmit="xuLyLuuPhanQuyen(event, ${u.id})">
  <div class="perm-grid">
   ${DANH_SACH_QUYEN.map(q => {
    const isChecked = curQuyen.includes(q.id);
    return `
    <label class="perm-card ${isChecked ? 'is-active' : ''}">
     <div class="perm-card-check">
      <input type="checkbox" name="perms" value="${q.id}" ${isChecked ? 'checked' : ''} ${isAdmin ? 'disabled' : ''} onchange="this.closest('.perm-card').classList.toggle('is-active', this.checked)">
     </div>
     <div class="perm-card-content">
      <div class="perm-card-title">
       <b>${esc(q.ten)}</b>
       <span class="pill p-mute" style="font-size:9.5px">${esc(q.nhom)}</span>
      </div>
      <p class="perm-card-desc">${esc(q.desc)}</p>
     </div>
    </label>`;
   }).join('')}
  </div>

  <div class="row" style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px">
   <button type="button" class="b-s" onclick="dlg.close();dlg.classList.remove('dlg-wide')">Đóng</button>
   ${!isAdmin ? `<button type="submit" class="b-p end">Lưu thay đổi phân quyền</button>` : ''}
  </div>
 </form>`;
 dlg.showModal();
}

function toggleAllPerms(check){
 const form = document.getElementById('fPhanQuyen');
 if(!form) return;
 form.querySelectorAll('input[name="perms"]').forEach(cb => {
  cb.checked = check;
  cb.closest('.perm-card').classList.toggle('is-active', check);
 });
}

function resetPermsToRole(role){
 const def = QUYEN_THEO_VAI_TRO[role] || QUYEN_THEO_VAI_TRO.cd;
 const form = document.getElementById('fPhanQuyen');
 if(!form) return;
 form.querySelectorAll('input[name="perms"]').forEach(cb => {
  const shouldCheck = def.includes(cb.value);
  cb.checked = shouldCheck;
  cb.closest('.perm-card').classList.toggle('is-active', shouldCheck);
 });
}

function xuLyLuuPhanQuyen(e, userId){
 e.preventDefault();
 const form = e.target;
 const selected = Array.from(form.querySelectorAll('input[name="perms"]:checked')).map(cb => cb.value);
 const res = auth.capNhatQuyenUser(userId, selected);
 if(res.ok){
  dlg.close();
  dlg.classList.remove('dlg-wide');
  auth.hienToast(`Đã lưu ${selected.length} quyền hạn cho ${res.user.ten}`);
  render();
 } else {
  alert(res.msg);
 }
}

/** Modal thêm tài khoản mới */
function formThemTaiKhoan(){
 dlg.classList.add('dlg-wide');
 dlgBody.innerHTML = `
 <h2>+ Thêm tài khoản mới</h2>
 <p class="sub">Tạo tài khoản và phân quyền truy cập hệ thống Sổ tay LCĐ</p>
 <form id="fNewUser" onsubmit="xuLyThemTaiKhoan(event)">
  <div class="row">
   <div>
    <label>Tên đăng nhập <span style="color:var(--crit)">*</span></label>
    <input name="username" type="text" placeholder="vd: cd_mis2023b, bch_nam" required pattern="[a-zA-Z0-9_.-]{3,30}" title="Ít nhất 3 ký tự (chữ cái, số, gạch dưới, gạch ngang)">
   </div>
   <div>
    <label>Mật khẩu khởi tạo <span style="color:var(--crit)">*</span></label>
    <input name="password" type="text" value="123456" required minlength="4">
   </div>
  </div>

  <div class="row">
   <div>
    <label>Họ và tên / Tên đại diện <span style="color:var(--crit)">*</span></label>
    <input name="ten" type="text" placeholder="vd: BCH Chi đoàn MIS2023B, Nguyễn Văn A" required>
   </div>
   <div>
    <label>Vai trò phân quyền <span style="color:var(--crit)">*</span></label>
    <select name="role" id="selNewRole" onchange="doiVaiTroForm('selNewRole','boxNewCd')">
     <option value="cd">BCH Chi đoàn lớp</option>
     <option value="lcd">BCH Liên chi đoàn</option>
     <option value="admin">Quản trị viên (Admin)</option>
     <option value="bbt">Ban Biên tập / Giám sát</option>
    </select>
   </div>
  </div>

  <div id="boxNewCd" class="row">
   <div>
    <label>Chi đoàn quản lý <span style="color:var(--crit)">*</span></label>
    <select name="cdId">
     ${DB.cd.map(c => `<option value="${c.id}">${esc(c.ma)} – ${esc(c.ten)}</option>`).join('')}
    </select>
   </div>
   <div>
    <label>Trạng thái</label>
    <select name="active">
     <option value="1">Đang hoạt động</option>
     <option value="0">Tạm khóa</option>
    </select>
   </div>
  </div>

  <div class="row">
   <div>
    <label>Email liên hệ</label>
    <input name="email" type="email" placeholder="vd: bch.lop@is.vnu.edu.vn">
   </div>
   <div>
    <label>Số điện thoại</label>
    <input name="sdt" type="tel" placeholder="vd: 0987654321">
   </div>
  </div>

  <div class="row" style="margin-top:14px">
   <button type="button" class="b-s" onclick="dlg.close();dlg.classList.remove('dlg-wide')">Hủy</button>
   <button type="submit" class="b-p end">Tạo tài khoản</button>
  </div>
 </form>`;
 dlg.showModal();
}

function doiVaiTroForm(roleSelId, boxCdId){
 const rSel = document.getElementById(roleSelId);
 const boxCd = document.getElementById(boxCdId);
 if(rSel && boxCd){
  if(rSel.value === 'cd'){
   boxCd.style.display = 'grid';
  } else {
   boxCd.style.display = 'none';
  }
 }
}

function xuLyThemTaiKhoan(e){
 e.preventDefault();
 const f = e.target;
 const res = auth.themTaiKhoan({
  username: f.username.value,
  password: f.password.value,
  ten: f.ten.value,
  role: f.role.value,
  cdId: f.cdId ? f.cdId.value : null,
  active: f.active ? f.active.value === '1' : true,
  email: f.email.value,
  sdt: f.sdt.value
 });

 if(res.ok){
  dlg.close();
  dlg.classList.remove('dlg-wide');
  auth.hienToast(`Đã tạo tài khoản "${res.user.username}"!`);
  render();
 } else {
  alert(res.msg);
 }
}

/** Modal sửa tài khoản */
function formSuaTaiKhoan(id){
 const u = (DB.users || []).find(x => x.id === id);
 if(!u) return;

 dlg.classList.remove('dlg-wide');
 dlgBody.innerHTML = `
 <h2>✏️ Sửa thông tin tài khoản</h2>
 <p class="sub">Tài khoản: <b style="font-family:monospace;color:var(--accent)">${esc(u.username)}</b></p>
 <form id="fEditUser" onsubmit="xuLySuaTaiKhoan(event, ${u.id})">
  <div class="row">
   <div>
    <label>Họ và tên / Đại diện <span style="color:var(--crit)">*</span></label>
    <input name="ten" type="text" value="${esc(u.ten)}" required>
   </div>
   <div>
    <label>Vai trò phân quyền <span style="color:var(--crit)">*</span></label>
    <select name="role" id="selEditRole" onchange="doiVaiTroForm('selEditRole','boxEditCd')">
     <option value="cd"${u.role==='cd'?' selected':''}>BCH Chi đoàn lớp</option>
     <option value="lcd"${u.role==='lcd'?' selected':''}>BCH Liên chi đoàn</option>
     <option value="admin"${u.role==='admin'?' selected':''}>Quản trị viên (Admin)</option>
     <option value="bbt"${u.role==='bbt'?' selected':''}>Ban Biên tập / Giám sát</option>
    </select>
   </div>
  </div>

  <div id="boxEditCd" class="row" style="${u.role==='cd'?'':'display:none'}">
   <div>
    <label>Chi đoàn trực thuộc</label>
    <select name="cdId">
     ${DB.cd.map(c => `<option value="${c.id}"${u.cdId===c.id?' selected':''}>${esc(c.ma)} – ${esc(c.ten)}</option>`).join('')}
    </select>
   </div>
   <div>
    <label>Trạng thái hoạt động</label>
    <select name="active">
     <option value="1"${u.active!==false?' selected':''}>Đang hoạt động</option>
     <option value="0"${u.active===false?' selected':''}>🔒 Tạm khóa</option>
    </select>
   </div>
  </div>

  <div class="row">
   <div>
    <label>Email</label>
    <input name="email" type="email" value="${esc(u.email||'')}">
   </div>
   <div>
    <label>Số điện thoại</label>
    <input name="sdt" type="tel" value="${esc(u.sdt||'')}">
   </div>
  </div>

  <div class="row" style="margin-top:14px">
   <button type="button" class="b-s" onclick="dlg.close()">Hủy</button>
   <button type="submit" class="b-p end">Lưu thay đổi</button>
  </div>
 </form>`;
 dlg.showModal();
}

function xuLySuaTaiKhoan(e, id){
 e.preventDefault();
 const f = e.target;
 const res = auth.suaTaiKhoan(id, {
  ten: f.ten.value,
  role: f.role.value,
  cdId: f.cdId ? f.cdId.value : null,
  active: f.active ? f.active.value === '1' : true,
  email: f.email.value,
  sdt: f.sdt.value
 });

 if(res.ok){
  dlg.close();
  auth.hienToast('Đã cập nhật thông tin tài khoản');
  render();
 } else {
  alert(res.msg);
 }
}

/** Modal đặt lại mật khẩu */
function formResetMatKhau(id){
 const u = (DB.users || []).find(x => x.id === id);
 if(!u) return;

 dlg.classList.remove('dlg-wide');
 dlgBody.innerHTML = `
 <h2>🔑 Đặt lại mật khẩu</h2>
 <p class="sub">Cấp mật khẩu mới cho tài khoản <b style="font-family:monospace;color:var(--accent)">${esc(u.username)}</b> (${esc(u.ten)})</p>
 <form onsubmit="xuLyResetMatKhau(event, ${u.id})">
  <div class="form-row">
   <label>Mật khẩu mới <span style="color:var(--crit)">*</span></label>
   <div class="input-icon-wrap">
    <span class="input-icon">🔑</span>
    <input id="resetPassInput" type="text" value="123456" required minlength="4">
   </div>
   <span class="t2" style="font-size:11px">Mật khẩu có thể bao gồm chữ cái, số, tối thiểu 4 ký tự.</span>
  </div>

  <div class="row" style="margin-top:14px">
   <button type="button" class="b-s" onclick="dlg.close()">Hủy</button>
   <button type="submit" class="b-p end">Xác nhận đổi mật khẩu</button>
  </div>
 </form>`;
 dlg.showModal();
}

function xuLyResetMatKhau(e, id){
 e.preventDefault();
 const passInp = document.getElementById('resetPassInput');
 const res = auth.resetMatKhau(id, passInp.value);
 if(res.ok){
  dlg.close();
  alert('Đã đổi mật khẩu thành công!');
  render();
 } else {
  alert(res.msg);
 }
}

/** Modal đổi mật khẩu cá nhân */
function formDoiMatKhauCaNhan(){
 if(!auth.currentUser) return;
 const u = auth.currentUser;

 dlg.classList.remove('dlg-wide');
 dlgBody.innerHTML = `
 <h2>🔒 Đổi mật khẩu cá nhân</h2>
 <p class="sub">Tài khoản: <b style="font-family:monospace;color:var(--accent)">${esc(u.username)}</b> (${esc(u.ten)})</p>
 <form onsubmit="xuLyDoiMatKhauCaNhan(event)">
  <div class="form-row">
   <label>Mật khẩu hiện tại <span style="color:var(--crit)">*</span></label>
   <input name="oldPass" type="password" required autofocus>
  </div>
  <div class="form-row">
   <label>Mật khẩu mới <span style="color:var(--crit)">*</span></label>
   <input name="newPass" type="password" required minlength="4">
  </div>
  <div class="form-row">
   <label>Xác nhận mật khẩu mới <span style="color:var(--crit)">*</span></label>
   <input name="confirmPass" type="password" required minlength="4">
  </div>

  <div class="row" style="margin-top:14px">
   <button type="button" class="b-s" onclick="dlg.close()">Hủy</button>
   <button type="submit" class="b-p end">Lưu mật khẩu mới</button>
  </div>
 </form>`;
 dlg.showModal();
}

function xuLyDoiMatKhauCaNhan(e){
 e.preventDefault();
 const f = e.target;
 if(f.newPass.value !== f.confirmPass.value){
  alert('Mật khẩu mới và xác nhận mật khẩu không khớp nhau!');
  return;
 }
 const res = auth.doiMatKhau(f.oldPass.value, f.newPass.value);
 if(res.ok){
  dlg.close();
  alert('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới cho lần đăng nhập sau.');
 } else {
  alert(res.msg);
 }
}

/** Xác nhận xóa tài khoản */
function xacNhanXoaTaiKhoan(id){
 const u = (DB.users || []).find(x => x.id === id);
 if(!u) return;

 xacNhan(
  `Xóa tài khoản "${u.username}"?`,
  `Tài khoản (${u.ten}) sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.`,
  () => {
   const res = auth.xoaTaiKhoan(id);
   if(res.ok){
    auth.hienToast('Đã xóa tài khoản');
    render();
   } else {
    alert(res.msg);
   }
  }
 );
}

/** Tự động đồng bộ tài khoản cho chi đoàn */
function dongBoTaiKhoanChiDoan(){
 const cnt = auth.tuDongTaoTaiKhoanChiDoan();
 if(cnt > 0){
  alert(`Đã tự động tạo mới ${cnt} tài khoản cho các Chi đoàn còn thiếu với mật khẩu mặc định là "cd123".`);
  render();
 } else {
  alert('Tất cả Chi đoàn trong danh sách đều đã có tài khoản tương ứng.');
 }
}

/** Modal giải thích các cấp quyền & danh mục quyền */
function moHuongDanPhanQuyen(){
 dlg.classList.add('dlg-wide');
 dlgBody.innerHTML = `
 <h2>ℹ️ Cơ chế Phân quyền hệ thống Sổ tay LCĐ</h2>
 <p class="sub">Hệ thống phân cấp quyền truy cập theo 4 nhóm đối tượng và 10 chức năng chi tiết</p>
 <div class="scroll" style="max-height:55vh;margin-bottom:12px">
  <table>
   <thead><tr><th>Mã</th><th>Tên quyền hạn</th><th>Nhóm</th><th>Mô tả chi tiết</th></tr></thead>
   <tbody>
    ${DANH_SACH_QUYEN.map(q => `
     <tr>
      <td><span class="pill p-xs" style="font-family:monospace">${esc(q.ma)}</span></td>
      <td><b>${esc(q.ten)}</b></td>
      <td><span class="pill p-mute">${esc(q.nhom)}</span></td>
      <td class="t2" style="color:var(--sec)">${esc(q.desc)}</td>
     </tr>`).join('')}
   </tbody>
  </table>
 </div>
 <div class="row" style="margin-top:14px">
  <button type="button" class="b-p end" onclick="dlg.close();dlg.classList.remove('dlg-wide')">Đã hiểu</button>
 </div>`;
 dlg.showModal();
}
