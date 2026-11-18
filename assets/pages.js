/* Các trang của BCH Liên chi đoàn và BCH chi đoàn, kèm hộp thoại nhập liệu. */
/* ===================== TRANG — LIÊN CHI ĐOÀN ===================== */
PAGES.tongquan=()=>state.role==='lcd'?lcdTongQuan():cdTongQuan();
function lcdTongQuan(){
 const xh=bangXH(),tb=Math.round(xh.reduce((s,c)=>s+c.tong,0)/xh.length);
 const choBc=DB.bc.filter(b=>b.status==='wait').map(b=>({t:'bc',id:b.id,khId:b.khId,cdId:b.cdId,ten:KH(b.khId).ma+' · '+KH(b.khId).ten,cdMa:CD(b.cdId).ma,so:b.soLuot+'/'+chiTieuSo(KH(b.khId),CD(b.cdId))+' lượt',ngay:b.ngayNop,mc:b.mc,treHan:b.treHan,crit:KH(b.khId).crit}));
 const choHd=DB.hd.filter(h=>h.status==='wait').map(h=>({t:'hd',id:h.id,cdId:h.cdId,ten:h.ten,cdMa:CD(h.cdId).ma,so:h.sl?h.sl+' lượt':'–',ngay:h.ngay,mc:h.mc,crit:h.crit}));
 const cho=[...choBc,...choHd];
 const dangTK=DB.kh.filter(k=>k.tienDo==='dang');
 const tongLuot=xh.reduce((s,c)=>s+c.luot,0);
 const mg=mocDenHan(7);

 return `
 <!-- HEADER TRANG CHỦ GỌN GÀNG -->
 <div class="card dash-hero-card" style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
   <div>
    <h1 style="font-size:20px;margin:0 0 4px">Tổng quan Liên chi đoàn KHUD</h1>
    <p class="sub" style="margin-bottom:0">Nhiệm kỳ 2025 – 2027 · <b>${DB.cd.length} Chi đoàn</b> trực thuộc · <b>${DB.kh.length} Hoạt động</b> theo timeline · <b>${DB.ns.length} Cán bộ Đoàn</b></p>
   </div>
   <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="b-p" onclick="formKH()" type="button">+ Thêm đầu việc</button>
    <button class="b-s" onclick="formCD()" type="button">+ Thêm chi đoàn</button>
    ${cho.length ? `<button class="b-s" style="border-color:var(--warn);color:#8a6100;font-weight:600" data-go="duyet" type="button">Duyệt ${cho.length} hồ sơ</button>` : ''}
   </div>
  </div>
 </div>

 <!-- 4 THẺ CHỈ SỐ CỐT LÕI (TILES) -->
 <div class="grid g4" style="margin-bottom:14px">
  <div class="tile">
   <div class="lbl">ĐIỂM KPI TRUNG BÌNH</div>
   <div class="val" style="color:var(--accent)">${tb}<span style="font-size:14px;color:var(--muted)">/100</span></div>
   <div class="foot">${pillXL(xepLoai(tb))} · Toàn khoa</div>
  </div>
  <div class="tile" style="cursor:pointer" onclick="go('duyet')" title="Bấm để xem danh sách duyệt">
   <div class="lbl">HỒ SƠ CHỜ DUYỆT</div>
   <div class="val" style="color:${cho.length?'var(--warn)':'var(--good)'}">${cho.length}</div>
   <div class="foot">${cho.length ? '<span style="color:#8a6100;font-weight:600">Cần thẩm định điểm</span>' : 'Đã xử lý hết'}</div>
  </div>
  <div class="tile" style="cursor:pointer" onclick="go('hoatdong')" title="Bấm để xem tiến độ hoạt động">
   <div class="lbl">ĐANG TRIỂN KHAI</div>
   <div class="val" style="color:var(--s1)">${dangTK.length}</div>
   <div class="foot">${DB.kh.filter(k=>k.tienDo==='xong').length} hoạt động đã xong</div>
  </div>
  <div class="tile">
   <div class="lbl">TỔNG LƯỢT THAM GIA</div>
   <div class="val" style="color:var(--good)">${tongLuot}</div>
   <div class="foot">Lượt đoàn viên toàn khoa</div>
  </div>
 </div>

 <!-- BỐ CỤC 2 CỘT CÂN ĐỐI, THOÁNG MẮT -->
 <div class="grid g2">
  <!-- CỘT TRÁI: BẢNG XẾP HẠNG THI ĐUA VÀ KẾ HOẠCH ĐANG CHẠY -->
  <div style="display:flex;flex-direction:column;gap:14px">
   <!-- THẺ BẢNG XẾP HẠNG CHI ĐOÀN -->
   <div class="card">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
     <div>
      <h3 style="font-size:14.5px">Bảng xếp hạng thi đua chi đoàn</h3>
      <p class="t2" style="margin:2px 0 0">Đánh giá theo 5 tiêu chí Đoàn vụ (Thang 100 điểm)</p>
     </div>
     <button class="b-s" data-go="sosanh" type="button" style="font-size:11.5px">So sánh chi tiết →</button>
    </header>

    <div class="scroll">
     <table class="dash-rank-table">
      <thead>
       <tr>
        <th style="width:36px;text-align:center">#</th>
        <th>Chi đoàn lớp</th>
        <th class="n" style="width:70px">Lượt TG</th>
        <th style="min-width:120px">Tiến độ điểm</th>
        <th class="n" style="width:65px">Điểm</th>
        <th style="width:90px;text-align:center">Xếp loại</th>
       </tr>
      </thead>
      <tbody>
       ${xh.map((c, i) => {
        const rankClass = i === 0 ? 'rank-badge r-top1' : (i === 1 ? 'rank-badge r-top2' : (i === 2 ? 'rank-badge r-top3' : 'rank-badge'));
        return `
        <tr>
         <td style="text-align:center"><span class="${rankClass}">${i + 1}</span></td>
         <td>
          <b>${esc(c.ma)}</b>
          <button class="btn-edit-link" onclick="formCD(${c.id})" title="Sửa thông tin chi đoàn" type="button">Sửa</button>
          <div class="t2" style="font-size:11px">${esc(c.nganh)} · ${c.siSo} SV</div>
         </td>
         <td class="n">${c.luot}</td>
         <td>
          <div class="track" style="height:7px;border-radius:4px;background:var(--track)">
           <i style="width:${Math.min(100, c.tong)}%;background:${c.tong>=90?'var(--accent)':c.tong>=80?'var(--good)':'var(--warn)'}"></i>
          </div>
         </td>
         <td class="n"><b style="font-size:14px">${c.tong}</b></td>
         <td style="text-align:center">${pillXL(c.xl)}</td>
        </tr>`;
       }).join('')}
      </tbody>
     </table>
    </div>

    <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center">
     <span class="t2">Xếp loại dựa trên minh chứng đã thẩm định</span>
     <a href="#matran" data-go="matran" style="font-size:12px;font-weight:600">Xem Ma trận chỉ tiêu 11 Chi đoàn →</a>
    </div>
   </div>

   <!-- THẺ TIẾN ĐỘ HOẠT ĐỘNG TRỌNG TÂM -->
   <div class="card">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
     <h3 style="font-size:14px">Hoạt động đang diễn ra (${dangTK.length})</h3>
     <a href="#hoatdong" data-go="hoatdong" style="font-size:12px">Xem tất cả →</a>
    </header>

    ${dangTK.length ? dangTK.slice(0, 4).map(k => {
     const t = thongKeKH(k);
     return `
     <div style="padding:10px 0;border-bottom:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
       <a href="#khct" data-go="khct" data-kh="${k.id}" style="font-weight:600;font-size:13px;text-decoration:none;color:var(--ink)">
        <b>${esc(k.ma)}</b> · ${esc(k.ten)}
       </a>
       <span class="pill p-warn" style="font-size:10px">Hạn ${dmy(k.hanChot)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:6px">
       <span class="track" style="flex:1;height:6px;border-radius:3px">
        <i style="width:${Math.min(100, t.tbTy)}%;background:var(--accent)"></i>
       </span>
       <span class="t2" style="font-size:11.5px;white-space:nowrap"><b>${t.nop}/${DB.cd.length}</b> CĐ nộp · ${t.luot} lượt</span>
      </div>
     </div>`;
    }).join('') : '<div class="empty" style="padding:18px">Hiện không có hoạt động nào đang diễn ra.</div>'}
   </div>
  </div>

  <!-- CỘT PHẢI: TRUNG TÂM VIỆC CẦN LÀM & ĐÁNH GIÁ 5 TIÊU CHÍ -->
  <div style="display:flex;flex-direction:column;gap:14px">
   <!-- THẺ HỒ SƠ CHỜ DUYỆT NHANH -->
   <div class="card">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
     <div>
      <h3 style="font-size:14px">Việc cần xử lý ngay</h3>
      <p class="t2" style="margin:2px 0 0">${cho.length ? `${cho.length} hồ sơ chờ duyệt` : 'Không có việc tồn đọng'}</p>
     </div>
     ${cho.length ? `<button class="b-s" data-go="duyet" type="button" style="font-size:11px">Mở trang duyệt →</button>` : ''}
    </header>

    ${cho.length ? `
    <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;padding-right:2px">
     ${cho.slice(0, 5).map(x => `
      <div class="dash-task-item">
       <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <div>
         <span class="pill p-xs" style="font-size:10px;padding:1px 5px">BCH ${esc(x.cdMa)}</span>
         <b style="font-size:12.5px;display:block;margin-top:3px">${esc(x.ten)}</b>
        </div>
        <span class="t2" style="font-size:10.5px">${dmy(x.ngay)}</span>
       </div>
       <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:8px">
        <span style="font-size:11.5px;color:var(--sec)">KQ: <b>${x.so}</b></span>
        <div style="display:flex;gap:4px">
         <button class="b-s b-ok" data-act="${x.t}-ok" data-id="${x.id}" type="button" style="padding:2px 8px;font-size:11px">Duyệt</button>
         <button class="b-s b-no" data-act="${x.t}-no" data-id="${x.id}" type="button" style="padding:2px 8px;font-size:11px">Trả lại</button>
         <button class="b-s" onclick="${x.t==='bc'?`formBC(${x.khId},${x.cdId})`:`formHD(${x.id})`}" type="button" style="padding:2px 6px;font-size:11px">Sửa</button>
        </div>
       </div>
      </div>`).join('')}
    </div>
    ${cho.length > 5 ? `<div style="text-align:center;margin-top:8px"><a href="#duyet" data-go="duyet" style="font-size:12px;font-weight:600">Và ${cho.length - 5} hồ sơ khác đang chờ duyệt →</a></div>` : ''}
    ` : `
    <div class="empty" style="padding:24px 14px;text-align:center">
     <b style="display:block;color:var(--good);font-size:13.5px">Đã xử lý xong mọi hồ sơ</b>
     <span class="t2">Toàn bộ minh chứng nộp của các chi đoàn đã được duyệt hoàn tất.</span>
    </div>`}
   </div>

   <!-- THẺ CƠ CẤU 5 TIÊU CHÍ TOÀN KHOA -->
   <div class="card">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
     <div>
      <h3 style="font-size:14px">Điểm theo 5 mảng tiêu chí</h3>
      <p class="t2" style="margin:2px 0 0">Mỗi mảng tối đa 20 điểm</p>
     </div>
    </header>

    <div style="display:flex;flex-direction:column;gap:9px">
     ${CRIT.map((cr, idx) => {
      const avg = Math.round(xh.reduce((s, c) => s + (c.chiTiet[idx] ? c.chiTiet[idx].diem : 0), 0) / xh.length * 10) / 10;
      const pct = Math.min(100, Math.round((avg / cr.max) * 100));
      return `
      <div>
       <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:3px">
        <span style="font-weight:500;color:var(--ink)">${esc(cr.ten)}</span>
        <span><b>${avg}</b><span class="t2">/20</span></span>
       </div>
       <div class="track" style="height:6px;border-radius:3px">
        <i style="width:${pct}%;background:${cr.c}"></i>
       </div>
      </div>`;
     }).join('')}
    </div>
   </div>

   <!-- MỐC CÔNG TÁC SẮP ĐẾN HẠN (NẾU CÓ) -->
   ${mg.length ? `
   <div class="card" style="border-left:4px solid var(--warn)">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
     <h4 style="margin:0;font-size:13px;display:flex;align-items:center;gap:6px">Mốc công tác trong 7 ngày (${mg.length})</h4>
    </header>
    <div style="display:flex;flex-direction:column;gap:6px">
     ${mg.slice(0, 3).map(({k, m}) => `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:4px 0;border-bottom:1px dashed var(--line)">
       <div style="min-width:0;flex:1">
        <b>${esc(m.ten)}</b>
        <div class="t2">${esc(k.ma)} · ${m.han < TODAY ? '<span style="color:var(--crit);font-weight:600">Quá hạn</span>' : 'Hạn ' + dmy(m.han)}</div>
       </div>
       <button class="b-s b-ok" data-moc="${k.id}-${m.id}" type="button" style="padding:2px 7px;font-size:11px">Xong</button>
      </div>`).join('')}
    </div>
   </div>` : ''}
  </div>
 </div>`;
}

PAGES.hoatdong=function(){
 const td=state.td||'all',bn=state.bn||'all',lo=state.lo||'all',sort=state.sortKH||'near';
 const ds=DB.kh.filter(k=>(td==='all'||k.tienDo===td)&&(bn==='all'||k.ban.includes(bn))
  &&(lo==='all'||(lo==='ct'?k.chiTieu>0:!k.chiTieu)));
 ds.sort((a,b)=>soSanhKH(a,b,sort));
 const coCT=DB.kh.filter(k=>k.chiTieu&&k.batDau<=TODAY);
 const quaHan=DB.kh.filter(k=>k.hanChot<TODAY&&k.tienDo!=='xong');
 return `<div class="head"><div><h1>Công tác theo timeline</h1>
  <p class="sub">Toàn bộ đầu việc Liên chi đoàn triển khai: việc có giao chỉ tiêu sẽ chấm điểm chi đoàn, việc nội bộ chỉ theo dõi tiến độ.</p></div>
  <button class="b-p end" id="themKH">+ Thêm đầu việc</button></div>
 <div class="grid g4">
  ${tile('Đầu việc trong timeline',DB.kh.length,DB.kh.filter(k=>k.chiTieu).length+' việc có giao chỉ tiêu cho chi đoàn')}
  ${tile('Đang triển khai',DB.kh.filter(k=>k.tienDo==='dang').length,DB.kh.filter(k=>k.tienDo==='xong').length+' việc đã hoàn thành')}
  ${tile('Quá hạn chưa xong',quaHan.length,quaHan.length?'Cần rà lại với ban phụ trách':'Không có việc nào trễ hạn')}
  ${tile('Tỷ lệ chi đoàn nộp báo cáo',Math.round(coCT.reduce((s,k)=>s+thongKeKH(k).nop,0)/Math.max(1,coCT.length*DB.cd.length)*100)+'%','Trên các việc đã giao chỉ tiêu')}
 </div>
 <div class="card"><header><h3>Danh sách đầu việc</h3>
  <div class="end row"><select onchange="go('hoatdong',{td:this.value})">
   <option value="all"${td==='all'?' selected':''}>Mọi tiến độ</option>
   ${Object.entries(TIENDO).map(([v,t])=>`<option value="${v}"${td===v?' selected':''}>${t[0]}</option>`).join('')}</select>
  <select onchange="go('hoatdong',{bn:this.value})"><option value="all"${bn==='all'?' selected':''}>Mọi ban</option>
   ${BAN.map(b=>`<option value="${esc(b)}"${bn===b?' selected':''}>${esc(b)}</option>`).join('')}</select>
  <select onchange="go('hoatdong',{lo:this.value})"><option value="all"${lo==='all'?' selected':''}>Mọi loại việc</option>
   <option value="ct"${lo==='ct'?' selected':''}>Có giao chỉ tiêu</option>
   <option value="nb"${lo==='nb'?' selected':''}>Nội bộ LCĐ</option></select>
  <select onchange="go('hoatdong',{sortKH:this.value})" title="Sắp xếp danh sách">
   <option value="near"${sort==='near'?' selected':''}>Gần hôm nay nhất</option>
   <option value="newest"${sort==='newest'?' selected':''}>Mới nhất trước</option>
   <option value="oldest"${sort==='oldest'?' selected':''}>Cũ nhất trước</option>
   <option value="ma"${sort==='ma'?' selected':''}>Theo mã việc</option></select></div></header>
 <div class="scroll"><table><thead><tr><th>Mã</th><th>Hoạt động</th><th>Ban phụ trách</th><th>Phụ trách</th><th>Thời gian</th>
  <th>Tiến độ</th><th>Chỉ tiêu / CĐ</th><th style="min-width:140px">Mức hoàn thành</th><th>Minh chứng</th><th>Thao tác</th></tr></thead>
 <tbody>${ds.map(k=>{const t=thongKeKH(k),ht=mucHT(k);
   const dangDienRa = k.batDau<=TODAY && TODAY<=k.hanChot && k.tienDo!=='xong';
   const badgeNgay = dangDienRa ? '<div>'+pill('đang diễn ra','p-xs')+'</div>' : (k.hanChot<TODAY&&k.tienDo!=='xong'?'<div>'+pill('quá hạn','p-crit')+'</div>':'');
   return `<tr><td><b>${esc(k.ma)}</b>${k.batBuoc?' '+pill('BB','p-xs'):''}</td>
   <td><a href="#khct" data-go="khct" data-kh="${k.id}">${esc(k.ten)}</a>
    <div class="t2">${critOf(k.crit).ten}${k.ketQua?' · '+esc(k.ketQua):''}</div></td>
   <td class="t2">${k.ban.map(esc).join(', ')}</td>
   <td class="t2">${k.ptIds.map(i=>UV(i)?esc(UV(i).ten):'').filter(Boolean).join(', ')||'–'}</td>
   <td class="t2">${esc(k.hienThi||dmy(k.batDau))}${badgeNgay}</td>
  <td>
   <select class="st-sel" onchange="doiTienDoKH(${k.id},this.value)" title="Đổi tiến độ">
    ${Object.entries(TIENDO).map(([v,text])=>`<option value="${v}"${k.tienDo===v?' selected':''}>${text[0]}</option>`).join('')}
   </select>
  </td>
  <td class="n">${k.chiTieu?k.chiTieu+(k.donVi==='%'?'% sĩ số':' lượt'):'<span class="t2">nội bộ</span>'}</td>
  <td><span class="track"><i style="width:${Math.min(100,ht)}%;background:${ht>=80?'var(--good)':'var(--seq-4)'}"${tip(k.chiTieu?'Trung bình đạt '+t.tbTy+'% chỉ tiêu · '+t.nop+'/'+DB.cd.length+' chi đoàn nộp':'Theo tiến độ: '+TIENDO[k.tienDo][0])}></i></span>
   <span class="t2">${k.chiTieu?t.dat+'/'+DB.cd.length+' CĐ đạt chỉ tiêu':TIENDO[k.tienDo][0]}${(k.lich||[]).length?' · '+k.lich.filter(m=>m.xong).length+'/'+k.lich.length+' mốc':''}</span></td>
  <td>${hienThiLink(k.mc,'Mở link',{tieuDe:k.ma+' · '+k.ten,url:k.mc,onSave:v=>{const it=KH(k.id);if(it){it.mc=v;if(typeof dataApi!=='undefined'&&dataApi.luuKH)dataApi.luuKH(it);}}})}</td>
  <td class="n" style="white-space:nowrap">
   <button class="b-s" onclick="formKH(${k.id})">Sửa</button>
   <button class="b-s b-no" onclick="xoaKH(${k.id})">Xoá</button>
  </td></tr>`}).join('')||'<tr><td colspan="10" class="empty">Không có đầu việc nào khớp bộ lọc.</td></tr>'}</tbody></table></div></div>`;
};

const mocDenHan=(n=7)=>DB.kh.flatMap(k=>(k.lich||[]).filter(m=>!m.xong&&m.han<=dayAdd(TODAY,n)).map(m=>({k,m})))
 .sort((a,b)=>a.m.han.localeCompare(b.m.han));
function lichCT(k){
 const ds=k.lich||[],xong=ds.filter(m=>m.xong).length;
 return `<div class="card" style="margin-top:14px"><header><h3>Lịch công tác</h3>
  <p class="end">${ds.length?xong+'/'+ds.length+' mốc đã xong':'chưa chia mốc'}</p></header>
  ${ds.length?`<span class="track" style="display:block;margin-bottom:12px"><i style="width:${xong/ds.length*100}%;background:${xong===ds.length?'var(--good)':'var(--seq-4)'}"></i></span>
  <div class="scroll"><table><tbody>${ds.map(m=>{const tre=!m.xong&&m.han<TODAY;
   return `<tr><td style="width:34px"><button class="b-s ${m.xong?'b-ok':''}" data-moc="${k.id}-${m.id}">${m.xong?'✓':'○'}</button></td>
   <td><b style="${m.xong?'opacity:.55':''}">${esc(m.ten)}</b></td>
   <td class="t2">${m.nsId&&UV(m.nsId)?esc(UV(m.nsId).ten):'–'}</td>
   <td class="n t2">${dmy(m.han)}</td>
   <td class="n">${m.xong?pill('xong','p-good'):tre?pill('quá hạn','p-crit'):pill('đang làm','p-warn')}</td>
   <td class="n"><button class="b-s" onclick="formMoc(${k.id},${m.id})">Sửa</button></td></tr>`}).join('')}</tbody></table></div>`
  :'<p class="t2" style="margin:0">Chia đầu việc thành các mốc nhỏ để biết đang tắc ở khâu nào, ai đang giữ việc.</p>'}
  <div class="row" style="margin-top:12px"><button class="b-p" onclick="formMoc(${k.id})">+ Thêm mốc công tác</button></div></div>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-moc]');if(!b)return;
 const [ki,mi]=b.dataset.moc.split('-').map(Number);
 const m=KH(ki).lich.find(x=>x.id===mi);m.xong=!m.xong;save();render();
});
function formMoc(khId,mocId){
 const k=KH(khId),m=mocId?k.lich.find(x=>x.id===mocId):{ten:'',han:k.hanChot,nsId:k.ptIds[0]||0,xong:false};
 dlgBody.innerHTML=`<h2>${mocId?'Sửa':'Thêm'} mốc công tác</h2>
 <p class="sub">${esc(k.ma)} · ${esc(k.ten)}</p>
 <div class="f"><label for="m_ten">Nội dung mốc</label><input id="m_ten" value="${esc(m.ten)}" placeholder="VD: Chốt danh sách tham dự"></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="m_han">Hạn hoàn thành</label><input id="m_han" type="date" value="${m.han}"></div>
 <div class="f" style="flex:1.4"><label for="m_ns">Người phụ trách</label><select id="m_ns"><option value="0">— chưa phân công —</option>
  ${DB.ns.map(u=>`<option value="${u.id}"${m.nsId===u.id?' selected':''}>${esc(u.ten)} — ${esc(u.ban)}</option>`).join('')}</select></div></div>
 <div class="f"><label class="row" style="font-weight:400"><input id="m_xong" type="checkbox" ${m.xong?'checked':''}> Đã hoàn thành</label></div>
 <div class="row"><button type="button" id="huy">Huỷ</button>
  ${mocId?'<button type="button" class="b-no" onclick="xoaMoc('+khId+','+mocId+')">Xoá mốc</button>':''}
  <button type="button" class="b-p end" id="luu">Lưu</button></div>`;
 dlg.showModal();huy.onclick=()=>dlg.close();
 luu.onclick=()=>{
  if(!m_ten.value.trim())return m_ten.focus();
  const o={ten:m_ten.value.trim(),han:m_han.value,nsId:+m_ns.value,xong:m_xong.checked};
  if(mocId)Object.assign(k.lich.find(x=>x.id===mocId),o);
  else{k.lich=k.lich||[];k.lich.push({id:nextId(k.lich.length?k.lich:[{id:0}]),...o})}
  save();dlg.close();render();
 };
}
function xoaMoc(khId,mocId){const k=KH(khId);k.lich=k.lich.filter(x=>x.id!==mocId);save();dlg.close();render()}
PAGES.khct=function(){
 const k=KH(state.khId)||DB.kh[0],cr=critOf(k.crit);
 const dau=`<div class="head"><div><p class="t2"><a href="#hoatdong" data-go="hoatdong">← Công tác theo timeline</a></p>
  <h1>${esc(k.ma)} · ${esc(k.ten)}</h1>
  <p class="sub">${cr.ten} · ${esc(k.hienThi||dmy(k.batDau))} · ${k.ban.map(esc).join(', ')} · phụ trách: ${k.ptIds.map(i=>UV(i)?esc(UV(i).ten):'').filter(Boolean).join(', ')||'chưa phân công'}</p></div>
  <span class="end">${pill(...TIENDO[k.tienDo])}</span></div>`;
 if(!k.chiTieu) return dau+`<div class="grid g2">
  <div class="card"><header><h3>Thông tin đầu việc</h3></header>
   <table><tbody>
   <tr><td>Tiến độ</td><td class="n">${pill(...TIENDO[k.tienDo])}</td></tr>
   <tr><td>Thời gian</td><td class="n">${esc(k.hienThi||dmy(k.batDau))} (hạn ${dmy(k.hanChot)})</td></tr>
   <tr><td>Kết quả</td><td class="n">${esc(k.ketQua)||'–'}</td></tr>
   <tr><td>Minh chứng</td><td class="n">${esc(k.mc)||'–'}</td></tr>
   <tr><td>Ghi chú</td><td class="n">${esc(k.note)||'–'}</td></tr></tbody></table>
   <div class="row" style="margin-top:12px"><button class="b-p" onclick="formKH(${k.id})">Cập nhật tiến độ</button></div></div>
  <div class="card"><header><h3>Việc nội bộ Liên chi đoàn</h3></header>
   <p class="t2">Đầu việc này chưa giao chỉ tiêu xuống chi đoàn nên không cộng điểm KPI chi đoàn; nó chỉ tính vào tiêu chí
   “Kết quả công tác được giao phụ trách” của uỷ viên BCH đứng tên.</p>
   <div class="row" style="margin-top:12px"><button onclick="formKH(${k.id})">Giao chỉ tiêu cho chi đoàn</button></div></div></div>`+lichCT(k);
 const t=thongKeKH(k);
 const rows=[...t.rows].sort((a,b)=>b.ty-a.ty);
 return dau+`<div class="row" style="margin:-6px 0 14px"><span class="t2">${k.batBuoc?'Bắt buộc toàn Liên chi đoàn':'Chi đoàn đăng ký tự nguyện'} · tối đa ${k.diem} điểm KPI${k.ketQua?' · kết quả: '+esc(k.ketQua):''}</span>
  <button class="b-s end" onclick="formKH(${k.id})">Sửa đầu việc</button></div>
 <div class="grid g4">
  ${tile('Chỉ tiêu giao',k.chiTieu+(k.donVi==='%'?'%':''),k.donVi==='%'?'tính trên sĩ số từng chi đoàn':'lượt tham gia mỗi chi đoàn')}
  ${tile('Chi đoàn đạt chỉ tiêu',t.dat+'/'+DB.cd.length,'Đạt từ 100% chỉ tiêu trở lên')}
  ${tile('Đã nộp báo cáo',t.nop+'/'+DB.cd.length,t.duyet+' báo cáo đã duyệt')}
  ${tile('Tổng lượt tham gia',t.luot,'Trung bình đạt '+t.tbTy+'% chỉ tiêu')}
 </div>
 <div class="grid g2">
  <div class="card"><header><h3>Mức độ hoàn thành chỉ tiêu theo chi đoàn</h3><p class="end">% chỉ tiêu được giao</p></header>
   ${rankBars(rows.map(r=>({l:r.cd.ma,v:r.ty,c:r.ty>=100?'var(--good)':r.ty>=60?'var(--seq-4)':'var(--serious)',
     tip:r.cd.ten+': '+r.luot+'/'+r.ct+' lượt ('+r.ty+'% chỉ tiêu)'})),{max:Math.max(150,...rows.map(r=>r.ty)),suffix:'%'})}
   <p class="t2" style="margin:12px 0 0">Màu xanh lá: đạt và vượt chỉ tiêu · xanh dương: còn thiếu · cam: dưới 60%.</p></div>
  <div class="card"><header><h3>Điểm KPI quy đổi</h3><p class="end">Tối đa ${k.diem} điểm</p></header>
   ${rankBars(rows.map(r=>({l:r.cd.ma,v:r.diem,tip:r.cd.ten+': '+r.diem+'/'+k.diem+' điểm'})),{max:k.diem,color:'var(--s1)'})}
   <p class="t2" style="margin:12px 0 0">Điểm = ${k.diem} × tỷ lệ hoàn thành chỉ tiêu (tối đa 100%), nộp trễ hạn còn ${TRE_PHAT*100}%.</p></div>
 </div>
 <div class="card"><header><h3>Báo cáo của từng chi đoàn</h3>
  <p class="end">LCĐ có thể nhập hộ báo cáo hoặc cập nhật trạng thái/link của chi đoàn</p></header>
 <div class="scroll"><table><thead><tr><th>Chi đoàn</th><th class="n">Sĩ số</th><th class="n">Chỉ tiêu</th><th class="n">Thực hiện</th>
  <th class="n">Tỷ lệ</th><th>Ngày nộp</th><th>Minh chứng</th><th>Trạng thái</th><th class="n">Điểm</th><th style="min-width:130px">Thao tác</th></tr></thead>
 <tbody>${t.rows.map(r=>{
  const mcHtml = r.b ? hienThiLink(r.b.mc, 'Mở link', {tieuDe:'Minh chứng: '+k.ma+' - '+r.cd.ma, url:r.b.mc, onSave:v=>{r.b.mc=v;if(typeof dataApi!=='undefined'&&dataApi.luuBC)dataApi.luuBC(r.b);}}) : '<span class="t2">–</span>';
  const stSelect = r.b ? `
   <select class="st-sel" onchange="doiTrangThaiBC(${r.b.id}, this.value)" title="Đổi trạng thái báo cáo">
    <option value="ok" ${r.b.status==='ok'?'selected':''}>✓ Đã duyệt</option>
    <option value="wait" ${r.b.status==='wait'?'selected':''}>⏳ Chờ duyệt</option>
    <option value="no" ${r.b.status==='no'?'selected':''}>✕ Trả lại</option>
   </select>` : (k.hanChot<TODAY?pill('Quá hạn','p-crit'):pill('Chưa nộp','p-mute'));
  return `<tr><td><b>${esc(r.cd.ma)}</b><div class="t2">BT ${esc(r.cd.bt)}</div></td>
  <td class="n">${r.cd.siSo}</td><td class="n">${r.ct}</td><td class="n">${r.b?r.b.soLuot:'–'}</td>
  <td class="n"><b>${r.b?r.ty+'%':'–'}</b></td>
  <td class="t2">${r.b?dmy(r.b.ngayNop)+(r.b.treHan?' '+pill('trễ','p-ser'):''):'–'}</td>
  <td>${mcHtml}</td>
  <td>${stSelect}</td>
  <td class="n">${r.diem||'–'}</td>
  <td class="n" style="white-space:nowrap">
   ${r.b ? `
    <button class="b-s" onclick="formBC(${k.id},${r.cd.id})">✏️ Sửa</button>
    ${r.b.status!=='ok'?`<button class="b-s b-ok" data-act="bc-ok" data-id="${r.b.id}">Duyệt</button>`:''}
    ${r.b.status!=='no'?`<button class="b-s b-no" data-act="bc-no" data-id="${r.b.id}">Trả</button>`:''}
   ` : `<button class="b-s b-p" onclick="formBC(${k.id},${r.cd.id})">+ Nhập báo cáo</button>`}
  </td></tr>`}).join('')}</tbody></table></div></div>`+lichCT(k);
};

PAGES.matran=function(){
 const kh=DB.kh.filter(k=>k.chiTieu&&k.batDau<=TODAY);
 const mode=state.matranMode||'barchart'; // 'barchart' | 'cd' | 'clean'
 const curCdId=state.matranCdId||DB.cd[0].id;
 const curCd=CD(curCdId);

 return `<div class="head"><div><h1>Theo dõi hoàn thành chỉ tiêu</h1>
  <p class="sub">Biểu đồ trực quan tiến độ thực hiện chỉ tiêu của các chi đoàn theo từng kế hoạch được giao.</p></div>
  <div class="end row">
   <div class="view-pills">
    <button type="button" class="view-pill ${mode==='barchart'?'active':''}" onclick="state.matranMode='barchart';render()">📊 Theo Kế hoạch</button>
    <button type="button" class="view-pill ${mode==='cd'?'active':''}" onclick="state.matranMode='cd';render()">🏢 Theo Chi đoàn</button>
    <button type="button" class="view-pill ${mode==='clean'?'active':''}" onclick="state.matranMode='clean';render()">📋 Bảng tổng hợp</button>
   </div>
  </div></div>

 ${mode==='barchart'?`
 <!-- GÓC NHÌN 1: BIỂU ĐỒ THANH THEO KẾ HOẠCH (DỄ NHÌN NHẤT) -->
 <div class="chart-card">
  <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
   <div>
    <h3 style="font-size:14px">Tỷ lệ hoàn thành chỉ tiêu trung bình theo từng kế hoạch</h3>
    <p class="t2" style="margin:2px 0 0">Vạch đứt nét thể hiện mốc chuẩn 100% chỉ tiêu được giao</p>
   </div>
   <div class="lgd" style="margin:0">
    <span><b style="background:var(--good)"></b>Đạt/vượt (≥100%)</span>
    <span><b style="background:var(--s1)"></b>Khá (80–99%)</span>
    <span><b style="background:var(--warn)"></b>Trung bình (60–79%)</span>
    <span><b style="background:var(--crit)"></b>Thấp (&lt;60%)</span>
   </div>
  </header>

  <div style="display:flex;flex-direction:column">
   ${kh.map(k=>{
     const t=thongKeKH(k);
     const pct=t.tbTy;
     // Thang đo tối đa 150% để biểu diễn các đơn vị vượt chỉ tiêu
     const barW=Math.min(100, Math.max(2, Math.round(pct / 150 * 100)));
     const targetPos=Math.round(100 / 150 * 100); // 66.7%
     const barCol=pct>=100?'var(--good)':pct>=80?'var(--s1)':pct>=60?'var(--warn)':'var(--crit)';
     return `
     <div class="chart-row">
      <div class="chart-info">
       <a href="#khct" data-go="khct" data-kh="${k.id}" style="text-decoration:none">
        <b${tip(k.ten)}><b>${esc(k.ma)}</b> · ${esc(k.ten)}</b>
       </a>
       <span>${critOf(k.crit).ten} · Chỉ tiêu: ${k.chiTieu}${k.donVi==='%'?'% sĩ số':' lượt'}</span>
      </div>
      <div>
       <div class="track-target" ${tip('Trung bình đạt '+pct+'% chỉ tiêu · '+t.nop+'/'+DB.cd.length+' chi đoàn nộp')}>
        <div class="bar-fill" style="width:${barW}%;background:${barCol}"></div>
        <div class="target-line" style="left:${targetPos}%" title="Mốc 100% chỉ tiêu"></div>
       </div>
       <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:3px">
        <span>${t.nop}/${DB.cd.length} CĐ nộp · ${t.dat} CĐ đạt chỉ tiêu</span>
        <span>${t.luot} lượt SV tham gia</span>
       </div>
      </div>
      <div class="chart-val" style="color:${barCol}">${pct}%</div>
     </div>`;
   }).join('')}
  </div>
 </div>`:''}

 ${mode==='cd'?`
 <!-- GÓC NHÌN 2: BIỂU ĐỒ THANH THEO TỪNG CHI ĐOÀN -->
 <div class="chart-card">
  <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">
   <div class="row">
    <label class="t2" for="selCdMatran" style="font-weight:600">Chọn chi đoàn xem tiến độ:</label>
    <select id="selCdMatran" onchange="state.matranCdId=+this.value;render()">
     ${DB.cd.map(c=>`<option value="${c.id}"${c.id===curCdId?' selected':''}>${esc(c.ma)} — ${esc(c.ten)}</option>`).join('')}
    </select>
   </div>
   <div class="lgd" style="margin:0">
    <span><b style="background:var(--good)"></b>Đạt/vượt (≥100%)</span>
    <span><b style="background:var(--s1)"></b>Chưa đủ (60–99%)</span>
    <span><b style="background:var(--crit)"></b>Dưới 60% / Quá hạn</span>
   </div>
  </header>

  <div style="display:flex;flex-direction:column">
   ${kh.map(k=>{
     const r=thongKeKH(k).rows.find(x=>x.cd.id===curCd.id);
     const pct=r.ty;
     const ct=r.ct;
     const luot=r.b?r.b.soLuot:0;
     const barW=Math.min(100, Math.max(r.b?2:0, Math.round(pct / 150 * 100)));
     const targetPos=Math.round(100 / 150 * 100);
     const barCol=!r.b?(k.hanChot<TODAY?'var(--crit)':'var(--track)'):pct>=100?'var(--good)':pct>=60?'var(--s1)':'var(--crit)';
     return `
     <div class="chart-row">
      <div class="chart-info">
       <a href="#khct" data-go="khct" data-kh="${k.id}" style="text-decoration:none">
        <b${tip(k.ten)}><b>${esc(k.ma)}</b> · ${esc(k.ten)}</b>
       </a>
       <span>Chỉ tiêu: ${ct} lượt · ${r.b?('Đã nộp '+dmy(r.b.ngayNop)):(k.hanChot<TODAY?pill('Quá hạn','p-crit'):pill('Chưa nộp','p-mute'))}</span>
      </div>
      <div>
       <div class="track-target" ${tip(curCd.ten+': '+luot+'/'+ct+' lượt ('+pct+'% chỉ tiêu)')}>
        <div class="bar-fill" style="width:${barW}%;background:${barCol}"></div>
        <div class="target-line" style="left:${targetPos}%" title="Mốc 100% chỉ tiêu"></div>
       </div>
       <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:3px">
        <span>Thực hiện: <b>${r.b?luot:'0'}</b> / ${ct} lượt</span>
        <span>${r.b?pillST(r.b.status):''}</span>
       </div>
      </div>
      <div class="chart-val" style="color:${barCol}">${r.b?pct+'%':'–'}</div>
     </div>`;
   }).join('')}
  </div>
 </div>`:''}

 ${mode==='clean'?`
 <!-- GÓC NHÌN 3: BẢNG TỔNG HỢP NẰM NGANG RÕ RÀNG (KHÔNG XOAY CHỮ DỌC) -->
 <div class="chart-card">
  <div class="scroll">
   <table class="clean-matrix">
    <thead>
     <tr>
      <th style="min-width:110px">Chi đoàn</th>
      ${kh.map(k=>`<th ${tip(k.ma+' · '+k.ten+' (Chỉ tiêu '+k.chiTieu+(k.donVi==='%'?'%':' lượt')+')')}>
       <a href="#khct" data-go="khct" data-kh="${k.id}" style="color:inherit;text-decoration:none"><b>${esc(k.ma)}</b></a>
      </th>`).join('')}
      <th>Trung bình</th>
     </tr>
    </thead>
    <tbody>
     ${bangXH().map(c=>{
       const cells=kh.map(k=>{const r=thongKeKH(k).rows.find(x=>x.cd.id===c.id);return {k,ty:r.ty,b:r.b,ct:r.ct,luot:r.luot}});
       const tb=Math.round(cells.reduce((s,x)=>s+Math.min(150,x.ty),0)/cells.length);
       return `<tr>
        <td><b>${esc(c.ma)}</b></td>
        ${cells.map(x=>{
          const col=x.b?(x.ty>=100?'var(--good)':x.ty>=75?'var(--s1)':x.ty>=50?'var(--warn)':'var(--crit)'):'var(--muted)';
          const bg=x.b?(x.ty>=100?'color-mix(in srgb,var(--good) 15%,transparent)':x.ty>=75?'color-mix(in srgb,var(--s1) 15%,transparent)':x.ty>=50?'color-mix(in srgb,var(--warn) 18%,transparent)':'color-mix(in srgb,var(--crit) 15%,transparent)'):'var(--track)';
          return `<td>
           <span class="matrix-badge" style="background:${bg};color:${col}" ${tip(c.ten+' · '+x.k.ma+' '+x.k.ten+': '+(x.b?x.luot+'/'+x.ct+' lượt = '+x.ty+'% chỉ tiêu ('+ST[x.b.status][0]+')':'chưa nộp báo cáo'))}>
            ${x.b?x.ty+'%':'–'}
           </span>
          </td>`;
        }).join('')}
        <td><b style="color:${tb>=100?'var(--good)':'var(--s1)'};font-size:13px">${tb}%</b></td>
       </tr>`;
     }).join('')}
    </tbody>
   </table>
  </div>
  <div class="lgd" style="margin-top:12px">
   <span>% chỉ tiêu:</span>
   <span><b style="background:var(--good)"></b>≥100% (Đạt chỉ tiêu)</span>
   <span><b style="background:var(--s1)"></b>75–99%</span>
   <span><b style="background:var(--warn)"></b>50–74%</span>
   <span><b style="background:var(--crit)"></b>&lt;50% / Quá hạn</span>
  </div>
 </div>`:''}

 <div class="grid g11">
  <div class="card"><header><h3>Kế hoạch có tỷ lệ hoàn thành thấp nhất</h3></header>
   ${rankBars(kh.map(k=>({l:k.ma,v:thongKeKH(k).tbTy,tip:k.ten+': trung bình '+thongKeKH(k).tbTy+'% chỉ tiêu'})).sort((a,b)=>a.v-b.v).slice(0,6),{max:150,suffix:'%',color:'var(--serious)'})}
   <p class="t2" style="margin:10px 0 0">Các kế hoạch dưới 80% chỉ tiêu cần BCH LCĐ đôn đốc thêm các chi đoàn còn nợ.</p>
  </div>
  <div class="card"><header><h3>Chi đoàn huy động tích cực nhất</h3><p class="end">lượt tham gia trên mỗi sinh viên</p></header>
   ${rankBars(DB.cd.map(c=>({l:c.ma,v:huyDong(c.id),tip:c.ten+': '+kpi(c.id).luot+' lượt trên '+c.siSo+' sinh viên'})).sort((a,b)=>b.v-a.v),{suffix:' lượt/SV',color:'var(--s3)'})}
   <p class="t2" style="margin:10px 0 0">Tỷ lệ đoàn viên tham gia sôi nổi tính trung bình trên sĩ số từng chi đoàn.</p>
  </div>
 </div>`;
};

PAGES.duyet=function(){
 const f=state.df;
 const items=[
  ...DB.bc.map(b=>({t:'bc',id:b.id,khId:b.khId,st:b.status,ngay:b.ngayNop,cdId:b.cdId,
    ten:KH(b.khId).ma+' · '+KH(b.khId).ten,crit:KH(b.khId).crit,
    so:b.soLuot+'/'+chiTieuSo(KH(b.khId),CD(b.cdId))+' lượt',diem:diemKH(KH(b.khId),CD(b.cdId)).diem,mc:b.mc,treHan:b.treHan,nx:b.nx})),
  ...DB.hd.map(h=>({t:'hd',id:h.id,khId:0,st:h.status,ngay:h.ngay,cdId:h.cdId,ten:h.ten,crit:h.crit,
    so:h.sl?h.sl+' người tham gia':'–',diem:h.diem,mc:h.mc,nx:''}))
 ].filter(x=>f==='all'||x.st===f).sort((a,b)=>b.ngay.localeCompare(a.ngay));
 return `<div class="head"><div><h1>Duyệt hồ sơ</h1>
  <p class="sub">Điểm KPI chỉ được cộng sau khi Liên chi đoàn duyệt minh chứng hợp lệ. Mọi trạng thái và link đều có thể cập nhật.</p></div>
  <div class="end row">
   <button class="topbar-btn" onclick="moHuongDanMinhChung()" type="button">📋 Chuẩn duyệt minh chứng</button>
   <label class="t2" for="dfSel">Lọc trạng thái:</label>
   <select id="dfSel" onchange="go('duyet',{df:this.value})">${[['wait','Chờ duyệt'],['ok','Đã duyệt'],['no','Trả lại'],['all','Tất cả']].map(([v,t])=>`<option value="${v}"${f===v?' selected':''}>${t}</option>`).join('')}</select>
  </div></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Nội dung</th><th>Chi đoàn</th><th>Loại</th><th>Tiêu chí</th>
  <th class="n">Kết quả</th><th>Ngày</th><th class="n">Điểm</th><th>Trạng thái</th><th style="min-width:180px">Thao tác</th></tr></thead>
 <tbody>${items.map(x=>{
  const mcHtml = hienThiLink(x.mc, 'Mở link', {tieuDe:'Minh chứng: '+x.ten+' ('+CD(x.cdId).ma+')', url:x.mc, onSave:v=>{const it=(x.t==='bc'?DB.bc:DB.hd).find(i=>i.id===x.id);if(it){it.mc=v;if(typeof dataApi!=='undefined'){if(x.t==='bc'&&dataApi.luuBC)dataApi.luuBC(it);else if(dataApi.luuHD)dataApi.luuHD(it);}}}});
  const stSel = `
   <select class="st-sel" onchange="${x.t==='bc'?'doiTrangThaiBC':'doiTrangThaiHD'}(${x.id}, this.value)" title="Đổi trạng thái">
    <option value="ok" ${x.st==='ok'?'selected':''}>✓ Đã duyệt</option>
    <option value="wait" ${x.st==='wait'?'selected':''}>⏳ Chờ duyệt</option>
    <option value="no" ${x.st==='no'?'selected':''}>✕ Trả lại</option>
   </select>`;
  return `<tr>
  <td><b>${esc(x.ten)}</b>
   <div style="margin-top:3px">${mcHtml}</div>
   ${x.st==='no'&&x.nx?`<div class="t2" style="color:var(--crit);margin-top:4px">⚠️ Nhận xét: ${esc(x.nx)}</div>`:''}
  </td>
  <td><b>${esc(CD(x.cdId).ma)}</b></td>
  <td>${x.t==='bc'||x.t==='kh'?pill('LCĐ giao','p-xs'):pill('Tự tổ chức','p-mute')}</td>
  <td class="t2">${critOf(x.crit).ten}</td>
  <td class="n">${x.so}</td>
  <td class="t2">${dmy(x.ngay)}${x.treHan?' '+pill('trễ','p-ser'):''}</td>
  <td class="n">${x.diem}</td>
  <td>${stSel}</td>
  <td class="n" style="white-space:nowrap">
   <button class="b-s" onclick="${x.t==='bc'?`formBC(${x.khId},${x.cdId})`:`formHD(${x.id})`}">✏️ Sửa</button>
   ${x.st!=='ok'?`<button class="b-s b-ok" data-act="${x.t}-ok" data-id="${x.id}">Duyệt</button>`:''}
   ${x.st!=='no'?`<button class="b-s b-no" data-act="${x.t}-no" data-id="${x.id}">Trả lại</button>`:''}
   ${x.st!=='wait'?`<button class="b-s" data-act="${x.t}-wait" data-id="${x.id}">Chờ</button>`:''}
   ${x.t==='hd'?`<button class="b-s b-no" onclick="xoaHD(${x.id})">Xoá</button>`:''}
  </td></tr>`}).join('')||'<tr><td colspan="9" class="empty">Không có hồ sơ nào khớp bộ lọc.</td></tr>'}</tbody></table></div></div>`;
};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b)return;
 const [t,s]=b.dataset.act.split('-'),id=+b.dataset.id;
 const o=(t==='bc'||t==='kh')?DB.bc.find(x=>x.id===id):DB.hd.find(x=>x.id===id);
 if(s==='no'){
  const lyDo=prompt('Nhập lý do trả lại để chi đoàn sửa bổ sung:', o.nx || 'Minh chứng chưa đủ, đề nghị bổ sung ảnh hoạt động và danh sách ký tên.');
  if(lyDo===null) return; // người dùng bấm Cancel
  o.nx=lyDo.trim()||'Minh chứng chưa đạt yêu cầu, đề nghị bổ sung nộp lại.';
 }
 o.status=s==='ok'?'ok':(s==='no'?'no':'wait');
 save();render();
});

PAGES.sosanh=function(){
 const A=CD(state.a),B=CD(state.b),ka=kpi(A.id),kb=kpi(B.id);
 const METRIC={
  kpi:['Điểm KPI (thang 100)',c=>kpi(c.id).tong,'','var(--seq-4)'],
  luot:['Tổng lượt tham gia',c=>kpi(c.id).luot,'','var(--s1)'],
  huy:['Mức huy động (lượt trên mỗi sinh viên)',c=>huyDong(c.id),' lượt/SV','var(--s3)'],
  phi:['Tỷ lệ nộp đoàn phí',c=>tyLePhi(c.id),'%','var(--s5)'],
  kh:['Số kế hoạch LCĐ đã hoàn thành',c=>DB.kh.filter(k=>bcOf(k.id,c.id)&&bcOf(k.id,c.id).status==='ok').length,'','var(--s2)'],
  drl:['Điểm rèn luyện trung bình',c=>{const d=dvOf(c.id);return Math.round(d.reduce((s,x)=>s+x.drl,0)/Math.max(1,d.length))},'','var(--s4)'],
 };
 const m=METRIC[state.metric];
 const opts=o=>DB.cd.map(c=>`<option value="${c.id}"${o===c.id?' selected':''}>${esc(c.ma)}</option>`).join('');
 return `<div class="head"><div><h1>So sánh chi đoàn</h1>
  <p class="sub">Chọn chỉ số để xếp hạng toàn khoa, hoặc đặt hai chi đoàn cạnh nhau theo từng tiêu chí.</p></div></div>
 <div class="card"><header><h3>Xếp hạng theo chỉ số</h3>
  <div class="end row"><label class="t2" for="mSel">Chỉ số</label>
  <select id="mSel" onchange="go('sosanh',{metric:this.value})">${Object.entries(METRIC).map(([k,v])=>`<option value="${k}"${state.metric===k?' selected':''}>${v[0]}</option>`).join('')}</select></div></header>
  ${rankBars(DB.cd.map(c=>({l:c.ma,v:m[1](c),tip:c.ten+' — '+m[0]+': '+m[1](c)+m[2]})).sort((a,b)=>b.v-a.v),{suffix:m[2],color:m[3]})}
  <p class="t2" style="margin:12px 0 0">${esc(m[0])} · ${DB.cd.length} chi đoàn.</p></div>
 <div class="card"><header><h3>Đối chiếu hai chi đoàn theo 5 tiêu chí</h3>
  <div class="end row"><select onchange="go('sosanh',{a:+this.value})">${opts(A.id)}</select>
  <span class="t2">so với</span><select onchange="go('sosanh',{b:+this.value})">${opts(B.id)}</select></div></header>
  <div class="bars">${CRIT.map((cr,i)=>{
   const va=ka.chiTiet[i].diem,vb=kb.chiTiet[i].diem;
   return `<div style="margin-bottom:4px"><div class="t2" style="margin-bottom:4px">${cr.ten} <span class="end">tối đa ${cr.max}</span></div>
   <div class="barrow" style="grid-template-columns:minmax(72px,auto) 1fr minmax(38px,auto)"><span>${esc(A.ma)}</span>
    <span class="track"><i style="width:${va/cr.max*100}%;background:var(--s1)"${tip(A.ten+' · '+cr.ten+': '+va+'/'+cr.max)}></i></span><span class="v">${va}</span></div>
   <div class="barrow" style="grid-template-columns:minmax(72px,auto) 1fr minmax(38px,auto);margin-top:4px"><span>${esc(B.ma)}</span>
    <span class="track"><i style="width:${vb/cr.max*100}%;background:var(--s2)"${tip(B.ten+' · '+cr.ten+': '+vb+'/'+cr.max)}></i></span><span class="v">${vb}</span></div></div>`}).join('')}</div>
  <div class="lgd"><span><b style="background:var(--s1)"></b>${esc(A.ma)} — tổng ${ka.tong} điểm, ${ka.xl[1]}</span>
   <span><b style="background:var(--s2)"></b>${esc(B.ma)} — tổng ${kb.tong} điểm, ${kb.xl[1]}</span></div></div>
 <div class="grid g11">
  <div class="card"><header><h3>Lượt tham gia theo tháng</h3></header>
   ${lineChart([{n:A.ma,v:luotTheoThang(A.id),c:'var(--s1)'},{n:B.ma,v:luotTheoThang(B.id),c:'var(--s2)'}])}
   <div class="lgd"><span><b style="background:var(--s1)"></b>${esc(A.ma)}</span><span><b style="background:var(--s2)"></b>${esc(B.ma)}</span></div></div>
  <div class="card"><header><h3>Bảng số liệu đối chiếu</h3></header>
   <table><tbody>${Object.values(METRIC).map(v=>`<tr><td>${v[0]}</td>
    <td class="n"><b>${v[1](A)}${v[2]}</b></td><td class="n"><b>${v[1](B)}${v[2]}</b></td></tr>`).join('')}
    <tr><td>Sĩ số</td><td class="n">${A.siSo}</td><td class="n">${B.siSo}</td></tr></tbody></table></div>
 </div>`;
};

PAGES.nhansu=()=>state.role==='lcd'?lcdNhanSu():cdNhanSu();
function lcdNhanSu(){
 const q=state.q.toLowerCase(),cf=state.cf;
 const list=DB.dv.filter(d=>(cf==='all'||d.cdId===+cf)&&(!q||d.ten.toLowerCase().includes(q)||d.mssv.includes(q)));
 return `<div class="head"><div><h1>Nhân sự toàn khoa</h1><p class="sub">${list.length} đoàn viên · dữ liệu do BCH chi đoàn cập nhật</p></div>
 <div class="end row"><input id="qIn" placeholder="Tìm họ tên hoặc MSSV" value="${esc(state.q)}" oninput="state.q=this.value;render();document.getElementById('qIn').focus()" style="width:190px">
 <select onchange="go('nhansu',{cf:this.value})"><option value="all">Tất cả chi đoàn</option>${DB.cd.map(c=>`<option value="${c.id}"${cf==c.id?' selected':''}>${esc(c.ma)}</option>`).join('')}</select></div></div>
 <div class="grid g4">
  ${tile('Tổng đoàn viên',DB.dv.length,DB.cd.reduce((s,c)=>s+c.siSo,0)+' sinh viên toàn khoa')}
  ${tile('Cán bộ Đoàn',DB.dv.filter(d=>d.cv!=='Đoàn viên').length,'BCH các chi đoàn')}
  ${tile('Đã nộp đoàn phí',Math.round(DB.dv.filter(d=>d.doanPhi).length/DB.dv.length*100)+'%',DB.dv.filter(d=>!d.doanPhi).length+' đoàn viên chưa nộp')}
  ${tile('Cảm tình Đảng',DB.dv.filter(d=>d.ghiChu.includes('Cảm tình')).length,'Nguồn giới thiệu phát triển Đảng')}
 </div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Họ và tên</th><th>MSSV</th><th>Chi đoàn</th><th>Chức vụ</th>
  <th class="n">ĐRL</th><th>Xếp loại ĐV</th><th class="n">Số HĐ</th><th>Đoàn phí</th><th>Ghi chú</th></tr></thead>
 <tbody>${list.map(d=>`<tr><td><b>${esc(d.ten)}</b></td><td class="n">${esc(d.mssv)}</td><td>${esc(CD(d.cdId).ma)}</td>
  <td>${esc(d.cv)}</td><td class="n">${d.drl}</td><td>${pillXL(xepLoai(d.drl))}</td><td class="n">${d.soHD}</td>
  <td>${d.doanPhi?pill('Đã nộp','p-good'):pill('Chưa nộp','p-crit')}</td><td class="t2">${esc(d.ghiChu)}</td></tr>`).join('')
  ||'<tr><td colspan="9" class="empty">Không tìm thấy đoàn viên phù hợp.</td></tr>'}</tbody></table></div></div>`;
}

PAGES.tongket=function(){
 const xh=bangXH(),dem=l=>xh.filter(c=>c.xl[1]===l).length;
 const uuTu=DB.dv.filter(d=>d.drl>=90&&d.soHD>=5).sort((a,b)=>b.drl-a.drl);
 return `<div class="head"><img src="assets/logo.webp" alt="" style="width:54px;height:54px;border-radius:10px;background:#fff;padding:2px;object-fit:contain;border:1px solid var(--line)">
 <div><h1>Tổng kết nhiệm kỳ 2025 – 2027</h1>
  <p class="sub">Bảng căn cứ xét khen thưởng chi đoàn và đoàn viên xuất sắc.</p></div></div>
 <div class="note">Điểm KPI = tổng điểm 5 tiêu chí (mỗi tiêu chí tối đa 20) trừ điểm trừ của Liên chi đoàn.
  Điểm mỗi tiêu chí đến từ hai nguồn đã được duyệt: kế hoạch LCĐ giao (quy đổi theo tỷ lệ hoàn thành chỉ tiêu, trễ hạn còn ${TRE_PHAT*100}%) và hoạt động chi đoàn tự tổ chức.
  Xếp loại: Xuất sắc ≥ 90 · Tốt ≥ 80 · Khá ≥ 65 · Trung bình ≥ 50 · Yếu &lt; 50.</div>
 <div class="grid g4">${[['Xuất sắc','p-xs'],['Tốt','p-good'],['Khá','p-warn'],['Trung bình / Yếu','p-ser']].map((x,i)=>
  tile(x[0],i===3?dem('Trung bình')+dem('Yếu'):dem(x[0]),'chi đoàn')).join('')}</div>
 <div class="card"><header><h3>Bảng tổng hợp KPI</h3><p class="end">Số liệu chốt đến ${dmy(TODAY)}</p></header>
  <div class="scroll"><table><thead><tr><th>#</th><th>Chi đoàn</th>
  ${CRIT.map(c=>`<th class="n"${tip(c.ten+' — tối đa '+c.max+' điểm')}>${c.ten.split(' – ')[0]}</th>`).join('')}
  <th class="n">Trừ</th><th class="n">Tổng</th><th>Xếp loại</th><th class="n">Lượt TG</th><th class="n">Đoàn phí</th></tr></thead>
  <tbody>${xh.map((c,i)=>`<tr><td><span class="rk r${i+1}">${i+1}</span></td><td><b>${esc(c.ma)}</b><div class="t2">${esc(c.nganh)}</div></td>
  ${c.chiTiet.map(x=>`<td class="n">${x.diem}</td>`).join('')}
  <td class="n">${c.diemTru?'−'+c.diemTru:'–'}</td><td class="n"><b>${c.tong}</b></td><td>${pillXL(c.xl)}</td>
  <td class="n">${c.luot}</td><td class="n">${tyLePhi(c.id)}%</td></tr>`).join('')}</tbody></table></div>
  ${lgdCRIT()}</div>
 <div class="card" style="margin-top:14px"><header><h3>Đề xuất đoàn viên xuất sắc</h3><p class="end">ĐRL từ 90 và tham gia từ 5 hoạt động</p></header>
  <div class="scroll"><table><thead><tr><th>Họ và tên</th><th>Chi đoàn</th><th>Chức vụ</th><th class="n">ĐRL</th><th class="n">Số HĐ</th><th>Ghi chú</th></tr></thead>
  <tbody>${uuTu.map(d=>`<tr><td><b>${esc(d.ten)}</b></td><td>${esc(CD(d.cdId).ma)}</td><td>${esc(d.cv)}</td>
   <td class="n">${d.drl}</td><td class="n">${d.soHD}</td><td class="t2">${esc(d.ghiChu)}</td></tr>`).join('')
   ||'<tr><td colspan="6" class="empty">Chưa có đề xuất.</td></tr>'}</tbody></table></div></div>`;
};

/* ===================== TRANG — CHI ĐOÀN ===================== */
const me=()=>CD(state.cdId);
function cdTongQuan(){
 const c=me(),k=kpi(c.id),xh=bangXH(),hang=xh.findIndex(x=>x.id===c.id)+1;
 const tbKhoa=CRIT.map((cr,i)=>Math.round(xh.reduce((s,x)=>s+x.chiTiet[i].diem,0)/xh.length*10)/10);
 const dv=dvOf(c.id);

 // 1. Cần sửa (hồ sơ bị trả lại)
 const canSua=DB.bc.filter(b=>b.cdId===c.id&&b.status==='no').map(b=>({
  t:'bc',id:b.id,khId:b.khId,loai:'crit',tag:'🔴 Cần sửa',
  ten:KH(b.khId).ma+' · '+KH(b.khId).ten,
  sub:`Nộp ngày ${dmy(b.ngayNop)} · Chỉ tiêu: ${chiTieuSo(KH(b.khId),c)} lượt`,
  note:b.nx||'Minh chứng chưa đạt yêu cầu, đề nghị bổ sung ảnh hoặc danh sách sinh viên.',
  action:`formBC(${b.khId})`,
  btn:'Sửa & nộp lại ngay'
 }));

 // 2. Sắp hết hạn / Quá hạn chưa nộp
 const giao=DB.kh.filter(k2=>k2.chiTieu&&k2.batDau<=TODAY);
 const sapHetVaQua=[];
 giao.forEach(k2=>{
  const b=bcOf(k2.id,c.id);
  if(!b){
   const tre=k2.hanChot<TODAY;
   const sapHet=!tre && k2.hanChot<=dayAdd(TODAY,7);
   if(tre || sapHet || k2.batBuoc){
    sapHetVaQua.push({
     t:'kh',id:k2.id,khId:k2.id,
     loai:tre?'crit':(sapHet?'warn':'info'),
     tag:tre?'⏰ Quá hạn':(sapHet?`⚠️ Hạn ${dmy(k2.hanChot)}`:'📋 Chưa nộp'),
     ten:k2.ma+' · '+k2.ten,
     sub:`Hạn chót: ${dmy(k2.hanChot)} · Chỉ tiêu: ${chiTieuSo(k2,c)} lượt (${k2.batBuoc?'Bắt buộc':'Tự nguyện'})`,
     note:tre?'Đã quá hạn chót quy định! Nộp muộn sẽ chỉ được tối đa 80% điểm KPI.':(sapHet?'Chỉ còn ít ngày trước khi chốt hạn nộp báo cáo.':''),
     action:`formBC(${k2.id})`,
     btn:tre?'Nộp bù ngay':'Nộp báo cáo'
    });
   }
  }
 });

 // 3. Hồ sơ chờ duyệt
 const choBc=DB.bc.filter(b=>b.cdId===c.id&&b.status==='wait').map(b=>({
  t:'bc',id:b.id,khId:b.khId,loai:'pending',tag:'⏳ Chờ duyệt',
  ten:KH(b.khId).ma+' · '+KH(b.khId).ten,
  sub:`Đã gửi ${b.soLuot} lượt · Nộp ngày ${dmy(b.ngayNop)}`,
  note:'Đang trong hàng đợi thẩm định minh chứng của Ban Chấp hành LCĐ.',
  action:`go('nhiemvu')`,
  btn:'Xem chi tiết'
 }));
 const choHd=DB.hd.filter(h=>h.cdId===c.id&&h.status==='wait').map(h=>({
  t:'hd',id:h.id,loai:'pending',tag:'⏳ Chờ duyệt',
  ten:h.ten+' (Tự tổ chức)',
  sub:`Đề xuất ${h.diem} điểm · Ngày gửi ${dmy(h.ngay)}`,
  note:'Đang chờ Ban Chấp hành LCĐ phê duyệt.',
  action:`go('tuchuc')`,
  btn:'Xem hoạt động'
 }));
 const choDuyet=[...choBc,...choHd];

 // Tổng hợp việc cần làm
 const allTodos=[...canSua,...sapHetVaQua,...choDuyet];
 const tab=state.cdTab||'all';
 const filteredTodos = tab==='sua'?canSua : (tab==='han'?sapHetVaQua : (tab==='cho'?choDuyet : allTodos));

 return `<div class="head"><div><h1>${esc(c.ten)}</h1>
  <p class="sub">${esc(c.nganh)} · ${c.siSo} sinh viên · Bí thư ${esc(c.bt)} · ${esc(c.sdt)}${(()=>{const u=DB.ns.find(x=>x.theoDoi.includes(c.id));return u?' · uỷ viên BCH LCĐ theo dõi: <b>'+esc(u.ten)+'</b> ('+esc(u.sdt)+')':''})()}</p></div>
  <div class="end row">
   <button class="b-s" onclick="formCD(${c.id})">✏️ Sửa thông tin lớp</button>
   <button class="b-p" data-go="nhiemvu">+ Nộp báo cáo</button>
   <button data-go="tuchuc">+ Gửi việc tự tổ chức</button>
  </div></div>

 ${canSua.length?`
 <div class="alert-banner b-crit">
  <span class="alert-banner-icon">🚨</span>
  <div class="alert-banner-text">
   <b>Chi đoàn có ${canSua.length} hồ sơ bị trả lại do minh chứng chưa đạt yêu cầu!</b>
   <span>Vui lòng kiểm tra nhận xét của LCĐ và cập nhật lại minh chứng để kịp tính điểm KPI.</span>
  </div>
  <div class="alert-banner-act">
   <button class="b-p b-no" onclick="state.cdTab='sua';render()">Sửa ngay ↓</button>
  </div>
 </div>`: (sapHetVaQua.filter(x=>x.loai==='crit'||x.loai==='warn').length?`
 <div class="alert-banner b-warn">
  <span class="alert-banner-icon">⏰</span>
  <div class="alert-banner-text">
   <b>Chi đoàn có ${sapHetVaQua.filter(x=>x.loai==='crit'||x.loai==='warn').length} kế hoạch sắp hết hạn hoặc đã quá hạn chưa nộp báo cáo!</b>
   <span>Hãy khẩn trương tập hợp danh sách và link minh chứng để nộp đúng hạn.</span>
  </div>
  <div class="alert-banner-act">
   <button class="b-p" onclick="state.cdTab='han';render()">Xem việc gấp ↓</button>
  </div>
 </div>`:'')}

 <!-- KHỐI VIỆC CẦN LÀM CỦA CHI ĐOÀN ĐẨY LÊN ĐẦU -->
 <div class="todo-hero">
  <div class="todo-hdr">
   <div class="todo-title">
    <h2>🎯 Việc cần làm của chi đoàn</h2>
    <span class="t2">· Ưu tiên xử lý: Cần sửa → Sắp hết hạn → Chờ duyệt</span>
   </div>
   <div class="todo-tabs">
    <button type="button" class="todo-tab ${tab==='all'?'active':''}" onclick="state.cdTab='all';render()">
     Tất cả <span class="cnt">${allTodos.length}</span>
    </button>
    <button type="button" class="todo-tab ${tab==='sua'?'active':''}" onclick="state.cdTab='sua';render()">
     🔴 Cần sửa <span class="cnt">${canSua.length}</span>
    </button>
    <button type="button" class="todo-tab ${tab==='han'?'active':''}" onclick="state.cdTab='han';render()">
     ⏰ Sắp hết hạn / Quá hạn <span class="cnt">${sapHetVaQua.length}</span>
    </button>
    <button type="button" class="todo-tab ${tab==='cho'?'active':''}" onclick="state.cdTab='cho';render()">
     ⏳ Chờ LCĐ duyệt <span class="cnt">${choDuyet.length}</span>
    </button>
   </div>
  </div>

  ${filteredTodos.length?`
   <div class="todo-grid">
    ${filteredTodos.map(item=>`
     <div class="todo-item ${item.loai==='crit'?'p-urgent':item.loai==='warn'?'p-near':'p-pending'}">
      <div>
       <div class="todo-item-top">
        <span class="todo-item-title">${esc(item.ten)}</span>
        ${pill(item.tag, item.loai==='crit'?'p-crit':item.loai==='warn'?'p-warn':'p-xs')}
       </div>
       <div class="todo-item-sub">${esc(item.sub)}</div>
       ${item.note?`<div class="todo-item-note">${esc(item.note)}</div>`:''}
      </div>
      <div class="todo-item-bottom">
       <button type="button" class="b-s" onclick="moHuongDanMinhChung()">📋 Tiêu chuẩn minh chứng</button>
       <button type="button" class="b-p ${item.loai==='crit'?'b-no':''}" onclick="${item.action}">${item.btn}</button>
      </div>
     </div>`).join('')}
   </div>`: `
   <div class="empty">
    🎉 Hoan hô! Không có công việc nào trong danh mục này. Mọi việc đã được xử lý chu đáo.
   </div>`}
 </div>

 <!-- CÁC CHỈ SỐ KPI TÓM TẮT -->
 <div class="grid g4">
  ${tile('Điểm KPI',k.tong+'<span style="font-size:15px;color:var(--muted)">/100</span>',pillXL(k.xl))}
  ${tile('Xếp hạng',hang+'<span style="font-size:15px;color:var(--muted)">/'+xh.length+'</span>','Toàn khoa ('+xh[0].tong+'đ dẫn đầu)')}
  ${tile('Lượt tham gia',k.luot,'Trung bình '+huyDong(c.id)+' lượt/sinh viên')}
  ${tile('Hồ sơ đang nộp',choDuyet.length+canSua.length,canSua.length?canSua.length+' hồ sơ cần sửa':'Đang chờ LCĐ duyệt')}
 </div>

 <!-- BIỂU ĐỒ VÀ TIẾN ĐỘ CHI TIẾT -->
 <div class="grid g2">
  <div class="card"><header><h3>Tiến độ 5 tiêu chí so với trung bình khoa</h3></header>
   <div class="bars">${k.chiTiet.map((x,i)=>`<div style="margin-bottom:6px">
    <div class="t2" style="margin-bottom:4px">${x.ten}</div>
    <div class="barrow" style="grid-template-columns:minmax(64px,auto) 1fr minmax(44px,auto)"><span>Chi đoàn</span>
     <span class="track"><i style="width:${x.diem/x.max*100}%;background:${x.c}"${tip(x.ten+': '+x.diem+'/'+x.max+' điểm')}></i></span><span class="v">${x.diem}</span></div>
    <div class="barrow" style="grid-template-columns:minmax(64px,auto) 1fr minmax(44px,auto);margin-top:3px"><span class="t2">TB khoa</span>
     <span class="track" style="height:9px"><i style="width:${tbKhoa[i]/x.max*100}%;background:var(--axis)"${tip('Trung bình toàn khoa: '+tbKhoa[i]+'/'+x.max)}></i></span><span class="v t2">${tbKhoa[i]}</span></div>
   </div>`).join('')}</div>
   <div class="row" style="margin-top:8px">
    <button class="b-p" data-go="nhiemvu">Xem chi tiết hoạt động LCĐ giao</button>
    <button data-go="tuchuc">Gửi hoạt động tự tổ chức</button>
   </div>
  </div>
  <div class="card"><header><h3>Lượt tham gia theo tháng</h3><p class="end">${esc(c.ma)} so với trung bình một chi đoàn</p></header>
   ${lineChart([{n:c.ma,v:luotTheoThang(c.id),c:'var(--s1)'},{n:'TB chi đoàn',v:luotTheoThang().map(v=>Math.round(v/DB.cd.length)),c:'var(--s2)'}])}
   <div class="lgd"><span><b style="background:var(--s1)"></b>${esc(c.ma)}</span><span><b style="background:var(--s2)"></b>Trung bình một chi đoàn</span></div>
  </div>
 </div>`;
}

PAGES.nhiemvu=function(){
 const c=me();
 const rows=DB.kh.filter(k=>k.chiTieu).map(k=>({k,b:bcOf(k.id,c.id),ct:chiTieuSo(k,c),d:diemKH(k,c)}));
 rows.sort((a,b)=>soSanhKH(a.k,b.k,'near'));
 const xong=rows.filter(r=>r.b&&r.b.status==='ok').length;
 return `<div class="head"><div><h1>Hoạt động Liên chi đoàn giao</h1>
  <p class="sub">${esc(c.ten)} · ${xong}/${rows.length} đầu việc được giao đã được duyệt</p></div></div>
 <div class="grid g4">
  ${tile('Đầu việc được giao',rows.length,rows.filter(r=>r.k.batBuoc).length+' việc bắt buộc')}
  ${tile('Đã hoàn thành',xong,'Báo cáo đã được duyệt')}
  ${tile('Đang chờ duyệt',rows.filter(r=>r.b&&r.b.status==='wait').length,'Liên chi đoàn đang xử lý')}
  ${tile('Điểm đã tích luỹ',rows.reduce((s,r)=>s+r.d.diem,0).toFixed(1),'Từ các kế hoạch LCĐ')}
 </div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Mã</th><th>Kế hoạch</th><th>Tiêu chí</th><th>Hạn chót</th>
  <th class="n">Chỉ tiêu</th><th class="n">Đã làm</th><th style="min-width:120px">Tiến độ</th><th class="n">Điểm</th><th>Minh chứng</th><th>Trạng thái</th><th style="min-width:130px">Thao tác</th></tr></thead>
 <tbody>${rows.map(({k,b,ct,d})=>{
  const ty=b?Math.round(b.soLuot/ct*100):0;
  const muon=!b&&k.hanChot<TODAY&&k.batDau<=TODAY;
  const mcHtml=b?hienThiLink(b.mc,'Mở link',{tieuDe:'Minh chứng: '+k.ma,url:b.mc,onSave:v=>{b.mc=v;if(typeof dataApi!=='undefined'&&dataApi.luuBC)dataApi.luuBC(b);}}):'<span class="t2">–</span>';
  return `<tr><td><b>${esc(k.ma)}</b>${k.batBuoc?' '+pill('BB','p-xs'):''}</td>
  <td>${esc(k.ten)}${b&&b.status==='no'?`<div class="t2" style="color:var(--crit)">Nhận xét: ${esc(b.nx)}</div>`:''}</td>
  <td class="t2">${critOf(k.crit).ten}</td>
  <td class="t2">${dmy(k.hanChot)}${b&&b.treHan?' '+pill('nộp trễ','p-ser'):''}</td>
  <td class="n">${ct}</td><td class="n">${b?b.soLuot:'–'}</td>
  <td><span class="track"><i style="width:${Math.min(100,ty)}%;background:${ty>=100?'var(--good)':'var(--seq-4)'}"${tip(ty+'% chỉ tiêu')}></i></span></td>
  <td class="n">${d.diem||'–'}</td>
  <td>${mcHtml}</td>
  <td>${b?pillST(b.status):(muon?pill('Quá hạn','p-crit'):(k.batDau>TODAY?pill('Sắp tới','p-mute'):pill('Chưa nộp','p-warn')))}</td>
  <td class="n" style="white-space:nowrap">
   ${k.batDau<=TODAY?`<button class="b-s ${!b?'b-p':b.status==='no'?'b-no':''}" onclick="formBC(${k.id})">${!b?'Nộp báo cáo':(b.status==='ok'?'Sửa / Bổ sung':'Sửa báo cáo')}</button>`:'<span class="t2">Chưa mở</span>'}
   ${b?`<button class="b-s" type="button" data-edit-link-id="${dangKySuaLink({tieuDe:'Minh chứng: '+k.ma,url:b.mc,onSave:v=>{b.mc=v;if(typeof dataApi!=='undefined'&&dataApi.luuBC)dataApi.luuBC(b);}})}" title="Sửa link">🔗 Sửa link</button>`:''}
  </td></tr>`}).join('')}
 </tbody></table></div></div>`;
};

PAGES.tuchuc=function(){
 const c=me(),hd=DB.hd.filter(h=>h.cdId===c.id).sort((a,b)=>b.ngay.localeCompare(a.ngay));
 return `<div class="head"><div><h1>Hoạt động chi đoàn tự tổ chức</h1>
  <p class="sub">Ngoài kế hoạch LCĐ giao, chi đoàn gửi thêm hoạt động của mình để được cộng điểm tiêu chí. Mọi hoạt động đều có thể sửa hoặc xoá.</p></div>
  <button class="b-p end" onclick="formHD()">+ Gửi hoạt động</button></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Hoạt động</th><th>Tiêu chí</th><th>Ngày</th>
  <th class="n">Tham gia</th><th class="n">Điểm</th><th>Minh chứng</th><th>Trạng thái</th><th style="min-width:110px">Thao tác</th></tr></thead>
 <tbody>${hd.map(h=>`<tr><td><b>${esc(h.ten)}</b></td>
  <td class="t2">${critOf(h.crit).ten}</td><td class="t2">${dmy(h.ngay)}</td><td class="n">${h.sl||'–'}</td>
  <td class="n">${h.diem}</td>
  <td>${hienThiLink(h.mc,'Mở link',{tieuDe:'Minh chứng: '+h.ten,url:h.mc,onSave:v=>{h.mc=v;if(typeof dataApi!=='undefined'&&dataApi.luuHD)dataApi.luuHD(h);}})}</td>
  <td>${pillST(h.status)}</td>
  <td class="n" style="white-space:nowrap">
   <button class="b-s" onclick="formHD(${h.id})">✏️ Sửa</button>
   <button class="b-s b-no" onclick="xoaHD(${h.id})">Xoá</button>
  </td></tr>`).join('')
  ||'<tr><td colspan="8" class="empty">Chưa gửi hoạt động nào.</td></tr>'}</tbody></table></div></div>`;
};

PAGES.kpi=function(){
 const c=me(),k=kpi(c.id);
 return `<div class="head"><div><h1>KPI chi tiết — ${esc(c.ma)}</h1>
  <p class="sub">Tổng ${k.tong}/100 điểm · ${k.xl[1]}${k.diemTru?' · đã trừ '+k.diemTru+' điểm':''}</p></div></div>
 ${k.chiTiet.map(x=>`<div class="card" style="margin-bottom:12px"><header><h3>${x.ten}</h3>
  <span class="end num" style="font-family:var(--fd);font-weight:600">${x.diem}<span style="color:var(--muted)">/${x.max}</span></span></header>
  <span class="track" style="display:block"><i style="width:${x.diem/x.max*100}%;background:${x.c}"></i></span>
  ${x.raw>x.max?`<p class="t2" style="margin:8px 0 0">Đã đạt trần tiêu chí (thực tế ${x.raw} điểm).</p>`:''}
  ${x.nguon.length?`<div class="scroll" style="margin-top:10px"><table><thead><tr><th>Nguồn điểm</th><th>Loại</th><th class="n">Điểm</th></tr></thead>
  <tbody>${x.nguon.map(n=>`<tr><td>${esc(n.ten)}${n.treHan?' '+pill('nộp trễ −20%','p-ser'):''}</td>
   <td>${n.loai==='kh'?pill('LCĐ giao · đạt '+Math.round(n.ty*100)+'% chỉ tiêu','p-xs'):pill('Tự tổ chức','p-mute')}</td>
   <td class="n">${n.diem}</td></tr>`).join('')}</tbody></table></div>`
  :'<p class="empty">Chưa có hoạt động nào được duyệt ở tiêu chí này.</p>'}</div>`).join('')}`;
};

function cdNhanSu(){
 const c=me(),dv=dvOf(c.id);
 return `<div class="head"><div><h1>Đoàn viên ${esc(c.ma)}</h1>
  <p class="sub">${dv.length} đoàn viên trong sổ · ${tyLePhi(c.id)}% đã nộp đoàn phí</p></div>
  <button class="b-p end" onclick="formDV()">+ Thêm đoàn viên</button></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Họ và tên</th><th>MSSV</th><th>Chức vụ</th><th class="n">ĐRL</th>
  <th>Xếp loại</th><th class="n">Số HĐ</th><th>Đoàn phí</th><th>Ghi chú</th><th></th></tr></thead>
 <tbody>${dv.map(d=>`<tr><td><b>${esc(d.ten)}</b></td><td class="n">${esc(d.mssv)}</td><td>${esc(d.cv)}</td>
  <td class="n">${d.drl}</td><td>${pillXL(xepLoai(d.drl))}</td><td class="n">${d.soHD}</td>
  <td><button class="b-s ${d.doanPhi?'b-ok':'b-no'}" onclick="togglePhi(${d.id})">${d.doanPhi?'Đã nộp':'Chưa nộp'}</button></td>
  <td class="t2">${esc(d.ghiChu)}</td>
  <td class="n"><button class="b-s" onclick="formDV(${d.id})">Sửa</button> <button class="b-s b-no" onclick="xoaDV(${d.id})">Xoá</button></td></tr>`).join('')
  ||'<tr><td colspan="9" class="empty">Chưa có đoàn viên nào.</td></tr>'}</tbody></table></div></div>`;
}
function togglePhi(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 const d=DB.dv.find(x=>x.id===id);
 if(!d) return;
 if(curUser && curUser.role === 'cd' && d.cdId !== curUser.cdId){
  alert('Không thể sửa đoàn phí của chi đoàn khác.');
  return;
 }
 d.doanPhi=!d.doanPhi;
 if(typeof dataApi !== 'undefined' && dataApi.luuDV) dataApi.luuDV(d).catch(e=>console.error(e));
 render();
}
function xoaDV(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 const d=DB.dv.find(x=>x.id===id);
 if(!d) return;
 if(curUser && curUser.role === 'cd' && d.cdId !== curUser.cdId){
  alert('Không thể xóa đoàn viên của chi đoàn khác.');
  return;
 }
 xacNhan('Xoá đoàn viên?',d.ten+' sẽ bị xoá khỏi sổ chi đoàn.', async ()=>{
  if(typeof dataApi !== 'undefined' && dataApi.xoaDV) await dataApi.xoaDV(id).catch(e=>console.error(e));
  else DB.dv=DB.dv.filter(x=>x.id!==id);
  render();
 });
}

/* ===================== HỘP THOẠI ===================== */
function xacNhan(tieuDe,noiDung,onOk){
 dlgBody.innerHTML=`<h2>${esc(tieuDe)}</h2><p class="sub">${esc(noiDung)}</p>
 <div class="row"><button type="button" id="huy">Huỷ</button><button type="button" class="b-p end b-no" id="okBtn">Xác nhận</button></div>`;
 dlg.showModal();
 dlgBody.querySelector('#huy').onclick=()=>dlg.close();
 dlgBody.querySelector('#okBtn').onclick=()=>{dlg.close();onOk()};
}
function formBC(khId, customCdId){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser){ alert('Chưa đăng nhập.'); return; }
 const isCd = curUser.role === 'cd';
 if(isCd && !auth.coQuyen('nop_bc')){ alert('Bạn không có quyền nộp báo cáo.'); return; }
 if(!isCd && !auth.coQuyen('duyet_bc')){ alert('Bạn không có quyền duyệt hoặc quản trị báo cáo.'); return; }

 const c = isCd ? CD(curUser.cdId) : (customCdId ? CD(customCdId) : me());
 const k = KH(khId);
 const b = bcOf(khId, c.id);
 if(isCd && b && b.status === 'ok'){
  alert('Báo cáo đã được LCĐ duyệt chính thức, không thể tự ý sửa.');
  return;
 }
 const ct = chiTieuSo(k, c);
 const isLcd = !isCd;
 dlgBody.innerHTML = `<h2>${b?'Cập nhật':'Nộp'} báo cáo — ${esc(k.ma)}</h2>
 <p class="sub">${esc(k.ten)} · Chi đoàn <b>${esc(c.ma)}</b> · chỉ tiêu <b>${ct}</b> lượt (${k.donVi==='%'?k.chiTieu+'% sĩ số '+c.siSo:'cố định'}) · hạn ${dmy(k.hanChot)}</p>

 ${b&&b.status==='no'?`
 <div class="todo-item-note" style="margin-bottom:12px;font-size:12.5px;padding:8px 10px">
  <b>⚠️ Nhận xét từ LCĐ (Cần sửa):</b> ${esc(b.nx||'Minh chứng chưa đạt yêu cầu, đề nghị bổ sung ảnh/danh sách.')}
 </div>`:''}

 <div class="mc-hint-box" style="margin-bottom:12px">
  <div><b>💡 Tiêu chuẩn minh chứng hợp lệ:</b> Link Drive công khai + Danh sách ký tên + Ảnh hoạt động</div>
  <button type="button" class="b-s" onclick="moHuongDanMinhChung()">Xem chi tiết</button>
 </div>

 <div class="f"><label for="b_so">Số lượt đoàn viên tham gia thực tế</label>
  <input id="b_so" type="number" min="0" value="${b?b.soLuot:''}" placeholder="VD: ${ct}">
 </div>

 <div class="f"><label for="b_mc">Link thư mục minh chứng (Google Drive / OneDrive / Ảnh)</label>
  <input id="b_mc" value="${b?esc(b.mc):''}" placeholder="https://drive.google.com/drive/folders/…">
  <div class="row" style="margin-top:4px">
   <button type="button" class="b-s" id="b_test_mc">🔗 Thử mở link</button>
   <span class="t2">Bắt buộc bật quyền chia sẻ: <i>"Bất kỳ ai có đường liên kết đều có thể xem"</i>.</span>
  </div>
 </div>

 ${isLcd ? `
 <div class="row" style="gap:10px">
  <div class="f" style="flex:1"><label for="b_st">Trạng thái duyệt của LCĐ</label>
   <select id="b_st">
    <option value="ok" ${b&&b.status==='ok'?'selected':''}>✓ Đã duyệt (hợp lệ)</option>
    <option value="wait" ${!b||b.status==='wait'?'selected':''}>⏳ Chờ duyệt</option>
    <option value="no" ${b&&b.status==='no'?'selected':''}>✕ Trả lại (chưa đạt)</option>
   </select>
  </div>
  <div class="f" style="flex:1.5"><label for="b_nx">Ghi chú / Nhận xét của LCĐ</label>
   <input id="b_nx" value="${b?esc(b.nx):''}" placeholder="Nhận xét nếu trả lại hoặc lưu ý">
  </div>
 </div>` : `
 <div class="note">Hồ sơ gửi đi ở trạng thái <b>Chờ duyệt</b>. Điểm quy đổi = ${k.diem} × tỷ lệ hoàn thành chỉ tiêu${k.hanChot<TODAY?', nộp sau hạn chót chỉ còn '+TRE_PHAT*100+'%':''}.</div>
 `}

 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  ${b ? `<button type="button" class="b-no" onclick="xoaBC(${b.id})">Xoá báo cáo</button>` : ''}
  <button type="button" class="b-p end" id="luu">${isLcd?'Lưu cập nhật':'Gửi duyệt'}</button>
 </div>`;

 dlg.showModal();
 huy.onclick = () => dlg.close();
 dlgBody.querySelector('#b_test_mc').onclick = () => {
  const v = dlgBody.querySelector('#b_mc').value.trim();
  if(!v) return alert('Vui lòng nhập link trước khi thử mở!');
  const clean = chuanHoaLink(v);
  if(!clean) return alert('Đường dẫn không hợp lệ hoặc giao thức nguy hiểm.');
  window.open(clean, '_blank', 'noopener');
 };
 luu.onclick = async () => {
  const so = +b_so.value;
  if(so === undefined || isNaN(so) || so < 0) return b_so.focus();
  const treHan = TODAY > k.hanChot;
  const st = isLcd ? (dlgBody.querySelector('#b_st') ? dlgBody.querySelector('#b_st').value : 'wait') : 'wait';
  const nx = isLcd && dlgBody.querySelector('#b_nx') ? dlgBody.querySelector('#b_nx').value.trim() : (b?b.nx:'');
  const mcVal = b_mc.value.trim() || '(chưa có)';
  if(mcVal !== '(chưa có)' && !isSafeUrl(mcVal)){
   alert('Đường dẫn minh chứng không an toàn.');
   return;
  }
  const reportObj = b ? Object.assign(b, {soLuot: so, mc: mcVal, ngayNop: b.ngayNop||TODAY, treHan, status: st, nx: st==='ok'?'':nx})
                      : {id: nextId(DB.bc), khId, cdId: c.id, soLuot: so, ngayNop: TODAY, treHan, mc: mcVal, status: st, nx};
  try {
   if(typeof dataApi !== 'undefined' && dataApi.luuBC){
    await dataApi.luuBC(reportObj);
   } else {
    if(!b) DB.bc.push(reportObj);
   }
   dlg.close(); render();
  } catch(err){
   alert('Lỗi lưu báo cáo: ' + err.message);
  }
 };
}

function xoaBC(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 const b = DB.bc.find(x => x.id === id);
 if(!b) return;
 if(curUser && curUser.role === 'cd'){
  if(b.cdId !== curUser.cdId || b.status === 'ok'){
   alert('Chi đoàn không thể xóa báo cáo đã duyệt hoặc của chi đoàn khác.');
   return;
  }
 }
 xacNhan('Xoá báo cáo này?', 'Số liệu và minh chứng đã nộp của chi đoàn sẽ bị xoá.', async ()=>{
  try {
   if(typeof dataApi !== 'undefined' && dataApi.xoaBC) await dataApi.xoaBC(id);
   else DB.bc = DB.bc.filter(x => x.id !== id);
   dlg.close(); render();
  } catch(err){
   alert('Lỗi xóa báo cáo: ' + err.message);
  }
 });
}
function formHD(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser){ alert('Chưa đăng nhập.'); return; }
 const isCd = curUser.role === 'cd';
 if(isCd && !auth.coQuyen('tuchuc_hd')){ alert('Bạn không có quyền đăng ký hoạt động tự tổ chức.'); return; }
 const h = id ? DB.hd.find(x => x.id === id) : {ten:'', crit:'ct', ngay:TODAY, sl:0, diem:4, mc:'', status:'wait'};
 if(isCd && id && (h.cdId !== curUser.cdId || h.status === 'ok')){
  alert('Không thể chỉnh sửa hoạt động của chi đoàn khác hoặc đã được duyệt.');
  return;
 }
 const isLcd = !isCd;
 dlgBody.innerHTML = `<h2>${id?'Sửa':'Gửi'} hoạt động tự tổ chức</h2>
 <p class="sub">Hoạt động do chi đoàn tự tổ chức để tích lũy điểm tiêu chí KPI</p>

 <div class="mc-hint-box" style="margin-bottom:12px">
  <div><b>💡 Tiêu chuẩn minh chứng:</b> Biên bản cuộc họp/kế hoạch + Danh sách đoàn viên + Ảnh sự kiện</div>
  <button type="button" class="b-s" onclick="moHuongDanMinhChung()">Xem chi tiết</button>
 </div>

 <div class="f"><label for="h_ten">Tên hoạt động</label><input id="h_ten" value="${esc(h.ten)}" placeholder="VD: Sinh hoạt chi đoàn chủ điểm tháng 10"></div>
 <div class="f"><label for="h_crit">Thuộc tiêu chí KPI</label><select id="h_crit">${CRIT.map(c=>`<option value="${c.id}"${c.id===h.crit?' selected':''}>${c.ten} (tối đa ${c.max}đ)</option>`).join('')}</select></div>
 <div class="row" style="gap:10px">
  <div class="f" style="flex:1"><label for="h_ngay">Ngày tổ chức</label><input id="h_ngay" type="date" value="${h.ngay}"></div>
  <div class="f" style="flex:1"><label for="h_sl">Số người tham gia</label><input id="h_sl" type="number" min="0" value="${h.sl}"></div>
  <div class="f" style="width:96px"><label for="h_diem">Điểm đề xuất</label><input id="h_diem" type="number" min="1" max="20" value="${h.diem}"></div>
 </div>
 <div class="f"><label for="h_mc">Link minh chứng (Google Drive / OneDrive / Ảnh)</label>
  <input id="h_mc" value="${esc(h.mc)}" placeholder="https://drive.google.com/…">
  <div class="row" style="margin-top:4px">
   <button type="button" class="b-s" id="h_test_mc">🔗 Thử mở link</button>
  </div>
 </div>
 ${isLcd ? `
 <div class="f"><label for="h_st">Trạng thái duyệt của LCĐ</label>
  <select id="h_st">
   <option value="ok" ${h.status==='ok'?'selected':''}>✓ Đã duyệt</option>
   <option value="wait" ${h.status==='wait'?'selected':''}>⏳ Chờ duyệt</option>
   <option value="no" ${h.status==='no'?'selected':''}>✕ Trả lại</option>
  </select>
 </div>` : ''}
 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  ${id ? `<button type="button" class="b-no" onclick="xoaHD(${id})">Xoá hoạt động</button>` : ''}
  <button type="button" class="b-p end" id="luu">${id?'Lưu':'Gửi duyệt'}</button>
 </div>`;

 dlg.showModal();
 huy.onclick = () => dlg.close();
 dlgBody.querySelector('#h_test_mc').onclick = () => {
  const v = dlgBody.querySelector('#h_mc').value.trim();
  if(!v) return alert('Vui lòng nhập link trước khi thử mở!');
  const clean = chuanHoaLink(v);
  if(!clean) return alert('Đường dẫn không hợp lệ hoặc chứa giao thức nguy hiểm.');
  window.open(clean, '_blank', 'noopener');
 };
 luu.onclick = async () => {
  if(!h_ten.value.trim()) return h_ten.focus();
  const st = isLcd && dlgBody.querySelector('#h_st') ? dlgBody.querySelector('#h_st').value : 'wait';
  const diemVal = isLcd ? (+h_diem.value||1) : (id ? h.diem : 0);
  const mcVal = h_mc.value.trim() || '(chưa có)';
  if(mcVal !== '(chưa có)' && !isSafeUrl(mcVal)){
   alert('Đường dẫn minh chứng không an toàn.');
   return;
  }
  const o = {
   ten: h_ten.value.trim(), crit: h_crit.value, ngay: h_ngay.value,
   sl: +h_sl.value||0, diem: diemVal,
   mc: mcVal, status: st
  };
  if(id) Object.assign(h, o);
  else Object.assign(h, o, {id: nextId(DB.hd), cdId: isCd ? curUser.cdId : state.cdId});
  try {
   if(typeof dataApi !== 'undefined' && dataApi.luuHD) await dataApi.luuHD(h);
   else if(!id) DB.hd.push(h);
   dlg.close(); render();
  } catch(err){
   alert('Lỗi lưu hoạt động: ' + err.message);
  }
 };
}

function xoaHD(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 const h = DB.hd.find(x => x.id === id);
 if(!h) return;
 if(curUser && curUser.role === 'cd' && (h.cdId !== curUser.cdId || h.status === 'ok')){
  alert('Không thể xóa hoạt động đã duyệt hoặc của chi đoàn khác.');
  return;
 }
 xacNhan('Xoá hoạt động tự tổ chức?', (h?h.ten:'Hoạt động này') + ' sẽ bị xoá vĩnh viễn.', async ()=>{
  try {
   if(typeof dataApi !== 'undefined' && dataApi.xoaHD) await dataApi.xoaHD(id);
   else DB.hd = DB.hd.filter(x => x.id !== id);
   dlg.close(); render();
  } catch(err){
   alert('Lỗi xóa hoạt động: ' + err.message);
  }
 });
}

function formDV(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser){ alert('Chưa đăng nhập.'); return; }
 const isCd = curUser.role === 'cd';
 if(isCd && !auth.coQuyen('ql_doanvien')){ alert('Bạn không có quyền quản lý đoàn viên.'); return; }
 const d=id?DB.dv.find(x=>x.id===id):{ten:'',mssv:'',cv:'Đoàn viên',drl:75,soHD:0,doanPhi:false,ghiChu:''};
 if(isCd && id && d.cdId !== curUser.cdId){
  alert('Không thể chỉnh sửa đoàn viên của chi đoàn khác.');
  return;
 }
 dlgBody.innerHTML=`<h2>${id?'Sửa':'Thêm'} đoàn viên</h2>
 <div class="f"><label for="d_ten">Họ và tên</label><input id="d_ten" value="${esc(d.ten)}"></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="d_mssv">MSSV</label><input id="d_mssv" value="${esc(d.mssv)}"></div>
 <div class="f" style="flex:1"><label for="d_cv">Chức vụ</label><select id="d_cv">${['Bí thư','Phó Bí thư','Uỷ viên BCH','Đoàn viên'].map(v=>`<option${v===d.cv?' selected':''}>${v}</option>`).join('')}</select></div></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="d_drl">Điểm rèn luyện</label><input id="d_drl" type="number" min="0" max="100" value="${d.drl}"></div>
 <div class="f" style="flex:1"><label for="d_hd">Số hoạt động tham gia</label><input id="d_hd" type="number" min="0" value="${d.soHD}"></div></div>
 <div class="f"><label for="d_gc">Ghi chú</label><input id="d_gc" value="${esc(d.ghiChu)}" placeholder="Cảm tình Đảng, đoàn viên ưu tú…"></div>
 <div class="f"><label class="row" style="font-weight:400"><input id="d_phi" type="checkbox" ${d.doanPhi?'checked':''}> Đã nộp đoàn phí học kỳ 1</label></div>
 <div class="row"><button type="button" id="huy">Huỷ</button><button type="button" class="b-p end" id="luu">Lưu</button></div>`;
 dlg.showModal();huy.onclick=()=>dlg.close();
 luu.onclick= async ()=>{
  if(!d_ten.value.trim())return d_ten.focus();
  const mssvVal = d_mssv.value.trim();
  const trung = DB.dv.find(x => x.mssv && x.mssv === mssvVal && x.id !== id);
  if(trung){
   alert('MSSV này đã tồn tại trong hệ thống (thuộc ' + (CD(trung.cdId) ? CD(trung.cdId).ma : 'chi đoàn khác') + ').');
   return;
  }
  const targetCdId = isCd ? curUser.cdId : state.cdId;
  const o={ten:d_ten.value.trim(),mssv:mssvVal,cv:d_cv.value,drl:+d_drl.value,soHD:+d_hd.value,
   doanPhi:d_phi.checked,ghiChu:d_gc.value.trim(), cdId: targetCdId};
  if(id) Object.assign(d, o);
  else Object.assign(d, o, {id: nextId(DB.dv)});
  try {
   if(typeof dataApi !== 'undefined' && dataApi.luuDV) await dataApi.luuDV(d);
   else if(!id) DB.dv.push(d);
   dlg.close(); render();
  } catch(err){
   alert('Lỗi lưu đoàn viên: ' + err.message);
  }
 };
}

document.addEventListener('click',e=>{if(e.target.id==='themKH')formKH()});
function formKH(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser || curUser.role === 'cd' || !auth.coQuyen('ql_kh')){
  alert('Chỉ Ban Chấp hành LCĐ mới có quyền quản lý đầu việc và giao chỉ tiêu.');
  return;
 }
 const k=id?KH(id):{ten:'',crit:'ct',ban:['Ban Phong trào'],ptIds:[],batDau:TODAY,hanChot:dayAdd(TODAY,21),
  hienThi:'',tienDo:'chua',diem:6,chiTieu:0,donVi:'n',batBuoc:false,ketQua:'',mc:'',note:''};
 dlgBody.innerHTML=`<h2>${id?'Sửa đầu việc':'Thêm đầu việc vào timeline'}</h2>
 <div class="f"><label for="k_ten">Tên hoạt động</label><input id="k_ten" value="${esc(k.ten)}"></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1.4"><label for="k_crit">Thuộc tiêu chí KPI</label>
  <select id="k_crit">${CRIT.map(c=>`<option value="${c.id}"${c.id===k.crit?' selected':''}>${c.ten}</option>`).join('')}</select></div>
 <div class="f" style="flex:1"><label for="k_td">Tiến độ</label>
  <select id="k_td">${Object.entries(TIENDO).map(([v,t])=>`<option value="${v}"${k.tienDo===v?' selected':''}>${t[0]}</option>`).join('')}</select></div></div>
 <div class="f"><label>Ban phụ trách</label><div class="row">${BAN.map(b=>`<label class="t2" style="display:flex;gap:5px;align-items:center">
  <input type="checkbox" class="k_ban" value="${esc(b)}" ${k.ban.includes(b)?'checked':''}>${esc(b)}</label>`).join('')}</div></div>
 <div class="f"><label for="k_pt">Người phụ trách</label><select id="k_pt" multiple size="4">
  ${DB.ns.map(u=>`<option value="${u.id}"${k.ptIds.includes(u.id)?' selected':''}>${esc(u.ten)} — ${esc(u.ban)}</option>`).join('')}</select>
  <span class="t2">Giữ Ctrl để chọn nhiều người.</span></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="k_bd">Bắt đầu</label><input id="k_bd" type="date" value="${k.batDau}"></div>
 <div class="f" style="flex:1"><label for="k_hc">Hạn chót</label><input id="k_hc" type="date" value="${k.hanChot}"></div>
 <div class="f" style="flex:1.2"><label for="k_ht">Thời gian hiển thị</label><input id="k_ht" value="${esc(k.hienThi)}" placeholder="VD: 04/09 – 05/10"></div></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="k_ct">Chỉ tiêu mỗi chi đoàn</label><input id="k_ct" type="number" min="0" value="${k.chiTieu}"></div>
 <div class="f" style="flex:1"><label for="k_dv">Đơn vị</label><select id="k_dv"><option value="n"${k.donVi==='n'?' selected':''}>lượt người</option><option value="%"${k.donVi==='%'?' selected':''}>% sĩ số</option></select></div>
 <div class="f" style="width:104px"><label for="k_d">Điểm KPI</label><input id="k_d" type="number" min="0" max="20" value="${k.diem}"></div></div>
 <div class="f"><label class="row" style="font-weight:400"><input id="k_bb" type="checkbox" ${k.batBuoc?'checked':''}> Bắt buộc với mọi chi đoàn</label>
  <span class="t2">Để chỉ tiêu bằng 0 nếu đây là việc nội bộ LCĐ, không chấm điểm chi đoàn.</span></div>
 <div class="row" style="gap:10px"><div class="f" style="flex:1"><label for="k_kq">Kết quả</label><input id="k_kq" value="${esc(k.ketQua)}" placeholder="VD: 128/170 sinh viên tham dự"></div>
 <div class="f" style="flex:1"><label for="k_mc">Minh chứng (Drive / Tài liệu)</label><input id="k_mc" value="${esc(k.mc)}"></div></div>
 <div class="row" style="margin-bottom:10px"><button type="button" class="b-s" id="k_test_mc">🔗 Thử mở link minh chứng</button></div>
 <div class="row"><button type="button" id="huy">Huỷ</button>
  ${id ? `<button type="button" class="b-no" onclick="xoaKH(${id})">Xoá đầu việc</button>` : ''}
  <button type="button" class="b-p end" id="luu">${id?'Lưu':'Ban hành'}</button></div>`;
 dlg.showModal();
 huy.onclick = () => dlg.close();
 dlgBody.querySelector('#k_test_mc').onclick = () => {
  const v = dlgBody.querySelector('#k_mc').value.trim();
  if(!v) return alert('Vui lòng nhập link trước khi thử mở!');
  window.open(chuanHoaLink(v), '_blank', 'noopener');
 };
 luu.onclick = () => {
  if(!k_ten.value.trim()) return k_ten.focus();
  const ptIds=[...k_pt.selectedOptions].map(o=>+o.value);
  const o={ten:k_ten.value.trim(),crit:k_crit.value,tienDo:k_td.value,
   ban:[...dlgBody.querySelectorAll('.k_ban:checked')].map(i=>i.value),ptIds,ptId:ptIds[0],
   batDau:k_bd.value,hanChot:k_hc.value,hienThi:k_ht.value.trim(),
   chiTieu:+k_ct.value,donVi:k_dv.value,diem:+k_d.value,batBuoc:k_bb.checked,
   ketQua:k_kq.value.trim(),mc:k_mc.value.trim()};
  if(!o.ban.length)o.ban=['Thường trực'];
  if(id){Object.assign(KH(id),o);save();dlg.close();render()}
  else{const nid=nextId(DB.kh);DB.kh.push({id:nid,ma:'KH-'+String(nid).padStart(2,'0'),note:'',lich:[],...o});
   save();dlg.close();go('khct',{khId:nid})}
 };
}

function xoaKH(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser || curUser.role === 'cd' || !auth.coQuyen('ql_kh')){
  alert('Chỉ Ban Chấp hành LCĐ mới có quyền xóa đầu việc.');
  return;
 }
 const k=KH(id);
 xacNhan('Xoá đầu việc '+k.ma+'?', (k?k.ten:'Đầu việc này')+' và toàn bộ báo cáo nộp của các chi đoàn cho việc này sẽ bị xoá.', async ()=>{
  if(typeof dataApi !== 'undefined' && dataApi.xoaKH) await dataApi.xoaKH(id).catch(e=>console.error(e));
  else {
   DB.kh = DB.kh.filter(x=>x.id!==id);
   DB.bc = DB.bc.filter(x=>x.khId!==id);
  }
  dlg.close(); go('hoatdong');
 });
}

function formCD(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser){ alert('Chưa đăng nhập.'); return; }
 const isCd = curUser.role === 'cd';
 if(isCd && !id){
  alert('Chi đoàn không có quyền tạo mới chi đoàn.');
  return;
 }
 if(!isCd && !auth.coQuyen('ql_csdl')){
  alert('Bạn không có quyền quản trị chi đoàn.');
  return;
 }
 const c = id ? CD(id) : {ma:'', ten:'', nganh:'', siSo:50, bt:'', sdt:'', diemTru:0};
 if(isCd && c.id !== curUser.cdId){
  alert('Không thể sửa thông tin của chi đoàn khác.');
  return;
 }
 dlgBody.innerHTML = `<h2>${id?'Sửa thông tin':'Thêm'} Chi đoàn</h2>
 <p class="sub">Thông tin chi đoàn trực thuộc Liên chi đoàn</p>
 <div class="row" style="gap:10px">
  <div class="f" style="flex:1"><label for="cd_ma">Mã chi đoàn (viết hoa)</label><input id="cd_ma" value="${esc(c.ma)}" placeholder="VD: MIS2024A" ${isCd?'disabled':''}></div>
  <div class="f" style="flex:1.5"><label for="cd_ten">Tên chi đoàn</label><input id="cd_ten" value="${esc(c.ten)}" placeholder="VD: Chi đoàn MIS2024A" ${isCd?'disabled':''}></div>
 </div>
 <div class="row" style="gap:10px">
  <div class="f" style="flex:1"><label for="cd_nganh">Ngành / Khóa</label><input id="cd_nganh" value="${esc(c.nganh)}" placeholder="VD: MIS · K2024" ${isCd?'disabled':''}></div>
  <div class="f" style="width:100px"><label for="cd_siso">Sĩ số SV</label><input id="cd_siso" type="number" min="1" value="${c.siSo||50}" ${isCd?'disabled':''}></div>
 </div>
 <div class="row" style="gap:10px">
  <div class="f" style="flex:1"><label for="cd_bt">Họ tên Bí thư chi đoàn</label><input id="cd_bt" value="${esc(c.bt)}" placeholder="Họ và tên"></div>
  <div class="f" style="flex:1"><label for="cd_sdt">Số điện thoại liên hệ</label><input id="cd_sdt" value="${esc(c.sdt)}" placeholder="09xxxxxxxx"></div>
 </div>
 <div class="f"><label for="cd_dt">Điểm trừ kỷ luật (nếu có)</label><input id="cd_dt" type="number" min="0" value="${c.diemTru||0}" ${isCd?'disabled':''}></div>
 <div class="row">
  <button type="button" id="huy">Huỷ</button>
  ${id&&!isCd?`<button type="button" class="b-no" onclick="xoaCD(${id})">Xoá chi đoàn</button>`:''}
  <button type="button" class="b-p end" id="luu">Lưu</button>
 </div>`;
 dlg.showModal();
 huy.onclick=()=>dlg.close();
 luu.onclick= async ()=>{
  if(!cd_ma.value.trim()) return cd_ma.focus();
  const ma = cd_ma.value.trim().toUpperCase();
  const ten = cd_ten.value.trim() || ('Chi đoàn ' + ma);
  const o = isCd ? {
   bt: cd_bt.value.trim() || '(chưa cập nhật)',
   sdt: cd_sdt.value.trim()
  } : {
   ma, ten, nganh: cd_nganh.value.trim(),
   siSo: Math.max(1, +cd_siso.value||1),
   bt: cd_bt.value.trim() || '(chưa cập nhật)',
   sdt: cd_sdt.value.trim(),
   diemTru: Math.max(0, +cd_dt.value||0)
  };
  if(id) {
   Object.assign(CD(id), o);
   if(typeof dataApi !== 'undefined' && dataApi.luuCD) await dataApi.luuCD(CD(id)).catch(e=>console.error(e));
  } else {
   const nid = nextId(DB.cd);
   const newCd = {id: nid, ...o};
   DB.cd.push(newCd);
   if(typeof dataApi !== 'undefined' && dataApi.luuCD) await dataApi.luuCD(newCd).catch(e=>console.error(e));
  }
  dlg.close(); render();
 };
}

function xoaCD(id){
 const curUser = typeof auth !== 'undefined' ? auth.currentUser : null;
 if(!curUser || curUser.role === 'cd' || !auth.coQuyen('ql_csdl')){
  alert('Chi đoàn không thể xóa chi đoàn khỏi hệ thống.');
  return;
 }
 const c = CD(id);
 xacNhan('Xoá chi đoàn '+c.ma+'?', 'Toàn bộ báo cáo, hoạt động và đoàn viên của chi đoàn này sẽ bị xoá.', async ()=>{
  if(typeof dataApi !== 'undefined' && dataApi.xoaCD) await dataApi.xoaCD(id).catch(e=>console.error(e));
  else {
   DB.cd = DB.cd.filter(x=>x.id!==id);
   DB.bc = DB.bc.filter(x=>x.cdId!==id);
   DB.hd = DB.hd.filter(x=>x.cdId!==id);
   DB.dv = DB.dv.filter(x=>x.cdId!==id);
   DB.ns.forEach(u=>{u.theoDoi = (u.theoDoi||[]).filter(i=>i!==id)});
  }
  if(state.cdId===id && DB.cd.length) state.cdId=DB.cd[0].id;
  dlg.close(); render();
 });
}
