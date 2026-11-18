/* Hệ thống Xác thực, Phân quyền và Quản trị Người dùng qua Supabase */
/* ===================== AUTH OBJECT ===================== */

const ROLE_INFO = {
 admin: { ten: 'Quản trị viên', badge: 'p-crit', icon: '🛡️', desc: 'Toàn quyền cấu hình hệ thống, quản trị tài khoản và cơ sở dữ liệu' },
 lcd:   { ten: 'BCH Liên chi đoàn', badge: 'p-xs', icon: '🏛️', desc: 'Quản lý toàn diện công tác Đoàn, giao chỉ tiêu, duyệt báo cáo và đánh giá KPI' },
 cd:    { ten: 'BCH Chi đoàn', badge: 'p-good', icon: '🚩', desc: 'Quản lý hoạt động chi đoàn, nộp báo cáo minh chứng và theo dõi đoàn viên' },
 bbt:   { ten: 'Ban Biên tập / Giám sát', badge: 'p-warn', icon: '📝', desc: 'Xem thông tin, giám sát số liệu và hỗ trợ truyền thông' }
};

function getSupabaseClient() {
 if (window._supabaseClient) return window._supabaseClient;
 if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
  return null;
 }
 const cfg = window.APP_CONFIG || {};
 if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
  return null;
 }
 window._supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
  auth: {
   autoRefreshToken: true,
   persistSession: true,
   detectSessionInUrl: true
  }
 });
 return window._supabaseClient;
}

const auth = {
 currentUser: null,
 status: 'loading', // 'loading' | 'unconfigured' | 'unauthenticated' | 'authenticated'
 _profileCache: [],

 async init() {
  this.status = 'loading';
  const client = getSupabaseClient();
  if (!client) {
   this.status = 'unconfigured';
   this.currentUser = null;
   render();
   return;
  }

  try {
   const { data, error } = await client.auth.getSession();
   if (error) throw error;

   if (data && data.session && data.session.user) {
    const ok = await this._loadUserProfile(data.session.user.id);
    if (ok) {
     this.status = 'authenticated';
     this.dongBoQuyenState();
     await dataApi.loadAll();
     render();
     this._setupAuthListener(client);
     return;
    }
   }
  } catch (err) {
   console.error('Lỗi khởi tạo phiên xác thực:', err);
  }

  this.status = 'unauthenticated';
  this.currentUser = null;
  render();
  this._setupAuthListener(client);
 },

 _setupAuthListener(client) {
  if (this._listenerAttached || !client) return;
  this._listenerAttached = true;

  client.auth.onAuthStateChange(async (event, session) => {
   if (event === 'SIGNED_OUT' || !session) {
    this.currentUser = null;
    this.status = 'unauthenticated';
    DB = { cd: [], ns: [], kh: [], hop: [], dd: [], bc: [], hd: [], dv: [] };
    state.page = 'tongquan';
    render();
   } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
    if (session.user && (!this.currentUser || this.currentUser.id !== session.user.id)) {
     const ok = await this._loadUserProfile(session.user.id);
     if (ok) {
      this.status = 'authenticated';
      this.dongBoQuyenState();
      await dataApi.loadAll();
      render();
     }
    }
   }
  });
 },

 async _loadUserProfile(userId) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
   const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

   if (error || !data) {
    console.warn('Không tải được hồ sơ người dùng:', error);
    // Nếu chưa có profile trong profiles table (ví dụ admin mới khởi tạo), kiểm tra nếu có thể bootstrap
    const { count } = await client.from('profiles').select('*', { count: 'exact', head: true });
    if (count === 0) {
     // Gọi bootstrap admin đầu tiên
     const resBootstrap = await client.rpc('bootstrap_initial_admin', { p_ten: 'Quản trị viên khởi tạo' });
     if (resBootstrap && resBootstrap.data && resBootstrap.data.ok) {
      return await this._loadUserProfile(userId);
     }
    }
    await client.auth.signOut();
    return false;
   }

   if (data.active === false) {
    alert('Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Quản trị viên hệ thống.');
    await client.auth.signOut();
    return false;
   }

   this.currentUser = {
    id: data.id,
    email: data.email,
    ten: data.ten || data.email,
    role: data.role,
    cdId: data.cd_id,
    sdt: data.sdt || '',
    active: data.active,
    quyen: Array.isArray(data.quyen) ? data.quyen : (QUYEN_THEO_VAI_TRO[data.role] || [])
   };

   return true;
  } catch (err) {
   console.error('Lỗi khi nạp hồ sơ người dùng:', err);
   return false;
  }
 },

 dongBoQuyenState() {
  if (!this.currentUser) return;
  const u = this.currentUser;
  if (u.role === 'cd') {
   state.role = 'cd';
   state.cdId = u.cdId || 1;
  } else {
   if (state.role !== 'cd') {
    state.role = 'lcd';
   }
  }
 },

 coQuyen(quyenId, customUser) {
  const u = customUser || this.currentUser;
  if (!u || u.active === false) return false;
  if (u.role === 'admin') return true;
  return Array.isArray(u.quyen) && u.quyen.includes(quyenId);
 },

 isAdmin(customUser) {
  const u = customUser || this.currentUser;
  return Boolean(u && u.active !== false && u.role === 'admin');
 },

 isLoggedIn() {
  return Boolean(this.currentUser && this.currentUser.active !== false);
 },

 async login(email, password) {
  const mail = String(email || '').trim().toLowerCase();
  const pass = String(password || '');

  if (!mail || !pass) {
   return { ok: false, msg: 'Vui lòng nhập đầy đủ email và mật khẩu!' };
  }

  const client = getSupabaseClient();
  if (!client) {
   return { ok: false, msg: 'Chưa cấu hình kết nối Supabase (thiếu URL hoặc Public Key).' };
  }

  try {
   const { data, error } = await client.auth.signInWithPassword({
    email: mail,
    password: pass
   });

   if (error) {
    let msg = error.message;
    if (msg.includes('Invalid login credentials')) {
     msg = 'Email hoặc mật khẩu không chính xác!';
    }
    return { ok: false, msg };
   }

   if (!data || !data.user) {
    return { ok: false, msg: 'Không tìm thấy thông tin phiên người dùng.' };
   }

   const ok = await this._loadUserProfile(data.user.id);
   if (!ok) {
    return { ok: false, msg: 'Tài khoản chưa được cấp hồ sơ hoặc quyền sử dụng trong hệ thống.' };
   }

   this.status = 'authenticated';
   this.dongBoQuyenState();
   await dataApi.loadAll();
   render();
   return { ok: true, user: this.currentUser };
  } catch (err) {
   return { ok: false, msg: 'Lỗi đăng nhập: ' + (err.message || 'Lỗi không xác định') };
  }
 },

 async logout() {
  const client = getSupabaseClient();
  if (client) {
   try {
    await client.auth.signOut();
   } catch (e) {}
  }
  this.currentUser = null;
  this.status = 'unauthenticated';
  DB = { cd: [], ns: [], kh: [], hop: [], dd: [], bc: [], hd: [], dv: [] };
  state.page = 'tongquan';
  render();
 },

 async doiMatKhau(newPass) {
  if (!this.currentUser) return { ok: false, msg: 'Chưa đăng nhập!' };
  if (!newPass || newPass.length < 6) {
   return { ok: false, msg: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' };
  }
  const client = getSupabaseClient();
  if (!client) return { ok: false, msg: 'Chưa kết nối máy chủ xác thực.' };

  try {
   const { error } = await client.auth.updateUser({ password: newPass });
   if (error) throw error;
   return { ok: true };
  } catch (err) {
   return { ok: false, msg: 'Lỗi đổi mật khẩu: ' + err.message };
  }
 },

 async quenMatKhau(email) {
  const mail = String(email || '').trim().toLowerCase();
  if (!mail) return { ok: false, msg: 'Vui lòng nhập địa chỉ email hợp lệ.' };
  const client = getSupabaseClient();
  if (!client) return { ok: false, msg: 'Chưa kết nối máy chủ xác thực.' };

  try {
   const { error } = await client.auth.resetPasswordForEmail(mail, {
    redirectTo: window.location.href.split('#')[0]
   });
   if (error) throw error;
   return { ok: true, msg: 'Đã gửi hướng dẫn khôi phục mật khẩu tới email của bạn.' };
  } catch (err) {
   return { ok: false, msg: 'Lỗi khôi phục mật khẩu: ' + err.message };
  }
 },

 hienToast(msg) {
  let t = document.getElementById('toastBox');
  if (!t) {
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

 renderTrangDangNhap() {
  if (this.status === 'unconfigured') {
   return `
   <div class="login-wrapper">
    <div class="login-box">
     <div class="login-logo-wrap">
      <img src="assets/logo.webp" alt="Logo LCĐ KHUD" class="login-logo">
     </div>
     <div class="login-header">
      <h1>Cấu hình kết nối hệ thống</h1>
      <p class="sub">Hệ thống chưa tìm thấy thông tin kết nối Supabase (URL & Public Anon Key).</p>
     </div>
     <div class="card" style="margin-bottom:16px;text-align:left">
      <p style="font-size:13px;line-height:1.6">Ứng dụng đã được chuyển đổi sang mô hình bảo mật máy chủ Supabase Auth & PostgreSQL RLS. Để kích hoạt:</p>
      <ol style="font-size:13px;line-height:1.6;padding-left:20px;margin:8px 0">
       <li>Sao chép file <code>.env.example</code> thành <code>.env</code> và điền thông tin dự án Supabase.</li>
       <li>Chạy file migration trong thư mục <code>supabase/migrations/</code>.</li>
       <li>Hoặc cấu hình tạm thời bên dưới để thử nghiệm trên trình duyệt:</li>
      </ol>
      <div class="f">
       <label for="cfg_url">Supabase Project URL</label>
       <input id="cfg_url" placeholder="https://xyzcompany.supabase.co" value="${esc(window.APP_CONFIG ? window.APP_CONFIG.SUPABASE_URL : '')}">
      </div>
      <div class="f">
       <label for="cfg_key">Supabase Publishable Anon Key</label>
       <input id="cfg_key" placeholder="eyJhbGciOi..." value="${esc(window.APP_CONFIG ? window.APP_CONFIG.SUPABASE_ANON_KEY : '')}">
      </div>
      <button type="button" class="b-p" style="width:100%;margin-top:8px" onclick="luuConfigTamThoi()">Lưu cấu hình và tiếp tục</button>
     </div>
    </div>
   </div>`;
  }

  if (this.status === 'loading') {
   return `
   <div class="login-wrapper">
    <div class="login-box" style="text-align:center;padding:48px 24px">
     <div class="login-logo-wrap"><img src="assets/logo.webp" alt="Logo LCĐ KHUD" class="login-logo"></div>
     <h2>Đang kiểm tra phiên xác thực...</h2>
     <p class="sub">Vui lòng chờ trong giây lát.</p>
    </div>
   </div>`;
  }

  return `
  <div class="login-wrapper">
   <div class="login-box">
    <div class="login-logo-wrap">
     <img src="assets/logo.webp" alt="Logo LCĐ KHUD" class="login-logo">
    </div>
    
    <div class="login-header">
     <h1>Đăng nhập hệ thống</h1>
     <p class="sub" style="margin-bottom:12px">Sổ tay theo dõi công tác & Đánh giá KPI Chi đoàn</p>
    </div>

    <form id="loginForm" onsubmit="auth.handleLoginSubmit(event)">
     <div id="loginAlert" class="alert-box alert-crit" style="display:none;margin-bottom:12px"></div>

     <div class="form-row">
      <label for="loginUser">Email đăng nhập</label>
      <div class="input-icon-wrap">
       <span class="input-icon">✉️</span>
       <input id="loginUser" type="email" placeholder="Địa chỉ email đã được cấp tài khoản" autocomplete="email" required autofocus>
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
      <a href="#" onclick="formQuenMatKhau();return false;" class="forgot-link">Quên mật khẩu?</a>
     </div>

     <button type="submit" class="b-p login-submit-btn">Đăng nhập</button>
    </form>

    <div class="login-footer" style="margin-top:20px;border-top:1px solid var(--border);padding-top:12px">
     <span>Nhiệm kỳ 2025 – 2027 · Phân quyền máy chủ & Supabase Auth</span>
    </div>
   </div>
  </div>`;
 },

 togglePasswordVisibility(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') {
   inp.type = 'text';
   btn.textContent = '🙈';
  } else {
   inp.type = 'password';
   btn.textContent = '👁️';
  }
 },

 async handleLoginSubmit(e) {
  e.preventDefault();
  const uInp = document.getElementById('loginUser');
  const pInp = document.getElementById('loginPass');
  const alertBox = document.getElementById('loginAlert');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (submitBtn) {
   submitBtn.disabled = true;
   submitBtn.textContent = 'Đang xác thực...';
  }

  const res = await this.login(uInp.value, pInp.value);
  if (!res.ok) {
   if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Đăng nhập';
   }
   if (alertBox) {
    alertBox.textContent = res.msg;
    alertBox.style.display = 'block';
   } else {
    alert(res.msg);
   }
  }
 }
};

function luuConfigTamThoi() {
 const url = document.getElementById('cfg_url').value.trim();
 const key = document.getElementById('cfg_key').value.trim();
 if (!url || !key) {
  alert('Vui lòng nhập cả Supabase Project URL và Publishable Anon Key.');
  return;
 }
 try {
  localStorage.setItem('lcdkhud_supabase_url', url);
  localStorage.setItem('lcdkhud_supabase_anon_key', key);
  window.APP_CONFIG = { SUPABASE_URL: url, SUPABASE_ANON_KEY: key };
  window._supabaseClient = null;
  auth.init();
 } catch (e) {
  alert('Không thể lưu cấu hình: ' + e.message);
 }
}

function formQuenMatKhau() {
 dlgBody.innerHTML = `<h2>🔑 Quên mật khẩu</h2>
 <p class="sub">Nhập email tài khoản đã đăng ký để nhận link đặt lại mật khẩu từ hệ thống Supabase.</p>
 <div class="f">
  <label for="f_email">Email đăng nhập</label>
  <input id="f_email" type="email" placeholder="admin@is.vnu.edu.vn" required>
 </div>
 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  <button type="button" class="b-p end" id="gui">Gửi email khôi phục</button>
 </div>`;
 dlg.showModal();
 dlgBody.querySelector('#huy').onclick = () => dlg.close();
 dlgBody.querySelector('#gui').onclick = async () => {
  const mail = dlgBody.querySelector('#f_email').value.trim();
  const res = await auth.quenMatKhau(mail);
  alert(res.msg);
  if (res.ok) dlg.close();
 };
}

function formDoiMatKhau() {
 dlgBody.innerHTML = `<h2>🔒 Đổi mật khẩu tài khoản</h2>
 <p class="sub">Cập nhật mật khẩu mới cho tài khoản hiện tại (${esc(auth.currentUser ? auth.currentUser.email : '')}).</p>
 <div class="f">
  <label for="f_new_pass">Mật khẩu mới (tối thiểu 6 ký tự)</label>
  <input id="f_new_pass" type="password" required>
 </div>
 <div class="f">
  <label for="f_confirm_pass">Xác nhận mật khẩu mới</label>
  <input id="f_confirm_pass" type="password" required>
 </div>
 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  <button type="button" class="b-p end" id="luu">Đổi mật khẩu</button>
 </div>`;
 dlg.showModal();
 dlgBody.querySelector('#huy').onclick = () => dlg.close();
 dlgBody.querySelector('#luu').onclick = async () => {
  const p1 = dlgBody.querySelector('#f_new_pass').value;
  const p2 = dlgBody.querySelector('#f_confirm_pass').value;
  if (!p1 || p1.length < 6) {
   alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
   return;
  }
  if (p1 !== p2) {
   alert('Xác nhận mật khẩu mới không khớp!');
   return;
  }
  const res = await auth.doiMatKhau(p1);
  if (!res.ok) {
   alert(res.msg);
  } else {
   alert('Đã đổi mật khẩu thành công!');
   dlg.close();
  }
 };
}

/* ===================== TRANG QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN (ADMIN ONLY) ===================== */
PAGES.users = async function() {
 const curUser = auth.currentUser;
 if (!curUser || curUser.role !== 'admin') {
  return `
  <div class="card" style="text-align:center;padding:48px 24px">
   <div style="font-size:48px;margin-bottom:12px">🚫</div>
   <h2>Không có quyền truy cập</h2>
   <p class="sub">Trang Quản trị & Phân quyền chỉ dành riêng cho Quản trị viên hệ thống (Admin).</p>
   <button class="b-p" onclick="go('tongquan')" type="button">Quay lại Trang chủ</button>
  </div>`;
 }

 const client = getSupabaseClient();
 let profiles = [];
 if (client) {
  try {
   const { data } = await client.from('profiles').select('*').order('created_at');
   profiles = data || [];
  } catch (e) {}
 }

 const totalCount = profiles.length;
 const adminCount = profiles.filter(x => x.role === 'admin').length;
 const lcdCount = profiles.filter(x => x.role === 'lcd').length;
 const cdCount = profiles.filter(x => x.role === 'cd').length;
 const activeCount = profiles.filter(x => x.active !== false).length;

 state.userTab = state.userTab || 'list';

 return `
 <div class="card" style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
   <div>
    <h1>👥 Quản trị tài khoản & Phân quyền máy chủ</h1>
    <p class="sub" style="margin-bottom:0">Quản trị danh tính người dùng và phân quyền dựa trên Row-Level Security (RLS) của Supabase.</p>
   </div>
   <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="b-p" onclick="formMoiTaiKhoan()" type="button">+ Cấp tài khoản mới</button>
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
  <div class="table-wrap">
   <table>
    <thead>
     <tr>
      <th>Email / Tên</th>
      <th>Vai trò</th>
      <th>Chi đoàn</th>
      <th>Trạng thái</th>
      <th>Số quyền</th>
      <th class="n">Thao tác</th>
     </tr>
    </thead>
    <tbody>
     ${profiles.map(u => {
      const info = ROLE_INFO[u.role] || ROLE_INFO.cd;
      const cdObj = u.cd_id ? (DB.cd.find(c => c.id === u.cd_id)) : null;
      const qCount = Array.isArray(u.quyen) ? u.quyen.length : 0;
      const isCur = curUser.id === u.id;
      return `
      <tr>
       <td>
        <b>${esc(u.ten || u.email)}</b>
        <div class="t2" style="font-size:11px">${esc(u.email)}</div>
       </td>
       <td><span class="pill ${info.badge}">${info.icon} ${info.ten}</span></td>
       <td>${cdObj ? `<span class="pill p-xs">${esc(cdObj.ma)}</span>` : '<span class="t2">–</span>'}</td>
       <td>
        <span class="pill ${u.active !== false ? 'p-good' : 'p-crit'}">
         ${u.active !== false ? '● Hoạt động' : '🔒 Đã khóa'}
        </span>
       </td>
       <td><span class="pill p-xs">${qCount} quyền</span></td>
       <td class="n">
        <button class="b-s" onclick="formSuaProfile('${u.id}')" type="button">✏️ Sửa vai trò/quyền</button>
       </td>
      </tr>`;
     }).join('')}
    </tbody>
   </table>
  </div>
 </div>`;
};

function formMoiTaiKhoan() {
 dlgBody.innerHTML = `<h2>+ Cấp tài khoản người dùng mới</h2>
 <p class="sub">Tạo tài khoản xác thực qua Supabase Auth và phân quyền trong hệ thống.</p>
 <div class="f">
  <label for="u_email">Email đăng ký</label>
  <input id="u_email" type="email" placeholder="example@is.vnu.edu.vn" required>
 </div>
 <div class="f">
  <label for="u_pass">Mật khẩu khởi tạo (tối thiểu 6 ký tự)</label>
  <input id="u_pass" type="password" required>
 </div>
 <div class="f">
  <label for="u_ten">Họ và tên người sử dụng</label>
  <input id="u_ten" placeholder="Nguyễn Văn A" required>
 </div>
 <div class="f">
  <label for="u_role">Vai trò</label>
  <select id="u_role" onchange="doiVaiTroMoi()">
   <option value="cd">BCH Chi đoàn</option>
   <option value="lcd">BCH Liên chi đoàn</option>
   <option value="bbt">Ban Biên tập / Giám sát</option>
   <option value="admin">Quản trị viên (Admin)</option>
  </select>
 </div>
 <div class="f" id="box_cd">
  <label for="u_cdId">Chi đoàn phụ trách</label>
  <select id="u_cdId">
   ${DB.cd.map(c => `<option value="${c.id}">${esc(c.ma)} – ${esc(c.ten)}</option>`).join('')}
  </select>
 </div>
 <div class="row">
  <button type="button" id="huy">Hủy</button>
  <button type="button" class="b-p end" id="tao">Tạo tài khoản</button>
 </div>`;
 dlg.showModal();
 dlgBody.querySelector('#huy').onclick = () => dlg.close();
 dlgBody.querySelector('#tao').onclick = async () => {
  const email = dlgBody.querySelector('#u_email').value.trim();
  const pass = dlgBody.querySelector('#u_pass').value;
  const ten = dlgBody.querySelector('#u_ten').value.trim();
  const role = dlgBody.querySelector('#u_role').value;
  const cdId = role === 'cd' ? +dlgBody.querySelector('#u_cdId').value : null;

  if (!email || !pass || !ten) {
   alert('Vui lòng điền đầy đủ email, mật khẩu và họ tên.');
   return;
  }
  const client = getSupabaseClient();
  if (!client) {
   alert('Chưa kết nối Supabase.');
   return;
  }
  try {
   const { data, error } = await client.auth.signUp({
    email,
    password: pass,
    options: {
     data: { ten, role }
    }
   });
   if (error) throw error;
   if (data && data.user) {
    const quyen = QUYEN_THEO_VAI_TRO[role] || [];
    await client.from('profiles').insert({
     id: data.user.id,
     email,
     ten,
     role,
     cd_id: cdId,
     quyen,
     active: true
    });
    alert('Đã tạo tài khoản thành công!');
    dlg.close();
    render();
   }
  } catch (err) {
   alert('Lỗi tạo tài khoản: ' + err.message);
  }
 };
}

function doiVaiTroMoi() {
 const r = document.getElementById('u_role');
 const b = document.getElementById('box_cd');
 if (r && b) {
  b.style.display = r.value === 'cd' ? 'block' : 'none';
 }
}

async function formSuaProfile(profileId) {
 const client = getSupabaseClient();
 if (!client) return;
 const { data: p } = await client.from('profiles').select('*').eq('id', profileId).single();
 if (!p) return;

 dlgBody.innerHTML = `<h2>✏️ Chỉnh sửa tài khoản & phân quyền</h2>
 <p class="sub">${esc(p.ten)} (${esc(p.email)})</p>
 <div class="f">
  <label for="ep_ten">Họ và tên</label>
  <input id="ep_ten" value="${esc(p.ten)}">
 </div>
 <div class="f">
  <label for="ep_role">Vai trò</label>
  <select id="ep_role">
   <option value="admin" ${p.role==='admin'?'selected':''}>Quản trị viên (Admin)</option>
   <option value="lcd" ${p.role==='lcd'?'selected':''}>BCH Liên chi đoàn</option>
   <option value="cd" ${p.role==='cd'?'selected':''}>BCH Chi đoàn</option>
   <option value="bbt" ${p.role==='bbt'?'selected':''}>Ban Biên tập / Giám sát</option>
  </select>
 </div>
 <div class="f">
  <label for="ep_cdId">Chi đoàn (nếu vai trò Chi đoàn)</label>
  <select id="ep_cdId">
   <option value="">(Không thuộc chi đoàn)</option>
   ${DB.cd.map(c => `<option value="${c.id}" ${p.cd_id===c.id?'selected':''}>${esc(c.ma)} – ${esc(c.ten)}</option>`).join('')}
  </select>
 </div>
 <div class="f">
  <label><input type="checkbox" id="ep_active" ${p.active!==false?'checked':''}> Tài khoản đang hoạt động (Bỏ chọn để khóa)</label>
 </div>
 <div class="row">
  <button type="button" id="huy">Hủy</button>
  <button type="button" class="b-p end" id="luu">Lưu thay đổi</button>
 </div>`;
 dlg.showModal();
 dlgBody.querySelector('#huy').onclick = () => dlg.close();
 dlgBody.querySelector('#luu').onclick = async () => {
  const ten = dlgBody.querySelector('#ep_ten').value.trim();
  const role = dlgBody.querySelector('#ep_role').value;
  const cdVal = dlgBody.querySelector('#ep_cdId').value;
  const cdId = (role === 'cd' && cdVal) ? +cdVal : null;
  const active = dlgBody.querySelector('#ep_active').checked;

  const { error } = await client.from('profiles').update({
   ten,
   role,
   cd_id: cdId,
   active
  }).eq('id', profileId);

  if (error) {
   alert('Lỗi cập nhật hồ sơ: ' + error.message);
  } else {
   alert('Đã cập nhật hồ sơ thành công!');
   dlg.close();
   render();
  }
 };
}

function moHuongDanPhanQuyen() {
 dlgBody.innerHTML = `<h2>ℹ️ Cơ chế Phân quyền & Bảo mật</h2>
 <p class="sub">Ranh giới danh tính và phân quyền dựa trên Supabase RLS</p>
 <div class="card" style="line-height:1.6;font-size:13px">
  <p><b>1. Quản trị viên (Admin):</b> Toàn quyền cấu hình, khởi tạo dữ liệu và quản lý tài khoản người dùng.</p>
  <p><b>2. BCH Liên chi đoàn (LCĐ):</b> Quản lý tiến độ công tác, duyệt báo cáo và đánh giá KPI. Không can thiệp trái phép vào tài khoản Admin.</p>
  <p><b>3. BCH Chi đoàn (CD):</b> Chỉ có quyền nộp báo cáo, khai báo hoạt động và quản lý đoàn viên của đúng Chi đoàn mình được phân công.</p>
  <p><b>4. Ban Biên tập (BBT):</b> Chế độ chỉ đọc dữ liệu tối thiểu phục vụ công tác truyền thông.</p>
 </div>
 <div class="row"><button type="button" class="b-p end" onclick="dlg.close()">Đã hiểu</button></div>`;
 dlg.showModal();
}


const coQuyen = (q, u) => typeof auth !== 'undefined' && auth.coQuyen(q, u);
const isAdmin = u => typeof auth !== 'undefined' && auth.isAdmin(u);
const isLoggedIn = () => typeof auth !== 'undefined' && auth.isLoggedIn();
