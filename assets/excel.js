/* Nhập / xuất Excel theo đúng định dạng file checklist của LCĐ. */
/* ===================== NHẬP / XUẤT EXCEL ===================== */
const bo=t=>String(t??'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
const cot=(h,...ten)=>h.findIndex(x=>ten.some(t=>bo(x)===bo(t)||bo(x).startsWith(bo(t))));
const tachBang=t=>t.trim().split(/\r?\n/).map(l=>l.split(l.includes('\t')?'\t':',').map(c=>c.trim().replace(/^"|"$/g,'')));
const coXLSX=()=>typeof XLSX!=='undefined';
const taiDuoc=()=>{try{return window.self===window.top}catch(e){return false}};
const XUAT={
 tongket:['Tong ket KPI chi doan',()=>[['Chi đoàn','Ngành','Sĩ số',...CRIT.map(c=>c.ten),'Điểm trừ','Tổng điểm','Xếp loại','Lượt tham gia','Lượt/SV','Đoàn phí (%)'],
  ...bangXH().map(c=>[c.ma,c.nganh,c.siSo,...c.chiTiet.map(x=>x.diem),c.diemTru,c.tong,c.xl[1],c.luot,huyDong(c.id),tyLePhi(c.id)])]],
 doanvien:['Danh sach doan vien',()=>[['Họ và tên','MSSV','Chi đoàn','Chức vụ','ĐRL','Xếp loại ĐV','Số HĐ','Đoàn phí','Ghi chú'],
  ...DB.dv.filter(d=>state.role==='lcd'||d.cdId===state.cdId).map(d=>[d.ten,d.mssv,CD(d.cdId).ma,d.cv,d.drl,xepLoai(d.drl)[1],d.soHD,d.doanPhi?'x':'',d.ghiChu])]],
 kehoach:['Ke hoach va tien do',()=>[['Mã kế hoạch','Tên kế hoạch','Tiêu chí','Phụ trách','Bắt đầu','Hạn chót','Chỉ tiêu','Đơn vị','Điểm tối đa','Bắt buộc','CĐ đã nộp','CĐ đạt chỉ tiêu','Tổng lượt','TB % chỉ tiêu'],
  ...DB.kh.map(k=>{const t=thongKeKH(k);return [k.ma,k.ten,critOf(k.crit).ten,k.ptId&&UV(k.ptId)?UV(k.ptId).ten:'',k.batDau,k.hanChot,k.chiTieu,k.donVi==='%'?'% sĩ số':'lượt',k.diem,k.batBuoc?'x':'',t.nop,t.dat,t.luot,t.tbTy]})]],
 baocao:['Bao cao chi tiet',()=>[['Mã kế hoạch','Tên kế hoạch','Chi đoàn','Chỉ tiêu','Số lượt','% chỉ tiêu','Ngày nộp','Trễ hạn','Trạng thái','Điểm quy đổi','Minh chứng'],
  ...DB.bc.map(b=>{const k=KH(b.khId),c=CD(b.cdId),ct=chiTieuSo(k,c);
   return [k.ma,k.ten,c.ma,ct,b.soLuot,Math.round(b.soLuot/ct*100),b.ngayNop,b.treHan?'x':'',ST[b.status][0],diemKH(k,c).diem,b.mc]})]],
 matran:['Ma tran chi tieu',()=>{const kh=DB.kh.filter(k=>k.chiTieu&&k.batDau<=TODAY);
  return [['Chi đoàn',...kh.map(k=>k.ma)],...DB.cd.map(c=>[c.ma,...kh.map(k=>{const r=thongKeKH(k).rows.find(x=>x.cd.id===c.id);return r.b?r.ty:''})])]}],
 bch:['Danh gia BCH LCD',()=>[['Họ và tên','Chức vụ','Ban','Kế hoạch chủ trì','Chi đoàn đỡ đầu',...BCRIT.map(c=>c.ten),'Tổng điểm','Xếp loại','Dự họp','Nhiệm vụ'],
  ...bangBCH().map(x=>[x.u.ten,x.u.cv,x.u.ban,x.khs.map(y=>y.k.ma).join(' '),x.u.theoDoi.map(i=>CD(i).ma).join(' '),
   ...x.ct.map(c=>c.diem),x.tong,x.xl[1],x.u.hopDu+'/'+x.u.hopTong,x.u.nvXong+'/'+x.u.nvGiao])]],
 nhiemvu:['Nhiem vu chi doan',()=>[['Mã kế hoạch','Tên kế hoạch','Tiêu chí','Hạn chót','Chỉ tiêu','Đã làm','% chỉ tiêu','Trạng thái','Điểm'],
  ...DB.kh.map(k=>{const c=CD(state.cdId),b=bcOf(k.id,c.id),ct=chiTieuSo(k,c);
   return [k.ma,k.ten,critOf(k.crit).ten,k.hanChot,ct,b?b.soLuot:'',b?Math.round(b.soLuot/ct*100):'',b?ST[b.status][0]:'Chưa nộp',diemKH(k,c).diem]})]],
};
const MAU={
 doanvien:[['Họ và tên','MSSV','Chi đoàn','Chức vụ','ĐRL','Số HĐ','Đoàn phí','Ghi chú'],
  ['Nguyễn Văn A','2261100','DH22TUD','Đoàn viên',88,5,'x','Cảm tình Đảng']],
 baocao:[['Mã kế hoạch','Chi đoàn','Số lượt','Ngày nộp','Minh chứng'],
  ['KH-05','DH22TUD',22,'2026-10-09','drive.google.com/kh05-dh22tud']],
};
function xuatBang(key,rows,ten){
 const data=rows||XUAT[key][1](),ten2=ten||XUAT[key][0];
 const tsv=data.map(r=>r.map(v=>String(v??'')).join('\t')).join('\n');
 dlgBody.innerHTML=`<h2>Xuất: ${esc(ten2)}</h2>
 <p class="sub">${data.length-1} dòng × ${data[0].length} cột</p>
 <textarea id="x_ta" readonly style="width:100%;height:150px;font:12px/1.5 ui-monospace,Consolas,monospace;resize:vertical">${esc(tsv)}</textarea>
 <p class="t2" style="margin:8px 0 12px">Bấm “Sao chép” rồi dán vào ô A1 của Excel hoặc Google Sheets (Ctrl+V) — cột tự tách đúng.</p>
 <div class="row"><button type="button" class="b-p" id="cp">Sao chép toàn bộ</button>
  ${coXLSX()&&taiDuoc()?'<button type="button" id="dl">Tải file .xlsx</button>':''}
  <button type="button" class="end" id="huy">Đóng</button></div>`;
 dlg.showModal();huy.onclick=()=>dlg.close();
 const cp=dlgBody.querySelector('#cp'),ta=dlgBody.querySelector('#x_ta');
 cp.onclick=()=>{
  try{navigator.clipboard.writeText(tsv).then(()=>{cp.textContent='Đã sao chép ✓'},()=>{ta.select();cp.textContent='Hãy bấm Ctrl+C'})}
  catch(e){ta.select();cp.textContent='Hãy bấm Ctrl+C'}};
 const dl=dlgBody.querySelector('#dl');
 if(dl)dl.onclick=()=>{const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),'Sheet1');XLSX.writeFile(wb,ten2+'.xlsx')};
}
function apDungDV(rows){
 const h=rows[0];
 const iTen=cot(h,'ho va ten','ho ten','ten'),iMs=cot(h,'mssv','ma so'),iCd=cot(h,'chi doan','ma chi doan'),
  iCv=cot(h,'chuc vu'),iDrl=cot(h,'drl','diem ren luyen'),iHd=cot(h,'so hd','so hoat dong'),
  iPhi=cot(h,'doan phi'),iGc=cot(h,'ghi chu');
 if(iTen<0||iMs<0)return{loi:'File thiếu cột “Họ và tên” hoặc “MSSV”.'};
 let them=0,sua=0,boQua=0;
 rows.slice(1).filter(r=>r[iTen]).forEach(r=>{
  let cdId=state.role==='cd'?state.cdId:null;
  if(cdId===null){const m=DB.cd.find(c=>bo(c.ma)===bo(r[iCd])||bo(c.ten)===bo(r[iCd]));if(!m){boQua++;return}cdId=m.id}
  const o={ten:String(r[iTen]).trim(),mssv:String(r[iMs]??'').trim(),cv:(iCv>=0&&r[iCv])||'Đoàn viên',
   drl:+(r[iDrl]||0)||0,soHD:+(r[iHd]||0)||0,
   doanPhi:['x','co','1','da nop','roi','true','v'].includes(bo(r[iPhi])),ghiChu:(iGc>=0&&r[iGc])||''};
  const cu=DB.dv.find(d=>d.mssv&&d.mssv===o.mssv);
  if(cu){Object.assign(cu,o,{cdId});sua++}else{DB.dv.push({id:nextId(DB.dv),cdId,...o});them++}
 });
 return {ok:'Đã thêm '+them+' đoàn viên, cập nhật '+sua+' đoàn viên'+(boQua?', bỏ qua '+boQua+' dòng không khớp mã chi đoàn':'')+'.'};
}
function apDungBC(rows){
 const h=rows[0];
 const iKh=cot(h,'ma ke hoach','ma kh','ke hoach'),iCd=cot(h,'chi doan','ma chi doan'),
  iSo=cot(h,'so luot','so luong','thuc hien'),iNgay=cot(h,'ngay nop'),iMc=cot(h,'minh chung');
 if(iKh<0||iSo<0)return{loi:'File thiếu cột “Mã kế hoạch” hoặc “Số lượt”.'};
 let them=0,sua=0,boQua=0;
 rows.slice(1).filter(r=>r[iKh]).forEach(r=>{
  const k=DB.kh.find(x=>bo(x.ma)===bo(r[iKh]));
  let cdId=state.role==='cd'?state.cdId:null;
  if(cdId===null){const m=DB.cd.find(c=>bo(c.ma)===bo(r[iCd]));if(m)cdId=m.id}
  if(!k||!cdId||!(+r[iSo]>=0)){boQua++;return}
  const ngay=(iNgay>=0&&r[iNgay])?String(r[iNgay]).slice(0,10):TODAY;
  const o={soLuot:+r[iSo],ngayNop:ngay,treHan:ngay>k.hanChot,mc:(iMc>=0&&r[iMc])||'(chưa có)',status:'wait',nx:''};
  const cu=bcOf(k.id,cdId);
  if(cu){Object.assign(cu,o);sua++}else{DB.bc.push({id:nextId(DB.bc),khId:k.id,cdId,...o});them++}
 });
 return {ok:'Đã thêm '+them+' báo cáo, cập nhật '+sua+' báo cáo'+(boQua?', bỏ qua '+boQua+' dòng không khớp mã kế hoạch hoặc chi đoàn':'')+'. Tất cả ở trạng thái Chờ duyệt.'};
}
let nhapRows=null;
Object.assign(XUAT,{
 nhansu:['DS nhan su LCD',()=>[['No.','Họ và Tên','SĐT','MSSV','Lớp','Vai trò','Ban','Khối','Link FB','Chi đoàn đỡ đầu'],
  ...DB.ns.map((u,i)=>[i+1,u.ten,u.sdt,u.mssv,u.lop,u.vaiTro,u.ban,tenNhom(u.nhom),u.fb,u.theoDoi.map(x=>CD(x).ma).join(' ')])]],
 timeline:['Cong tac theo timeline',()=>[['STT','HOẠT ĐỘNG','THỜI GIAN','TIẾN ĐỘ','Ban Phụ Trách','PHỤ TRÁCH','LỊCH CÔNG TÁC','NOTE','Minh Chứng','Kết quả','Chỉ tiêu / CĐ','Điểm tối đa','CĐ đã nộp','TB % chỉ tiêu'],
  ...DB.kh.map((k,i)=>{const t=k.chiTieu?thongKeKH(k):null;
   return [i+1,k.ten,k.hienThi||dmy(k.batDau),TIENDO[k.tienDo][0],k.ban.join(', '),k.ptIds.map(x=>UV(x)?UV(x).ten:'').filter(Boolean).join(' / '),
    (k.lich||[]).map(m=>(m.xong?'[x] ':'[ ] ')+m.ten+' — '+m.han).join(' | '),k.note,k.mc,k.ketQua,k.chiTieu?k.chiTieu+(k.donVi==='%'?'% sĩ số':' lượt'):'nội bộ LCĐ',k.diem||'',t?t.nop:'',t?t.tbTy:'']})]],
 lichcongtac:['Lich cong tac',()=>[['Mã','Đầu việc','Mốc công tác','Hạn','Người phụ trách','Trạng thái'],
  ...DB.kh.flatMap(k=>(k.lich||[]).map(m=>[k.ma,k.ten,m.ten,m.han,m.nsId&&UV(m.nsId)?UV(m.nsId).ten:'',
   m.xong?'Đã xong':(m.han<TODAY?'Quá hạn':'Đang làm')]))]],
 sinhhoat:['So sinh hoat LCD',()=>[['STT','HOẠT ĐỘNG','THỜI GIAN','NỘI DUNG','BIÊN BẢN CUỘC HỌP','Tệp đính kèm','Có mặt','Vắng'],
  ...DB.hop.map((h,i)=>{const co=DB.ns.filter(u=>{const d=ddOf(h.id,u.id);return d&&d.co}).length;
   return [i+1,h.ten,h.ngay,h.noiDung,h.bienBan,(h.tep||[]).map(t=>t.ten).join(' | '),co,DB.ns.length-co]})]],
 diemdanh:['Diem danh sinh hoat',()=>{const hs=buoiDaHop();
  return [['No.','Họ và Tên','Vai trò','Ban',...hs.map(h=>h.ngay),'Vắng','Muộn'],
   ...DB.ns.map((u,i)=>{const cc=chuyenCan(u.id);
    return [i+1,u.ten,u.vaiTro,u.ban,...hs.map(h=>{const d=ddOf(h.id,u.id);return !d||!d.co?'FALSE':(d.muon?'MUON':'TRUE')}),cc.vang,cc.muon]})]}],
 danhgiabch:['Danh gia BCH LCD',()=>[['Họ và Tên','Vai trò','Ban','Đầu việc phụ trách','Chi đoàn đỡ đầu',...BCRIT.map(c=>c.ten),'Tổng điểm','Xếp loại','Dự họp','Đầu việc xong'],
  ...bangBCH().map(x=>[x.u.ten,x.u.vaiTro,x.u.ban,x.khs.map(y=>y.k.ma).join(' '),x.u.theoDoi.map(i=>CD(i).ma).join(' '),
   ...x.ct.map(c=>c.diem),x.tong,x.xl[1],x.cc.co+'/'+x.cc.tong,x.nv.xong+'/'+x.nv.giao])]],
});
Object.assign(MAU,{
 nhansu:[['No.','Họ và Tên','SĐT','MSSV','Lớp','Vai trò','Link FB'],
  ['Ban Phong trào','','','','','',''],
  [1,'Nguyễn Văn A','0900000000','23070001','BDA2023A','Trưởng ban','facebook.com/a']],
 timeline:[['STT','HOẠT ĐỘNG','THỜI GIAN','TIẾN ĐỘ','Ban Phụ Trách','PHỤ TRÁCH','LỊCH CÔNG TÁC','NOTE','Minh Chứng','Kết quả'],
  [1,'Workshop làm hoa','20/10/2026','Đang triển khai','Ban Tình nguyện','Trần Huyền / Thành Tân','','','drive.google.com/…','']],
});
/** Nhập sheet "DS NHÂN SỰ": dòng chỉ có tên ban được hiểu là tiêu đề nhóm. */
function apDungNS(rows){
 const h=rows[0];
 const iTen=cot(h,'ho va ten','ho ten'),iSdt=cot(h,'sdt','dien thoai'),iMs=cot(h,'mssv'),
  iLop=cot(h,'lop'),iVt=cot(h,'vai tro','chuc vu'),iFb=cot(h,'link fb','facebook'),iBan=cot(h,'ban');
 if(iTen<0)return{loi:'File thiếu cột “Họ và Tên”.'};
 let them=0,sua=0,banHienTai='Thường trực',nhomHienTai='bcm';
 rows.slice(1).forEach(r=>{
  const day=r.filter(c=>String(c??'').trim()!=='');
  if(day.length===1){const t=bo(day[0]);
   if(/key|nguon/.test(t)){nhomHienTai='nguon';return}
   if(/ban chap hanh|^bch/.test(t)){nhomHienTai='bch';return}
   if(/^ban |^thuong truc|^thuong vu/.test(t)){banHienTai=matBan(day[0]);nhomHienTai='bcm';return}
   return}
  const ten=String(r[iTen]??'').trim();if(!ten)return;
  const ban=iBan>=0&&r[iBan]?matBan(r[iBan]):banHienTai;
  const vt=iVt>=0&&r[iVt]?matVaiTro(r[iVt]):'Thành viên';
  const o={ten,ban,vaiTro:vt,sdt:iSdt>=0?String(r[iSdt]??'').trim():'',mssv:iMs>=0?String(r[iMs]??'').trim():'',
   lop:iLop>=0?String(r[iLop]??'').trim():'',fb:iFb>=0?String(r[iFb]??'').trim():'',
   nhom:['Bí thư','Phó Bí thư','UV BTV','UV BCH'].includes(vt)?'bch':nhomHienTai,
   bch:['Bí thư','Phó Bí thư','UV BTV','UV BCH'].includes(vt)||nhomHienTai==='bch'?1:0};
  const cu=DB.ns.find(u=>bo(u.ten)===bo(ten));
  if(cu){Object.assign(cu,o);sua++}else{DB.ns.push({id:nextId(DB.ns),theoDoi:[],...o});them++}
 });
 return {ok:'Đã thêm '+them+' nhân sự, cập nhật '+sua+' nhân sự theo ban chuyên môn.'};
}
const matBan=t=>{const x=bo(t);
 if(/tckt|to chuc|kiem tra/.test(x))return 'Ban Tổ chức – Kiểm tra';
 if(/tchc|tai chinh|hau can/.test(x))return 'Ban Tài chính – Hậu cần';
 if(/tthong|truyen thong/.test(x))return 'Ban Truyền thông';
 if(/tinh nguyen/.test(x))return 'Ban Tình nguyện';
 if(/phong trao/.test(x))return 'Ban Phong trào';
 if(/hoc tap|nckh/.test(x))return 'Ban Học tập & NCKH';
 return BAN.find(b=>bo(b)===x)||'Thường trực'};
const matVaiTro=t=>{const x=bo(t);
 return x==='bt'||x.includes('bi thu')&&!x.includes('pho')?'Bí thư':x==='pbt'||x.includes('pho bi thu')?'Phó Bí thư':
  x.includes('btv')?'UV BTV':x.includes('bch')?'UV BCH':x.includes('truong ban')?'Trưởng ban':x.includes('pho ban')?'Phó ban':'Thành viên'};
const matTienDo=t=>{const x=bo(t);return x.includes('hoan thanh')?'xong':x.includes('dang')?'dang':'chua'};
const ngayISO=t=>{const s=String(t??'').trim();
 let m=s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);if(m)return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
 m=s.match(/(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];
 return ''};
/** Nhập sheet "CÔNG TÁC THEO TIMELINE". */
function apDungTL(rows){
 const h=rows[0];
 const iTen=cot(h,'hoat dong','ten'),iTg=cot(h,'thoi gian'),iTd=cot(h,'tien do'),
  iBan=cot(h,'ban phu trach'),iPt=cot(h,'phu trach'),iNote=cot(h,'note','ghi chu'),
  iMc=cot(h,'minh chung'),iKq=cot(h,'ket qua');
 if(iTen<0)return{loi:'File thiếu cột “HOẠT ĐỘNG”.'};
 let them=0,sua=0;
 rows.slice(1).forEach(r=>{
  const ten=String(r[iTen]??'').trim();if(!ten)return;
  const hienThi=iTg>=0?String(r[iTg]??'').trim():'';
  const d=ngayISO(hienThi)||TODAY;
  const o={ten,hienThi:hienThi||dmy(d),tienDo:iTd>=0?matTienDo(r[iTd]):'chua',
   ban:iBan>=0&&r[iBan]?String(r[iBan]).split(',').map(x=>matBan(x)).filter((v,i,a)=>a.indexOf(v)===i):['Thường trực'],
   ptIds:iPt>=0&&r[iPt]?String(r[iPt]).split('/').map(x=>{const u=DB.ns.find(n=>bo(n.ten).includes(bo(x)));return u&&u.id}).filter(Boolean):[],
   note:iNote>=0?String(r[iNote]??'').trim():'',mc:iMc>=0?String(r[iMc]??'').trim():'',
   ketQua:iKq>=0?String(r[iKq]??'').trim():''};
  const cu=DB.kh.find(k=>bo(k.ten)===bo(ten));
  if(cu){Object.assign(cu,o,{ptId:o.ptIds[0]??cu.ptId});sua++}
  else{const id=nextId(DB.kh);
   DB.kh.push({id,ma:'KH-'+String(id).padStart(2,'0'),crit:'ct',batDau:d,hanChot:d,lich:[],
    diem:0,chiTieu:0,donVi:'n',batBuoc:false,ptId:o.ptIds[0],...o});them++}
 });
 return {ok:'Đã thêm '+them+' đầu việc, cập nhật '+sua+' đầu việc. Hoạt động mới chưa giao chỉ tiêu — mở từng việc để giao chỉ tiêu cho chi đoàn.'};
}
/** Nhập sheet "ĐIỂM DANH": các cột từ sau "Vai trò" là ngày sinh hoạt. */
function apDungDD(rows){
 const h=rows[0];
 const iTen=cot(h,'ho va ten','ho ten');
 if(iTen<0)return{loi:'File thiếu cột “Họ và Tên”.'};
 const cols=[];
 h.forEach((c,i)=>{const d=ngayISO(c);if(d)cols.push({i,ngay:d})});
 if(!cols.length)return{loi:'Không tìm thấy cột ngày sinh hoạt nào ở dòng tiêu đề.'};
 let buoiMoi=0,o=0;
 cols.forEach(c=>{if(!DB.hop.find(x=>x.ngay===c.ngay)){
  DB.hop.push({id:nextId(DB.hop),ten:'Họp Liên chi đoàn KHUD',ngay:c.ngay,noiDung:'',bienBan:''});buoiMoi++}});
 rows.slice(1).forEach(r=>{
  const ten=String(r[iTen]??'').trim();if(!ten)return;
  const u=DB.ns.find(x=>bo(x.ten)===bo(ten));if(!u)return;
  cols.forEach(c=>{
   const hop=DB.hop.find(x=>x.ngay===c.ngay);
   const v=bo(r[c.i]);
   const co=['true','x','có','co','1','v','yes'].includes(v),muon=v.includes('muon');
   let d=ddOf(hop.id,u.id);
   if(d){d.co=co||muon;d.muon=muon}else DB.dd.push({hopId:hop.id,nsId:u.id,co:co||muon,muon});
   o++;
  });
 });
 return {ok:'Đã cập nhật '+o+' ô điểm danh'+(buoiMoi?', tạo mới '+buoiMoi+' buổi sinh hoạt':'')+'.'};
}
const NHAP={
 dv:{ten:'danh sách đoàn viên',mau:'doanvien',ap:apDungDV,moTa:'Khớp theo MSSV: trùng thì cập nhật, chưa có thì thêm mới.'},
 bc:{ten:'số liệu báo cáo kế hoạch',mau:'baocao',ap:apDungBC,moTa:'Khớp theo mã kế hoạch và chi đoàn; hồ sơ nhập vào ở trạng thái Chờ duyệt.'},
 ns:{ten:'danh sách nhân sự LCĐ',mau:'nhansu',ap:apDungNS,moTa:'Đọc đúng sheet “DS NHÂN SỰ”: dòng chỉ có tên ban được hiểu là tiêu đề nhóm, người bên dưới thuộc ban đó.'},
 tl:{ten:'công tác theo timeline',mau:'timeline',ap:apDungTL,moTa:'Đọc đúng sheet “CÔNG TÁC THEO TIMELINE”: hoạt động, tiến độ, ban và người phụ trách, minh chứng, kết quả.'},
 dd:{ten:'bảng điểm danh',mau:null,ap:apDungDD,moTa:'Đọc đúng sheet “ĐIỂM DANH”: mỗi cột ngày là một buổi sinh hoạt, giá trị TRUE/FALSE hoặc x.'},
};
function formNhap(loai){
 const cf=NHAP[loai];nhapRows=null;
 dlgBody.innerHTML=`<h2>Nhập ${cf.ten} từ Excel</h2>
 <p class="sub">${cf.moTa}</p>
 <div class="f"><label for="n_file">Chọn file .xlsx hoặc .csv</label><input id="n_file" type="file" accept=".xlsx,.xls,.csv,.txt"></div>
 <div class="f"><label for="n_ta">Hoặc dán trực tiếp từ Excel (Ctrl+V, gồm cả dòng tiêu đề)</label>
  <textarea id="n_ta" style="width:100%;height:88px;font:12px/1.5 ui-monospace,Consolas,monospace"></textarea></div>
 <div id="n_xem"></div>
 <div class="row"><button type="button" id="huy">Huỷ</button>
  ${cf.mau?`<button type="button" onclick="xuatBang(null,MAU['${cf.mau}'],'Mau ${cf.mau}')">Tải file mẫu</button>`:''}
  <button type="button" class="b-p end" id="luu" disabled>Áp dụng</button></div>`;
 dlg.showModal();huy.onclick=()=>dlg.close();
 const xem=dlgBody.querySelector('#n_xem'),luu=dlgBody.querySelector('#luu');
 const nhan=rows=>{
  nhapRows=rows.filter(r=>r.some(c=>String(c??'').trim()!==''));
  const n=nhapRows.length-1;
  xem.innerHTML=n>0?'<div class="note">Đọc được <b>'+n+'</b> dòng dữ liệu, '+nhapRows[0].length+' cột: '+nhapRows[0].map(esc).join(' · ')+'</div>'
   +'<div class="scroll" style="max-height:140px;margin-bottom:10px"><table><tbody>'
   +nhapRows.slice(1,6).map(r=>'<tr>'+r.map(c=>'<td class="t2">'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'
   :'<div class="note" style="border-left-color:var(--crit)">Không đọc được dòng dữ liệu nào.</div>';
  luu.disabled=!(n>0);
 };
 dlgBody.querySelector('#n_ta').addEventListener('input',e=>{if(e.target.value.trim())nhan(tachBang(e.target.value))});
 dlgBody.querySelector('#n_file').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=ev=>{
   if(/\.(xlsx|xls)$/i.test(f.name)){
    if(!coXLSX()){xem.innerHTML='<div class="note" style="border-left-color:var(--crit)">Chưa tải được thư viện đọc .xlsx (cần mạng). Hãy lưu file thành .csv hoặc dán trực tiếp.</div>';return}
    const wb=XLSX.read(new Uint8Array(ev.target.result),{type:'array'});
    nhan(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:false,defval:''}));
   }else nhan(tachBang(new TextDecoder('utf-8').decode(ev.target.result)));
  };
  r.readAsArrayBuffer(f);
 });
 luu.onclick=()=>{
  const kq=cf.ap(nhapRows);
  if(kq.loi){xem.innerHTML='<div class="note" style="border-left-color:var(--crit)">'+esc(kq.loi)+'</div>';return}
  save();dlg.close();render();
  setTimeout(()=>{dlgBody.innerHTML='<h2>Đã nhập xong</h2><p class="sub">'+esc(kq.ok)+'</p>'
   +'<div class="row"><button type="button" class="b-p end" onclick="dlg.close()">Đóng</button></div>';dlg.showModal()},60);
 };
}
PAGES.excel=function(){
 const lcd=state.role==='lcd';
 const ds=lcd?['tongket','timeline','lichcongtac','nhansu','danhgiabch','diemdanh','sinhhoat','doanvien','baocao','matran','kehoach']:['nhiemvu','doanvien'];
 const nh=lcd?['ns','tl','dd','dv','bc']:['dv','bc'];
 return `<div class="head"><div><h1>Nhập / xuất Excel</h1>
  <p class="sub">${lcd?'Các bảng xuất ra giữ đúng cột của file checklist LCĐ đang dùng, và nhập ngược lại được từ chính file đó.':'Xuất số liệu chi đoàn, hoặc nhập danh sách đoàn viên từ file của lớp.'}</p></div></div>
 <div class="card"><header><h3>Xuất dữ liệu</h3><p class="end">Sao chép dán thẳng vào Excel${coXLSX()&&taiDuoc()?', hoặc tải .xlsx':''}</p></header>
  <div class="grid g3" style="margin:0">${ds.map(k=>`<button style="text-align:left;padding:12px 14px" onclick="xuatBang('${k}')">
   <b>${esc(XUAT[k][0])}</b><div class="t2">${XUAT[k][1]().length-1} dòng</div></button>`).join('')}</div>
  ${taiDuoc()?'':'<p class="t2" style="margin:12px 0 0">Bản chạy trên web không tự tải file được, nên dùng nút sao chép rồi dán vào Excel. Mở file index.html trực tiếp trên máy thì có thêm nút tải .xlsx.</p>'}</div>
 <div class="card" style="margin-top:14px"><header><h3>Nhập dữ liệu</h3><p class="end">Nhận .xlsx, .csv hoặc dán trực tiếp</p></header>
  <div class="grid g2" style="margin:0;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
  ${nh.map(k=>`<button style="text-align:left;padding:12px 14px" onclick="formNhap('${k}')">
   <b>Nhập ${esc(NHAP[k].ten)}</b><div class="t2">${esc(NHAP[k].moTa)}</div></button>`).join('')}</div>
  <p class="t2" style="margin:12px 0 0">Nhập từ file checklist hiện tại: mở sheet cần nhập trong Excel, bôi đen toàn bộ (gồm dòng tiêu đề), Ctrl+C rồi dán vào ô bên trên — hoặc chọn thẳng file .xlsx, hệ thống đọc sheet đầu tiên.</p></div>`;
};
