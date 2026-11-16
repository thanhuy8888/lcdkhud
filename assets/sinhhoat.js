/* Trang sinh hoạt LCĐ và bảng điểm danh. */
/* ===================== TRANG — SINH HOẠT & ĐIỂM DANH ===================== */
PAGES.sinhhoat=function(){
 const hs=[...DB.hop].sort((a,b)=>b.ngay.localeCompare(a.ngay));
 const daHop=buoiDaHop();
 const cot=[...DB.hop].sort((a,b)=>a.ngay.localeCompare(b.ngay)); // mọi buổi, kể cả buổi mới thêm
 const vangNhieu=DB.ns.filter(u=>chuyenCan(u.id).vang>=VANG_CANH_BAO);
 const tyTB=Math.round(DB.ns.reduce((s,u)=>s+chuyenCan(u.id).ty,0)/DB.ns.length*100);
 return `<div class="head"><div><h1>Sinh hoạt Liên chi đoàn</h1>
  <p class="sub">Sổ sinh hoạt hằng tuần, biên bản và điểm danh — số liệu này chấm thẳng vào tiêu chí chuyên cần của uỷ viên BCH.</p></div>
  <button class="b-p end" onclick="formHop()">+ Thêm buổi sinh hoạt</button></div>
 <div class="grid g4">
  ${tile('Buổi đã tổ chức',daHop.length,DB.hop.filter(h=>h.ngay<=TODAY&&!daDiemDanh(h)).length?DB.hop.filter(h=>h.ngay<=TODAY&&!daDiemDanh(h)).length+' buổi chưa chốt điểm danh':'tính đến '+dmy(TODAY))}
  ${tile('Tỷ lệ có mặt',tyTB+'%','Trung bình toàn bộ nhân sự LCĐ')}
  ${tile('Vắng từ '+VANG_CANH_BAO+' buổi',vangNhieu.length,vangNhieu.length?'Cần nhắc nhở theo quy định':'Không có trường hợp nào')}
  ${tile('Buổi chưa có biên bản',DB.hop.filter(h=>h.ngay<=TODAY&&!h.bienBan&&!(h.tep||[]).length).length,'Thư ký cần bổ sung')}
 </div>
 <div class="card"><header><h3>Sổ sinh hoạt</h3></header>
 <div class="scroll"><table><thead><tr><th>Ngày</th><th>Nội dung buổi sinh hoạt</th><th>Biên bản</th>
  <th class="n">Có mặt</th><th style="min-width:110px">Tỷ lệ</th><th></th></tr></thead>
 <tbody>${hs.map(h=>{const co=DB.ns.filter(u=>{const d=ddOf(h.id,u.id);return d&&d.co}).length;
  const ty=Math.round(co/DB.ns.length*100);
  return `<tr><td class="t2">${dmy(h.ngay)}${h.ngay>TODAY?' '+pill('sắp tới','p-mute'):''}</td>
  <td><b>${esc(h.ten)}</b><div class="t2">${esc(h.noiDung)||'(chưa ghi nội dung)'}</div></td>
  <td class="t2">
   ${h.bienBan ? (/^https?:\/\/|drive\.google\.com/i.test(h.bienBan) ? hienThiLink(h.bienBan,'Mở biên bản',`moSuaLink({tieuDe:'Biên bản họp ${dmy(h.ngay)}',url:'${esc(h.bienBan)}',onSave:v=>{h.bienBan=v}})`)+'<br>' : `<span class="link-item"><span>${esc(h.bienBan)}</span><button class="btn-edit-link" onclick="moSuaLink({tieuDe:'Biên bản họp ${dmy(h.ngay)}',url:'${esc(h.bienBan)}',onSave:v=>{h.bienBan=v}})">✏️</button></span><br>`) : ''}
   ${(h.tep||[]).length?pill((h.tep||[]).length+' tệp đã tải','p-good'):(h.bienBan?'':pill('chưa có','p-warn'))}
   <button class="b-s" onclick="formTep(${h.id})" style="margin-left:4px">Tệp</button>
  </td>
  <td class="n">${h.ngay<=TODAY?co+'/'+DB.ns.length:'–'}</td>
  <td>${h.ngay<=TODAY?`<span class="track"><i style="width:${ty}%;background:${ty>=80?'var(--good)':'var(--seq-4)'}"></i></span>`:''}</td>
  <td class="n"><button class="b-s b-p" onclick="formDiemDanh(${h.id})">Điểm danh</button>
   <button class="b-s" onclick="formHop(${h.id})">Sửa</button></td></tr>`}).join('')}</tbody></table></div></div>
 ${(()=>{const kho=DB.hop.flatMap(h=>(h.tep||[]).map(t=>({h,t}))).sort((a,b)=>b.h.ngay.localeCompare(a.h.ngay)||b.t.taiLuc.localeCompare(a.t.taiLuc));
  return `<div class="card" style="margin-top:14px"><header><h3>Kho biên bản theo ngày</h3>
  <p class="end">${kho.length} tệp · ${coTep(kho.reduce((s,x)=>s+x.t.co,0))}</p></header>
  ${kho.length?`<div class="scroll"><table><thead><tr><th>Ngày sinh hoạt</th><th>Buổi</th><th>Tệp</th><th class="n">Dung lượng</th><th class="n">Tải lên</th><th></th></tr></thead>
  <tbody>${kho.map(({h,t})=>`<tr><td class="t2">${dmy(h.ngay)}</td><td class="t2">${esc(h.ten)}</td>
   <td><b>${esc(t.ten)}</b></td><td class="n t2">${coTep(t.co)}</td><td class="n t2">${dmy(t.taiLuc)}</td>
   <td class="n"><button class="b-s" onclick="moTep('${t.id}')">Mở</button></td></tr>`).join('')}</tbody></table></div>`
  :'<p class="t2" style="margin:0">Chưa có tệp nào. Bấm nút “Tệp” ở từng buổi sinh hoạt để tải biên bản, ảnh chụp hoặc danh sách ký tên lên.</p>'}
  </div>`})()}
 <div class="card" style="margin-top:14px"><header><h3>Bảng điểm danh</h3>
  <p>Nhấn vào ô để đổi: chưa điểm danh → có mặt → đi muộn → vắng</p>
  <button class="b-p end" onclick="formHop()">+ Thêm ngày sinh hoạt</button></header>
 <div class="scroll"><table class="hm"><thead><tr><th></th>
  ${cot.map(h=>`<th class="rot" style="${h.ngay>TODAY?'color:var(--muted)':''}"${tip(h.ten+' · '+dmy(h.ngay)+(h.ngay>TODAY?' (chưa diễn ra)':daDiemDanh(h)?'':' (chưa điểm danh)'))}>${dmy(h.ngay)}${h.ngay>TODAY?' ·':''}</th>`).join('')}
  <th class="rot">Vắng / Muộn</th></tr></thead>
 <tbody>${NHOM.map(([key,tenN])=>{const nh=DB.ns.filter(u=>u.nhom===key);if(!nh.length)return '';
  return `<tr><td colspan="${cot.length+2}" style="padding-top:12px;font:600 11.5px var(--ff);letter-spacing:.06em;text-transform:uppercase;color:var(--accent)">${tenN}</td></tr>`
  +nh.map(u=>{const cc=chuyenCan(u.id);
  return `<tr><td class="lab">${esc(u.ten)}${u.bch?' <span class="t2">· '+esc(u.vaiTro)+'</span>':''}</td>
  ${cot.map(h=>{const d=ddOf(h.id,u.id);
   const tt=!d?'chưa điểm danh':d.co?(d.muon?'đi muộn':'có mặt'):'vắng';
   const bg=!d?'transparent':!d.co?'var(--seq-0)':d.muon?'color-mix(in srgb,var(--warn) 45%,transparent)':'var(--seq-4)';
   return `<td><div class="cell" style="background:${bg};color:${d&&d.co&&!d.muon?'#fff':'var(--sec)'};cursor:pointer;${!d?'border:1px dashed var(--line)':''}"
    data-dd="${h.id}-${u.id}"${tip(u.ten+' · '+dmy(h.ngay)+': '+tt)}>${!d?'·':!d.co?'×':d.muon?'M':'✓'}</div></td>`}).join('')}
  <td><div class="cell" style="background:${cc.vang>=VANG_CANH_BAO?'color-mix(in srgb,var(--crit) 20%,transparent)':'var(--seq-0)'};color:var(--sec)">${cc.vang}/${cc.muon}</div></td></tr>`}).join('')}).join('')}
 </tbody></table></div>
 <div class="lgd"><span><b style="background:transparent;border:1px dashed var(--line)"></b>Chưa điểm danh</span>
  <span><b style="background:var(--seq-4)"></b>Có mặt</span>
  <span><b style="background:color-mix(in srgb,var(--warn) 45%,transparent)"></b>Đi muộn</span>
  <span><b style="background:var(--seq-0);border:1px solid var(--line)"></b>Vắng</span>
  <span class="t2">Quy định LCĐ: đi muộn có hình thức phạt, vắng từ ${VANG_CANH_BAO} buổi sẽ bị xem xét tư cách.</span></div></div>`;
};
document.addEventListener('click',e=>{
 const c=e.target.closest('[data-dd]');if(!c)return;
 const [h,n]=c.dataset.dd.split('-').map(Number);
 doiDiemDanh(h,n);save();render();
});
/** Xoay một ô điểm danh: chưa điểm danh → có mặt → đi muộn → vắng → chưa điểm danh. */
function doiDiemDanh(hopId,nsId){
 const d=ddOf(hopId,nsId);
 if(!d){DB.dd.push({hopId,nsId,co:true,muon:false});return}
 if(d.co&&!d.muon){d.muon=true;return}
 if(d.co&&d.muon){d.co=false;d.muon=false;return}
 DB.dd=DB.dd.filter(x=>x!==d);
}
/** Đặt thẳng một trạng thái: 'co' | 'muon' | 'vang' | 'trong'. */
function datDiemDanh(hopId,nsId,tt){
 DB.dd=DB.dd.filter(d=>!(d.hopId===hopId&&d.nsId===nsId));
 if(tt==='co')DB.dd.push({hopId,nsId,co:true,muon:false});
 if(tt==='muon')DB.dd.push({hopId,nsId,co:true,muon:true});
 if(tt==='vang')DB.dd.push({hopId,nsId,co:false,muon:false});
}
/* ----- chốt điểm danh cả buổi trong một hộp thoại ----- */
function formDiemDanh(hopId){
 const h=DB.hop.find(x=>x.id===hopId);
 const hang=u=>{const d=ddOf(hopId,u.id),tt=!d?'trong':d.co?(d.muon?'muon':'co'):'vang';
  const nut=(v,nhan,cls)=>`<button class="b-s ${tt===v?cls:''}" onclick="datDiemDanh(${hopId},${u.id},'${v}');save();veDiemDanh(${hopId});render()">${nhan}</button>`;
  return `<tr><td><b>${esc(u.ten)}</b><div class="t2">${esc(u.vaiTro)} · ${esc(u.ban)}</div></td>
  <td class="n" style="white-space:nowrap">${nut('co','Có mặt','b-p')}${nut('muon','Muộn','b-ok')}${nut('vang','Vắng','b-no')}</td></tr>`};
 const than=()=>NHOM.map(([k,ten])=>{const ds=DB.ns.filter(u=>u.nhom===k);if(!ds.length)return '';
  return `<tr><td colspan="2" style="padding-top:12px;font:600 11px var(--ff);letter-spacing:.06em;text-transform:uppercase;color:var(--accent)">${ten}</td></tr>`
   +ds.map(hang).join('')}).join('');
 window.veDiemDanh=id=>{const b=dlgBody.querySelector('#dd_than');if(b&&id===hopId)b.innerHTML=than()};
 const co=DB.ns.filter(u=>{const d=ddOf(hopId,u.id);return d&&d.co}).length;
 dlgBody.innerHTML=`<h2>Điểm danh ${dmy(h.ngay)}</h2>
 <p class="sub">${esc(h.ten)} · hiện có mặt ${co}/${DB.ns.length}</p>
 <div class="row" style="margin-bottom:10px">
  <button type="button" onclick="DB.ns.forEach(u=>datDiemDanh(${hopId},u.id,'co'));save();veDiemDanh(${hopId});render()">Đánh dấu tất cả có mặt</button>
  <button type="button" onclick="DB.dd=DB.dd.filter(d=>d.hopId!==${hopId});save();veDiemDanh(${hopId});render()">Xoá hết đánh dấu</button></div>
 <div class="scroll" style="max-height:46vh"><table><tbody id="dd_than">${than()}</tbody></table></div>
 <div class="row" style="margin-top:12px"><button type="button" class="b-p end" onclick="dlg.close();render()">Xong</button></div>`;
 dlg.showModal();
}
/* ----- tệp đính kèm của một buổi sinh hoạt ----- */
async function moTep(id){
 const b=await layTep(id).catch(()=>null);
 const meta=DB.hop.flatMap(h=>h.tep||[]).find(t=>t.id===id);
 if(!b){bao('Không tìm thấy nội dung tệp','Tệp chỉ nằm trên trình duyệt đã tải nó lên, không đồng bộ sang máy khác.');return}
 const url=URL.createObjectURL(b);
 if(meta&&/^image\//.test(meta.kieu||'')){ // ảnh thì xem ngay tại chỗ
  dlgBody.innerHTML=`<h2>${esc(meta.ten)}</h2><p class="sub">${coTep(meta.co)} · tải ${dmy(meta.taiLuc)}</p>
  <img src="${url}" alt="${esc(meta.ten)}" style="width:100%;border-radius:10px;border:1px solid var(--line)">
  <div class="row" style="margin-top:12px"><button type="button" class="b-p end" onclick="dlg.close()">Đóng</button></div>`;
  dlg.showModal();setTimeout(()=>URL.revokeObjectURL(url),60000);return;
 }
 if(!taiDuoc()){ // bản xem nhanh trong khung artifact bị chặn tải tệp
  URL.revokeObjectURL(url);
  bao('Bản xem nhanh không tải được tệp','Trình xem này chặn việc tải tệp về máy. Mở cùng trang tại lcdkhud.vercel.app để tải '+(meta?meta.ten:'tệp')+' — ảnh thì vẫn xem trực tiếp được ở đây.');
  return;
 }
 const a=document.createElement('a');a.href=url;a.download=meta?meta.ten:'bien-ban';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),20000);
}
const bao=(tieuDe,noiDung)=>{dlgBody.innerHTML=`<h2>${esc(tieuDe)}</h2><p class="sub">${esc(noiDung)}</p>
 <div class="row"><button type="button" class="b-p end" onclick="dlg.close()">Đóng</button></div>`;dlg.showModal()};
async function formTep(hopId){
 const h=DB.hop.find(x=>x.id===hopId);h.tep=h.tep||[];
 let dung='';
 try{const e=await navigator.storage.estimate();dung=' · trình duyệt đã dùng '+coTep(e.usage||0)}catch(e){}
 dlgBody.innerHTML=`<h2>Biên bản ${dmy(h.ngay)}</h2>
 <p class="sub">${esc(h.ten)}${dung}</p>
 <div id="t_ds">${dsTep(h)}</div>
 <div class="f"><label for="t_file">Tải tệp lên (biên bản, ảnh chụp, danh sách ký tên)</label>
  <input id="t_file" type="file" multiple></div>
 <div class="note">Tệp nằm trong bộ nhớ trình duyệt của máy này, không gửi đi đâu và không đồng bộ sang máy khác.
  Mỗi tệp tối đa ${coTep(TEP_TOI_DA)}. Muốn cả BCH cùng xem thì vẫn nên dán thêm link Drive vào ô Biên bản.</div>
 <div class="row"><button type="button" class="b-p end" onclick="dlg.close()">Xong</button></div>`;
 dlg.showModal();
 dlgBody.querySelector('#t_file').addEventListener('change',async e=>{
  const ds=dlgBody.querySelector('#t_ds');
  for(const f of [...e.target.files]){
   if(f.size>TEP_TOI_DA){ds.insertAdjacentHTML('afterbegin',`<div class="note" style="border-left-color:var(--crit)">${esc(f.name)} nặng ${coTep(f.size)}, vượt mức cho phép.</div>`);continue}
   const id=idTep();
   try{await luuTep(id,f)}catch(err){ds.insertAdjacentHTML('afterbegin','<div class="note" style="border-left-color:var(--crit)">Trình duyệt không cho lưu tệp (có thể đang ở chế độ ẩn danh).</div>');continue}
   h.tep.push({id,ten:f.name,co:f.size,kieu:f.type,taiLuc:TODAY});
  }
  save();e.target.value='';ds.innerHTML=dsTep(h);render();
 });
}
const dsTep=h=>(h.tep||[]).length?`<div class="scroll" style="margin-bottom:12px"><table><tbody>
 ${h.tep.map(t=>`<tr><td><b>${esc(t.ten)}</b><div class="t2">${coTep(t.co)} · tải ${dmy(t.taiLuc)}</div></td>
 <td class="n"><button class="b-s" onclick="moTep('${t.id}')">Mở</button>
  <button class="b-s b-no" onclick="xoaTep(${h.id},'${t.id}')">Xoá</button></td></tr>`).join('')}
 </tbody></table></div>`:'<p class="t2" style="margin:0 0 12px">Chưa có tệp nào cho buổi này.</p>';
function xoaTep(hopId,id){
 const h=DB.hop.find(x=>x.id===hopId);
 h.tep=h.tep.filter(t=>t.id!==id);save();
 xoaTepKho(id).catch(()=>{});
 dlgBody.querySelector('#t_ds').innerHTML=dsTep(h);render();
}
function formHop(id){
 const h=id?DB.hop.find(x=>x.id===id):{ten:'Họp Liên chi đoàn KHUD',ngay:TODAY,noiDung:'',bienBan:''};
 dlgBody.innerHTML=`<h2>${id?'Sửa':'Thêm'} buổi sinh hoạt</h2>
 <div class="f"><label for="p_ten">Tên buổi sinh hoạt</label><input id="p_ten" value="${esc(h.ten)}"></div>
 <div class="f"><label for="p_ngay">Thời gian</label><input id="p_ngay" type="date" value="${h.ngay}"></div>
 <div class="f"><label for="p_nd">Nội dung</label><textarea id="p_nd" style="width:100%;height:70px">${esc(h.noiDung)}</textarea></div>
 <div class="f"><label for="p_bb">Biên bản (tên file hoặc link Drive)</label><input id="p_bb" value="${esc(h.bienBan)}" placeholder="Biên bản họp 13-10.docx hoặc https://drive.google.com/…"></div>
 <div class="row" style="margin-top:-6px;margin-bottom:10px"><button type="button" class="b-s" id="p_test_bb">🔗 Thử mở link</button></div>
 <div class="row"><button type="button" id="huy">Huỷ</button>
  ${id?'<button type="button" class="b-no" onclick="xoaHop('+id+')">Xoá buổi họp</button>':''}
  <button type="button" class="b-p end" id="luu">Lưu</button></div>`;
 dlg.showModal();huy.onclick=()=>dlg.close();
 dlgBody.querySelector('#p_test_bb').onclick=()=>{
  const v=dlgBody.querySelector('#p_bb').value.trim();
  if(!v) return alert('Vui lòng nhập link trước khi thử mở!');
  window.open(chuanHoaLink(v),'_blank','noopener');
 };
 luu.onclick=()=>{
  if(!p_ten.value.trim())return p_ten.focus();
  const o={ten:p_ten.value.trim(),ngay:p_ngay.value,noiDung:p_nd.value.trim(),bienBan:p_bb.value.trim()};
  if(id)Object.assign(DB.hop.find(x=>x.id===id),o);
  else{const nid=nextId(DB.hop);DB.hop.push({id:nid,tep:[],...o});save();dlg.close();formDiemDanh(nid);return}
  save();dlg.close();render();
 };
}
function xoaHop(id){dlg.close();
 xacNhan('Xoá buổi sinh hoạt?','Dữ liệu điểm danh của buổi này cũng bị xoá.',
 ()=>{const h=DB.hop.find(x=>x.id===id);(h.tep||[]).forEach(t=>xoaTepKho(t.id).catch(()=>{}));
  DB.hop=DB.hop.filter(x=>x.id!==id);DB.dd=DB.dd.filter(d=>d.hopId!==id);save();render()})}
