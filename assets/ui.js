/* Thành phần giao diện dùng chung, biểu đồ và điều hướng. */
/* ===================== TỪ ĐIỂN MÔ TẢ TRẠNG THÁI ===================== */
const STATUS_DESC = {
 'Đã duyệt': 'Minh chứng hợp lệ, số liệu đã được LCĐ xác nhận và điểm KPI đã được cộng chính thức.',
 'Chờ duyệt': 'Hồ sơ đã gửi thành công, đang chờ Ban Chấp hành LCĐ kiểm tra và duyệt minh chứng.',
 'Trả lại': 'Minh chứng chưa đạt yêu cầu (thiếu ảnh, danh sách chưa đủ hoặc link lỗi), cần sửa và nộp lại.',
 'Cần sửa': 'Minh chứng chưa đạt yêu cầu, cần cập nhật bổ sung gấp để được xét điểm KPI.',
 'Đã nộp': 'Chi đoàn đã gửi báo cáo số lượng và link minh chứng lên hệ thống.',
 'Chưa nộp': 'Chi đoàn chưa gửi báo cáo minh chứng cho kế hoạch này.',
 'Quá hạn': 'Đã quá hạn chót quy định. Nộp sau hạn chỉ nhận tối đa 80% số điểm KPI.',
 'quá hạn': 'Đã quá hạn chót quy định. Cần xử lý gấp.',
 'Sắp hết hạn': 'Hạn chót trong vòng 3–7 ngày tới, cần khẩn trương hoàn thiện nộp hồ sơ.',
 'Đạt chỉ tiêu': 'Chi đoàn hoàn thành từ 100% chỉ tiêu số lượng hoặc tỷ lệ tham gia được giao.',
 'Chưa đạt chỉ tiêu': 'Số lượng hoặc tỷ lệ tham gia thực tế chưa đạt mức chỉ tiêu LCĐ giao.',
 'Hoàn thành': 'Công việc / mốc tiến độ đã kết thúc và được nghiệm thu đầy đủ.',
 'xong': 'Mốc công tác hoặc đầu việc đã hoàn thành nghiệm thu.',
 'đang làm': 'Công việc đang trong giai đoạn triển khai thực hiện.',
 'Đang triển khai': 'Công việc đang trong giai đoạn triển khai thực hiện theo kế hoạch.',
 'Chưa triển khai': 'Hoạt động đã lên kế hoạch nhưng chưa đến thời gian thực hiện.',
 'Sắp tới': 'Hoạt động chưa mở cổng tiếp nhận báo cáo / chưa đến ngày bắt đầu.',
 'BB': 'Kế hoạch bắt buộc: 100% các chi đoàn trực thuộc phải tham gia và gửi báo cáo.',
 'Bắt buộc': 'Kế hoạch bắt buộc: 100% các chi đoàn trực thuộc phải tham gia và gửi báo cáo.',
 'LCĐ giao': 'Kế hoạch do Liên chi đoàn phát động và giao chỉ tiêu xuống chi đoàn.',
 'Tự tổ chức': 'Hoạt động do chi đoàn tự chủ động tổ chức để tích lũy điểm tiêu chí KPI.'
};

/* ===================== THÀNH PHẦN GIAO DIỆN ===================== */
const tip=(txt)=>' data-tip="'+esc(txt)+'"';
const tile=(lbl,val,foot='')=>`<div class="tile"><div class="lbl">${lbl}</div><div class="val">${val}</div><div class="foot">${foot}</div></div>`;

/** Tạo pill có tooltip tự động giải thích ý nghĩa trạng thái */
function pill(t,c,customTip){
 const tipText = customTip || (STATUS_DESC[t] ? `${t}: ${STATUS_DESC[t]}` : '');
 return `<span class="pill ${c}"${tipText ? tip(tipText) : ''}>${t}</span>`;
}

const pillXL=xl=>pill(xl[1],xl[2],`Xếp loại ${xl[1]} (thang điểm: Xuất sắc ≥90 · Tốt ≥80 · Khá ≥65 · Trung bình ≥50 · Yếu <50)`);

const ST={
 ok:['Đã duyệt','p-good','Minh chứng hợp lệ, điểm KPI đã được cộng chính thức.'],
 wait:['Chờ duyệt','p-warn','Hồ sơ đang đợi Ban Chấp hành LCĐ kiểm tra duyệt minh chứng.'],
 no:['Trả lại','p-crit','Minh chứng chưa đạt, cần bổ sung nộp lại để được xét điểm.']
};
const pillST=s=>{const item=ST[s]||ST.wait;return pill(item[0],item[1],item[0]+': '+item[2])};

const seqCell=ty=>ty>=100?'var(--seq-5)':ty>=80?'var(--seq-4)':ty>=55?'var(--seq-3)':ty>=25?'var(--seq-2)':ty>0?'var(--seq-1)':'var(--seq-0)';
const seqInk=ty=>ty>=80?'#fff':'var(--sec)';

/** Dãy thanh ngang xếp hạng (1 chuỗi số liệu → 1 màu). */
function rankBars(items,{max,suffix='',color='var(--s1)'}={}){
 const m=max||Math.max(...items.map(i=>i.v),1);
 return `<div class="bars">${items.map(i=>`<div class="barrow">
  <span${tip(i.tip||i.l)}>${esc(i.l)}</span>
  <span class="track"><i style="width:${Math.max(1,i.v/m*100)}%;background:${i.c||color}"${tip(i.tip||i.l+': '+i.v+suffix)}></i></span>
  <span class="v">${i.v}${suffix}</span></div>`).join('')}</div>`;
}

/** Thanh chồng theo 5 tiêu chí */
function stackRow(nhan,chiTiet,tong,tenDay){
 return `<div class="barrow" style="grid-template-columns:minmax(78px,auto) 1fr minmax(34px,auto)">
  <span>${esc(nhan)}</span>
  <span class="stack">${chiTiet.map(x=>`<i style="width:${x.diem}%;background:${x.c}"${tip((tenDay||nhan)+' · '+x.ten+': '+x.diem+'/'+x.max+' điểm')}>${x.diem>=8?Math.round(x.diem):''}</i>`).join('')}</span>
  <span class="v">${tong}</span></div>`;
}
const lgdOf=arr=>`<div class="lgd">${arr.map(c=>`<span><b style="background:${c.c}"></b>${c.ten}</span>`).join('')}</div>`;
const lgdCRIT=()=>`<div class="lgd">${CRIT.map(c=>`<span><b style="background:${c.c}"></b>${c.ten}</span>`).join('')}</div>`;

/** Biểu đồ đường: lượt tham gia theo tháng. */
function lineChart(series,{w=640,h=210}={}){
 const pl=42,pr=14,pt=14,pb=28,iw=w-pl-pr,ih=h-pt-pb;
 const all=series.flatMap(s=>s.v);
 const mx=Math.max(10,Math.ceil(Math.max(...all)/50)*50);
 const X=i=>pl+(series[0].v.length===1?iw/2:i*iw/(series[0].v.length-1));
 const Y=v=>pt+ih-v/mx*ih;
 const ticks=[0,.25,.5,.75,1].map(t=>Math.round(mx*t));
 return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block;height:auto;overflow:visible" role="img" aria-label="Lượt tham gia theo tháng">
 ${ticks.map(t=>`<line x1="${pl}" x2="${w-pr}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--grid)" stroke-width="1"/>
   <text x="${pl-8}" y="${Y(t)+4}" text-anchor="end" font-size="10.5" fill="var(--muted)">${t}</text>`).join('')}
 <line x1="${pl}" x2="${w-pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--axis)" stroke-width="1"/>
 ${thangNhan.map((t,i)=>`<text x="${X(i)}" y="${h-9}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${t}</text>`).join('')}
 ${series.map(s=>`<path d="${s.v.map((v,i)=>(i?'L':'M')+X(i)+' '+Y(v)).join(' ')} L${X(s.v.length-1)} ${Y(0)} L${X(0)} ${Y(0)} Z" fill="${s.c}" opacity=".10"/>
  <path d="${s.v.map((v,i)=>(i?'L':'M')+X(i)+' '+Y(v)).join(' ')}" fill="none" stroke="${s.c}" stroke-width="2" stroke-linejoin="round"/>
  ${s.v.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="${i===s.v.length-1?5:4}" fill="${s.c}" stroke="var(--surface)" stroke-width="2"${tip(s.n+' · tháng '+thangNhan[i].slice(1)+': '+v+' lượt')}/>`).join('')}
  <text x="${X(s.v.length-1)}" y="${Y(s.v[s.v.length-1])-12}" text-anchor="end" font-size="11.5" font-weight="700" fill="${s.c}">${s.v[s.v.length-1]}</text>`).join('')}
 </svg>`;
}

/* ===================== HỆ THỐNG THÔNG BÁO & NHẮC VIỆC ===================== */
function layThongBao(){
 const list=[];
 if(state.role==='cd'){
  const c=CD(state.cdId);
  // 1. Hồ sơ bị trả lại cần sửa ngay
  const biTraLai=DB.bc.filter(b=>b.cdId===c.id&&b.status==='no');
  biTraLai.forEach(b=>{
   const k=KH(b.khId);
   list.push({
    loai:'crit',icon:'🔴',
    tieuDe:`Hồ sơ "${k.ma}" bị trả lại`,
    noiDung:b.nx||'Minh chứng chưa đạt yêu cầu, đề nghị bổ sung nộp lại.',
    time:`Nộp ngày ${dmy(b.ngayNop)}`,
    action:()=>formBC(b.khId),
    btnText:'Sửa & nộp lại'
   });
  });
  // 2. Kế hoạch LCĐ giao sắp đến hạn hoặc quá hạn chưa nộp
  const giao=DB.kh.filter(k=>k.chiTieu&&k.batDau<=TODAY);
  giao.forEach(k=>{
   const b=bcOf(k.id,c.id);
   if(!b){
    const tre=k.hanChot<TODAY;
    const sapHet=!tre && k.hanChot<=dayAdd(TODAY,7);
    if(tre){
     list.push({
      loai:'crit',icon:'⏰',
      tieuDe:`Quá hạn: ${k.ma} · ${k.ten}`,
      noiDung:`Hạn chót là ${dmy(k.hanChot)}. Nộp muộn sẽ bị trừ 20% điểm KPI.`,
      time:`Hạn ${dmy(k.hanChot)}`,
      action:()=>formBC(k.id),
      btnText:'Nộp ngay'
     });
    }else if(sapHet){
     list.push({
      loai:'warn',icon:'⚠️',
      tieuDe:`Sắp hết hạn: ${k.ma} · ${k.ten}`,
      noiDung:`Chỉ tiêu ${chiTieuSo(k,c)} lượt. Còn ít ngày trước hạn chót ${dmy(k.hanChot)}.`,
      time:`Hạn ${dmy(k.hanChot)}`,
      action:()=>formBC(k.id),
      btnText:'Nộp báo cáo'
     });
    }
   }
  });
  // 3. Hồ sơ đang chờ duyệt
  const choDuyet=DB.bc.filter(b=>b.cdId===c.id&&b.status==='wait').length+DB.hd.filter(h=>h.cdId===c.id&&h.status==='wait').length;
  if(choDuyet>0){
   list.push({
    loai:'info',icon:'⏳',
    tieuDe:`${choDuyet} hồ sơ đang chờ LCĐ duyệt`,
    noiDung:'BCH LCĐ đang thẩm định minh chứng để công nhận điểm KPI.',
    time:'Đang xử lý',
    action:()=>go('nhiemvu'),
    btnText:'Xem hồ sơ'
   });
  }
  // 4. Kế hoạch mới triển khai
  const moi=DB.kh.filter(k=>k.chiTieu&&k.batDau<=TODAY&&k.batDau>=dayAdd(TODAY,-14));
  moi.slice(0,2).forEach(k=>{
   list.push({
    loai:'info',icon:'📢',
    tieuDe:`Kế hoạch mới: ${k.ma} · ${k.ten}`,
    noiDung:`Chỉ tiêu ${chiTieuSo(k,c)} lượt. Hạn chót ${dmy(k.hanChot)}.`,
    time:`Bắt đầu ${dmy(k.batDau)}`,
    action:()=>go('nhiemvu'),
    btnText:'Xem chi tiết'
   });
  });
 } else {
  // Với BCH Liên chi đoàn
  // 1. Hồ sơ chờ LCĐ duyệt
  const cho=DB.bc.filter(b=>b.status==='wait').length+DB.hd.filter(h=>h.status==='wait').length;
  if(cho>0){
   list.push({
    loai:'warn',icon:'📥',
    tieuDe:`Có ${cho} hồ sơ đang chờ LCĐ duyệt`,
    noiDung:'Các chi đoàn đã gửi báo cáo và minh chứng, cần kiểm tra để chốt điểm KPI.',
    time:'Cần xử lý',
    action:()=>go('duyet'),
    btnText:'Vào duyệt ngay'
   });
  }
  // 2. Mốc công tác quá hạn hoặc đến hạn trong 7 ngày
  const mocs=mocDenHan(7);
  mocs.slice(0,3).forEach(({k,m})=>{
   const tre=m.han<TODAY;
   list.push({
    loai:tre?'crit':'warn',icon:tre?'🚨':'⏰',
    tieuDe:`${tre?'Quá hạn':'Sắp đến hạn'}: ${m.ten}`,
    noiDung:`Thuộc ${k.ma} · ${k.ten} (Phụ trách: ${m.nsId&&UV(m.nsId)?UV(m.nsId).ten:'Chưa phân công'})`,
    time:`Hạn ${dmy(m.han)}`,
    action:()=>go('khct',{khId:k.id}),
    btnText:'Mở mốc'
   });
  });
  // 3. Chi đoàn trễ hạn kế hoạch bắt buộc
  const treHen=DB.kh.filter(k=>k.chiTieu&&k.batBuoc&&k.hanChot<TODAY).flatMap(k=>DB.cd.filter(c=>!bcOf(k.id,c.id)).map(c=>({k,c})));
  if(treHen.length>0){
   list.push({
    loai:'crit',icon:'⚠️',
    tieuDe:`${treHen.length} lượt chi đoàn nợ việc bắt buộc`,
    noiDung:`Các chi đoàn chưa nộp báo cáo cho kế hoạch đã hết hạn.`,
    time:`Hạn đã qua`,
    action:()=>go('hoatdong'),
    btnText:'Xem chi tiết'
   });
  }
 }
 return list;
}



/** Hộp thoại cập nhật link nhanh */
function moSuaLink({tieuDe='Cập nhật link', url='', onSave}){
 const cur = (url && url !== '(chưa có)' && url !== '–') ? url : '';
 dlgBody.innerHTML = `<h2>🔗 Cập nhật link</h2>
 <p class="sub">${esc(tieuDe)}</p>
 <div class="f">
  <label for="m_link_input">Đường dẫn liên kết (Link Google Drive / OneDrive / Ảnh / Facebook / Web)</label>
  <input id="m_link_input" value="${esc(cur)}" placeholder="https://drive.google.com/drive/folders/…">
  <span class="t2">Bắt buộc bật quyền: <i>"Bất kỳ ai có đường liên kết đều có thể xem"</i>.</span>
 </div>
 <div class="row" style="margin-bottom:12px;gap:8px">
  <button type="button" class="b-s" id="m_test_link">🔗 Thử mở link kiểm tra</button>
 </div>
 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  <button type="button" class="b-p end" id="luu">Lưu link</button>
 </div>`;
 dlg.showModal();
 dlgBody.querySelector('#huy').onclick = () => dlg.close();
 dlgBody.querySelector('#m_test_link').onclick = () => {
  const v = dlgBody.querySelector('#m_link_input').value.trim();
  if(!v) return alert('Vui lòng nhập hoặc dán link trước khi thử mở!');
  const full = chuanHoaLink(v);
  window.open(full, '_blank', 'noopener');
 };
 dlgBody.querySelector('#luu').onclick = () => {
  const v = dlgBody.querySelector('#m_link_input').value.trim();
  onSave(v);
  save();
  dlg.close();
  render();
 };
}

/** Đổi trạng thái báo cáo chi đoàn (ok / wait / no) */
function doiTrangThaiBC(id, newSt){
 if(typeof auth !== 'undefined'){
  if(!auth.currentUser || auth.currentUser.role === 'cd' || !auth.coQuyen('duyet_bc')){
   alert('Bạn không có quyền duyệt báo cáo.');
   render();
   return;
  }
 }
 const b = DB.bc.find(x => x.id === id);
 if(!b) return;
 if(newSt === 'no'){
  const lyDo = prompt('Nhập nhận xét / lý do trả lại để chi đoàn sửa bổ sung:', b.nx || 'Minh chứng chưa đủ, đề nghị bổ sung ảnh hoạt động và danh sách ký tên.');
  if(lyDo === null) { render(); return; }
  b.nx = lyDo.trim() || 'Minh chứng chưa đạt yêu cầu, đề nghị bổ sung nộp lại.';
 } else if(newSt === 'ok') {
  b.nx = '';
 }
 b.status = newSt;
 if(typeof dataApi !== 'undefined' && dataApi.luuBC){
  dataApi.luuBC(b).catch(err => {
   alert('Lỗi cập nhật máy chủ: ' + err.message);
  });
 }
 render();
}

/** Đổi trạng thái hoạt động tự tổ chức (ok / wait / no) */
function doiTrangThaiHD(id, newSt){
 if(typeof auth !== 'undefined'){
  if(!auth.currentUser || auth.currentUser.role === 'cd' || !auth.coQuyen('duyet_bc')){
   alert('Bạn không có quyền duyệt hoạt động.');
   render();
   return;
  }
 }
 const h = DB.hd.find(x => x.id === id);
 if(!h) return;
 h.status = newSt;
 if(typeof dataApi !== 'undefined' && dataApi.luuHD){
  dataApi.luuHD(h).catch(err => {
   alert('Lỗi cập nhật máy chủ: ' + err.message);
  });
 }
 render();
}

/** Đổi tiến độ đầu việc timeline (chua / dang / xong) */
function doiTienDoKH(id, newTd){
 if(typeof auth !== 'undefined'){
  if(!auth.currentUser || auth.currentUser.role === 'cd' || !auth.coQuyen('ql_kh')){
   alert('Bạn không có quyền cập nhật tiến độ công tác LCĐ.');
   render();
   return;
  }
 }
 const k = KH(id);
 if(!k) return;
 k.tienDo = newTd;
 if(typeof dataApi !== 'undefined' && dataApi.luuKH){
  dataApi.luuKH(k).catch(err => {
   alert('Lỗi cập nhật máy chủ: ' + err.message);
  });
 }
 render();
}

/** Modal Quản lý và nạp dữ liệu thật */
function formQuanLyDuLieu(){
 dlg.classList.add('dlg-wide');
 dlgBody.innerHTML = `<h2>⚙️ Quản lý & Nạp dữ liệu thật</h2>
 <p class="sub">Chuyển đổi từ dữ liệu demo sang dữ liệu thật của nhiệm kỳ 2025–2027, sao lưu và phục hồi an toàn.</p>

 <div class="mgmt-grid">
  <div class="mgmt-card is-recommended">
   <div class="mgmt-card-info">
    <h4>🚀 1. Khởi tạo nạp dữ liệu thật (Khuyên dùng)</h4>
    <p>Giữ lại danh sách Chi đoàn & cơ cấu nhân sự Liên chi đoàn; <b>xóa sạch</b> các báo cáo, hoạt động, lịch họp, điểm danh và đoàn viên mẫu để bắt đầu ghi nhận dữ liệu thực tế.</p>
   </div>
   <button type="button" class="b-p" id="btnInitReal" style="white-space:nowrap">Bắt đầu nạp data thật</button>
  </div>

  <div class="mgmt-card">
   <div class="mgmt-card-info">
    <h4>📁 2. Nhập dữ liệu từ Excel / File mẫu</h4>
    <p>Nhập danh sách đoàn viên từ file của lớp, cập nhật tiến độ công tác theo timeline hoặc nạp danh sách nhân sự từ file checklist của LCĐ.</p>
   </div>
   <button type="button" class="b-s" onclick="dlg.close();go('excel')" style="white-space:nowrap">Mở trang Nhập Excel →</button>
  </div>

  <div class="mgmt-card">
   <div class="mgmt-card-info">
    <h4>💾 3. Sao lưu dữ liệu ra file (.json)</h4>
    <p>Tải toàn bộ cơ sở dữ liệu hiện tại về máy tính để lưu trữ an toàn, tránh mất mát khi xóa bộ nhớ trình duyệt hoặc gửi sang máy tính khác.</p>
   </div>
   <button type="button" class="b-s" onclick="xuatBackupJSON()" style="white-space:nowrap">Tải file Backup (.json)</button>
  </div>

  <div class="mgmt-card">
   <div class="mgmt-card-info">
    <h4>📥 4. Phục hồi dữ liệu từ file sao lưu</h4>
    <p>Chọn file <code>.json</code> đã sao lưu trước đó để nạp lại đầy đủ 100% dữ liệu vào hệ thống.</p>
   </div>
   <label class="b-s" style="white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center">
    Nạp file Backup <input type="file" id="restoreFile" accept=".json" style="display:none">
   </label>
  </div>

  <div class="mgmt-card">
   <div class="mgmt-card-info">
    <h4>⚪ 5. Xóa trắng toàn bộ dữ liệu</h4>
    <p>Xóa sạch mọi bảng biểu (kể cả chi đoàn) để bắt đầu hệ thống từ con số 0 hoàn toàn tinh sạch.</p>
   </div>
   <button type="button" class="b-s b-no" id="btnWipeAll" style="white-space:nowrap">Xóa trắng tất cả</button>
  </div>

  <div class="mgmt-card">
   <div class="mgmt-card-info">
    <h4>🔄 6. Khôi phục dữ liệu mẫu Demo</h4>
    <p>Nạp lại toàn bộ dữ liệu mẫu ban đầu để tham khảo kịch bản đánh giá, KPI và quy trình làm việc mẫu.</p>
   </div>
   <button type="button" class="b-s" id="btnRestoreDemo" style="white-space:nowrap">Nạp lại Demo</button>
  </div>
 </div>

 <div class="row" style="margin-top:14px">
  <button type="button" class="b-p end" onclick="dlg.close();dlg.classList.remove('dlg-wide')">Đóng</button>
 </div>`;

 dlg.showModal();

 dlgBody.querySelector('#btnInitReal').onclick = () => {
  xacNhan('Bắt đầu nạp data thật?', 'Hệ thống sẽ giữ khung Chi đoàn và Nhân sự, xóa sạch mọi hoạt động, báo cáo và điểm danh mẫu để bạn nạp data thực tế.', () => {
   khoiTaoDataThat('giu-khung');
   dlg.close();
   dlg.classList.remove('dlg-wide');
   render();
  });
 };

 dlgBody.querySelector('#btnWipeAll').onclick = () => {
  xacNhan('Xóa trắng toàn bộ dữ liệu?', 'Mọi chi đoàn, nhân sự, đầu việc và báo cáo sẽ bị xóa rỗng hoàn toàn để nhập mới từ đầu.', () => {
   khoiTaoDataThat('trang-tinh');
   dlg.close();
   dlg.classList.remove('dlg-wide');
   render();
  });
 };

 dlgBody.querySelector('#btnRestoreDemo').onclick = () => {
  xacNhan('Khôi phục dữ liệu mẫu Demo?', 'Dữ liệu hiện tại sẽ được thay bằng dữ liệu mẫu.', () => {
   khoiTaoDataThat('demo');
   dlg.close();
   dlg.classList.remove('dlg-wide');
   render();
  });
 };

 const rFile = dlgBody.querySelector('#restoreFile');
 if(rFile){
  rFile.addEventListener('change', async e => {
   const file = e.target.files[0];
   if(!file) return;
   try {
    await nhapBackupJSON(file);
    alert('Đã phục hồi dữ liệu thành công từ file backup!');
    dlg.close();
    dlg.classList.remove('dlg-wide');
    render();
   } catch(err) {
    alert('Lỗi phục hồi: ' + err.message);
   }
  });
 }
}

/** Render thanh Topbar tiện ích với thiết kế gọn gàng, tinh tế */
function topBarHtml(){
 const tb=layThongBao();
 const urgentCount=tb.filter(x=>x.loai==='crit'||x.loai==='warn').length;
 const roleName = state.role==='lcd' ? 'Ban Chấp hành Liên chi đoàn KHUD' : CD(state.cdId).ten;
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 const canManageUser = curUser && (curUser.role === 'admin' || curUser.role === 'lcd');
 const rInfo = curUser && typeof ROLE_INFO !== 'undefined' ? (ROLE_INFO[curUser.role] || {badge:'p-xs',icon:'👤',ten:curUser.role}) : {badge:'p-xs',icon:'👤',ten:'Người dùng'};

 return `<div class="topbar">
  <div class="topbar-info">
   <span class="role-tag">${state.role==='lcd'?'BCH LCĐ':'Chi đoàn'}</span>
   <b>${esc(roleName)}</b>
   <span class="t2">· Hôm nay: ${dmy(TODAY)}</span>
  </div>
  <div class="topbar-actions">
   ${canManageUser ? `
   <button class="topbar-btn btn-perm-shortcut" onclick="go('users')" type="button" title="Mở trang Ma trận Phân quyền & Quản trị tài khoản">
    <b>Phân quyền User</b>
   </button>` : ''}

   <!-- Dropdown Tiện ích & Hướng dẫn gọn gàng -->
   <div style="position:relative">
    <button class="topbar-btn" id="utilToggle" type="button" title="Tiện ích & Hướng dẫn tra cứu">
     Tiện ích ▾
    </button>
    <div class="topbar-dropdown" id="utilDropdown">
     <div class="dropdown-item" onclick="formQuanLyDuLieu()">
      <div><b>Quản lý dữ liệu</b><p>Khởi tạo data thật, sao lưu & phục hồi JSON</p></div>
     </div>
     <div class="dropdown-item" onclick="moHuongDanMinhChung()">
      <div><b>Hướng dẫn minh chứng</b><p>Quy chuẩn tài liệu, ảnh và danh sách</p></div>
     </div>
     <div class="dropdown-item" onclick="moYNgiaTrangThai()">
      <div><b>Ý nghĩa trạng thái</b><p>Tra cứu nhãn duyệt, tiến độ và cảnh báo</p></div>
     </div>
    </div>
   </div>

   <!-- Chuông Thông báo -->
   <div style="position:relative">
    <button class="notif-btn" id="notifToggle" type="button" aria-label="Thông báo" title="Thông báo và việc nhắc nhở">
     🔔${urgentCount?`<span class="notif-badge">${urgentCount}</span>`:''}
    </button>
    <div class="notif-dropdown" id="notifDropdown">
     <div class="notif-hdr">
      <span>Thông báo & Việc cần nhớ</span>
      <span class="t2">${tb.length} mục</span>
     </div>
     <div class="notif-list">
      ${tb.length?tb.map((n,idx)=>`
       <div class="notif-item is-${n.loai}" data-notif-idx="${idx}">
        <div class="notif-body">
         <div class="notif-title"><span>${esc(n.tieuDe)}</span><span class="t2" style="font-size:11px">${n.time}</span></div>
         <div class="notif-desc">${esc(n.noiDung)}</div>
         <div style="margin-top:5px"><button class="b-s ${n.loai==='crit'?'b-no':n.loai==='warn'?'b-p':'b-s'}" type="button">${n.btnText||'Xử lý'}</button></div>
        </div>
       </div>`).join('')
      :'<div class="empty" style="padding:18px">Không có thông báo mới nào.</div>'}
     </div>
    </div>
   </div>

   <!-- Dropdown Hồ sơ & Thao tác Người dùng -->
   ${curUser ? `
   <div style="position:relative">
    <div class="user-pill-btn" id="userProfileToggle" title="Tài khoản cá nhân: ${esc(curUser.ten)} (@${esc(curUser.username)})">
     <span class="user-avatar-tiny">${rInfo.icon}</span>
     <span class="user-name-top">${esc(curUser.ten)}</span>
     <span class="user-pill-arrow">▾</span>
    </div>
    <div class="user-dropdown-menu" id="userProfileDropdown">
     <div class="user-drop-hdr">
      <div style="font-size:22px">${rInfo.icon}</div>
      <div style="min-width:0;flex:1">
       <b style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(curUser.ten)}</b>
       <div style="display:flex;align-items:center;gap:5px;margin-top:2px">
        <span class="pill ${rInfo.badge}" style="font-size:9.5px;padding:1px 5px">${esc(rInfo.ten)}</span>
        <span class="t2" style="font-family:monospace">@${esc(curUser.username)}</span>
       </div>
      </div>
     </div>
     <div class="user-drop-body">
      ${canManageUser ? `
      <div class="user-drop-item" onclick="go('users')">
       <b>Ma trận Phân quyền & Quản trị</b>
      </div>` : ''}
      <div class="user-drop-item" onclick="formDoiMatKhauCaNhan()">
       <span>Đổi mật khẩu cá nhân</span>
      </div>
      <div class="user-drop-item" onclick="formQuanLyDuLieu()">
       <span>Quản lý dữ liệu hệ thống</span>
      </div>
      <div class="user-drop-sep"></div>
      <div class="user-drop-item item-logout" onclick="auth.logout()">
       <b>Đăng xuất khỏi hệ thống</b>
      </div>
     </div>
    </div>
   </div>` : ''}
  </div>
 </div>`;
}

/** Modal hướng dẫn minh chứng chi tiết */
function moHuongDanMinhChung(){
 dlg.classList.add('dlg-wide');
 dlgBody.innerHTML=`<h2>📋 Hướng dẫn chuẩn bị minh chứng hợp lệ</h2>
 <p class="sub">Quy chuẩn thẩm định của Ban Chấp hành Liên chi đoàn Khoa các Khoa học Ứng dụng</p>
 <div class="guide-box">
  <h4>📁 1. Định dạng tài liệu được chấp nhận</h4>
  <ul>
   <li><b>Link Google Drive:</b> Bắt buộc phải bật quyền chia sẻ <i>"Bất kỳ ai có đường liên kết đều có thể xem"</i> (Viewer). Không đặt ở chế độ bị khóa / yêu cầu cấp quyền.</li>
   <li><b>File hình ảnh:</b> Định dạng .JPG, .PNG rõ nét, không bị nhòe vỡ chữ.</li>
   <li><b>File tài liệu:</b> File PDF, Word (.docx) hoặc Excel (.xlsx) danh sách điểm danh.</li>
  </ul>
 </div>
 <div class="guide-box">
  <h4>📸 2. Ba thành phần bắt buộc trong hồ sơ minh chứng</h4>
  <ul>
   <li><b>Danh sách sinh viên tham gia:</b> Có đầy đủ Họ tên, MSSV, Lớp và chữ ký xác nhận (hoặc dữ liệu xuất từ Google Form/Microsoft Form điểm danh chính thức).</li>
   <li><b>Hình ảnh hoạt động thực tế:</b> Tối thiểu 3–5 ảnh thể hiện toàn cảnh quy mô hoạt động, phông nền (backdrop/banner) sự kiện và sự hiện diện của đoàn viên chi đoàn.</li>
   <li><b>Biên bản / Kế hoạch:</b> Đối với Đại hội, Sinh hoạt chi đoàn chủ điểm hoặc Hoạt động tự tổ chức, bắt buộc có biên bản cuộc họp có chữ ký của Thư ký và Bí thư.</li>
  </ul>
 </div>
 <div class="guide-box" style="border-left:3px solid var(--crit)">
  <h4>⚠️ 3. Các lý do phổ biến khiến hồ sơ bị trả lại</h4>
  <ul>
   <li>Link Google Drive bị khóa quyền truy cập, người duyệt không mở xem được.</li>
   <li>Số lượng báo cáo lớn hơn số sinh viên có tên trong danh sách ký nhận thực tế.</li>
   <li>Chỉ có 1 ảnh đại diện hoặc ảnh tải trên mạng, không chứng minh được sinh viên chi đoàn tham gia.</li>
  </ul>
 </div>
 <div class="row" style="margin-top:14px">
  <button type="button" class="b-p end" onclick="dlg.close();dlg.classList.remove('dlg-wide')">Đã hiểu</button>
 </div>`;
 dlg.showModal();
}

/** Modal tra cứu nhanh ý nghĩa các nhãn trạng thái */
function moYNgiaTrangThai(){
 dlg.classList.add('dlg-wide');
 const entries = Object.entries(STATUS_DESC);
 dlgBody.innerHTML=`<h2>🏷️ Ý nghĩa các nhãn trạng thái</h2>
 <p class="sub">Giải thích các nhãn hiển thị trong hệ thống Sổ tay LCĐ</p>
 <div class="scroll" style="max-height:55vh">
  <table>
   <thead><tr><th style="width:140px">Nhãn</th><th>Giải thích ý nghĩa</th></tr></thead>
   <tbody>
    ${entries.map(([label,desc])=>`
     <tr>
      <td><b>${esc(label)}</b></td>
      <td class="t2" style="color:var(--sec)">${esc(desc)}</td>
     </tr>`).join('')}
   </tbody>
  </table>
 </div>
 <div class="row" style="margin-top:14px">
  <button type="button" class="b-p end" onclick="dlg.close();dlg.classList.remove('dlg-wide')">Đóng</button>
 </div>`;
 dlg.showModal();
}

/* ===================== ĐIỀU HƯỚNG ===================== */
const state={role:'lcd',cdId:1,page:'tongquan',khId:null,q:'',cf:'all',df:'wait',metric:'kpi',a:1,b:4,todoTab:'all',userQ:'',userRoleFilter:'all',userStFilter:'all',sortKH:'near'};
const MENU={
 lcd:[['','BCH Liên chi đoàn'],['tongquan','Tổng quan'],['hoatdong','Hoạt động triển khai'],['matran','Ma trận theo dõi'],['duyet','Duyệt hồ sơ'],['sosanh','So sánh chi đoàn'],
  ['','Con người'],['bch','Nhân sự & BCH LCĐ'],['sinhhoat','Sinh hoạt & điểm danh'],['nhansu','Nhân sự toàn khoa'],
  ['','Kết xuất'],['excel','Nhập / xuất Excel'],['tongket','Tổng kết năm học'],['href:summary/index.html','Báo cáo tổng kết 2025 – 2026'],
  ['','Hệ thống & Phân quyền'],['users','Quản trị tài khoản']],
 cd:[['','BCH Chi đoàn'],['tongquan','Tổng quan chi đoàn'],['nhiemvu','Hoạt động được giao'],['tuchuc','Hoạt động tự tổ chức'],['kpi','KPI chi tiết'],['nhansu','Đoàn viên chi đoàn'],['excel','Nhập / xuất Excel'],
  ['','Báo cáo & Tổng kết'],['href:summary/index.html','Tổng kết năm học 2025 – 2026']]
};
const PAGES={};
function go(p,extra){Object.assign(state,extra||{});state.page=p;render()}
function render(){
 if(typeof auth === 'undefined' || !auth){
  document.body.innerHTML = '<div style="padding:48px 20px;text-align:center;font-family:sans-serif;color:var(--crit,#ef4444)"><h2>LỖI BẢO MẬT HỆ THỐNG</h2><p>Không tìm thấy module xác thực (auth.js). Ứng dụng đã bị khóa để bảo vệ dữ liệu.</p></div>';
  return;
 }
 if(!auth.currentUser){
  document.body.classList.add('is-login-screen');
  main.innerHTML = auth.renderTrangDangNhap ? auth.renderTrangDangNhap() : auth.renderLoginScreen();
  window.scrollTo(0,0);
  return;
 }
 document.body.classList.remove('is-login-screen');

 const curUser = auth.currentUser;
 const roleBoxEl = document.querySelector('.rolebox');

 if(curUser && roleBoxEl){
  const rInfo = typeof ROLE_INFO !== 'undefined' ? (ROLE_INFO[curUser.role] || {badge:'p-xs',icon:'👤',ten:curUser.role}) : {badge:'p-xs',icon:'👤',ten:curUser.role};
  let userCardHtml = `
  <div class="user-sidebar-card">
   <div class="user-avatar-wrap">
    <div class="user-avatar">${rInfo.icon}</div>
    <div class="user-meta">
     <b class="user-name" title="${esc(curUser.ten)}">${esc(curUser.ten)}</b>
     <div style="margin-top:2px"><span class="pill ${rInfo.badge}" style="font-size:10px;padding:1px 6px">${esc(rInfo.ten)}</span></div>
     <span class="user-uname">${esc(curUser.email || '')}</span>
    </div>
   </div>
   <div class="user-actions">
    <button type="button" class="btn-u-action" onclick="formDoiMatKhauCaNhan()" title="Đổi mật khẩu cá nhân">🔑 Đổi MK</button>
    <button type="button" class="btn-u-action btn-logout" onclick="auth.logout()" title="Đăng xuất khỏi hệ thống">🚪 Đăng xuất</button>
   </div>
  </div>`;

  if(curUser.role === 'admin' || curUser.role === 'lcd'){
   userCardHtml += `
   <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--nav-line)">
    <label for="roleSel" style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--nav-ink-2);font-weight:600;display:block">Chuyển góc nhìn</label>
    <select id="roleSel"></select>
   </div>`;
   roleBoxEl.innerHTML = userCardHtml;
   const rSel = document.getElementById('roleSel');
   if(rSel){
    rSel.innerHTML=`<option value="lcd"${state.role==='lcd'?' selected':''}>BCH Liên chi đoàn</option>`+
     DB.cd.map(c=>`<option value="${c.id}"${state.role==='cd'&&state.cdId===c.id?' selected':''}>BCH ${esc(c.ma)}</option>`).join('');
    rSel.onchange = e => {
     const v = e.target.value;
     if(v==='lcd'){state.role='lcd';state.page='tongquan'}
     else{state.role='cd';state.cdId=+v;state.page='tongquan'}
     render();
    };
   }
  } else {
   state.role = 'cd';
   state.cdId = curUser.cdId || (DB.cd && DB.cd[0] ? DB.cd[0].id : 1);
   const cdObj = CD(state.cdId);
   userCardHtml += `
   <div class="user-cd-lock" style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--nav-line)">
    <span class="t2" style="color:var(--nav-ink-2);font-size:11px">Chi đoàn phụ trách:</span>
    <b style="color:#fff;display:block;margin-top:2px;font-size:12.5px">${esc(cdObj.ten)} (${esc(cdObj.ma)})</b>
   </div>`;
   roleBoxEl.innerHTML = userCardHtml;
  }
 }

 if(curUser && curUser.role === 'cd'){
  state.role = 'cd';
  state.cdId = curUser.cdId || 1;
  if(state.page === 'users' || state.page === 'duyet' || state.page === 'hoatdong' || state.page === 'bch' || state.page === 'sinhhoat' || state.page === 'sosanh' || state.page === 'matran'){
   state.page = 'tongquan';
  }
 }

 const menuItems = MENU[state.role] || MENU.lcd;
 nav.innerHTML=menuItems.map(([p,t])=>{
  if(!p) return `<div class="grp">${t}</div>`;
  if(p.startsWith('href:')){
   const url = p.slice(5);
   return `<a href="${esc(url)}" class="nav-standalone">${t}<span class="nav-ext-arrow" aria-hidden="true">↗</span></a>`;
  }
  return `<a href="#${p}"${state.page===p||(p==='hoatdong'&&state.page==='khct')?' aria-current="page"':''} data-go="${p}">${t}</a>`;
 }).join('');
 main.innerHTML=topBarHtml()+(PAGES[state.page]?PAGES[state.page]():PAGES.tongquan());
 window.scrollTo(0,0);
}

window.addEventListener('hashchange',()=>{
 const h=location.hash.slice(1);
 if(h&&PAGES[h]&&state.page!==h){state.page=h;render()}
});
if(location.hash.slice(1)&&PAGES[location.hash.slice(1)]){
 state.page=location.hash.slice(1);
}

document.addEventListener('click',e=>{
 const a=e.target.closest('[data-go]');
 if(a){e.preventDefault();go(a.dataset.go,a.dataset.kh?{khId:+a.dataset.kh}:null);return}
 
 // Xử lý mở / đóng chuông thông báo
 const notifBtn=e.target.closest('#notifToggle');
 const notifDropdown=document.getElementById('notifDropdown');
 if(notifBtn){
  if(notifDropdown) notifDropdown.classList.toggle('open');
  const uDrop = document.getElementById('userProfileDropdown');
  if(uDrop) uDrop.classList.remove('open');
  const utDrop = document.getElementById('utilDropdown');
  if(utDrop) utDrop.classList.remove('open');
  return;
 }
 if(notifDropdown && !e.target.closest('#notifDropdown')){
  notifDropdown.classList.remove('open');
 }

 // Xử lý menu tiện ích
 const utilBtn=e.target.closest('#utilToggle');
 const utilDropdown=document.getElementById('utilDropdown');
 if(utilBtn){
  if(utilDropdown) utilDropdown.classList.toggle('open');
  if(notifDropdown) notifDropdown.classList.remove('open');
  const uDrop = document.getElementById('userProfileDropdown');
  if(uDrop) uDrop.classList.remove('open');
  return;
 }
 if(utilDropdown && !e.target.closest('#utilDropdown')){
  utilDropdown.classList.remove('open');
 }

 // Xử lý menu hồ sơ người dùng
 const userBtn=e.target.closest('#userProfileToggle');
 const userDropdown=document.getElementById('userProfileDropdown');
 if(userBtn){
  if(userDropdown) userDropdown.classList.toggle('open');
  if(notifDropdown) notifDropdown.classList.remove('open');
  if(utilDropdown) utilDropdown.classList.remove('open');
  return;
 }
 if(userDropdown && !e.target.closest('#userProfileDropdown')){
  userDropdown.classList.remove('open');
 }

 // Xử lý click item thông báo
 const notifItem=e.target.closest('[data-notif-idx]');
 if(notifItem){
  const idx=+notifItem.dataset.notifIdx;
  const tb=layThongBao();
  if(tb[idx]&&tb[idx].action){
   if(notifDropdown) notifDropdown.classList.remove('open');
   tb[idx].action();
  }
 }
});

if(roleSel){
 roleSel.addEventListener('change',e=>{
  if(typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.role === 'cd'){
   state.role = 'cd';
   state.cdId = auth.currentUser.cdId || 1;
   render();
   return;
  }
  const v=e.target.value;
  if(v==='lcd'){state.role='lcd';state.page='tongquan'}
  else{state.role='cd';state.cdId=+v;state.page='tongquan'}
  render();
 });
}
themeBtn.addEventListener('click',()=>{
 const cur=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
 document.documentElement.dataset.theme=cur==='dark'?'light':'dark';
});
resetBtn.addEventListener('click',()=>{
 if(typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.role !== 'admin'){
  alert('Chỉ Quản trị viên hệ thống (Admin) mới có quyền khôi phục dữ liệu mẫu.');
  return;
 }
 xacNhan('Khôi phục dữ liệu mẫu?','Thao tác này chỉ ảnh hưởng dữ liệu trong phiên thử nghiệm.',()=>{DB=seed();render()});
});
window.formDoiMatKhauCaNhan = function(){
 if(typeof formDoiMatKhau === 'function') formDoiMatKhau();
};
const dataMgmtBtn = document.getElementById('dataMgmtBtn');
if(dataMgmtBtn) dataMgmtBtn.addEventListener('click', formQuanLyDuLieu);

/* Chú giải nổi [data-tip] */
document.addEventListener('mouseover',e=>{
 const t=e.target.closest('[data-tip]');
 if(!t)return;
 tip.textContent=t.dataset.tip;
 tip.style.opacity='1';
});
document.addEventListener('mousemove',e=>{
 if(tip.style.opacity!=='1')return;
 tip.style.left=Math.min(innerWidth-tip.offsetWidth-10,e.clientX+14)+'px';
 tip.style.top=Math.max(8,e.clientY-tip.offsetHeight-12)+'px';
});
document.addEventListener('mouseout',e=>{
 if(e.target.closest('[data-tip]'))tip.style.opacity='0';
});

