/* Trang nhân sự và đánh giá BCH Liên chi đoàn. */
/* ===================== TRANG — ĐÁNH GIÁ BCH LIÊN CHI ĐOÀN ===================== */
PAGES.bch = function () {
 const bs = bangBCH(), ngan = t => t.split(' ').slice(-2).join(' ');
 const tb = Math.round(bs.reduce((s, x) => s + x.tong, 0) / (bs.length || 1));
 const hopTB = Math.round(DB.ns.reduce((s, u) => s + chuyenCan(u.id).ty, 0) / (DB.ns.length || 1) * 100);
 const bf = state.bf || 'all';
 const dsNS = DB.ns.filter(u => bf === 'all' || u.ban === bf);
 const coQuyenSua = state.role !== 'cd' && (coQuyen('ql_nhansu') || isAdmin());

 return `<div class="head"><div><h1>Nhân sự và đánh giá BCH Liên chi đoàn</h1>
  <p class="sub">${DB.ns.length} nhân sự thuộc ${new Set(DB.ns.map(u => u.ban)).size} ban chuyên môn · ${bs.length} uỷ viên BCH được chấm điểm.</p></div>
  ${coQuyenSua ? '<button class="b-p end" onclick="formUV()">+ Thêm nhân sự</button>' : ''}</div>
 <div class="grid g4">
  ${tile('Nhân sự Liên chi đoàn', DB.ns.length, bs.length + ' UV BCH · ' + DB.ns.filter(u => u.nhom === 'bcm').length + ' thành viên ban · ' + DB.ns.filter(u => u.nhom === 'nguon').length + ' cán bộ nguồn')}
  ${tile('Điểm BCH trung bình', tb + '<span style="font-size:15px;color:var(--muted)">/100</span>', pillXL(xepLoai(tb)))}
  ${tile('Tỷ lệ dự sinh hoạt', hopTB + '%', buoiDaHop().length + ' buổi đã tổ chức')}
  ${tile('Hồ sơ tồn đọng', bs.reduce((s, x) => s + x.ton, 0), 'Hồ sơ chờ duyệt và chi đoàn quá hạn')}
 </div>
 <div class="card"><header><h3>Nhân sự theo ban chuyên môn</h3>
  <div class="end row"><label class="t2" for="bfSel">Ban</label>
  <select id="bfSel" onchange="go('bch',{bf:this.value})"><option value="all"${bf === 'all' ? ' selected' : ''}>Tất cả ban</option>
  ${BAN.map(b => `<option value="${esc(b)}"${bf === b ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div></header>
 <div class="scroll"><table><thead><tr><th>Họ và tên</th><th>Vai trò</th><th>Ban</th><th>Lớp</th><th>SĐT</th>
  <th>Chi đoàn đỡ đầu</th><th class="n">Dự họp</th><th></th></tr></thead>
 <tbody>${NHOM.map(([key, tenN]) => {
  const nh = dsNS.filter(u => u.nhom === key);
  if (!nh.length) return '';
  return `<tr><td colspan="8" style="padding-top:14px;font:600 11.5px var(--ff);letter-spacing:.06em;text-transform:uppercase;color:var(--accent)">${tenN} · ${nh.length} người</td></tr>`
   + nh.map(u => {
    const cc = chuyenCan(u.id);
    const fbLink = u.fb ? '<br>' + hienThiLink(u.fb, 'FB', coQuyenSua ? {
     tieuDe: 'Link FB: ' + u.ten,
     url: u.fb,
     onSave: async v => {
      u.fb = v;
      if (typeof dataApi !== 'undefined' && dataApi.luuNS) {
       try { await dataApi.luuNS(u); } catch (e) { console.error(e); }
      }
      save();
      render();
     }
    } : null) : '';

    return `<tr>
     <td><b>${esc(u.ten)}</b>${u.bch ? ' ' + pill('BCH', 'p-xs') : ''}</td>
     <td>${esc(u.vaiTro)}</td><td class="t2">${esc(u.ban)}</td><td class="t2">${esc(u.lop) || '–'}</td>
     <td class="t2">${u.sdt ? esc(u.sdt) : '–'}${fbLink}</td>
     <td class="t2">${u.theoDoi.length ? u.theoDoi.map(i => esc(CD(i).ma)).join(', ') : '–'}</td>
     <td class="n">${cc.co}/${cc.tong}${cc.vang >= VANG_CANH_BAO ? ' ' + pill('vắng ' + cc.vang, 'p-crit') : ''}</td>
     <td class="n">${coQuyenSua ? `<button class="b-s" onclick="formUV(${u.id})">Sửa</button>` : ''}</td></tr>`;
   }).join('');
 }).join('')}</tbody></table></div></div>
 <div class="note" style="margin-top:14px">Thang điểm uỷ viên BCH: ${BCRIT.map(c => c.ten + ' (' + c.max + 'đ)').join(' · ')}.
  Ba tiêu chí đầu lấy thẳng từ kết quả công tác và số liệu chi đoàn; tiêu chí cuối lấy từ bảng điểm danh sinh hoạt.</div>
 <div class="grid g2">
  <div class="card"><header><h3>Xếp hạng uỷ viên BCH</h3><p class="end">Thang 100 điểm</p></header>
   ${rankBars(bs.map(x => ({ l: ngan(x.u.ten), v: x.tong, tip: x.u.ten + ' — ' + x.u.vaiTro + ' · ' + x.tong + ' điểm · ' + x.xl[1] })), { max: 100, color: 'var(--seq-4)' })}</div>
  <div class="card"><header><h3>Cơ cấu điểm theo 4 tiêu chí</h3></header>
   ${bs.map(x => stackRow(ngan(x.u.ten), x.ct, x.tong, x.u.ten)).join('')}
   ${lgdOf(BCRIT)}</div>
 </div>
 <div class="card"><header><h3>Phân công và kết quả</h3><p class="end">Nhấn tên để xem phiếu đánh giá chi tiết</p></header>
 <div class="scroll"><table><thead><tr><th>Uỷ viên</th><th>Vai trò · Ban</th><th>Đầu việc phụ trách</th><th>Chi đoàn đỡ đầu</th>
  <th class="n">Điểm CĐ đỡ đầu</th><th class="n" title="Hồ sơ chi đoàn chờ duyệt hoặc quá hạn nộp báo cáo (Tiêu chí Xử lý hồ sơ)">Hồ sơ tồn</th><th class="n">Dự họp</th><th class="n" title="Đầu việc hoàn thành trên tổng số đầu việc phụ trách">Đầu việc xong</th><th class="n">Điểm</th><th>Xếp loại</th></tr></thead>
 <tbody>${bs.map(x => `<tr><td><b><a href="#bch" onclick="xemUV(${x.u.id});return false">${esc(x.u.ten)}</a></b></td>
  <td>${esc(x.u.vaiTro)}<div class="t2">${esc(x.u.ban)}</div></td>
  <td class="t2">${x.khs.length ? x.khs.map(y => esc(y.k.ma)).join(', ') : '–'}</td>
  <td class="t2">${x.u.theoDoi.length ? x.u.theoDoi.map(i => esc(CD(i).ma)).join(', ') : 'toàn khoa'}</td>
  <td class="n">${x.cds.length ? Math.round(x.cds.reduce((s, i) => s + kpi(i).tong, 0) / x.cds.length) : 0}</td>
  <td class="n" title="${x.ton ? x.ton + ' hồ sơ chờ duyệt hoặc chi đoàn quá hạn nộp' : 'Không có hồ sơ tồn đọng'}">${x.ton ? pill(x.ton, 'p-crit') : '0'}</td>
  <td class="n">${x.cc.co}/${x.cc.tong}</td><td class="n" title="${x.nv.xong}/${x.nv.giao} đầu việc hoàn thành${x.nv.giao > x.nv.xong ? ' · còn ' + (x.nv.giao - x.nv.xong) + ' việc đang thực hiện' : ''}${x.nv.tre ? ' · ' + x.nv.tre + ' việc quá hạn' : ''}">${x.nv.xong}/${x.nv.giao}${x.nv.tre ? ' ' + pill('trễ ' + x.nv.tre, 'p-crit') : ''}</td>
  <td class="n"><b>${x.tong}</b></td><td>${pillXL(x.xl)}</td></tr>`).join('')}</tbody></table></div></div>`;
};

function xemUV(id) {
 const x = kpiBCH(id);
 dlgBody.innerHTML = `<h2>${esc(x.u.ten)}</h2>
 <p class="sub">${esc(x.u.vaiTro)} · ${esc(x.u.ban)}${x.u.lop ? ' · ' + esc(x.u.lop) : ''}${x.u.sdt ? ' · ' + esc(x.u.sdt) : ''}</p>
 <div class="row" style="margin-bottom:12px"><span style="font-family:var(--fd);font-size:30px;font-weight:600">${x.tong}</span>
  <span class="t2">/100 điểm</span><span class="end">${pillXL(x.xl)}</span></div>
 <table><tbody>${x.ct.map(c => `<tr><td>${c.ten}<div class="t2">${esc(c.ghi)}</div></td>
  <td style="width:100px"><span class="track"><i style="width:${c.diem / c.max * 100}%;background:${c.c}"></i></span></td>
  <td class="n" style="width:62px"><b>${c.diem}</b>/${c.max}</td></tr>`).join('')}</tbody></table>
 <div class="note" style="margin:12px 0"><b>Đầu việc phụ trách:</b><br>${x.khs.length ? x.khs.map(y => esc(y.k.ma) + ' — ' + esc(y.k.ten) + ' (' + (TIENDO[y.k.tienDo] ? TIENDO[y.k.tienDo][0] : 'Đang thực hiện') + ' · ' + y.ht + '%)').join('<br>') : 'chưa có'}
  <div style="margin-top:6px;font-weight:500" class="t2">Tiến độ nhiệm vụ: ${x.nv.xong}/${x.nv.giao} đầu việc hoàn thành${x.nv.giao > x.nv.xong ? ' · còn ' + (x.nv.giao - x.nv.xong) + ' việc đang thực hiện / chưa đến hạn' : ''}</div>
  ${x.nv.tre ? '<div style="margin-top:4px"><b style="color:var(--crit)">⚠️ ' + x.nv.tre + ' đầu việc quá hạn chưa hoàn thành</b></div>' : ''}
  <div style="margin-top:4px" class="t2">Hồ sơ chờ xử lý: ${x.ton ? x.ton + ' hồ sơ (chờ duyệt hoặc chi đoàn quá hạn nộp)' : '0 hồ sơ tồn đọng'}</div></div>
 <div class="row"><button type="button" class="end b-p" id="dong_xem">Đóng</button></div>`;
 dlg.showModal();
 const dong = dlgBody.querySelector('#dong_xem');
 if (dong) dong.onclick = () => dlg.close();
}

function formUV(id) {
 if (state.role === 'cd' || (!coQuyen('ql_nhansu') && !isAdmin())) {
  alert('Bạn không có quyền quản lý nhân sự Liên chi đoàn.');
  return;
 }
 const u = id ? UV(id) : { ten: '', vaiTro: 'Thành viên', ban: 'Ban Phong trào', lop: '', sdt: '', mssv: '', fb: '', bch: 0, theoDoi: [] };
 dlgBody.innerHTML = `<h2>${id ? 'Sửa' : 'Thêm'} nhân sự Liên chi đoàn</h2>
 <div class="f"><label for="u_ten">Họ và tên</label><input id="u_ten" value="${esc(u.ten)}"></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="u_cv">Vai trò</label>
  <select id="u_cv">${VAITRO.map(v => `<option${v === u.vaiTro ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
 <div class="f" style="flex:1.4"><label for="u_ban">Ban chuyên môn</label>
  <select id="u_ban">${BAN.map(v => `<option${v === u.ban ? ' selected' : ''}>${v}</option>`).join('')}</select></div></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="u_lop">Lớp</label><input id="u_lop" value="${esc(u.lop)}"></div>
 <div class="f" style="flex:1"><label for="u_mssv">MSSV</label><input id="u_mssv" value="${esc(u.mssv)}"></div>
 <div class="f" style="flex:1"><label for="u_sdt">Số điện thoại</label><input id="u_sdt" value="${esc(u.sdt)}"></div></div>
 <div class="f"><label for="u_fb">Link Facebook</label><input id="u_fb" value="${esc(u.fb)}"></div>
 <div class="row" style="margin-top:-6px;margin-bottom:10px"><button type="button" class="b-s" id="u_test_fb">🔗 Thử mở link Facebook</button></div>
 <div class="f"><label for="u_nhom">Thuộc khối</label><select id="u_nhom">
  ${NHOM.map(([v, t]) => `<option value="${v}"${(u.nhom || 'bcm') === v ? ' selected' : ''}>${t}${v === 'bch' ? ' (được chấm điểm)' : ''}</option>`).join('')}</select></div>
 <div class="f"><label>Chi đoàn được phân công đỡ đầu</label>
  <div class="row">${DB.cd.map(c => `<label class="t2" style="display:flex;gap:5px;align-items:center">
   <input type="checkbox" class="u_cd" value="${c.id}" ${u.theoDoi.includes(c.id) ? 'checked' : ''}>${esc(c.ma)}</label>`).join('')}</div></div>
 <div class="row"><button type="button" id="huy">Huỷ</button>${id ? '<button type="button" class="b-no" id="btn_xoa">Xoá</button>' : ''}
  <button type="button" class="b-p end" id="luu">Lưu</button></div>`;
 dlg.showModal();

 const huy = dlgBody.querySelector('#huy');
 if (huy) huy.onclick = () => dlg.close();

 const btnXoa = dlgBody.querySelector('#btn_xoa');
 if (btnXoa && id) {
  btnXoa.onclick = () => xoaUV(id);
 }

 dlgBody.querySelector('#u_test_fb').onclick = () => {
  const v = dlgBody.querySelector('#u_fb').value.trim();
  if (!v) return alert('Vui lòng nhập link Facebook trước khi thử mở!');
  const link = chuanHoaLink(v);
  if (!link) return alert('Đường dẫn không hợp lệ hoặc không an toàn.');
  window.open(link, '_blank', 'noopener,noreferrer');
 };

 const u_ten = dlgBody.querySelector('#u_ten');
 const u_cv = dlgBody.querySelector('#u_cv');
 const u_ban = dlgBody.querySelector('#u_ban');
 const u_lop = dlgBody.querySelector('#u_lop');
 const u_mssv = dlgBody.querySelector('#u_mssv');
 const u_sdt = dlgBody.querySelector('#u_sdt');
 const u_fb = dlgBody.querySelector('#u_fb');
 const u_nhom = dlgBody.querySelector('#u_nhom');
 const luu = dlgBody.querySelector('#luu');

 luu.onclick = async () => {
  if (!u_ten.value.trim()) return u_ten.focus();
  const rawFb = u_fb.value.trim();
  const safeFb = isSafeUrl(rawFb) ? rawFb : (rawFb ? esc(rawFb) : '');
  const o = {
   ten: u_ten.value.trim(),
   vaiTro: u_cv.value,
   ban: u_ban.value,
   lop: u_lop.value.trim(),
   mssv: u_mssv.value.trim(),
   sdt: u_sdt.value.trim(),
   fb: safeFb,
   nhom: u_nhom.value,
   bch: u_nhom.value === 'bch' ? 1 : 0,
   theoDoi: [...dlgBody.querySelectorAll('.u_cd:checked')].map(i => +i.value)
  };

  luu.disabled = true;
  luu.textContent = 'Đang lưu...';

  let uRec;
  if (id) {
   uRec = UV(id);
   Object.assign(uRec, o);
  } else {
   uRec = { id: nextId(DB.ns), ...o };
   DB.ns.push(uRec);
  }

  if (typeof dataApi !== 'undefined' && dataApi.luuNS) {
   try {
    await dataApi.luuNS(uRec);
   } catch (e) {
    console.error('Lỗi khi lưu nhân sự:', e);
    alert('Lưu lên máy chủ gặp lỗi: ' + (e.message || e));
   }
  }

  save();
  dlg.close();
  render();
 };
}

function xoaUV(id) {
 if (state.role === 'cd' || (!coQuyen('ql_nhansu') && !isAdmin())) {
  alert('Bạn không có quyền xoá nhân sự Liên chi đoàn.');
  return;
 }
 const u = UV(id);
 dlg.close();
 xacNhan('Xoá nhân sự?', u.ten + ' sẽ bị xoá khỏi danh sách và khỏi các bảng điểm danh.', async () => {
  if (typeof dataApi !== 'undefined' && dataApi.xoaNS) {
   try {
    await dataApi.xoaNS(id);
   } catch (e) {
    console.error('Lỗi khi xoá nhân sự trên máy chủ:', e);
   }
  }
  DB.ns = DB.ns.filter(x => x.id !== id);
  DB.dd = DB.dd.filter(d => d.nsId !== id);
  DB.kh.forEach(k => {
   k.ptIds = k.ptIds.filter(i => i !== id);
   k.ptId = k.ptIds[0] || null;
  });
  save();
  render();
 });
}
