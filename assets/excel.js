/* Nhập / xuất Excel theo đúng định dạng file checklist của LCĐ. */
/* ===================== NHẬP / XUẤT EXCEL ===================== */
const bo = t => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
const cot = (h, ...ten) => h.findIndex(x => ten.some(t => bo(x) === bo(t) || bo(x).startsWith(bo(t))));
const tachBang = t => t.trim().split(/\r?\n/).map(l => l.split(l.includes('\t') ? '\t' : ',').map(c => c.trim().replace(/^"|"$/g, '')));
const coXLSX = () => typeof XLSX !== 'undefined';
const taiDuoc = () => { try { return window.self === window.top; } catch (e) { return false; } };

const XUAT = {
 tongket: ['Tong ket KPI chi doan', () => [['Chi đoàn', 'Ngành', 'Sĩ số', ...CRIT.map(c => c.ten), 'Điểm trừ', 'Tổng điểm', 'Xếp loại', 'Lượt tham gia', 'Lượt/SV', 'Đoàn phí (%)'],
  ...bangXH().map(c => [c.ma, c.nganh, c.siSo, ...c.chiTiet.map(x => x.diem), c.diemTru, c.tong, c.xl[1], c.luot, huyDong(c.id), tyLePhi(c.id)])]],
 doanvien: ['Danh sach doan vien', () => [['Họ và tên', 'MSSV', 'Chi đoàn', 'Chức vụ', 'ĐRL', 'Xếp loại ĐV', 'Số HĐ', 'Đoàn phí', 'Ghi chú'],
  ...DB.dv.filter(d => state.role === 'lcd' || d.cdId === state.cdId).map(d => [d.ten, d.mssv, CD(d.cdId).ma, d.cv, d.drl, xepLoai(d.drl)[1], d.soHD, d.doanPhi ? 'x' : '', d.ghiChu])]],
 kehoach: ['Ke hoach va tien do', () => [['Mã kế hoạch', 'Tên kế hoạch', 'Tiêu chí', 'Phụ trách', 'Bắt đầu', 'Hạn chót', 'Chỉ tiêu', 'Đơn vị', 'Điểm tối đa', 'Bắt buộc', 'CĐ đã nộp', 'CĐ đạt chỉ tiêu', 'Tổng lượt', 'TB % chỉ tiêu'],
  ...DB.kh.map(k => { const t = thongKeKH(k); return [k.ma, k.ten, critOf(k.crit).ten, k.ptId && UV(k.ptId) ? UV(k.ptId).ten : '', k.batDau, k.hanChot, k.chiTieu, k.donVi === '%' ? '% sĩ số' : 'lượt', k.diem, k.batBuoc ? 'x' : '', t.nop, t.dat, t.luot, t.tbTy]; })]],
 baocao: ['Bao cao chi tiet', () => [['Mã kế hoạch', 'Tên kế hoạch', 'Chi đoàn', 'Chỉ tiêu', 'Số lượt', '% chỉ tiêu', 'Ngày nộp', 'Trễ hạn', 'Trạng thái', 'Điểm quy đổi', 'Minh chứng'],
  ...DB.bc.map(b => { const k = KH(b.khId), c = CD(b.cdId), ct = chiTieuSo(k, c);
   return [k.ma, k.ten, c.ma, ct, b.soLuot, Math.round(b.soLuot / ct * 100), b.ngayNop, b.treHan ? 'x' : '', ST[b.status][0], diemKH(k, c).diem, b.mc]; })]],
 matran: ['Ma tran chi tieu', () => { const kh = DB.kh.filter(k => k.chiTieu && k.batDau <= TODAY);
  return [['Chi đoàn', ...kh.map(k => k.ma)], ...DB.cd.map(c => [c.ma, ...kh.map(k => { const r = thongKeKH(k).rows.find(x => x.cd.id === c.id); return r.b ? r.ty : ''; })])]; }],
 bch: ['Danh gia BCH LCD', () => [['Họ và tên', 'Chức vụ', 'Ban', 'Kế hoạch chủ trì', 'Chi đoàn đỡ đầu', ...BCRIT.map(c => c.ten), 'Tổng điểm', 'Xếp loại', 'Dự họp', 'Nhiệm vụ'],
  ...bangBCH().map(x => [x.u.ten, x.u.cv, x.u.ban, x.khs.map(y => y.k.ma).join(' '), x.u.theoDoi.map(i => CD(i).ma).join(' '),
   ...x.ct.map(c => c.diem), x.tong, x.xl[1], x.u.hopDu + '/' + x.u.hopTong, x.u.nvXong + '/' + x.u.nvGiao])]],
 nhiemvu: ['Nhiem vu chi doan', () => [['Mã kế hoạch', 'Tên kế hoạch', 'Tiêu chí', 'Hạn chót', 'Chỉ tiêu', 'Đã làm', '% chỉ tiêu', 'Trạng thái', 'Điểm'],
  ...DB.kh.map(k => { const c = CD(state.cdId), b = bcOf(k.id, c.id), ct = chiTieuSo(k, c);
   return [k.ma, k.ten, critOf(k.crit).ten, k.hanChot, ct, b ? b.soLuot : '', b ? Math.round(b.soLuot / ct * 100) : '', b ? ST[b.status][0] : 'Chưa nộp', diemKH(k, c).diem]; })]],
};

const MAU = {
 doanvien: [['Họ và tên', 'MSSV', 'Chi đoàn', 'Chức vụ', 'ĐRL', 'Số HĐ', 'Đoàn phí', 'Ghi chú'],
  ['Nguyễn Văn A', '2261100', 'DH22TUD', 'Đoàn viên', 88, 5, 'x', 'Cảm tình Đảng']],
 baocao: [['Mã kế hoạch', 'Chi đoàn', 'Số lượt', 'Ngày nộp', 'Minh chứng'],
  ['KH-05', 'DH22TUD', 22, '2026-10-09', 'https://drive.google.com/kh05-dh22tud']],
};

function xuatBang(key, rows, ten) {
 const data = rows || XUAT[key][1]();
 const ten2 = ten || XUAT[key][0];
 const tsv = data.map(r => r.map(v => String(v ?? '')).join('\t')).join('\n');
 dlgBody.innerHTML = `<h2>Xuất: ${esc(ten2)}</h2>
 <p class="sub">${data.length - 1} dòng × ${data[0].length} cột</p>
 <textarea id="x_ta" readonly style="width:100%;height:150px;font:12px/1.5 ui-monospace,Consolas,monospace;resize:vertical">${esc(tsv)}</textarea>
 <p class="t2" style="margin:8px 0 12px">Bấm “Sao chép” rồi dán vào ô A1 của Excel hoặc Google Sheets (Ctrl+V) — cột tự tách đúng.</p>
 <div class="row"><button type="button" class="b-p" id="cp">Sao chép toàn bộ</button>
  ${coXLSX() && taiDuoc() ? '<button type="button" id="dl">Tải file .xlsx</button>' : ''}
  <button type="button" class="end" id="huy">Đóng</button></div>`;
 dlg.showModal();
 const huy = dlgBody.querySelector('#huy');
 if (huy) huy.onclick = () => dlg.close();
 const cp = dlgBody.querySelector('#cp');
 const ta = dlgBody.querySelector('#x_ta');
 if (cp) {
  cp.onclick = () => {
   try {
    navigator.clipboard.writeText(tsv).then(() => { cp.textContent = 'Đã sao chép ✓'; }, () => { ta.select(); cp.textContent = 'Hãy bấm Ctrl+C'; });
   } catch (e) {
    ta.select();
    cp.textContent = 'Hãy bấm Ctrl+C';
   }
  };
 }
 const dl = dlgBody.querySelector('#dl');
 if (dl) {
  dl.onclick = () => {
   const wb = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Sheet1');
   XLSX.writeFile(wb, ten2 + '.xlsx');
  };
 }
}

function apDungDV(rows) {
 const h = rows[0];
 const iTen = cot(h, 'ho va ten', 'ho ten', 'ten');
 const iMs = cot(h, 'mssv', 'ma so');
 const iCd = cot(h, 'chi doan', 'ma chi doan');
 const iCv = cot(h, 'chuc vu');
 const iDrl = cot(h, 'drl', 'diem ren luyen');
 const iHd = cot(h, 'so hd', 'so hoat dong');
 const iPhi = cot(h, 'doan phi');
 const iGc = cot(h, 'ghi chu');

 if (iTen < 0 || iMs < 0) return { loi: 'File thiếu cột “Họ và tên” hoặc “MSSV”.' };
 if (state.role === 'cd' && !coQuyen('ql_doanvien')) return { loi: 'Tài khoản chi đoàn không có quyền quản lý đoàn viên.' };
 if (state.role !== 'cd' && !coQuyen('ql_nhansu') && !isAdmin()) return { loi: 'Tài khoản không có quyền nhập danh sách đoàn viên.' };

 let them = 0, sua = 0, boQua = 0, trungKhac = 0;
 const danhSachLuu = [];

 rows.slice(1).filter(r => r[iTen]).forEach(r => {
  let cdId = state.role === 'cd' ? state.cdId : null;
  if (cdId === null) {
   const m = DB.cd.find(c => bo(c.ma) === bo(r[iCd]) || bo(c.ten) === bo(r[iCd]));
   if (!m) { boQua++; return; }
   cdId = m.id;
  }
  const rawDrl = +(r[iDrl] || 0) || 0;
  const drl = Math.max(0, Math.min(100, Math.round(rawDrl)));
  const soHD = Math.max(0, Math.round(+(r[iHd] || 0) || 0));
  const o = {
   ten: String(r[iTen]).trim(),
   mssv: String(r[iMs] ?? '').trim(),
   cv: (iCv >= 0 && r[iCv]) ? String(r[iCv]).trim() : 'Đoàn viên',
   drl,
   soHD,
   doanPhi: ['x', 'co', '1', 'da nop', 'roi', 'true', 'v'].includes(bo(r[iPhi])),
   ghiChu: (iGc >= 0 && r[iGc]) ? String(r[iGc]).trim() : ''
  };

  const cu = DB.dv.find(d => d.mssv && d.mssv === o.mssv);
  if (cu) {
   if (state.role === 'cd' && cu.cdId !== state.cdId) {
    trungKhac++;
    return;
   }
   Object.assign(cu, o, { cdId: state.role === 'cd' ? state.cdId : cdId });
   danhSachLuu.push(cu);
   sua++;
  } else {
   const moi = { id: nextId(DB.dv), cdId, ...o };
   DB.dv.push(moi);
   danhSachLuu.push(moi);
   them++;
  }
 });

 return {
  ok: 'Đã thêm ' + them + ' đoàn viên, cập nhật ' + sua + ' đoàn viên'
   + (trungKhac ? ', bỏ qua ' + trungKhac + ' MSSV thuộc chi đoàn khác' : '')
   + (boQua ? ', bỏ qua ' + boQua + ' dòng không khớp mã chi đoàn' : '') + '.',
  items: danhSachLuu,
  loai: 'dv'
 };
}

function apDungBC(rows) {
 if (state.role === 'cd' && !coQuyen('nop_bc')) return { loi: 'Tài khoản chi đoàn không có quyền nộp báo cáo.' };
 if (state.role !== 'cd' && !coQuyen('duyet_bc') && !isAdmin()) return { loi: 'Tài khoản không có quyền duyệt/nhập báo cáo kế hoạch.' };

 const h = rows[0];
 const iKh = cot(h, 'ma ke hoach', 'ma kh', 'ke hoach');
 const iCd = cot(h, 'chi doan', 'ma chi doan');
 const iSo = cot(h, 'so luot', 'so luong', 'thuc hien');
 const iNgay = cot(h, 'ngay nop');
 const iMc = cot(h, 'minh chung');

 if (iKh < 0 || iSo < 0) return { loi: 'File thiếu cột “Mã kế hoạch” hoặc “Số lượt”.' };
 let them = 0, sua = 0, boQua = 0;
 const danhSachLuu = [];

 rows.slice(1).filter(r => r[iKh]).forEach(r => {
  const k = DB.kh.find(x => bo(x.ma) === bo(r[iKh]));
  let cdId = state.role === 'cd' ? state.cdId : null;
  if (cdId === null) {
   const m = DB.cd.find(c => bo(c.ma) === bo(r[iCd]));
   if (m) cdId = m.id;
  }
  if (!k || !cdId || !(+r[iSo] >= 0)) { boQua++; return; }

  const ngay = (iNgay >= 0 && r[iNgay]) ? String(r[iNgay]).slice(0, 10) : TODAY;
  const rawMc = (iMc >= 0 && r[iMc]) ? String(r[iMc]).trim() : '';
  const mc = isSafeUrl(rawMc) ? rawMc : (rawMc ? esc(rawMc) : '(chưa có)');
  const o = {
   soLuot: Math.max(0, Math.round(+r[iSo] || 0)),
   ngayNop: ngay,
   treHan: ngay > k.hanChot,
   mc,
   status: 'wait',
   nx: ''
  };

  const cu = bcOf(k.id, cdId);
  if (cu) {
   if (state.role === 'cd' && cu.status === 'pass') {
    boQua++;
    return;
   }
   Object.assign(cu, o);
   danhSachLuu.push(cu);
   sua++;
  } else {
   const moi = { id: nextId(DB.bc), khId: k.id, cdId, ...o };
   DB.bc.push(moi);
   danhSachLuu.push(moi);
   them++;
  }
 });

 return {
  ok: 'Đã thêm ' + them + ' báo cáo, cập nhật ' + sua + ' báo cáo'
   + (boQua ? ', bỏ qua ' + boQua + ' dòng không khớp hoặc hồ sơ đã được duyệt' : '') + '. Tất cả ở trạng thái Chờ duyệt.',
  items: danhSachLuu,
  loai: 'bc'
 };
}

let nhapRows = null;

Object.assign(XUAT, {
 nhansu: ['DS nhan su LCD', () => [['No.', 'Họ và Tên', 'SĐT', 'MSSV', 'Lớp', 'Vai trò', 'Ban', 'Khối', 'Link FB', 'Chi đoàn đỡ đầu'],
  ...DB.ns.map((u, i) => [i + 1, u.ten, u.sdt, u.mssv, u.lop, u.vaiTro, u.ban, tenNhom(u.nhom), u.fb, u.theoDoi.map(x => CD(x).ma).join(' ')])]],
 timeline: ['Cong tac theo timeline', () => [['STT', 'HOẠT ĐỘNG', 'THỜI GIAN', 'TIẾN ĐỘ', 'Ban Phụ Trách', 'PHỤ TRÁCH', 'LỊCH CÔNG TÁC', 'NOTE', 'Minh Chứng', 'Kết quả', 'Chỉ tiêu / CĐ', 'Điểm tối đa', 'CĐ đã nộp', 'TB % chỉ tiêu'],
  ...DB.kh.map((k, i) => { const t = k.chiTieu ? thongKeKH(k) : null;
   return [i + 1, k.ten, k.hienThi || dmy(k.batDau), TIENDO[k.tienDo][0], k.ban.join(', '), k.ptIds.map(x => UV(x) ? UV(x).ten : '').filter(Boolean).join(' / '),
    (k.lich || []).map(m => (m.xong ? '[x] ' : '[ ] ') + m.ten + ' — ' + m.han).join(' | '), k.note, k.mc, k.ketQua, k.chiTieu ? k.chiTieu + (k.donVi === '%' ? '% sĩ số' : ' lượt') : 'nội bộ LCĐ', k.diem || '', t ? t.nop : '', t ? t.tbTy : '']; })]],
 lichcongtac: ['Lich cong tac', () => [['Mã', 'Đầu việc', 'Mốc công tác', 'Hạn', 'Người phụ trách', 'Trạng thái'],
  ...DB.kh.flatMap(k => (k.lich || []).map(m => [k.ma, k.ten, m.ten, m.han, m.nsId && UV(m.nsId) ? UV(m.nsId).ten : '',
   m.xong ? 'Đã xong' : (m.han < TODAY ? 'Quá hạn' : 'Đang làm')]))]],
 sinhhoat: ['So sinh hoat LCD', () => [['STT', 'HOẠT ĐỘNG', 'THỜI GIAN', 'NỘI DUNG', 'BIÊN BẢN CUỘC HỌP', 'Tệp đính kèm', 'Có mặt', 'Vắng'],
  ...DB.hop.map((h, i) => { const co = DB.ns.filter(u => { const d = ddOf(h.id, u.id); return d && d.co; }).length;
   return [i + 1, h.ten, h.ngay, h.noiDung, h.bienBan, (h.tep || []).map(t => t.ten).join(' | '), co, DB.ns.length - co]; })]],
 diemdanh: ['Diem danh sinh hoat', () => { const hs = buoiDaHop();
  return [['No.', 'Họ và Tên', 'Vai trò', 'Ban', ...hs.map(h => h.ngay), 'Vắng', 'Muộn'],
   ...DB.ns.map((u, i) => { const cc = chuyenCan(u.id);
    return [i + 1, u.ten, u.vaiTro, u.ban, ...hs.map(h => { const d = ddOf(h.id, u.id); return !d || !d.co ? 'FALSE' : (d.muon ? 'MUON' : 'TRUE'); }), cc.vang, cc.muon]; })]; }],
 danhgiabch: ['Danh gia BCH LCD', () => [['Họ và Tên', 'Vai trò', 'Ban', 'Đầu việc phụ trách', 'Chi đoàn đỡ đầu', ...BCRIT.map(c => c.ten), 'Tổng điểm', 'Xếp loại', 'Dự họp', 'Đầu việc xong'],
  ...bangBCH().map(x => [x.u.ten, x.u.vaiTro, x.u.ban, x.khs.map(y => y.k.ma).join(' '), x.u.theoDoi.map(i => CD(i).ma).join(' '),
   ...x.ct.map(c => c.diem), x.tong, x.xl[1], x.cc.co + '/' + x.cc.tong, x.nv.xong + '/' + x.nv.giao])]],
});

Object.assign(MAU, {
 nhansu: [['No.', 'Họ và Tên', 'SĐT', 'MSSV', 'Lớp', 'Vai trò', 'Link FB'],
  ['Ban Phong trào', '', '', '', '', '', ''],
  [1, 'Nguyễn Văn A', '0900000000', '23070001', 'BDA2023A', 'Trưởng ban', 'https://facebook.com/a']],
 timeline: [['STT', 'HOẠT ĐỘNG', 'THỜI GIAN', 'TIẾN ĐỘ', 'Ban Phụ Trách', 'PHỤ TRÁCH', 'LỊCH CÔNG TÁC', 'NOTE', 'Minh Chứng', 'Kết quả'],
  [1, 'Workshop làm hoa', '20/10/2026', 'Đang triển khai', 'Ban Tình nguyện', 'Trần Huyền / Thành Tân', '', '', 'https://drive.google.com/example', '']],
});

/** Nhập sheet "DS NHÂN SỰ": dòng chỉ có tên ban được hiểu là tiêu đề nhóm. */
function apDungNS(rows) {
 if (state.role === 'cd' || (!coQuyen('ql_nhansu') && !isAdmin())) return { loi: 'Chỉ LCĐ hoặc Quản trị viên mới có quyền nhập danh sách nhân sự LCĐ.' };
 const h = rows[0];
 const iTen = cot(h, 'ho va ten', 'ho ten');
 const iSdt = cot(h, 'sdt', 'dien thoai');
 const iMs = cot(h, 'mssv');
 const iLop = cot(h, 'lop');
 const iVt = cot(h, 'vai tro', 'chuc vu');
 const iFb = cot(h, 'link fb', 'facebook');
 const iBan = cot(h, 'ban');

 if (iTen < 0) return { loi: 'File thiếu cột “Họ và Tên”.' };
 let them = 0, sua = 0, banHienTai = 'Thường trực', nhomHienTai = 'bcm';
 const danhSachLuu = [];

 rows.slice(1).forEach(r => {
  const day = r.filter(c => String(c ?? '').trim() !== '');
  if (day.length === 1) {
   const t = bo(day[0]);
   if (/key|nguon/.test(t)) { nhomHienTai = 'nguon'; return; }
   if (/ban chap hanh|^bch/.test(t)) { nhomHienTai = 'bch'; return; }
   if (/^ban |^thuong truc|^thuong vu/.test(t)) { banHienTai = matBan(day[0]); nhomHienTai = 'bcm'; return; }
   return;
  }
  const ten = String(r[iTen] ?? '').trim();
  if (!ten) return;
  const ban = iBan >= 0 && r[iBan] ? matBan(r[iBan]) : banHienTai;
  const vt = iVt >= 0 && r[iVt] ? matVaiTro(r[iVt]) : 'Thành viên';
  const rawFb = iFb >= 0 ? String(r[iFb] ?? '').trim() : '';
  const fb = isSafeUrl(rawFb) ? rawFb : (rawFb ? esc(rawFb) : '');
  const o = {
   ten,
   ban,
   vaiTro: vt,
   sdt: iSdt >= 0 ? String(r[iSdt] ?? '').trim() : '',
   mssv: iMs >= 0 ? String(r[iMs] ?? '').trim() : '',
   lop: iLop >= 0 ? String(r[iLop] ?? '').trim() : '',
   fb,
   nhom: ['Bí thư', 'Phó Bí thư', 'UV BTV', 'UV BCH'].includes(vt) ? 'bch' : nhomHienTai,
   bch: ['Bí thư', 'Phó Bí thư', 'UV BTV', 'UV BCH'].includes(vt) || nhomHienTai === 'bch' ? 1 : 0
  };

  const cu = DB.ns.find(u => bo(u.ten) === bo(ten));
  if (cu) {
   Object.assign(cu, o);
   danhSachLuu.push(cu);
   sua++;
  } else {
   const moi = { id: nextId(DB.ns), theoDoi: [], ...o };
   DB.ns.push(moi);
   danhSachLuu.push(moi);
   them++;
  }
 });

 return {
  ok: 'Đã thêm ' + them + ' nhân sự, cập nhật ' + sua + ' nhân sự theo ban chuyên môn.',
  items: danhSachLuu,
  loai: 'ns'
 };
}

const matBan = t => {
 const x = bo(t);
 if (/tckt|to chuc|kiem tra/.test(x)) return 'Ban Tổ chức – Kiểm tra';
 if (/tchc|tai chinh|hau can/.test(x)) return 'Ban Tài chính – Hậu cần';
 if (/tthong|truyen thong/.test(x)) return 'Ban Truyền thông';
 if (/tinh nguyen/.test(x)) return 'Ban Tình nguyện';
 if (/phong trao/.test(x)) return 'Ban Phong trào';
 if (/hoc tap|nckh/.test(x)) return 'Ban Học tập & NCKH';
 return BAN.find(b => bo(b) === x) || 'Thường trực';
};

const matVaiTro = t => {
 const x = bo(t);
 return x === 'bt' || (x.includes('bi thu') && !x.includes('pho')) ? 'Bí thư' :
  x === 'pbt' || x.includes('pho bi thu') ? 'Phó Bí thư' :
  x.includes('btv') ? 'UV BTV' :
  x.includes('bch') ? 'UV BCH' :
  x.includes('truong ban') ? 'Trưởng ban' :
  x.includes('pho ban') ? 'Phó ban' : 'Thành viên';
};

const matTienDo = t => {
 const x = bo(t);
 return x.includes('hoan thanh') ? 'xong' : x.includes('dang') ? 'dang' : 'chua';
};

const ngayISO = t => {
 const s = String(t ?? '').trim();
 let m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
 if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
 m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
 if (m) return m[0];
 return '';
};

/** Nhập sheet "CÔNG TÁC THEO TIMELINE". */
function apDungTL(rows) {
 if (state.role === 'cd' || (!coQuyen('ql_kh') && !isAdmin())) return { loi: 'Chỉ LCĐ hoặc Quản trị viên mới có quyền nhập kế hoạch công tác theo timeline.' };
 const h = rows[0];
 const iTen = cot(h, 'hoat dong', 'ten');
 const iTg = cot(h, 'thoi gian');
 const iTd = cot(h, 'tien do');
 const iBan = cot(h, 'ban phu trach');
 const iPt = cot(h, 'phu trach');
 const iNote = cot(h, 'note', 'ghi chu');
 const iMc = cot(h, 'minh chung');
 const iKq = cot(h, 'ket qua');

 if (iTen < 0) return { loi: 'File thiếu cột “HOẠT ĐỘNG”.' };
 let them = 0, sua = 0;
 const danhSachLuu = [];

 rows.slice(1).forEach(r => {
  const ten = String(r[iTen] ?? '').trim();
  if (!ten) return;
  const hienThi = iTg >= 0 ? String(r[iTg] ?? '').trim() : '';
  const d = ngayISO(hienThi) || TODAY;
  const rawMc = iMc >= 0 ? String(r[iMc] ?? '').trim() : '';
  const mc = isSafeUrl(rawMc) ? rawMc : (rawMc ? esc(rawMc) : '');
  const o = {
   ten,
   hienThi: hienThi || dmy(d),
   tienDo: iTd >= 0 ? matTienDo(r[iTd]) : 'chua',
   ban: iBan >= 0 && r[iBan] ? String(r[iBan]).split(',').map(x => matBan(x)).filter((v, i, a) => a.indexOf(v) === i) : ['Thường trực'],
   ptIds: iPt >= 0 && r[iPt] ? String(r[iPt]).split('/').map(x => { const u = DB.ns.find(n => bo(n.ten).includes(bo(x))); return u && u.id; }).filter(Boolean) : [],
   note: iNote >= 0 ? String(r[iNote] ?? '').trim() : '',
   mc,
   ketQua: iKq >= 0 ? String(r[iKq] ?? '').trim() : ''
  };

  const cu = DB.kh.find(k => bo(k.ten) === bo(ten));
  if (cu) {
   Object.assign(cu, o, { ptId: o.ptIds[0] ?? cu.ptId });
   danhSachLuu.push(cu);
   sua++;
  } else {
   const id = nextId(DB.kh);
   const moi = {
    id,
    ma: 'KH-' + String(id).padStart(2, '0'),
    crit: 'ct',
    batDau: d,
    hanChot: d,
    lich: [],
    diem: 0,
    chiTieu: 0,
    donVi: 'n',
    batBuoc: false,
    ptId: o.ptIds[0],
    ...o
   };
   DB.kh.push(moi);
   danhSachLuu.push(moi);
   them++;
  }
 });

 return {
  ok: 'Đã thêm ' + them + ' đầu việc, cập nhật ' + sua + ' đầu việc. Hoạt động mới chưa giao chỉ tiêu — mở từng việc để giao chỉ tiêu cho chi đoàn.',
  items: danhSachLuu,
  loai: 'kh'
 };
}

/** Nhập sheet "ĐIỂM DANH": các cột từ sau "Vai trò" là ngày sinh hoạt. */
function apDungDD(rows) {
 if (state.role === 'cd' || (!coQuyen('ql_nhansu') && !isAdmin())) return { loi: 'Chỉ LCĐ hoặc Quản trị viên mới có quyền nhập điểm danh.' };
 const h = rows[0];
 const iTen = cot(h, 'ho va ten', 'ho ten');
 if (iTen < 0) return { loi: 'File thiếu cột “Họ và Tên”.' };

 const cols = [];
 h.forEach((c, i) => { const d = ngayISO(c); if (d) cols.push({ i, ngay: d }); });
 if (!cols.length) return { loi: 'Không tìm thấy cột ngày sinh hoạt nào ở dòng tiêu đề.' };

 let buoiMoi = 0, o = 0;
 const danhSachLuu = [];

 cols.forEach(c => {
  if (!DB.hop.find(x => x.ngay === c.ngay)) {
   const moiHop = { id: nextId(DB.hop), ten: 'Họp Liên chi đoàn KHUD', ngay: c.ngay, noiDung: '', bienBan: '' };
   DB.hop.push(moiHop);
   buoiMoi++;
  }
 });

 rows.slice(1).forEach(r => {
  const ten = String(r[iTen] ?? '').trim();
  if (!ten) return;
  const u = DB.ns.find(x => bo(x.ten) === bo(ten));
  if (!u) return;

  cols.forEach(c => {
   const hop = DB.hop.find(x => x.ngay === c.ngay);
   const v = bo(r[c.i]);
   const co = ['true', 'x', 'có', 'co', '1', 'v', 'yes'].includes(v);
   const muon = v.includes('muon');
   let d = ddOf(hop.id, u.id);
   if (d) {
    d.co = co || muon;
    d.muon = muon;
   } else {
    d = { hopId: hop.id, nsId: u.id, co: co || muon, muon };
    DB.dd.push(d);
   }
   danhSachLuu.push(d);
   o++;
  });
 });

 return {
  ok: 'Đã cập nhật ' + o + ' ô điểm danh' + (buoiMoi ? ', tạo mới ' + buoiMoi + ' buổi sinh hoạt' : '') + '.',
  items: danhSachLuu,
  loai: 'dd'
 };
}

/* ===================== CHUẨN HÓA, DRY-RUN, BATCH IMPORT & ĐỐI SOÁT ===================== */
const chuanHoaChuoi = v => String(v ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
const chuanHoaMaSo = v => String(v ?? '').normalize('NFC').trim().replace(/^'+/, '').replace(/^(\d+)\.0+$/, '$1');
function ngayISOChuan(t) {
 const s = chuanHoaChuoi(t);
 if (!s) return '';
 let y, m, d;
 let mt = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
 if (mt) { d = +mt[1]; m = +mt[2]; y = +mt[3]; }
 else {
  mt = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!mt) return '';
  y = +mt[1]; m = +mt[2]; d = +mt[3];
 }
 const dt = new Date(Date.UTC(y, m - 1, d));
 if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) return '';
 return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

async function tinhChecksumImport(loai, rows) {
 const canon = JSON.stringify({ loai, rows });
 if (typeof storageApi !== 'undefined' && typeof storageApi.sha256Hex === 'function') {
  return storageApi.sha256Hex(new TextEncoder().encode(canon).buffer);
 }
 throw new Error('Không tính được mã băm SHA-256 của tệp nguồn.');
}

/** Dry-run 100% chỉ-đọc: chuẩn hóa, kiểm tra quyền/trùng/ràng buộc, không sửa DB bộ nhớ hoặc máy chủ */
function dryRunImport(loai, rawRows) {
 if (!Array.isArray(rawRows) || rawRows.length < 2) {
  return { loi: 'File không có dòng tiêu đề hoặc không có dữ liệu.' };
 }
 const h = rawRows[0].map(c => chuanHoaChuoi(c));
 const dataRows = rawRows.slice(1).filter(r => Array.isArray(r) && r.some(c => chuanHoaChuoi(c) !== ''));
 if (!dataRows.length) return { loi: 'Không có dòng dữ liệu nào khác trống.' };

 const strippedCols = [];
 h.forEach(col => {
  const b = bo(col);
  if (['role', 'vai tro he thong', 'quyen', 'active'].includes(b)) strippedCols.push(col);
  if (loai === 'bc' && ['trang thai', 'status', 'diem quy doi', 'diem'].includes(b)) strippedCols.push(col);
 });

 const actions = [];
 const errors = [];
 const skipped = [];
 const duplicates = [];
 let createCount = 0, updateCount = 0, skipCount = 0, errorCount = 0;

 if (loai === 'dv') {
  if (state.role === 'cd' && !coQuyen('ql_doanvien')) return { loi: 'Tài khoản chi đoàn không có quyền quản lý đoàn viên.' };
  if (state.role !== 'cd' && !coQuyen('ql_nhansu') && !isAdmin()) return { loi: 'Tài khoản không có quyền nhập danh sách đoàn viên.' };
  const iTen = cot(h, 'ho va ten', 'ho ten', 'ten');
  const iMs = cot(h, 'mssv', 'ma so');
  const iCd = cot(h, 'chi doan', 'ma chi doan');
  const iCv = cot(h, 'chuc vu');
  const iDrl = cot(h, 'drl', 'diem ren luyen');
  const iHd = cot(h, 'so hd', 'so hoat dong');
  const iPhi = cot(h, 'doan phi');
  const iGc = cot(h, 'ghi chu');
  if (iTen < 0 || iMs < 0) return { loi: 'File thiếu cột bắt buộc “Họ và tên” hoặc “MSSV”.' };
  if (state.role !== 'cd' && iCd < 0) return { loi: 'File thiếu cột “Chi đoàn” khi nhập ở cấp LCĐ.' };

  const seenMssv = new Map();
  dataRows.forEach((r, idx) => {
   const line = idx + 2;
   const ten = chuanHoaChuoi(r[iTen]);
   const mssv = chuanHoaMaSo(r[iMs]);
   if (!ten || !mssv) {
    errorCount++;
    errors.push({ line, msg: 'Thiếu Họ và tên hoặc MSSV.' });
    return;
   }
   if (seenMssv.has(mssv)) {
    errorCount++;
    const msg = `Trùng MSSV "${mssv}" với dòng ${seenMssv.get(mssv)} trong cùng file.`;
    duplicates.push({ line, key: mssv, msg });
    errors.push({ line, msg });
    return;
   }
   seenMssv.set(mssv, line);

   let cdId = state.role === 'cd' ? state.cdId : null;
   if (cdId === null) {
    const cdVal = chuanHoaChuoi(r[iCd]);
    const m = DB.cd.find(c => bo(c.ma) === bo(cdVal) || bo(c.ten) === bo(cdVal));
    if (!m) {
     errorCount++;
     errors.push({ line, msg: `Không tìm thấy mã chi đoàn "${cdVal}".` });
     return;
    }
    cdId = m.id;
   } else if (iCd >= 0 && chuanHoaChuoi(r[iCd])) {
    const myCd = CD(cdId);
    const cdVal = chuanHoaChuoi(r[iCd]);
    if (myCd && bo(myCd.ma) !== bo(cdVal) && bo(myCd.ten) !== bo(cdVal)) {
     errorCount++;
     errors.push({ line, msg: `Chi đoàn "${cdVal}" không khớp phạm vi chi đoàn đang đăng nhập (${myCd.ma}).` });
     return;
    }
   }

   let drl = 0;
   if (iDrl >= 0 && chuanHoaChuoi(r[iDrl]) !== '') {
    const n = Number(chuanHoaChuoi(r[iDrl]));
    if (!Number.isFinite(n) || n < 0 || n > 100) {
     errorCount++;
     errors.push({ line, msg: `ĐRL "${r[iDrl]}" không hợp lệ (phải từ 0 đến 100).` });
     return;
    }
    drl = Math.round(n);
   }
   let soHD = 0;
   if (iHd >= 0 && chuanHoaChuoi(r[iHd]) !== '') {
    const n = Number(chuanHoaChuoi(r[iHd]));
    if (!Number.isFinite(n) || n < 0) {
     errorCount++;
     errors.push({ line, msg: `Số HĐ "${r[iHd]}" không hợp lệ (phải >= 0).` });
     return;
    }
    soHD = Math.round(n);
   }
   const cvRaw = iCv >= 0 ? chuanHoaChuoi(r[iCv]) : '';
   const validCv = ['Bí thư', 'Phó Bí thư', 'Uỷ viên BCH', 'Đoàn viên'];
   const cv = cvRaw ? (validCv.find(x => bo(x) === bo(cvRaw)) || '') : 'Đoàn viên';
   if (!cv) {
    errorCount++;
    errors.push({ line, msg: `Chức vụ "${cvRaw}" không thuộc danh mục (${validCv.join(', ')}).` });
    return;
   }

   const recPayload = {
    cdId,
    ten,
    mssv,
    cv,
    drl,
    soHD,
    doanPhi: iPhi >= 0 ? ['x', 'co', '1', 'da nop', 'roi', 'true', 'v'].includes(bo(r[iPhi])) : false,
    ghiChu: iGc >= 0 ? chuanHoaChuoi(r[iGc]) : ''
   };

   const existing = DB.dv.find(d => d.mssv && d.mssv === mssv);
   if (existing) {
    if (existing.cdId !== cdId) {
     errorCount++;
     const ownerCd = CD(existing.cdId);
     errors.push({ line, msg: `Xung đột MSSV "${mssv}": đang thuộc chi đoàn ${ownerCd ? ownerCd.ma : existing.cdId}, hệ thống không tự ý chuyển chi đoàn.` });
     return;
    }
    updateCount++;
    actions.push({
     line, table: 'doan_vien', action: 'updated',
     before: {
      cd_id: existing.cdId, ten: existing.ten, mssv: existing.mssv, cv: existing.cv,
      drl: existing.drl, doan_phi: existing.doanPhi, so_hd: existing.soHD, ghi_chu: existing.ghiChu
     },
     record: { ...existing, ...recPayload }
    });
   } else {
    createCount++;
    actions.push({ line, table: 'doan_vien', action: 'created', before: null, record: recPayload });
   }
  });
 } else if (loai === 'bc') {
  if (state.role === 'cd' && !coQuyen('nop_bc')) return { loi: 'Tài khoản chi đoàn không có quyền nộp báo cáo.' };
  if (state.role !== 'cd' && !coQuyen('duyet_bc') && !isAdmin()) return { loi: 'Tài khoản không có quyền nhập báo cáo kế hoạch.' };
  const iKh = cot(h, 'ma ke hoach', 'ma kh', 'ke hoach');
  const iCd = cot(h, 'chi doan', 'ma chi doan');
  const iSo = cot(h, 'so luot', 'so luong', 'thuc hien');
  const iNgay = cot(h, 'ngay nop');
  const iMc = cot(h, 'minh chung');
  if (iKh < 0 || iSo < 0) return { loi: 'File thiếu cột “Mã kế hoạch” hoặc “Số lượt”.' };
  if (state.role !== 'cd' && iCd < 0) return { loi: 'File thiếu cột “Chi đoàn” khi nhập ở cấp LCĐ.' };

  const seenKey = new Map();
  dataRows.forEach((r, idx) => {
   const line = idx + 2;
   const khCode = chuanHoaMaSo(r[iKh]);
   const k = DB.kh.find(x => bo(x.ma) === bo(khCode));
   if (!k) {
    errorCount++;
    errors.push({ line, msg: `Không tìm thấy mã kế hoạch "${khCode}".` });
    return;
   }
   let cdId = state.role === 'cd' ? state.cdId : null;
   if (cdId === null) {
    const cdVal = chuanHoaChuoi(r[iCd]);
    const m = DB.cd.find(c => bo(c.ma) === bo(cdVal) || bo(c.ten) === bo(cdVal));
    if (!m) {
     errorCount++;
     errors.push({ line, msg: `Không tìm thấy chi đoàn "${cdVal}".` });
     return;
    }
    cdId = m.id;
   }
   const key = `${k.id}:${cdId}`;
   if (seenKey.has(key)) {
    errorCount++;
    const msg = `Trùng báo cáo (${k.ma} · ${CD(cdId).ma}) với dòng ${seenKey.get(key)} trong cùng file.`;
    duplicates.push({ line, key, msg });
    errors.push({ line, msg });
    return;
   }
   seenKey.set(key, line);

   const nSo = Number(chuanHoaChuoi(r[iSo]));
   if (!Number.isFinite(nSo) || nSo < 0) {
    errorCount++;
    errors.push({ line, msg: `Số lượt "${r[iSo]}" không hợp lệ.` });
    return;
   }
   const rawNgay = iNgay >= 0 ? chuanHoaChuoi(r[iNgay]) : '';
   const ngayNop = rawNgay ? ngayISOChuan(rawNgay) : TODAY;
   if (rawNgay && !ngayNop) {
    errorCount++;
    errors.push({ line, msg: `Ngày nộp "${rawNgay}" không đúng định dạng hoặc không tồn tại.` });
    return;
   }
   const rawMc = iMc >= 0 ? chuanHoaChuoi(r[iMc]) : '';
   if (rawMc && rawMc !== '(chưa có)' && !isSafeUrl(rawMc)) {
    errorCount++;
    errors.push({ line, msg: `Link minh chứng "${rawMc}" không an toàn hoặc sai URL.` });
    return;
   }

   const existing = bcOf(k.id, cdId);
   if (existing && state.role === 'cd' && existing.status === 'ok') {
    skipCount++;
    skipped.push({ line, msg: `${k.ma} đã được LCĐ duyệt chính thức, bỏ qua.` });
    return;
   }
   // Không bao giờ cho phép nâng trạng thái duyệt từ file import: luôn reset về 'wait'
   const recPayload = {
    khId: k.id,
    cdId,
    soLuot: Math.round(nSo),
    ngayNop,
    treHan: ngayNop > k.hanChot,
    mc: rawMc || '(chưa có)',
    status: 'wait',
    nx: existing ? existing.nx : ''
   };
   if (existing) {
    updateCount++;
    actions.push({
     line, table: 'bao_cao', action: 'updated',
     before: { so_luot: existing.soLuot, ngay_nop: existing.ngayNop, mc: existing.mc, status: existing.status, nx: existing.nx },
     record: { ...existing, ...recPayload }
    });
   } else {
    createCount++;
    actions.push({ line, table: 'bao_cao', action: 'created', before: null, record: recPayload });
   }
  });
 } else if (loai === 'ns') {
  if (state.role === 'cd' || (!coQuyen('ql_nhansu') && !isAdmin())) return { loi: 'Chỉ LCĐ hoặc Quản trị viên mới có quyền nhập danh sách nhân sự LCĐ.' };
  const iTen = cot(h, 'ho va ten', 'ho ten');
  const iSdt = cot(h, 'sdt', 'dien thoai');
  const iMs = cot(h, 'mssv');
  const iLop = cot(h, 'lop');
  const iVt = cot(h, 'vai tro', 'chuc vu');
  const iFb = cot(h, 'link fb', 'facebook');
  const iBan = cot(h, 'ban');
  if (iTen < 0) return { loi: 'File thiếu cột “Họ và Tên”.' };

  let banHienTai = 'Thường trực', nhomHienTai = 'bcm';
  const seenNames = new Map();
  dataRows.forEach((r, idx) => {
   const line = idx + 2;
   const day = r.filter(c => chuanHoaChuoi(c) !== '');
   if (day.length === 1) {
    const t = bo(day[0]);
    if (/key|nguon/.test(t)) nhomHienTai = 'nguon';
    else if (/ban chap hanh|^bch/.test(t)) nhomHienTai = 'bch';
    else if (/^ban |^thuong truc|^thuong vu/.test(t)) { banHienTai = matBan(day[0]); nhomHienTai = 'bcm'; }
    skipCount++;
    skipped.push({ line, msg: `Dòng tiêu đề nhóm "${chuanHoaChuoi(day[0])}"` });
    return;
   }
   const ten = chuanHoaChuoi(r[iTen]);
   if (!ten) {
    errorCount++;
    errors.push({ line, msg: 'Thiếu Họ và Tên.' });
    return;
   }
   const key = bo(ten);
   if (seenNames.has(key)) {
    errorCount++;
    const msg = `Trùng tên nhân sự "${ten}" với dòng ${seenNames.get(key)} trong cùng file.`;
    duplicates.push({ line, key, msg });
    errors.push({ line, msg });
    return;
   }
   seenNames.set(key, line);

   const rawFb = iFb >= 0 ? chuanHoaChuoi(r[iFb]) : '';
   if (rawFb && !isSafeUrl(rawFb)) {
    errorCount++;
    errors.push({ line, msg: `Link Facebook "${rawFb}" không hợp lệ hoặc không an toàn.` });
    return;
   }
   const vt = iVt >= 0 && chuanHoaChuoi(r[iVt]) ? matVaiTro(r[iVt]) : 'Thành viên';
   const ban = iBan >= 0 && chuanHoaChuoi(r[iBan]) ? matBan(r[iBan]) : banHienTai;
   const nhom = ['Bí thư', 'Phó Bí thư', 'UV BTV', 'UV BCH'].includes(vt) ? 'bch' : nhomHienTai;
   const recPayload = {
    ten,
    ban,
    vaiTro: vt,
    sdt: iSdt >= 0 ? chuanHoaMaSo(r[iSdt]) : '',
    mssv: iMs >= 0 ? chuanHoaMaSo(r[iMs]) : '',
    lop: iLop >= 0 ? chuanHoaChuoi(r[iLop]) : '',
    fb: rawFb,
    nhom,
    bch: nhom === 'bch' ? 1 : 0
   };
   const existing = DB.ns.find(u => bo(u.ten) === key);
   if (existing) {
    updateCount++;
    actions.push({
     line, table: 'nhan_su', action: 'updated',
     before: { ten: existing.ten, vai_tro: existing.vaiTro, ban: existing.ban, lop: existing.lop, sdt: existing.sdt, mssv: existing.mssv, fb: existing.fb, bch: existing.bch, nhom: existing.nhom },
     record: { ...existing, ...recPayload }
    });
   } else {
    createCount++;
    actions.push({ line, table: 'nhan_su', action: 'created', before: null, record: { theoDoi: [], ...recPayload } });
   }
  });
 } else if (loai === 'tl') {
  if (state.role === 'cd' || (!coQuyen('ql_kh') && !isAdmin())) return { loi: 'Chỉ LCĐ hoặc Quản trị viên mới có quyền nhập kế hoạch công tác theo timeline.' };
  const iTen = cot(h, 'hoat dong', 'ten');
  const iTg = cot(h, 'thoi gian');
  const iTd = cot(h, 'tien do');
  const iBan = cot(h, 'ban phu trach');
  const iPt = cot(h, 'phu trach');
  const iNote = cot(h, 'note', 'ghi chu');
  const iMc = cot(h, 'minh chung');
  const iKq = cot(h, 'ket qua');
  if (iTen < 0) return { loi: 'File thiếu cột “HOẠT ĐỘNG”.' };

  const seenTitle = new Map();
  dataRows.forEach((r, idx) => {
   const line = idx + 2;
   const ten = chuanHoaChuoi(r[iTen]);
   if (!ten) {
    errorCount++;
    errors.push({ line, msg: 'Thiếu tên hoạt động.' });
    return;
   }
   const key = bo(ten);
   if (seenTitle.has(key)) {
    errorCount++;
    const msg = `Trùng tên hoạt động "${ten}" với dòng ${seenTitle.get(key)} trong cùng file.`;
    duplicates.push({ line, key, msg });
    errors.push({ line, msg });
    return;
   }
   seenTitle.set(key, line);

   const hienThi = iTg >= 0 ? chuanHoaChuoi(r[iTg]) : '';
   const d = hienThi ? ngayISOChuan(hienThi) : TODAY;
   if (hienThi && !d) {
    errorCount++;
    errors.push({ line, msg: `Thời gian "${hienThi}" không đúng định dạng DD/MM/YYYY hoặc YYYY-MM-DD.` });
    return;
   }
   const rawMc = iMc >= 0 ? chuanHoaChuoi(r[iMc]) : '';
   if (rawMc && !isSafeUrl(rawMc)) {
    errorCount++;
    errors.push({ line, msg: `Link minh chứng "${rawMc}" không an toàn.` });
    return;
   }

   const ptIds = iPt >= 0 && chuanHoaChuoi(r[iPt])
    ? chuanHoaChuoi(r[iPt]).split('/').map(x => { const u = DB.ns.find(n => bo(n.ten).includes(bo(x))); return u && u.id; }).filter(Boolean)
    : [];
   const ban = iBan >= 0 && chuanHoaChuoi(r[iBan])
    ? chuanHoaChuoi(r[iBan]).split(',').map(x => matBan(x)).filter((v, i, a) => a.indexOf(v) === i)
    : ['Thường trực'];

   const recPayload = {
    ten,
    hienThi: hienThi || dmy(d),
    tienDo: iTd >= 0 ? matTienDo(r[iTd]) : 'chua',
    ban,
    ptIds,
    note: iNote >= 0 ? chuanHoaChuoi(r[iNote]) : '',
    mc: rawMc,
    ketQua: iKq >= 0 ? chuanHoaChuoi(r[iKq]) : ''
   };
   const existing = DB.kh.find(k => bo(k.ten) === key);
   if (existing) {
    updateCount++;
    actions.push({
     line, table: 'ke_hoach', action: 'updated',
     before: { ten: existing.ten, hien_thi: existing.hienThi, tien_do: existing.tienDo, mc: existing.mc, ket_qua: existing.ketQua, note: existing.note },
     record: { ...existing, ...recPayload, ptId: ptIds[0] ?? existing.ptId }
    });
   } else {
    createCount++;
    actions.push({
     line, table: 'ke_hoach', action: 'created', before: null,
     record: { crit: 'ct', batDau: d, hanChot: d, lich: [], diem: 0, chiTieu: 0, donVi: 'n', batBuoc: false, ptId: ptIds[0] || null, ...recPayload }
    });
   }
  });
 } else if (loai === 'dd') {
  if (state.role === 'cd' || (!coQuyen('ql_nhansu') && !isAdmin())) return { loi: 'Chỉ LCĐ hoặc Quản trị viên mới có quyền nhập điểm danh.' };
  const iTen = cot(h, 'ho va ten', 'ho ten');
  if (iTen < 0) return { loi: 'File thiếu cột “Họ và Tên”.' };
  const cols = [];
  h.forEach((c, i) => { const d = ngayISOChuan(c); if (d) cols.push({ i, ngay: d }); });
  if (!cols.length) return { loi: 'Không tìm thấy cột ngày sinh hoạt hợp lệ (YYYY-MM-DD hoặc DD/MM/YYYY) ở dòng tiêu đề.' };

  const seenNames = new Map();
  dataRows.forEach((r, idx) => {
   const line = idx + 2;
   const ten = chuanHoaChuoi(r[iTen]);
   if (!ten) {
    errorCount++;
    errors.push({ line, msg: 'Thiếu Họ và Tên.' });
    return;
   }
   const key = bo(ten);
   if (seenNames.has(key)) {
    errorCount++;
    const msg = `Trùng nhân sự "${ten}" với dòng ${seenNames.get(key)}.`;
    duplicates.push({ line, key, msg });
    errors.push({ line, msg });
    return;
   }
   seenNames.set(key, line);

   const u = DB.ns.find(x => bo(x.ten) === key);
   if (!u) {
    errorCount++;
    errors.push({ line, msg: `Không tìm thấy nhân sự "${ten}" trong hệ thống.` });
    return;
   }

   const cellOps = [];
   for (const c of cols) {
    const rawVal = chuanHoaChuoi(r[c.i]);
    if (!rawVal) continue;
    const v = bo(rawVal);
    const co = ['true', 'x', 'co', '1', 'v', 'yes'].includes(v);
    const muon = v.includes('muon');
    const vang = ['false', '0', 'vang', 'khong'].includes(v);
    if (!co && !muon && !vang) {
     errorCount++;
     errors.push({ line, msg: `Giá trị điểm danh "${rawVal}" ở ngày ${c.ngay} không hợp lệ.` });
     return;
    }
    const existingHop = DB.hop.find(x => x.ngay === c.ngay);
    const existingDd = existingHop ? ddOf(existingHop.id, u.id) : null;
    cellOps.push({
     ngay: c.ngay,
     nsId: u.id,
     co: co || muon,
     muon,
     existingHopId: existingHop ? existingHop.id : null,
     before: existingDd ? { co: existingDd.co, muon: existingDd.muon } : null
    });
   }
   if (!cellOps.length) {
    skipCount++;
    skipped.push({ line, msg: `${ten}: không có ô điểm danh nào cần cập nhật.` });
    return;
   }
   const allUpdates = cellOps.every(op => op.before !== null);
   if (allUpdates) updateCount++; else createCount++;
   actions.push({ line, table: 'diem_danh', action: allUpdates ? 'updated' : 'created', before: null, record: { nsId: u.id, cellOps } });
  });
 } else {
  return { loi: 'Loại nhập dữ liệu không hợp lệ.' };
 }

 const total = dataRows.length;
 // Bảo đảm bất biến: total === create + update + skip + error
 const summary = { total, create: createCount, update: updateCount, skip: skipCount, error: errorCount };
 return { ok: true, loai, rawRows, summary, actions, errors, duplicates, skipped, strippedCols };
}

async function thucThiImportBatch(loai, dryRunResult, meta = {}) {
 if (!dryRunResult || dryRunResult.loi) {
  throw new Error(dryRunResult ? dryRunResult.loi : 'Chưa chạy Dry-run kiểm tra dữ liệu.');
 }
 const client = dataApi._requireClient();
 const checksum = meta.checksum || await tinhChecksumImport(loai, dryRunResult.rawRows);
 const cdScope = state.role === 'cd' ? state.cdId : null;

 // Chặn nhập trùng file đã hoàn tất cùng (loai, file_checksum, cd_id)
 let idemQ = client.from('import_batches').select('id, created_at')
  .eq('loai', loai).eq('file_checksum', checksum).eq('status', 'completed');
 idemQ = cdScope !== null ? idemQ.eq('cd_id', cdScope) : idemQ.is('cd_id', null);
 const idemRes = await idemQ.limit(1);
 if (idemRes.error) throw new Error('Lỗi kiểm tra chống nhập trùng: ' + idemRes.error.message);
 if (idemRes.data && idemRes.data.length > 0) {
  throw new Error(`Dữ liệu trùng lô đã nhập hoàn tất trước đó (Batch ID: ${idemRes.data[0].id}). Huỷ nhập để tránh nhân đôi.`);
 }

 const { summary, actions } = dryRunResult;
 const batchInsert = await client.from('import_batches').insert({
  loai,
  file_name: String(meta.fileName || 'paste').slice(0, 255),
  file_checksum: checksum,
  cd_id: cdScope,
  status: 'running',
  total_rows: summary.total,
  created_count: 0,
  updated_count: 0,
  skipped_count: summary.skip,
  error_count: summary.error,
  summary: { dryRun: summary }
 }).select().single();
 if (batchInsert.error || !batchInsert.data) {
  throw new Error('Không khởi tạo được lô nhập trên máy chủ: ' + (batchInsert.error ? batchInsert.error.message : 'RLS từ chối'));
 }

 const batchId = batchInsert.data.id;
 let actualCreated = 0, actualUpdated = 0;
 const runtimeErrors = [];
 const CHUNK = 25;
 const hopCache = new Map();

 try {
  for (let i = 0; i < actions.length; i += CHUNK) {
   const slice = actions.slice(i, i + CHUNK);
   const itemLogs = [];
   for (const act of slice) {
    if (act.table === 'doan_vien') {
     const res = await dataApi.luuDV(act.record, { isNew: act.action === 'created', forceOverwrite: true });
     itemLogs.push({ batch_id: batchId, table_name: 'doan_vien', record_key: String(res.data.id), action: act.action, before_data: act.before, after_updated_at: res.data.updatedAt });
     if (act.action === 'created') actualCreated++; else actualUpdated++;
    } else if (act.table === 'bao_cao') {
     const res = await dataApi.luuBC(act.record, { isNew: act.action === 'created', forceOverwrite: true });
     itemLogs.push({ batch_id: batchId, table_name: 'bao_cao', record_key: String(res.data.id), action: act.action, before_data: act.before, after_updated_at: res.data.updatedAt });
     if (act.action === 'created') actualCreated++; else actualUpdated++;
    } else if (act.table === 'nhan_su') {
     const res = await dataApi.luuNS(act.record, { isNew: act.action === 'created', forceOverwrite: true });
     itemLogs.push({ batch_id: batchId, table_name: 'nhan_su', record_key: String(res.data.id), action: act.action, before_data: act.before, after_updated_at: res.data.updatedAt });
     if (act.action === 'created') actualCreated++; else actualUpdated++;
    } else if (act.table === 'ke_hoach') {
     const res = await dataApi.luuKH(act.record, { isNew: act.action === 'created', forceOverwrite: true });
     itemLogs.push({ batch_id: batchId, table_name: 'ke_hoach', record_key: String(res.data.id), action: act.action, before_data: act.before, after_updated_at: res.data.updatedAt });
     if (act.action === 'created') actualCreated++; else actualUpdated++;
    } else if (act.table === 'diem_danh') {
     for (const op of act.record.cellOps) {
      let hopId = op.existingHopId || hopCache.get(op.ngay);
      if (!hopId) {
       const exH = DB.hop.find(h => h.ngay === op.ngay);
       if (exH) hopId = exH.id;
       else {
        const hSaved = await dataApi.luuHop({ ten: 'Họp Liên chi đoàn KHUD', ngay: op.ngay, noiDung: '', bienBan: '' }, { isNew: true });
        hopId = hSaved.data.id;
        itemLogs.push({ batch_id: batchId, table_name: 'sinh_hoat', record_key: String(hopId), action: 'created', before_data: null, after_updated_at: hSaved.data.updatedAt });
       }
       hopCache.set(op.ngay, hopId);
      }
      const dRes = await dataApi.luuDiemDanh(hopId, op.nsId, op.co, op.muon);
      itemLogs.push({
       batch_id: batchId, table_name: 'diem_danh', record_key: `${hopId}:${op.nsId}`,
       action: op.before ? 'updated' : 'created', before_data: op.before, after_updated_at: dRes.data.updatedAt
      });
     }
     if (act.action === 'created') actualCreated++; else actualUpdated++;
    }
   }

   if (itemLogs.length) {
    const logRes = await client.from('import_batch_items').insert(itemLogs);
    if (logRes.error) throw logRes.error;
   }
   await client.from('import_batches').update({
    created_count: actualCreated,
    updated_count: actualUpdated,
    summary: { dryRun: summary, checkpointOffset: i + slice.length }
   }).eq('id', batchId);
  }
 } catch (err) {
  runtimeErrors.push(err.message || String(err));
  const failStatus = (actualCreated + actualUpdated) > 0 ? 'partial' : 'failed';
  await client.from('import_batches').update({
   status: failStatus,
   created_count: actualCreated,
   updated_count: actualUpdated,
   error_count: summary.error + 1,
   summary: { dryRun: summary, runtimeErrors }
  }).eq('id', batchId);
  await dataApi.loadAll().catch(() => {});
  return {
   ok: false,
   status: failStatus,
   batchId,
   error: runtimeErrors.join('; '),
   reconciliation: {
    total: summary.total, created: actualCreated, updated: actualUpdated,
    skipped: summary.skip, error: summary.error, checksum
   }
  };
 }

 // Đối soát từ server theo batch_id
 const itemVerify = await client.from('import_batch_items').select('id, action, table_name', { count: 'exact' }).eq('batch_id', batchId);
 if (itemVerify.error) throw itemVerify.error;

 const reconciliation = {
  batchId,
  checksum,
  cdScope,
  total: summary.total,
  created: actualCreated,
  updated: actualUpdated,
  skipped: summary.skip,
  error: summary.error,
  balanced: summary.total === (actualCreated + actualUpdated + summary.skip + summary.error),
  serverLoggedItems: itemVerify.count || (itemVerify.data ? itemVerify.data.length : 0)
 };

 await client.from('import_batches').update({
  status: 'completed',
  created_count: actualCreated,
  updated_count: actualUpdated,
  completed_at: new Date().toISOString(),
  summary: { dryRun: summary, reconciliation }
 }).eq('id', batchId);

 await dataApi.loadAll();
 return { ok: true, status: 'completed', batchId, reconciliation };
}

async function hoanTacImportBatch(batchId) {
 const client = dataApi._requireClient();
 const res = await client.rpc('rpc_rollback_import_batch', { p_batch_id: batchId });
 if (res.error) throw res.error;
 await dataApi.loadAll();
 return res.data;
}

const NHAP = {
 dv: { ten: 'danh sách đoàn viên', mau: 'doanvien', tplFile: 'templates/mau_doan_vien.xlsx', ap: apDungDV, moTa: 'Khớp theo MSSV (chuỗi, giữ số 0 đầu): kiểm tra Dry-run trước khi ghi, không tự chuyển chi đoàn nếu xung đột.' },
 bc: { ten: 'số liệu báo cáo kế hoạch', mau: 'baocao', tplFile: 'templates/mau_bao_cao.xlsx', ap: apDungBC, moTa: 'Khớp theo mã kế hoạch và chi đoàn; hồ sơ nhập vào luôn ở trạng thái Chờ duyệt.' },
 ns: { ten: 'danh sách nhân sự LCĐ', mau: 'nhansu', tplFile: 'templates/mau_nhan_su_lcd.xlsx', ap: apDungNS, moTa: 'Đọc đúng sheet “DS NHÂN SỰ”: dòng chỉ có tên ban được hiểu là tiêu đề nhóm, MSSV/SĐT giữ dạng chuỗi.' },
 tl: { ten: 'công tác theo timeline', mau: 'timeline', tplFile: 'templates/mau_timeline_kehoach.xlsx', ap: apDungTL, moTa: 'Đọc đúng sheet “CÔNG TÁC THEO TIMELINE”: kiểm tra ngày, ban/người phụ trách, URL minh chứng hợp lệ.' },
 dd: { ten: 'bảng điểm danh', mau: null, tplFile: 'templates/mau_diem_danh.xlsx', ap: apDungDD, moTa: 'Đọc đúng sheet “ĐIỂM DANH”: mỗi cột ngày (YYYY-MM-DD hoặc DD/MM/YYYY) là một buổi sinh hoạt.' },
};

function formNhap(loai) {
 const cf = NHAP[loai];
 nhapRows = null;
 let lastDryRun = null;
 let lastFileName = 'paste';
 dlg.classList.add('dlg-wide');
 dlgBody.innerHTML = `<h2>Nhập ${esc(cf.ten)} từ Excel</h2>
 <p class="sub">${esc(cf.moTa)}</p>
 <div class="f"><label for="n_file">Chọn file .xlsx hoặc .csv</label><input id="n_file" type="file" accept=".xlsx,.xls,.csv,.txt"></div>
 <div class="f"><label for="n_ta">Hoặc dán trực tiếp từ Excel (Ctrl+V, gồm cả dòng tiêu đề)</label>
  <textarea id="n_ta" style="width:100%;height:88px;font:12px/1.5 ui-monospace,Consolas,monospace"></textarea></div>
 <div id="n_xem"></div>
 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  ${cf.mau ? `<button type="button" id="btn_mau">Tạo file mẫu</button>` : ''}
  ${cf.tplFile ? `<a href="${esc(cf.tplFile)}" download class="b-s" style="text-decoration:none;display:inline-flex;align-items:center">Tải template chuẩn</a>` : ''}
  <button type="button" class="b-p end" id="luu" disabled>Áp dụng lô nhập</button>
 </div>`;
 dlg.showModal();

 const huy = dlgBody.querySelector('#huy');
 if (huy) huy.onclick = () => { dlg.close(); dlg.classList.remove('dlg-wide'); };

 const btnMau = dlgBody.querySelector('#btn_mau');
 if (btnMau && cf.mau) {
  btnMau.onclick = () => xuatBang(null, MAU[cf.mau], 'Mau ' + cf.mau);
 }

 const xem = dlgBody.querySelector('#n_xem');
 const luu = dlgBody.querySelector('#luu');

 const nhan = (rows, fileName = 'paste') => {
  lastFileName = fileName;
  nhapRows = rows.filter(r => r.some(c => String(c ?? '').trim() !== ''));
  lastDryRun = dryRunImport(loai, nhapRows);
  if (lastDryRun.loi) {
   xem.innerHTML = `<div class="note" style="border-left-color:var(--crit)">${esc(lastDryRun.loi)}</div>`;
   luu.disabled = true;
   return;
  }
  const s = lastDryRun.summary;
  const errHtml = lastDryRun.errors.length
   ? `<div class="scroll" style="max-height:130px;margin:8px 0"><table><thead><tr><th>Dòng</th><th>Lỗi / Xung đột phát hiện (sẽ không ghi)</th></tr></thead><tbody>
      ${lastDryRun.errors.slice(0, 15).map(er => `<tr><td class="n"><b>${er.line}</b></td><td style="color:var(--crit)">${esc(er.msg)}</td></tr>`).join('')}
      </tbody></table></div>` : '';
  const stripHtml = lastDryRun.strippedCols.length
   ? `<div class="note" style="border-left-color:var(--warn)">Đã loại bỏ cột không tin cậy (quyền/trạng thái duyệt/điểm chính thức): <b>${lastDryRun.strippedCols.map(esc).join(', ')}</b>.</div>` : '';

  xem.innerHTML = `<div class="note">
   <b>Kết quả Dry-run (chỉ kiểm tra, chưa ghi DB):</b> Tổng nguồn <b>${s.total}</b> = Tạo mới <b>${s.create}</b> + Cập nhật <b>${s.update}</b> + Bỏ qua <b>${s.skip}</b> + Lỗi <b>${s.error}</b>.
  </div>${stripHtml}${errHtml}`;
  luu.disabled = !(s.create + s.update > 0);
 };

 dlgBody.querySelector('#n_ta').addEventListener('input', e => {
  if (e.target.value.trim()) nhan(tachBang(e.target.value), 'paste');
 });

 dlgBody.querySelector('#n_file').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
   if (/\.(xlsx|xls)$/i.test(f.name)) {
    if (!coXLSX()) {
     xem.innerHTML = '<div class="note" style="border-left-color:var(--crit)">Chưa tải được thư viện đọc .xlsx. Vui lòng kiểm tra thư mục vendor hoặc lưu file thành .csv và dán trực tiếp.</div>';
     return;
    }
    const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
    nhan(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' }), f.name);
   } else {
    nhan(tachBang(new TextDecoder('utf-8').decode(ev.target.result)), f.name);
   }
  };
  r.readAsArrayBuffer(f);
 });

 luu.onclick = async () => {
  if (!lastDryRun || lastDryRun.loi) return;
  luu.disabled = true;
  luu.textContent = 'Đang ghi theo lô...';
  try {
   const res = await thucThiImportBatch(loai, lastDryRun, { fileName: lastFileName });
   const rc = res.reconciliation || {};
   render();
   dlgBody.innerHTML = `<h2>${res.ok ? 'Nhập & Đối soát hoàn tất' : 'Nhập bị gián đoạn (' + esc(res.status) + ')'}</h2>
   <div class="note" style="border-left-color:${res.ok ? 'var(--good)' : 'var(--crit)'}">
    <b>Batch ID:</b> <code>${esc(res.batchId)}</code><br>
    <b>Checksum nguồn (SHA-256):</b> <code>${esc((rc.checksum || '').slice(0, 16))}…</code><br>
    <b>Đối soát nguồn (${rc.total}):</b> Tạo mới <b>${rc.created}</b> + Cập nhật <b>${rc.updated}</b> + Bỏ qua <b>${rc.skipped}</b> + Lỗi <b>${rc.error}</b>
    ${rc.balanced ? ' · <b style="color:var(--good)">Khớp 100%</b>' : ' · <b style="color:var(--crit)">Chưa cân đối</b>'}
    ${res.error ? '<br><span style="color:var(--crit)">Chi tiết lỗi: ' + esc(res.error) + '</span>' : ''}
   </div>
   <div class="row">
    ${res.batchId && (res.status === 'completed' || res.status === 'partial') ? `<button type="button" class="b-no" id="btn_rb_batch">Hoàn tác lô này (Rollback)</button>` : ''}
    <button type="button" class="b-p end" id="dong_tc">Đóng</button>
   </div>`;
   const dongTc = dlgBody.querySelector('#dong_tc');
   if (dongTc) dongTc.onclick = () => { dlg.close(); dlg.classList.remove('dlg-wide'); };
   const btnRb = dlgBody.querySelector('#btn_rb_batch');
   if (btnRb) {
    btnRb.onclick = async () => {
     btnRb.disabled = true;
     btnRb.textContent = 'Đang hoàn tác...';
     try {
      const rb = await hoanTacImportBatch(res.batchId);
      render();
      alert(`Hoàn tác thành công: xoá ${rb.deleted} dòng tạo mới, khôi phục ${rb.restored} dòng cập nhật, giữ nguyên ${rb.skipped_modified} dòng đã có chỉnh sửa sau import.`);
      dlg.close();
      dlg.classList.remove('dlg-wide');
     } catch (rbErr) {
      btnRb.disabled = false;
      btnRb.textContent = 'Hoàn tác lô này (Rollback)';
      alert('Hoàn tác thất bại: ' + (rbErr.message || rbErr));
     }
    };
   }
  } catch (e) {
   luu.disabled = false;
   luu.textContent = 'Áp dụng lô nhập';
   xem.insertAdjacentHTML('afterbegin', `<div class="note" style="border-left-color:var(--crit)">${esc(e.message || e)}</div>`);
  }
 };
}

PAGES.excel = function () {
 const lcd = state.role === 'lcd';
 const ds = lcd ? ['tongket', 'timeline', 'lichcongtac', 'nhansu', 'danhgiabch', 'diemdanh', 'sinhhoat', 'doanvien', 'baocao', 'matran', 'kehoach'] : ['nhiemvu', 'doanvien'];
 const nh = lcd ? ['ns', 'tl', 'dd', 'dv', 'bc'] : ['dv', 'bc'];

 return `<div class="head"><div><h1>Nhập / xuất Excel &amp; Chuẩn hóa dữ liệu</h1>
  <p class="sub">${lcd ? 'Các bảng xuất ra giữ đúng cột của file checklist LCĐ đang dùng. Nhập dữ liệu hỗ trợ Dry-run, chống trùng và đối soát theo lô.' : 'Xuất số liệu chi đoàn, hoặc nhập danh sách đoàn viên / báo cáo từ template chuẩn.'}</p></div></div>
 <div class="card"><header><h3>Xuất dữ liệu</h3><p class="end">Sao chép dán thẳng vào Excel${coXLSX() && taiDuoc() ? ', hoặc tải .xlsx' : ''}</p></header>
  <div class="grid g3" style="margin:0">${ds.map(k => `<button style="text-align:left;padding:12px 14px" onclick="xuatBang('${k}')">
   <b>${esc(XUAT[k][0])}</b><div class="t2">${XUAT[k][1]().length - 1} dòng</div></button>`).join('')}</div>
  ${taiDuoc() ? '' : '<p class="t2" style="margin:12px 0 0">Bản chạy trên web không tự tải file được, nên dùng nút sao chép rồi dán vào Excel. Mở file index.html trực tiếp trên máy thì có thêm nút tải .xlsx.</p>'}</div>
 <div class="card" style="margin-top:14px"><header><h3>Nhập dữ liệu (Dry-run · Chống trùng · Đối soát)</h3><p class="end">Nhận .xlsx, .csv hoặc dán trực tiếp</p></header>
  <div class="grid g2" style="margin:0;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
  ${nh.map(k => `<button style="text-align:left;padding:12px 14px" onclick="formNhap('${k}')">
   <b>Nhập ${esc(NHAP[k].ten)}</b><div class="t2">${esc(NHAP[k].moTa)}</div></button>`).join('')}</div>
  <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
   <span class="t2">Template chuẩn:</span>
   ${nh.map(k => `<a href="${esc(NHAP[k].tplFile)}" download class="b-s" style="text-decoration:none;font-size:11.5px">${esc(NHAP[k].tplFile.split('/').pop())}</a>`).join('')}
   <a href="templates/HUONG_DAN_NHAP_LIEU.md" target="_blank" rel="noopener noreferrer" class="b-s" style="text-decoration:none;font-size:11.5px">Hướng dẫn nhập liệu</a>
  </div></div>`;
};
