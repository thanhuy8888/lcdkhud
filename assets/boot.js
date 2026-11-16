/* Tự kiểm tra công thức rồi khởi động ứng dụng. */
/* ===================== TỰ KIỂM TRA CÔNG THỨC ===================== */
(function selfCheck(){
 const bak=JSON.stringify(DB);
 DB={cd:[{id:9,ma:'TEST',ten:'TEST',nganh:'',siSo:50,bt:'',sdt:'',diemTru:3}],
  ns:[{id:1,ten:'A',vaiTro:'UV BCH',ban:'Thường trực',lop:'',sdt:'',mssv:'',fb:'',bch:1,theoDoi:[9]}],
  hop:[{id:1,ten:'h1',ngay:'2026-01-05',noiDung:'',bienBan:''},{id:2,ten:'h2',ngay:'2026-01-12',noiDung:'',bienBan:''}],
  dd:[{hopId:1,nsId:1,co:true,muon:false},{hopId:2,nsId:1,co:false,muon:false}],
  kh:[{id:1,ma:'K1',ten:'k1',crit:'ct',ban:['Thường trực'],ptIds:[1],ptId:1,batDau:'2026-01-01',hanChot:'2026-02-01',tienDo:'xong',diem:10,chiTieu:20,donVi:'n',batBuoc:true,ketQua:'',mc:'',note:''},
      {id:2,ma:'K2',ten:'k2',crit:'ct',ban:['Thường trực'],ptIds:[1],ptId:1,batDau:'2026-01-01',hanChot:'2026-02-01',tienDo:'xong',diem:10,chiTieu:50,donVi:'%',batBuoc:true,ketQua:'',mc:'',note:''},
      {id:3,ma:'K3',ten:'k3',crit:'tn',ban:['Thường trực'],ptIds:[1],ptId:1,batDau:'2026-01-01',hanChot:'2026-02-01',tienDo:'dang',diem:10,chiTieu:10,donVi:'n',batBuoc:true,ketQua:'',mc:'',note:''},
      {id:4,ma:'K4',ten:'noi bo',crit:'hc',ban:['Thường trực'],ptIds:[1],ptId:1,batDau:'2026-01-01',hanChot:'2026-02-01',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:false,ketQua:'',mc:'',note:''}],
  bc:[{id:1,khId:1,cdId:9,soLuot:30,ngayNop:'2026-01-20',treHan:false,mc:'',status:'ok'},
      {id:2,khId:2,cdId:9,soLuot:25,ngayNop:'2026-02-05',treHan:true,mc:'',status:'ok'},
      {id:3,khId:3,cdId:9,soLuot:10,ngayNop:'2026-01-20',treHan:false,mc:'',status:'wait'}],
  hd:[{id:1,cdId:9,crit:'ct',ten:'h',ngay:'2026-01-05',sl:10,diem:5,status:'ok'}],dv:[]};
 const k=kpi(9);
 // KPI chi đoàn
 console.assert(chiTieuSo(DB.kh[1],DB.cd[0])===25,'chỉ tiêu % sĩ số sai');
 console.assert(diemKH(DB.kh[0],DB.cd[0]).diem===10,'không chặn trần theo chỉ tiêu');
 console.assert(diemKH(DB.kh[1],DB.cd[0]).diem===8,'phạt trễ hạn sai');
 console.assert(diemKH(DB.kh[2],DB.cd[0]).diem===0,'hồ sơ chờ duyệt vẫn được tính điểm');
 console.assert(diemKH(DB.kh[3],DB.cd[0]).diem===0,'việc nội bộ không được chấm điểm chi đoàn');
 console.assert(k.chiTiet[0].diem===20&&k.chiTiet[0].raw===23,'trần 20đ mỗi tiêu chí sai');
 console.assert(k.tong===17,'tổng điểm / điểm trừ sai: '+k.tong);
 console.assert(xepLoai(90)[1]==='Xuất sắc'&&xepLoai(89)[1]==='Tốt'&&xepLoai(49)[1]==='Yếu','ngưỡng xếp loại sai');
 // chuyên cần + đánh giá uỷ viên BCH
 const cc=chuyenCan(1);
 console.assert(cc.tong===2&&cc.co===1&&cc.vang===1,'tính chuyên cần sai');
 console.assert(mucHT(DB.kh[3])===100&&mucHT({chiTieu:0,tienDo:'chua'})===0,'mức hoàn thành việc nội bộ sai');
 const ku=kpiBCH(1);
 console.assert(ku.ct.length===4&&ku.ct.reduce((s,c)=>s+c.max,0)===100,'thang điểm BCH phải đủ 100');
 console.assert(ku.ct[3].diem===+(12*0.5+8*0.75).toFixed(1),'điểm sinh hoạt/nhiệm vụ sai: '+ku.ct[3].diem);
 console.assert(ku.tong>=0&&ku.tong<=100,'điểm BCH ngoài thang: '+ku.tong);
 // nhập / xuất Excel
 console.assert(cot(['Họ và Tên','MSSV'],'ho va ten')===0&&cot(['MSSV'],'chi doan')===-1,'dò cột tiếng Việt sai');
 console.assert(tachBang('a\tb\n1\t2').length===2,'tách bảng dán từ Excel sai');
 console.assert(matBan('Ban TCKT')==='Ban Tổ chức – Kiểm tra'&&matBan('Ban Phong Trào')==='Ban Phong trào','dò tên ban sai');
 console.assert(matVaiTro('PBT')==='Phó Bí thư'&&matVaiTro('UV BCH')==='UV BCH'&&matVaiTro('Trưởng Ban')==='Trưởng ban','dò vai trò sai');
 console.assert(ngayISO('20/10/2026')==='2026-10-20'&&ngayISO('2026-10-20')==='2026-10-20'&&ngayISO('Coming soon')==='','đọc ngày sai');
 // lịch công tác + nhóm nhân sự
 DB.kh[0].lich=[{id:1,ten:'m1',han:'2026-01-10',nsId:1,xong:true},{id:2,ten:'m2',han:'2026-01-20',nsId:1,xong:false}];
 console.assert(mocDenHan(3650).length===1,'mốc đã xong vẫn bị coi là đến hạn');
 console.assert(mocDenHan(-9999).length===0,'lọc mốc theo mốc thời gian sai');
 DB.dd=[];
 doiDiemDanh(1,1);console.assert(ddOf(1,1).co&&!ddOf(1,1).muon,'ô trống bấm lần 1 phải thành có mặt');
 doiDiemDanh(1,1);console.assert(ddOf(1,1).muon,'bấm lần 2 phải thành đi muộn');
 doiDiemDanh(1,1);console.assert(ddOf(1,1)&&!ddOf(1,1).co,'bấm lần 3 phải thành vắng');
 doiDiemDanh(1,1);console.assert(!ddOf(1,1),'bấm lần 4 phải trở về chưa điểm danh');
 datDiemDanh(1,1,'muon');console.assert(ddOf(1,1).co&&ddOf(1,1).muon,'đặt thẳng trạng thái đi muộn sai');
 console.assert(buoiDaHop().length===1,'buổi chưa điểm danh vẫn bị tính vào chuyên cần');
 console.assert(coTep(900)==='900 B'&&coTep(2048)==='2 KB'&&coTep(1572864)==='1,5 MB','hiển thị dung lượng tệp sai: '+coTep(1572864));
 console.assert(idTep()!==idTep(),'mã tệp bị trùng');
 console.assert(tenNhom('nguon').includes('2k7')&&tenNhom('bch').includes('Ban Chấp hành'),'tên khối nhân sự sai');
 console.assert(matTienDo('Hoàn thành')==='xong'&&matTienDo('Đang triển khai')==='dang'&&matTienDo('Chưa triển khai')==='chua','dò tiến độ sai');
 DB=JSON.parse(bak);
 console.log('✓ Tự kiểm tra công thức KPI, chuyên cần và nhập/xuất: đạt');
})();

if(typeof auth !== 'undefined'){
 auth.init();
}
render();
