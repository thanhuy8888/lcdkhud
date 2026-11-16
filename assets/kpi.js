/* Công thức tính KPI chi đoàn và đánh giá uỷ viên BCH LCĐ. */
/* ===================== TÍNH TOÁN KPI ===================== */
const CD=id=>DB.cd.find(c=>c.id===id) || {id:id||0, ma:'–', ten:'(Chi đoàn)', nganh:'', siSo:0, bt:'(chưa cập nhật)', sdt:'', diemTru:0};
const KH=id=>DB.kh.find(k=>k.id===id) || {id:id||0, ma:'KH-00', ten:'(Đầu việc)', crit:'ct', ban:['Thường trực'], ptIds:[], batDau:TODAY, hanChot:TODAY, tienDo:'chua', diem:0, chiTieu:0, donVi:'n', batBuoc:false, ketQua:'', mc:'', note:'', lich:[]};
const bcOf=(khId,cdId)=>DB.bc.find(b=>b.khId===khId&&b.cdId===cdId);
const dvOf=id=>DB.dv.filter(d=>d.cdId===id);
const tyLePhi=id=>{const a=dvOf(id);return a.length?Math.round(a.filter(d=>d.doanPhi).length/a.length*100):0};
const trangThaiKH=k=>TIENDO[k.tienDo||'chua'] || ['Chưa triển khai', 'p-mute'];

/** Điểm một chi đoàn nhận được từ 1 kế hoạch LCĐ: theo tỷ lệ hoàn thành chỉ tiêu, phạt nếu nộp trễ. */
function diemKH(k,c){
 if(!k.chiTieu)return {diem:0,ty:0,b:null};
 const b=bcOf(k.id,c.id);
 if(!b||b.status!=='ok') return {diem:0,ty:0,b};
 const ty=Math.min(1,b.soLuot/chiTieuSo(k,c));
 return {diem:+(k.diem*ty*(b.treHan?TRE_PHAT:1)).toFixed(1),ty,b};
}
function kpi(cdId){
 const c=CD(cdId);
 const nguon=[];
 DB.kh.forEach(k=>{const r=diemKH(k,c);if(r.diem>0)nguon.push({crit:k.crit,diem:r.diem,ten:k.ma+' · '+k.ten,loai:'kh',ty:r.ty,treHan:r.b.treHan})});
 DB.hd.filter(h=>h.cdId===cdId&&h.status==='ok').forEach(h=>nguon.push({crit:h.crit,diem:h.diem,ten:h.ten,loai:'hd'}));
 const chiTiet=CRIT.map(cr=>{
  const ds=nguon.filter(n=>n.crit===cr.id);
  const raw=ds.reduce((s,n)=>s+n.diem,0);
  return {...cr,raw:+raw.toFixed(1),diem:+Math.min(raw,cr.max).toFixed(1),nguon:ds};
 });
 const tong=Math.round(Math.max(0,chiTiet.reduce((s,x)=>s+x.diem,0)-c.diemTru));
 return {chiTiet,diemTru:c.diemTru,tong,xl:xepLoai(tong),
  soKH:DB.bc.filter(b=>b.cdId===cdId&&b.status==='ok').length,
  cho:DB.bc.filter(b=>b.cdId===cdId&&b.status==='wait').length+DB.hd.filter(h=>h.cdId===cdId&&h.status==='wait').length,
  luot:DB.bc.filter(b=>b.cdId===cdId&&b.status==='ok').reduce((s,b)=>s+b.soLuot,0)};
}
/** Mức huy động: trung bình mỗi sinh viên tham gia bao nhiêu lượt hoạt động. */
const huyDong=id=>+(kpi(id).luot/CD(id).siSo).toFixed(1);
const bangXH=()=>DB.cd.map(c=>({...c,...kpi(c.id)})).sort((a,b)=>b.tong-a.tong);
/** Thống kê 1 kế hoạch trên toàn Liên chi đoàn */
function thongKeKH(k){
 if(!k.chiTieu)return {rows:[],luot:0,dat:0,nop:0,duyet:0,tbTy:0};
 const rows=DB.cd.map(c=>{
  const b=bcOf(k.id,c.id),ct=chiTieuSo(k,c);
  const ty=b&&b.status!=='no'?Math.round(b.soLuot/ct*100):0;
  return {cd:c,b,ct,ty,luot:b&&b.status!=='no'?b.soLuot:0,diem:diemKH(k,c).diem};
 });
 return {rows,luot:rows.reduce((s,r)=>s+r.luot,0),
  dat:rows.filter(r=>r.ty>=100).length,
  nop:rows.filter(r=>r.b).length,
  duyet:rows.filter(r=>r.b&&r.b.status==='ok').length,
  tbTy:Math.round(rows.reduce((s,r)=>s+Math.min(150,r.ty),0)/rows.length)};
}
/* ===== Đánh giá uỷ viên BCH Liên chi đoàn (thang 100) ===== */
const BCRIT=[
 {id:'kh',ten:'Kết quả công tác được giao phụ trách',max:35,c:'var(--s1)'},
 {id:'cd',ten:'Chi đoàn được phân công theo dõi',max:25,c:'var(--s2)'},
 {id:'hs',ten:'Xử lý hồ sơ, duyệt minh chứng',max:20,c:'var(--s3)'},
 {id:'sh',ten:'Sinh hoạt LCĐ và nhiệm vụ cá nhân',max:20,c:'var(--s4)'},
];
const UV=id=>DB.ns.find(x=>x.id===id) || {id:id||0, ten:'(Chưa phân công)', vaiTro:'Thành viên', ban:'Thường trực', lop:'', sdt:'', mssv:'', fb:'', bch:0, theoDoi:[]};
const daDiemDanh=h=>DB.dd.some(d=>d.hopId===h.id);
/** Buổi đã diễn ra và đã chốt điểm danh — buổi chưa điểm danh không kéo tụt chuyên cần của ai. */
const buoiDaHop=()=>DB.hop.filter(h=>h.ngay<=TODAY&&daDiemDanh(h));
const ddOf=(hopId,nsId)=>DB.dd.find(d=>d.hopId===hopId&&d.nsId===nsId);
function chuyenCan(nsId){
 const hs=buoiDaHop();
 const co=hs.filter(h=>{const d=ddOf(h.id,nsId);return d&&d.co}).length;
 const muon=hs.filter(h=>{const d=ddOf(h.id,nsId);return d&&d.co&&d.muon}).length;
 return {tong:hs.length,co,vang:hs.length-co,muon,ty:hs.length?co/hs.length:1};
}
/** Mức hoàn thành của một đầu việc: có chỉ tiêu thì theo số liệu chi đoàn, không thì theo tiến độ. */
const mucHT=k=>{
 if(!k.chiTieu)return k.tienDo==='xong'?100:k.tienDo==='dang'?60:0;
 const t=thongKeKH(k);
 return Math.round(0.6*Math.min(100,t.tbTy)+0.4*t.nop/DB.cd.length*100);
};
const nhiemVu=id=>{const ks=DB.kh.filter(k=>k.ptIds.includes(id));
 return {giao:ks.length,xong:ks.filter(k=>k.tienDo==='xong').length,
  tre:ks.filter(k=>k.hanChot<TODAY&&k.tienDo!=='xong').length}};
function kpiBCH(id){
 const u=UV(id);
 const khs=DB.kh.filter(k=>k.ptIds.includes(id)&&k.batDau<=TODAY).map(k=>({k,ht:mucHT(k)}));
 const cds=u.theoDoi.length?u.theoDoi:DB.cd.map(c=>c.id);
 const tbCD=cds.reduce((s,i)=>s+kpi(i).tong,0)/cds.length/100;
 const ton=DB.bc.filter(b=>b.status==='wait'&&KH(b.khId).ptIds.includes(id)).length
  +DB.kh.filter(k=>k.ptIds.includes(id)&&k.chiTieu&&k.hanChot<TODAY&&k.batBuoc&&DB.cd.some(c=>!bcOf(k.id,c.id))).length;
 const cc=chuyenCan(id),nv=nhiemVu(id);
 const ct=[
  {...BCRIT[0],diem:+(35*(khs.length?khs.reduce((s,x)=>s+x.ht,0)/khs.length/100:0)).toFixed(1),
   ghi:khs.length?khs.map(x=>x.k.ma).join(', '):'chưa có đầu việc nào đã bắt đầu'},
  {...BCRIT[1],diem:+(25*tbCD).toFixed(1),
   ghi:u.theoDoi.length?u.theoDoi.map(i=>CD(i).ma).join(', '):'theo dõi chung toàn khoa'},
  {...BCRIT[2],diem:Math.max(0,20-4*ton),
   ghi:ton?ton+' hồ sơ tồn (chờ duyệt hoặc chi đoàn quá hạn chưa nộp)':'không còn hồ sơ tồn đọng'},
  {...BCRIT[3],diem:+(12*cc.ty+8*nv.xong/Math.max(1,nv.giao)).toFixed(1),
   ghi:cc.co+'/'+cc.tong+' buổi sinh hoạt · '+nv.xong+'/'+nv.giao+' đầu việc hoàn thành'+(cc.muon?' · đi muộn '+cc.muon+' buổi':'')},
 ];
 const tong=Math.round(ct.reduce((s,x)=>s+x.diem,0));
 return {u,ct,tong,xl:xepLoai(tong),khs,ton,cds,cc,nv};
}
const bangBCH=()=>DB.ns.filter(u=>u.bch).map(u=>kpiBCH(u.id)).sort((a,b)=>b.tong-a.tong);
const thangKeys=['2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10'];
const thangNhan=['T3','T4','T5','T6','T7','T8','T9','T10'];
function luotTheoThang(cdId){
 return thangKeys.map(t=>{
  let s=0;
  DB.bc.filter(b=>b.status==='ok'&&(!cdId||b.cdId===cdId)).forEach(b=>{const k=KH(b.khId);if(k.hanChot.slice(0,7)===t)s+=b.soLuot});
  DB.hd.filter(h=>h.status==='ok'&&(!cdId||h.cdId===cdId)).forEach(h=>{if(h.ngay.slice(0,7)===t)s+=h.sl});
  return s;
 });
}
