/* Khung tiêu chí, dữ liệu và tương tác API Sổ tay LCĐ KHUD */
/* ===================== KHUNG TIÊU CHÍ ===================== */
const TODAY=new Date().toISOString().slice(0,10);
const CRIT=[
 {id:'ct',ten:'Giáo dục chính trị – tư tưởng',max:20,c:'var(--s1)'},
 {id:'tn',ten:'Tình nguyện – vì cộng đồng',max:20,c:'var(--s2)'},
 {id:'ht',ten:'Học tập – NCKH – rèn luyện',max:20,c:'var(--s3)'},
 {id:'xd',ten:'Xây dựng Đoàn – phát triển Đảng',max:20,c:'var(--s4)'},
 {id:'hc',ten:'Tổ chức – báo cáo – đoàn phí',max:20,c:'var(--s5)'},
];
const critOf=id=>CRIT.find(c=>c.id===id);
const RANKS=[[90,'Xuất sắc','p-xs'],[80,'Tốt','p-good'],[65,'Khá','p-warn'],[50,'Trung bình','p-ser'],[0,'Yếu','p-crit']];
const xepLoai=d=>RANKS.find(r=>d>=r[0]);
const TRE_PHAT=0.8;

/* ===================== CƠ CẤU & DANH MỤC ===================== */
const BAN=['Thường trực','Ban Phong trào','Ban Tình nguyện','Ban Tài chính – Hậu cần','Ban Truyền thông','Ban Tổ chức – Kiểm tra','Ban Học tập & NCKH'];
const VAITRO=['Bí thư','Phó Bí thư','UV BTV','UV BCH','Trưởng ban','Phó ban','Thành viên'];
const NHOM=[['bch','Ban Chấp hành Liên chi đoàn'],['bcm','Ban chuyên môn'],['nguon','Key 2k7 — cán bộ nguồn']];
const tenNhom=n=>(NHOM.find(x=>x[0]===n)||NHOM[1])[1];
const TIENDO={chua:['Chưa triển khai','p-mute'],dang:['Đang triển khai','p-xs'],xong:['Hoàn thành','p-good']};
const VANG_CANH_BAO=3;

/* Lịch công tác mặc định */
const LICH={
 'KH-02':[['Chốt điều lệ và phân môn thi','2026-03-05',8,1],['Nhận đăng ký của các chi đoàn','2026-03-12',9,1],
  ['Bốc thăm chia bảng','2026-03-18',3,1],['Thi đấu vòng loại','2026-03-25',8,0],['Tổng kết, trao giải','2026-03-31',3,0]],
 'KH-07':[['Ban hành hướng dẫn sinh hoạt chi đoàn','2026-09-30',4,0],['Chi đoàn đăng ký lịch sinh hoạt','2026-10-10',2,0],
  ['Dự sinh hoạt mẫu tại 2 chi đoàn','2026-10-25',3,0]],
 'KH-12':[['Phát động tới các chi đoàn','2026-04-05',8,1],['Nhận bài dự thi','2026-04-20',9,1],
  ['Chấm vòng sơ loại','2026-04-25',14,0],['Công bố kết quả','2026-04-30',8,0]],
 'KH-14':[['Tập huấn công tác đại hội','2026-04-10',4,1],['Duyệt văn kiện các chi đoàn','2026-04-25',2,0],
  ['Tổ chức đại hội điểm','2026-05-10',3,0]],
 'KH-20':[['Chốt vật tư và kinh phí','2026-10-08',5,1],['Mở form đăng ký','2026-10-12',10,1],
  ['Chốt danh sách tham dự','2026-10-17',16,0],['Tổ chức workshop','2026-10-20',10,0]],
 'KH-21':[['Mở cổng đề cử','2026-09-04',6,1],['Chốt danh sách đề cử','2026-09-20',12,1],['Gala trao giải','2026-10-05',6,1]],
};

function seed(){
 const cd=[
  {id:1,ma:'MIS2022B',ten:'Chi đoàn MIS2022B',nganh:'MIS · K2022',siSo:62,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:2,ma:'MIS2023A',ten:'Chi đoàn MIS2023A',nganh:'MIS · K2023',siSo:58,bt:'(chưa cập nhật)',sdt:'',diemTru:2},
  {id:3,ma:'BDA2023A',ten:'Chi đoàn BDA2023A',nganh:'BDA · K2023',siSo:55,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:4,ma:'FDB2023B',ten:'Chi đoàn FDB2023B',nganh:'FDB · K2023',siSo:49,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:5,ma:'MIS2024B',ten:'Chi đoàn MIS2024B',nganh:'MIS · K2024',siSo:64,bt:'(chưa cập nhật)',sdt:'',diemTru:4},
  {id:6,ma:'BDA2024A',ten:'Chi đoàn BDA2024A',nganh:'BDA · K2024',siSo:71,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:7,ma:'BDA2025A',ten:'Chi đoàn BDA2025A',nganh:'BDA · K2025',siSo:78,bt:'(chưa cập nhật)',sdt:'',diemTru:1},
 ];

 const ns=[
  {id:1, ten:'Bùi Nhật Lệ',              vaiTro:'Bí thư',    ban:'Thường trực',               lop:'',          bch:1,theoDoi:[]},
  {id:2, ten:'Thân Quang Huy',           vaiTro:'Phó Bí thư',ban:'Thường trực',               lop:'MIS2022B',  bch:1,theoDoi:[1,2]},
  {id:3, ten:'Nguyễn Phụ Long',          vaiTro:'UV BTV',    ban:'Ban Tình nguyện',           lop:'FDB2023B',  bch:1,theoDoi:[4]},
  {id:4, ten:'Mai Thị Uyên Trang',       vaiTro:'UV BCH',    ban:'Ban Tổ chức – Kiểm tra',    lop:'BDA2024A',  bch:1,theoDoi:[6]},
  {id:5, ten:'Đào Duy Anh',              vaiTro:'UV BCH',    ban:'Ban Tài chính – Hậu cần',   lop:'BDA2024B',  bch:1,theoDoi:[]},
  {id:6, ten:'Mạc Phạm Thiên Long',      vaiTro:'UV BCH',    ban:'Ban Học tập & NCKH',        lop:'MIS2022B',  bch:1,theoDoi:[1]},
  {id:7, ten:'Giang Lê Hiệp',            vaiTro:'UV BCH',    ban:'Ban Truyền thông',          lop:'MIS2023A',  bch:1,theoDoi:[2]},
  {id:8, ten:'Nguyễn Thị Thanh Huyền',   vaiTro:'UV BCH',    ban:'Ban Phong trào',            lop:'BDA2023A',  bch:1,theoDoi:[3]},
  {id:9, ten:'Cao Mai Anh',              vaiTro:'UV BCH',    ban:'Ban Phong trào',            lop:'BDA2024A',  bch:1,theoDoi:[7]},
  {id:10,ten:'Trần Thị Huyền',           vaiTro:'UV BCH',    ban:'Ban Tình nguyện',           lop:'BDA2024C',  bch:1,theoDoi:[5]},
  {id:11,ten:'Nguyễn Thị Ánh Dương',     vaiTro:'UV BCH',    ban:'Ban Truyền thông',          lop:'MIS2024B',  bch:1,theoDoi:[]},
  {id:12,ten:'Nguyễn Hương Giang',       vaiTro:'Phó ban',   ban:'Ban Học tập & NCKH',        lop:'MIS2024B',  bch:0,theoDoi:[]},
  {id:13,ten:'Chu Thị Thanh Thuý',       vaiTro:'Thành viên',ban:'Ban Tài chính – Hậu cần',   lop:'MIS2024B',  bch:0,theoDoi:[]},
  {id:14,ten:'Vũ Thị Minh Phương',       vaiTro:'Thành viên',ban:'Ban Phong trào',            lop:'MIS2023A',  bch:0,theoDoi:[]},
  {id:15,ten:'Lê Văn Mạnh',              vaiTro:'Thành viên',ban:'Ban Phong trào',            lop:'FDB2023B',  bch:0,theoDoi:[]},
  {id:16,ten:'Nguyễn Hà Bảo Châu',       vaiTro:'Thành viên',ban:'Ban Tình nguyện',           lop:'FDB2023B',  bch:0,theoDoi:[]},
  {id:17,ten:'Lâm Thị Bình Dương',       vaiTro:'Thành viên',ban:'Ban Truyền thông',          lop:'MIS2025A',  bch:0,theoDoi:[]},
  {id:18,ten:'Lương Vũ Hà Phương',       vaiTro:'Thành viên',ban:'Ban Tổ chức – Kiểm tra',    lop:'BDA2025A',  bch:0,theoDoi:[]},
  {id:19,ten:'Đỗ Thủy Linh',             vaiTro:'Thành viên',ban:'Ban Học tập & NCKH',        lop:'MIS2024B',  bch:0,theoDoi:[]},
  {id:20,ten:'Phạm Thành Tân',           vaiTro:'Thành viên',ban:'Ban Tình nguyện',           lop:'BDA2 K24',  bch:0,nhom:'nguon',theoDoi:[]},
  {id:21,ten:'Trần Hà Linh',             vaiTro:'Thành viên',ban:'Ban Phong trào',            lop:'BDA1 K24',  bch:0,nhom:'nguon',theoDoi:[]},
  {id:22,ten:'Đào Hoàng Hiệp',           vaiTro:'Thành viên',ban:'Ban Tổ chức – Kiểm tra',    lop:'BDA1 K24',  bch:0,nhom:'nguon',theoDoi:[]},
  {id:23,ten:'Phùng Đức Tú',             vaiTro:'Thành viên',ban:'Ban Phong trào',            lop:'BDA3 K24',  bch:0,nhom:'nguon',theoDoi:[]},
  {id:24,ten:'Trần Minh Phương',         vaiTro:'Thành viên',ban:'Ban Truyền thông',          lop:'BDA3 K24',  bch:0,nhom:'nguon',theoDoi:[]},
  {id:25,ten:'Hoàng Thị Tú An',          vaiTro:'Thành viên',ban:'Ban Truyền thông',          lop:'MIS2 K24',  bch:0,nhom:'nguon',theoDoi:[]},
 ].map(u=>({sdt:'',mssv:'',fb:'',nhom:u.bch?'bch':'bcm',...u}));

 const kh=[
  {ma:'KH-01',ten:'FDB Talent',crit:'ht',ban:['Ban Học tập & NCKH'],ptIds:[6],batDau:'2026-03-01',hanChot:'2026-04-30',hienThi:'3/2026 – 4/2026',tienDo:'xong',diem:9,chiTieu:10,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-02',ten:'Hội thao Isport',crit:'ht',ban:['Ban Phong trào'],ptIds:[1,3,8,9],batDau:'2026-03-01',hanChot:'2026-03-31',hienThi:'01/03/2026',tienDo:'dang',diem:10,chiTieu:15,donVi:'n',batBuoc:1,ketQua:''},
  {ma:'KH-03',ten:'Nộp hồ sơ Ngôi sao xanh',crit:'xd',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-03-06',hanChot:'2026-03-06',hienThi:'06/03/2026',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-04',ten:'Khảo sát đăng ký Cảm tình Đảng',crit:'xd',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-03-12',hanChot:'2026-03-20',hienThi:'12/03/2026',tienDo:'xong',diem:8,chiTieu:3,donVi:'n',batBuoc:1,ketQua:''},
  {ma:'KH-05',ten:'Workshop nến thơm Light Up',crit:'tn',ban:['Ban Tình nguyện'],ptIds:[3,10],batDau:'2026-04-04',hanChot:'2026-04-10',hienThi:'04/04/2026',tienDo:'xong',diem:7,chiTieu:8,donVi:'n',batBuoc:0,ketQua:'Workshop Light Up'},
  {ma:'KH-06',ten:'Kế hoạch Bonding LCĐ',crit:'hc',ban:['Ban Tài chính – Hậu cần'],ptIds:[5],batDau:'2026-03-01',hanChot:'2026-03-15',hienThi:'01/03/2026',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-07',ten:'Tổ chức sinh hoạt theo chi đoàn',crit:'hc',ban:['Thường trực','Ban Tổ chức – Kiểm tra'],ptIds:[2,3,4],batDau:'2026-03-01',hanChot:'2026-05-31',hienThi:'01/03/2026',tienDo:'chua',diem:10,chiTieu:100,donVi:'%',batBuoc:1,ketQua:''},
  {ma:'KH-08',ten:'Infographic “Theo dấu Nghị quyết Đại hội”',crit:'ct',ban:['Ban Truyền thông'],ptIds:[7,11],batDau:'2026-03-01',hanChot:'2026-03-25',hienThi:'01/03/2026',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-09',ten:'IBLUE Tiktok Challenge 2026',crit:'ct',ban:['Ban Truyền thông'],ptIds:[7,11],batDau:'2026-03-01',hanChot:'2026-03-31',hienThi:'01/03/2026',tienDo:'xong',diem:6,chiTieu:5,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-10',ten:'Con đường ánh sáng 2026',crit:'tn',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-03-22',hanChot:'2026-03-31',hienThi:'22/03/2026',tienDo:'xong',diem:7,chiTieu:6,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-11',ten:'Nộp hồ sơ bồi dưỡng và phát triển Đảng',crit:'xd',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-03-01',hanChot:'2026-03-31',hienThi:'01/03/2026',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-12',ten:'Lớp tôi là số 1',crit:'ct',ban:['Ban Phong trào'],ptIds:[8,9],batDau:'2026-04-01',hanChot:'2026-04-30',hienThi:'01/04/2026',tienDo:'dang',diem:10,chiTieu:80,donVi:'%',batBuoc:1,ketQua:''},
  {ma:'KH-13',ten:'Nộp văn kiện đại hội',crit:'hc',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-04-01',hanChot:'2026-04-15',hienThi:'01/04/2026',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:'Đăng ký tham gia BCM LCĐ KHUD'},
  {ma:'KH-14',ten:'Đại hội các chi đoàn năm 1, 2',crit:'hc',ban:['Thường trực','Ban Tổ chức – Kiểm tra'],ptIds:[1,2,3,4],batDau:'2026-04-01',hanChot:'2026-05-31',hienThi:'4/2026 – 5/2026',tienDo:'chua',diem:10,chiTieu:100,donVi:'%',batBuoc:1,ketQua:'MIS K23, K24: các lớp đều tham gia'},
  {ma:'KH-15',ten:'Cuộc thi tìm hiểu về Đảng',crit:'ct',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[2,4,17],batDau:'2026-04-01',hanChot:'2026-04-30',hienThi:'01/04/2026',tienDo:'xong',diem:10,chiTieu:60,donVi:'%',batBuoc:1,ketQua:''},
  {ma:'KH-16',ten:'Lấy ý kiến chuyển Đảng (Đ/c Thúc Kha, Thúy Hằng)',crit:'xd',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-04-01',hanChot:'2026-04-30',hienThi:'01/04/2026',tienDo:'xong',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-17',ten:'Lấy ý kiến chuyển Đảng (Đ/c Phùng Đức Tú)',crit:'xd',ban:['Ban Tổ chức – Kiểm tra'],ptIds:[4],batDau:'2026-05-01',hanChot:'2026-05-31',hienThi:'01/05/2026',tienDo:'dang',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-18',ten:'Study Buddy',crit:'ht',ban:['Ban Học tập & NCKH'],ptIds:[6,12],batDau:'2026-05-01',hanChot:'2026-06-30',hienThi:'5/2026 – 6/2026',tienDo:'chua',diem:8,chiTieu:10,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-19',ten:'Mùa vui Trung thu',crit:'tn',ban:['Ban Tài chính – Hậu cần'],ptIds:[2,5],batDau:'2026-09-15',hanChot:'2026-09-25',hienThi:'20/09/2026',tienDo:'xong',diem:9,chiTieu:12,donVi:'n',batBuoc:1,ketQua:''},
  {ma:'KH-20',ten:'Workshop làm hoa “Sắc hương”',crit:'tn',ban:['Ban Tình nguyện'],ptIds:[10,16],batDau:'2026-10-05',hanChot:'2026-10-20',hienThi:'20/10/2026',tienDo:'dang',diem:8,chiTieu:8,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-21',ten:'Star Awards 2026',crit:'ht',ban:['Ban Học tập & NCKH'],ptIds:[1,6],batDau:'2026-09-04',hanChot:'2026-10-05',hienThi:'04/09 – 05/10/2026',tienDo:'xong',diem:11,chiTieu:20,donVi:'n',batBuoc:1,ketQua:'128/170 sinh viên tham dự'},
  {ma:'KH-22',ten:'Kế hoạch BDA Talent 2026',crit:'ht',ban:['Ban Học tập & NCKH'],ptIds:[6],batDau:'2026-11-01',hanChot:'2026-12-15',hienThi:'Coming soon',tienDo:'chua',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-23',ten:'ISTUBOX KHUD (tài liệu học tập)',crit:'ht',ban:['Ban Học tập & NCKH'],ptIds:[6,19],batDau:'2026-12-01',hanChot:'2027-01-31',hienThi:'12/2026 – 01/2027',tienDo:'chua',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
  {ma:'KH-24',ten:'Bán dây thẻ KHUD',crit:'hc',ban:['Ban Tài chính – Hậu cần','Ban Truyền thông'],ptIds:[5,11],batDau:'2026-11-01',hanChot:'2026-12-31',hienThi:'Coming soon',tienDo:'chua',diem:0,chiTieu:0,donVi:'n',batBuoc:0,ketQua:''},
 ].map((k,i)=>({id:i+1,lich:(LICH[k.ma]||[]).map((m,j)=>({id:j+1,ten:m[0],han:m[1],nsId:m[2],xong:!!m[3]})),...k,batBuoc:!!k.batBuoc,ptId:k.ptIds[0],mc:k.tienDo==='xong'?'https://drive.google.com/'+k.ma.toLowerCase():'',note:''}));

 const hop=[
  {id:1,ten:'Họp Liên chi đoàn KHUD',ngay:'2026-09-01',noiDung:'Triển khai công tác đầu năm học, phân công ban chuyên môn.',bienBan:'Biên bản họp 01-09.docx'},
  {id:2,ten:'Họp Liên chi đoàn KHUD',ngay:'2026-09-08',noiDung:'Chốt kế hoạch Mùa vui Trung thu và Star Awards 2026.',bienBan:'Biên bản họp 08-09.docx'},
  {id:3,ten:'Họp mặt BCH các chi đoàn',ngay:'2026-09-15',noiDung:'Giao chỉ tiêu cho các chi đoàn, hướng dẫn nộp minh chứng.',bienBan:'Biên bản họp 15-09.docx'},
  {id:4,ten:'Họp Liên chi đoàn KHUD',ngay:'2026-09-22',noiDung:'Rà soát tiến độ Trung thu, phân công trực gian hàng.',bienBan:'Biên bản họp 22-09.docx'},
  {id:5,ten:'Họp Liên chi đoàn KHUD',ngay:'2026-09-29',noiDung:'Tổng kết Trung thu, triển khai Workshop Sắc hương.',bienBan:'Biên bản họp 29-09.docx'},
  {id:6,ten:'Họp LCĐ với Lãnh đạo Khoa',ngay:'2026-10-02',noiDung:'Báo cáo tình hình tổ chức, nhân sự và kết quả hoạt động.',bienBan:'Biên bản họp 02-10.docx'},
  {id:7,ten:'Họp Liên chi đoàn KHUD',ngay:'2026-10-06',noiDung:'Chốt số liệu Star Awards 2026, rà soát hồ sơ phát triển Đảng.',bienBan:'Biên bản họp 06-10.docx'},
  {id:8,ten:'Họp Liên chi đoàn KHUD',ngay:'2026-10-13',noiDung:'Đánh giá giữa học kỳ, nhắc chi đoàn còn nợ báo cáo.',bienBan:''},
 ].map(h=>({tep:[],...h}));

 const dd=[];
 hop.forEach(h=>ns.forEach(u=>{
  const r=(h.id*5+u.id*7)%11;
  dd.push({hopId:h.id,nsId:u.id,co:!(r===0||(r===4&&u.id%3===0)),muon:r===2});
 }));

 const hoTen=['Nguyễn Văn An','Trần Thị Bình','Lê Hoàng Cường','Phạm Thuỳ Dung','Hoàng Minh Đức','Vũ Thị Én','Đặng Quốc Phong','Bùi Thu Giang','Ngô Hải Hà','Dương Khánh Ly','Tạ Minh Nhật','Lý Thu Oanh','Phan Gia Phúc','Hồ Thanh Quý','Mai Nhật Sang','Trịnh Bảo Trân','Cao Minh Tuấn','Lưu Thị Vân','Đinh Quang Vũ','Chu Hồng Yến'];
 const cvs=['Bí thư','Phó Bí thư','Uỷ viên BCH','Đoàn viên','Đoàn viên','Đoàn viên','Đoàn viên'];
 const dv=[];let k2=1;
 cd.forEach(c=>{
  const n=6+(c.id%3);
  for(let i=0;i<n;i++){
   const drl=[95,88,84,76,71,92,64,81][(c.id+i)%8];
   dv.push({id:k2++,cdId:c.id,ten:hoTen[(c.id*3+i)%hoTen.length],
     mssv:'2'+(26-Math.floor((c.id+1)/3))+'0'+String(70100+c.id*17+i),
     cv:cvs[Math.min(i,6)],drl,doanPhi:(c.id+i)%7!==0,soHD:((c.id*2+i*3)%9)+1,
     ghiChu:(c.id+i)%6===0?'Cảm tình Đảng':((c.id+i)%11===0?'Đoàn viên ưu tú':'')});
  }
 });

 const bc=[];let b=1;
 kh.forEach(k=>{ if(!k.chiTieu||k.batDau>TODAY) return;
  cd.forEach(c=>{
   const r=(k.id*7+c.id*11)%10;
   if(r===0&&!k.batBuoc) return;
   if(r===3&&k.hanChot>TODAY) return;
   const ct=chiTieuSo(k,c);
   const ty=[1.35,.96,1.2,.82,1.5,1.08,1.25,.88,1.4,1.02][(k.id*3+c.id*5)%10];
   const treHan=r===5&&k.hanChot<TODAY;
   const ngayNop=treHan?dayAdd(k.hanChot,4):dayAdd(k.hanChot<TODAY?k.hanChot:TODAY,-2);
   const st=r===1?'wait':(r===7?'no':'ok');
   bc.push({id:b++,khId:k.id,cdId:c.id,soLuot:Math.max(1,Math.round(ct*ty)),ngayNop,treHan,
     mc:'https://drive.google.com/'+k.ma.toLowerCase()+'-'+c.ma.toLowerCase(),status:st,
     nx:st==='no'?'Minh chứng chưa đủ, đề nghị bổ sung ảnh và danh sách ký tên.':''});
  });
 });

 const hd=[
  [1,'ht','Seminar “Dữ liệu và nghề nghiệp MIS”','2026-09-22',41,5,'ok'],
  [1,'xd','Kết nạp 6 đoàn viên mới','2026-09-28',6,4,'ok'],
  [2,'ct','Tuyên truyền an toàn giao thông đầu năm','2026-09-25',47,4,'ok'],
  [2,'hc','Hoàn thiện sổ chi đoàn điện tử','2026-10-02',0,4,'wait'],
  [3,'tn','Chủ nhật xanh – dọn giảng đường','2026-09-07',29,5,'ok'],
  [3,'ht','Đăng ký 2 đề tài NCKH sinh viên','2026-10-04',8,6,'ok'],
  [4,'ht','Cuộc thi phân tích dữ liệu cấp lớp','2026-10-08',35,7,'wait'],
  [4,'ct','Sinh hoạt chi đoàn chủ điểm tháng 9','2026-09-15',44,4,'ok'],
  [5,'tn','Gian hàng gây quỹ Trung thu','2026-09-10',15,5,'ok'],
  [5,'ht','Nhóm học tập cùng tiến','2026-10-06',22,3,'wait'],
  [6,'ct','Cuộc thi tìm hiểu lịch sử Đoàn','2026-09-26',66,5,'ok'],
  [6,'tn','Ngày hội tình nguyện tân sinh viên','2026-09-21',44,6,'ok'],
  [7,'tn','Vệ sinh khu tự học tầng 5','2026-09-14',21,4,'ok'],
  [7,'ht','Tham quan doanh nghiệp fintech','2026-10-09',30,6,'wait'],
 ].map((h,i)=>({id:i+1,cdId:h[0],crit:h[1],ten:h[2],ngay:h[3],sl:h[4],diem:h[5],status:h[6],mc:'https://drive.google.com/hd-'+(i+1)}));

 return {cd,ns,kh,hop,dd,bc,hd,dv};
}

/** Danh mục quyền hạn */
const DANH_SACH_QUYEN = [
 { id: 'xem_tongquan', ma: 'TỔNG QUAN', ten: 'Xem Tổng quan & Xếp hạng', nhom: 'Chung', desc: 'Xem trang tổng quan, ma trận tiến độ và bảng xếp hạng thi đua' },
 { id: 'duyet_bc',     ma: 'DUYỆT BC',   ten: 'Duyệt báo cáo & Chấm KPI', nhom: 'Nghiệp vụ LCĐ', desc: 'Thẩm định hồ sơ, minh chứng Google Drive/ảnh, duyệt hoặc trả lại' },
 { id: 'ql_kh',        ma: 'KẾ HOẠCH',   ten: 'Quản lý Hoạt động & Chỉ tiêu', nhom: 'Nghiệp vụ LCĐ', desc: 'Thêm, sửa công tác theo timeline, giao chỉ tiêu cho các chi đoàn' },
 { id: 'ql_nhansu',    ma: 'NHÂN SỰ',    ten: 'Quản lý Nhân sự & Điểm danh', nhom: 'Nghiệp vụ LCĐ', desc: 'Quản lý BCH LCĐ, phân công nhiệm vụ và điểm danh sinh hoạt' },
 { id: 'nop_bc',       ma: 'NỘP BC',     ten: 'Nộp báo cáo & Minh chứng', nhom: 'Chi đoàn', desc: 'Chi đoàn gửi link minh chứng, số liệu tham gia cho hoạt động được giao' },
 { id: 'tuchuc_hd',    ma: 'TỰ TỔ CHỨC', ten: 'Đăng ký Hoạt động tự tổ chức', nhom: 'Chi đoàn', desc: 'Khai báo các hoạt động do Chi đoàn lớp tự tổ chức' },
 { id: 'ql_doanvien',  ma: 'ĐOÀN VIÊN',  ten: 'Quản lý Đoàn viên & Đoàn phí', nhom: 'Chi đoàn', desc: 'Quản lý danh sách sinh viên lớp, điểm rèn luyện và đóng đoàn phí' },
 { id: 'nhap_excel',   ma: 'EXCEL',      ten: 'Nhập / Xuất dữ liệu Excel', nhom: 'Dữ liệu', desc: 'Nhập xuất danh sách sinh viên, nhân sự, đoàn phí bằng Excel' },
 { id: 'ql_csdl',      ma: 'CSDL DATA',  ten: 'Quản lý Dữ liệu & Backup', nhom: 'Hệ thống', desc: 'Sao lưu, phục hồi file JSON, quản trị dữ liệu' },
 { id: 'ql_user',      ma: 'PHÂN QUYỀN', ten: 'Phân quyền & Quản trị User', nhom: 'Hệ thống', desc: 'Tạo tài khoản, phân quyền và khóa/mở khóa tài khoản' },
];

const QUYEN_THEO_VAI_TRO = {
 admin: DANH_SACH_QUYEN.map(q => q.id),
 lcd:   ['xem_tongquan', 'duyet_bc', 'ql_kh', 'ql_nhansu', 'nhap_excel', 'ql_csdl', 'ql_user'],
 cd:    ['xem_tongquan', 'nop_bc', 'tuchuc_hd', 'ql_doanvien', 'nhap_excel'],
 bbt:   ['xem_tongquan', 'nhap_excel']
};

const dayAdd=(d,n)=>{const t=new Date(d+'T00:00:00');t.setDate(t.getDate()+n);return t.toISOString().slice(0,10)};
const dmy=d=>d?d.slice(8,10)+'/'+d.slice(5,7)+(d.slice(0,4)!=='2026'?'/'+d.slice(2,4):''):'–';
const chiTieuSo=(k,c)=>k.donVi==='%'?Math.round(c.siSo*k.chiTieu/100):k.chiTieu;

function khoangCachNgayKH(k, today = TODAY){
 const bd = k.batDau || today;
 const hc = k.hanChot || bd;
 if (bd <= today && today <= hc) return 0;
 const tNow = new Date(today + 'T00:00:00').getTime();
 if (today < bd) {
  return Math.round(Math.abs(new Date(bd + 'T00:00:00').getTime() - tNow) / 86400000);
 }
 return Math.round(Math.abs(tNow - new Date(hc + 'T00:00:00').getTime()) / 86400000);
}

function soSanhKH(a, b, kieu = 'near', today = TODAY){
 if(kieu === 'near'){
  const ca = khoangCachNgayKH(a, today);
  const cb = khoangCachNgayKH(b, today);
  if(ca !== cb) return ca - cb;
  if(a.tienDo === 'xong' && b.tienDo !== 'xong') return 1;
  if(b.tienDo === 'xong' && a.tienDo !== 'xong') return -1;
  const aFuture = (a.hanChot || a.batDau) >= today ? 1 : 0;
  const bFuture = (b.hanChot || b.batDau) >= today ? 1 : 0;
  if(aFuture !== bFuture) return bFuture - aFuture;
  return (b.batDau || '').localeCompare(a.batDau || '') || b.id - a.id;
 }
 if(kieu === 'newest'){
  return (b.batDau || '').localeCompare(a.batDau || '') || (b.hanChot || '').localeCompare(a.hanChot || '') || b.id - a.id;
 }
 if(kieu === 'oldest'){
  return (a.batDau || '').localeCompare(b.batDau || '') || (a.hanChot || '').localeCompare(b.hanChot || '') || a.id - b.id;
 }
 if(kieu === 'ma'){
  return a.ma.localeCompare(b.ma) || a.id - b.id;
 }
 return 0;
}

/* ===================== AN TOÀN DỮ LIỆU & ESCAPING ===================== */

/** Mã hóa chuỗi cho HTML (chống XSS) */
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
 '&': '&amp;',
 '<': '&lt;',
 '>': '&gt;',
 '"': '&quot;',
 "'": '&#39;'
}[m]));

/** Thoát chuỗi an toàn khi truyền trong ngữ cảnh JavaScript */
const escJs = s => String(s ?? '')
 .replace(/\\/g, '\\\\')
 .replace(/'/g, "\\'")
 .replace(/"/g, '\\"')
 .replace(/\n/g, '\\n')
 .replace(/\r/g, '\\r');

const nextId = a => (a && a.length) ? a.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1 : 1;

/** Kiểm tra đường dẫn URL hợp lệ và giao thức an toàn */
function isSafeUrl(u) {
 if (!u) return false;
 const s = String(u).trim();
 if (/^(javascript|data|vbscript|file):/i.test(s)) return false;
 try {
  const parsed = new URL(s.startsWith('http://') || s.startsWith('https://') ? s : 'https://' + s);
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
 } catch (e) {
  return false;
 }
}

/** Chuẩn hóa link để luôn mở an toàn trong tab mới */
const chuanHoaLink = u => {
 if (!u || u === '(chưa có)' || u === '–') return '';
 const s = String(u).trim();
 if (/^(javascript|data|vbscript|file):/i.test(s)) return '';
 if (s.startsWith('http://') || s.startsWith('https://')) return s;
 if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(s) || s.startsWith('/')) {
  return 'https://' + s;
 }
 return '';
};

/* Quản lý đăng ký hành động sửa link mà không chèn chuỗi động vào onclick */
const _linkActions = new Map();
let _linkActionSeq = 1;

function dangKySuaLink(opts) {
 const actId = 'lnk_' + (_linkActionSeq++);
 _linkActions.set(actId, opts);
 return actId;
}

function laySuaLink(actId) {
 return _linkActions.get(actId);
}

/** Hiển thị link mở trong tab mới + nút sửa link (không dùng dynamic inline JS) */
function hienThiLink(url, label = 'Mở link', editOpts = null) {
 const clean = chuanHoaLink(url);
 let editBtn = '';
 if (editOpts) {
  const actId = dangKySuaLink(editOpts);
  editBtn = `<button type="button" class="btn-edit-link" data-edit-link-id="${actId}" title="${clean ? 'Chỉnh sửa link' : 'Nhập link'}">${clean ? '✏️ Sửa' : '+ Thêm link'}</button>`;
 }
 if (!clean) {
  return `<span class="link-item"><span class="t2">(chưa có link)</span>${editBtn}</span>`;
 }
 return `<span class="link-item"><a href="${esc(clean)}" target="_blank" rel="noopener noreferrer" class="link-badge" title="${esc(url)}">🔗 ${esc(label)}</a>${editBtn}</span>`;
}

// Bắt sự kiện click chỉnh sửa link thông qua event delegation an toàn
document.addEventListener('click', function(e) {
 const btn = e.target.closest('[data-edit-link-id]');
 if (btn) {
  const actId = btn.getAttribute('data-edit-link-id');
  const opts = laySuaLink(actId);
  if (opts && typeof moSuaLink === 'function') {
   moSuaLink(opts);
  }
 }
});

/* ===================== BỘ NHỚ TRẠNG THÁI (DB) ===================== */
let DB = { cd: [], ns: [], kh: [], hop: [], dd: [], bc: [], hd: [], dv: [] };

/* ===================== KHO TỆP DÙNG CHUNG (SUPABASE STORAGE) & DI CHUYỂN INDEXEDDB CŨ ===================== */
const TEP_KHO = 'lcdkhud-tep';
const STORAGE_BUCKET = 'lcdkhud-files';
const STORAGE_SIGNED_TTL = 300;
const TEP_TOI_DA = 25 * 1048576;
const TEP_ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'];
const TEP_ALLOWED_MIMES = [
 'image/jpeg', 'image/png', 'image/webp', 'image/gif',
 'application/pdf', 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.ms-excel',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'text/csv', 'text/plain'
];

const coTep = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
const idTep = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

function _taoUuidMoi() {
 if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
  return crypto.randomUUID();
 }
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
 });
}

/* Bộ đọc chỉ-đọc cho kho IndexedDB cũ nhằm chuyển dữ liệu lên Storage (không ghi mới, không tự xoá bản cũ) */
const _legacyMoKho = () => new Promise((ok, loi) => {
 if (typeof indexedDB === 'undefined') return loi(new Error('Trình duyệt không hỗ trợ IndexedDB.'));
 const r = indexedDB.open(TEP_KHO, 1);
 r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('tep')) r.result.createObjectStore('tep'); };
 r.onsuccess = () => ok(r.result);
 r.onerror = () => loi(r.error);
});
const _legacyListKeys = () => _legacyMoKho().then(db => new Promise((ok, loi) => {
 if (!db.objectStoreNames.contains('tep')) return ok([]);
 const r = db.transaction('tep', 'readonly').objectStore('tep').getAllKeys();
 r.onsuccess = () => ok(r.result || []);
 r.onerror = () => loi(r.error);
}));
const _legacyGetBlob = id => _legacyMoKho().then(db => new Promise((ok, loi) => {
 if (!db.objectStoreNames.contains('tep')) return ok(null);
 const r = db.transaction('tep', 'readonly').objectStore('tep').get(id);
 r.onsuccess = () => ok(r.result || null);
 r.onerror = () => loi(r.error);
}));

const storageApi = {
 async sha256Hex(blobOrBuf) {
  const buf = blobOrBuf && typeof blobOrBuf.arrayBuffer === 'function'
   ? await blobOrBuf.arrayBuffer()
   : (blobOrBuf instanceof ArrayBuffer ? blobOrBuf : new TextEncoder().encode(String(blobOrBuf ?? '')).buffer);
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
   const hashBuf = await crypto.subtle.digest('SHA-256', buf);
   return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('Môi trường trình duyệt không hỗ trợ Web Crypto SHA-256.');
 },

 validateFile(file) {
  if (!file) throw new Error('Không tìm thấy tệp tải lên.');
  const size = Number(file.size || 0);
  if (size <= 0) throw new Error('Tệp rỗng hoặc không hợp lệ.');
  if (size > TEP_TOI_DA) {
   throw new Error(`Tệp "${file.name || 'không tên'}" nặng ${coTep(size)}, vượt mức tối đa ${coTep(TEP_TOI_DA)}.`);
  }
  const name = String(file.name || '');
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase().trim() : '';
  const mime = String(file.type || '').toLowerCase().trim();
  if (ext && !TEP_ALLOWED_EXTS.includes(ext)) {
   throw new Error(`Định dạng .${ext} không nằm trong danh sách cho phép (${TEP_ALLOWED_EXTS.join(', ')}).`);
  }
  if (mime && !TEP_ALLOWED_MIMES.includes(mime)) {
   throw new Error(`Loại MIME "${mime}" không được phép tải lên.`);
  }
  if (!ext && !mime) {
   throw new Error('Không xác định được định dạng tệp.');
  }
  return { ext: ext || (mime === 'application/pdf' ? 'pdf' : 'bin'), mime };
 },

 buildObjectPath(hopId, fileName) {
  const safeHopId = Number(hopId);
  if (!Number.isInteger(safeHopId) || safeHopId <= 0) {
   throw new Error('Mã buổi sinh hoạt không hợp lệ để lưu tệp.');
  }
  const rawExt = String(fileName || '').includes('.') ? String(fileName).split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const ext = TEP_ALLOWED_EXTS.includes(rawExt) ? '.' + rawExt : '';
  return `sinh-hoat/${safeHopId}/${_taoUuidMoi()}${ext}`;
 },

 async uploadHopFile(hopId, file) {
  const client = dataApi._requireClient();
  const { mime } = this.validateFile(file);
  const checksum = await this.sha256Hex(file);
  const storagePath = this.buildObjectPath(hopId, file.name);
  const id = idTep();

  const upRes = await client.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
   contentType: mime || 'application/octet-stream',
   upsert: false
  });
  if (upRes.error) throw new Error('Tải tệp lên Storage thất bại: ' + upRes.error.message);

  const curUser = typeof auth !== 'undefined' && auth.currentUser ? auth.currentUser : null;
  const metaPayload = {
   id,
   hop_id: Number(hopId),
   ten: String(file.name || 'tep-dinh-kem').slice(0, 255),
   loai: mime || file.type || '',
   co: Number(file.size || 0),
   storage_path: storagePath,
   checksum_sha256: checksum,
   created_by: curUser ? curUser.id : null
  };

  const dbRes = await client.from('tep_tin').insert(metaPayload).select().single();
  if (dbRes.error || !dbRes.data) {
   // Dọn object mồ côi nếu ghi metadata DB thất bại
   try { await client.storage.from(STORAGE_BUCKET).remove([storagePath]); } catch (e) {}
   throw new Error('Lưu thông tin tệp thất bại (đã thu hồi object tạm): ' + (dbRes.error ? dbRes.error.message : '0 dòng'));
  }

  const row = dbRes.data;
  const mapped = {
   id: row.id,
   ten: row.ten,
   loai: row.loai || '',
   kieu: row.loai || '',
   co: Number(row.co) || 0,
   storagePath: row.storage_path,
   checksum: row.checksum_sha256 || checksum,
   taiLuc: (row.created_at || TODAY).slice(0, 10),
   updatedAt: row.updated_at || null
  };
  const h = DB.hop.find(x => x.id === Number(hopId));
  if (h) {
   h.tep = h.tep || [];
   if (!h.tep.some(t => t.id === mapped.id)) h.tep.push(mapped);
  }
  return mapped;
 },

 async getSignedUrl(storagePath, expiresIn = STORAGE_SIGNED_TTL) {
  const client = dataApi._requireClient();
  if (!storagePath) throw new Error('Tệp chưa có đường dẫn Storage trên máy chủ.');
  const res = await client.storage.from(STORAGE_BUCKET).createSignedUrl(storagePath, expiresIn);
  if (res.error || !res.data || !res.data.signedUrl) {
   throw new Error('Không tạo được liên kết tải tệp ngắn hạn: ' + (res.error ? res.error.message : 'Từ chối truy cập'));
  }
  return res.data.signedUrl;
 },

 async downloadBlob(meta) {
  const client = dataApi._requireClient();
  if (!meta || !meta.storagePath) {
   throw new Error('Tệp chưa có trên Storage dùng chung (có thể đang nằm trong bộ nhớ cục bộ của máy đã tải lên trước đây).');
  }
  const res = await client.storage.from(STORAGE_BUCKET).download(meta.storagePath);
  if (res.error || !res.data) {
   throw new Error('Không tải được nội dung tệp từ Storage: ' + (res.error ? res.error.message : 'Không có quyền hoặc tệp không tồn tại'));
  }
  return res.data;
 },

 async deleteHopFile(hopId, tepId) {
  const client = dataApi._requireClient();
  const delRes = await client.from('tep_tin').delete().eq('id', tepId).select('id, storage_path');
  if (delRes.error) throw delRes.error;
  if (!delRes.data || delRes.data.length === 0) {
   throw new Error('Xoá tệp thất bại: 0 dòng bị ảnh hưởng (không có quyền hoặc tệp không tồn tại).');
  }

  const removedRow = delRes.data[0];
  let storageCleaned = true;
  let warning = '';
  if (removedRow.storage_path) {
   const rmRes = await client.storage.from(STORAGE_BUCKET).remove([removedRow.storage_path]);
   if (rmRes.error) {
    storageCleaned = false;
    warning = 'Đã xoá bản ghi tệp nhưng xoá object trên Storage gặp lỗi: ' + rmRes.error.message;
   }
  }

  const h = DB.hop.find(x => x.id === Number(hopId));
  if (h && h.tep) h.tep = h.tep.filter(t => t.id !== tepId);
  return { ok: true, storageCleaned, warning };
 },

 async previewLegacyIndexedDB() {
  if (typeof indexedDB === 'undefined') {
   return { supported: false, items: [], totalSize: 0, pendingCount: 0 };
  }
  const keys = await _legacyListKeys().catch(() => []);
  const allMetas = DB.hop.flatMap(h => (h.tep || []).map(t => ({ hop: h, meta: t })));
  const items = [];
  for (const key of keys) {
   const blob = await _legacyGetBlob(key).catch(() => null);
   const found = allMetas.find(x => x.meta.id === key);
   const hasStorage = Boolean(found && found.meta.storagePath);
   const size = blob ? Number(blob.size || 0) : 0;
   const checksum = blob ? await this.sha256Hex(blob).catch(() => '') : '';
   items.push({
    id: String(key),
    hopId: found ? found.hop.id : null,
    hopTen: found ? `${found.hop.ten} (${dmy(found.hop.ngay)})` : '(Không khớp buổi sinh hoạt trên máy chủ)',
    ten: found ? found.meta.ten : (blob && blob.name) || String(key),
    co: size,
    kieu: (found && (found.meta.loai || found.meta.kieu)) || (blob && blob.type) || '',
    hasBlob: Boolean(blob),
    checksum,
    status: !found ? 'orphan' : (hasStorage ? 'migrated' : 'pending')
   });
  }
  return {
   supported: true,
   items,
   totalSize: items.reduce((s, x) => s + (x.co || 0), 0),
   pendingCount: items.filter(x => x.status === 'pending' && x.hasBlob).length
  };
 },

 async migrateLegacyIndexedDB(onProgress) {
  const client = dataApi._requireClient();
  const preview = await this.previewLegacyIndexedDB();
  const report = { total: 0, uploaded: 0, verified: 0, skipped: 0, failed: 0, totalBytes: 0, errors: [] };

  for (const item of preview.items) {
   if (item.status !== 'pending' || !item.hasBlob || !item.hopId) {
    report.skipped++;
    continue;
   }
   report.total++;
   try {
    const blob = await _legacyGetBlob(item.id);
    if (!blob) throw new Error('Không đọc được nội dung Blob từ IndexedDB.');
    const fileObj = blob.name ? blob : new File([blob], item.ten, { type: item.kieu || 'application/octet-stream' });
    const { mime } = this.validateFile(fileObj);
    const storagePath = this.buildObjectPath(item.hopId, item.ten);

    const upRes = await client.storage.from(STORAGE_BUCKET).upload(storagePath, fileObj, {
     contentType: mime || 'application/octet-stream',
     upsert: false
    });
    if (upRes.error) throw upRes.error;
    report.uploaded++;

    const dlRes = await client.storage.from(STORAGE_BUCKET).download(storagePath);
    if (dlRes.error || !dlRes.data) {
     await client.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => {});
     throw new Error('Không kiểm chứng lại được tệp vừa tải lên Storage.');
    }
    const remoteHash = await this.sha256Hex(dlRes.data);
    if (remoteHash !== item.checksum || Number(dlRes.data.size) !== Number(item.co)) {
     await client.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => {});
     throw new Error('Sai lệch dung lượng hoặc SHA-256 sau khi tải lên Storage.');
    }

    const updRes = await client.from('tep_tin')
     .update({ storage_path: storagePath, checksum_sha256: item.checksum, co: item.co, loai: mime || item.kieu || '' })
     .eq('id', item.id)
     .select()
     .single();
    if (updRes.error || !updRes.data) {
     await client.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => {});
     throw new Error(updRes.error ? updRes.error.message : 'Không cập nhật được metadata tep_tin.');
    }

    const hop = DB.hop.find(x => x.id === item.hopId);
    const meta = hop && hop.tep ? hop.tep.find(t => t.id === item.id) : null;
    if (meta) {
     meta.storagePath = storagePath;
     meta.checksum = item.checksum;
    }
    report.verified++;
    report.totalBytes += item.co;
    if (typeof onProgress === 'function') onProgress(item, 'ok');
   } catch (err) {
    report.failed++;
    report.errors.push(`${item.ten}: ${err.message || err}`);
    if (typeof onProgress === 'function') onProgress(item, 'error', err);
   }
  }
  return report;
 }
};

/* Giữ tên hàm tương thích hướng về Supabase Storage (không dùng IndexedDB cho thao tác mới) */
const luuTep = (hopId, file) => storageApi.uploadHopFile(hopId, file);
const layTep = meta => storageApi.downloadBlob(meta);
const xoaTepKho = (hopId, id) => storageApi.deleteHopFile(hopId, id);

/* ===================== DATA ADAPTER LAYER (SUPABASE SERVER-TRUTH + REALTIME) ===================== */
const REALTIME_TABLES = ['chi_doan', 'nhan_su', 'ke_hoach', 'moc_cong_tac', 'bao_cao', 'hoat_dong', 'doan_vien', 'sinh_hoat', 'diem_danh', 'tep_tin'];

const dataApi = {
 _sessionEpoch: 0,
 _rtChannel: null,
 _rtDirtyTables: new Set(),
 _rtTimer: null,
 _rtReconnectTimer: null,
 _rtRetry: 0,

 bumpSessionEpoch() {
  this._sessionEpoch += 1;
  return this._sessionEpoch;
 },

 _requireClient() {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   throw new Error('Chưa kết nối máy chủ Supabase. Không thể ghi hoặc đọc dữ liệu.');
  }
  return client;
 },

 async _fetchAllRows(client, table, orderCols = ['id'], pageSize = 1000) {
  const all = [];
  let from = 0;
  while (true) {
   let q = client.from(table).select('*');
   for (const col of orderCols) {
    q = q.order(col, { ascending: true });
   }
   q = q.range(from, from + pageSize - 1);
   const res = await q;
   if (res.error) throw new Error(`Lỗi tải bảng ${table}: ${res.error.message}`);
   const batch = res.data || [];
   all.push(...batch);
   if (batch.length < pageSize) break;
   from += pageSize;
  }
  return all;
 },

 _mapCD: c => ({
  id: c.id, ma: c.ma, ten: c.ten, nganh: c.nganh || '', siSo: c.si_so || 0,
  bt: c.bt || '', sdt: c.sdt || '', diemTru: c.diem_tru || 0,
  updatedAt: c.updated_at || null, _persisted: true
 }),
 _mapNS: u => ({
  id: u.id, ten: u.ten, vaiTro: u.vai_tro, ban: u.ban, lop: u.lop || '',
  sdt: u.sdt || '', mssv: u.mssv || '', fb: u.fb || '', bch: u.bch || 0,
  nhom: u.nhom || 'bcm', theoDoi: u.theo_doi || [],
  updatedAt: u.updated_at || null, _persisted: true
 }),
 _mapMoc: m => ({
  id: m.id, khId: m.kh_id, ten: m.ten, han: m.han, nsId: m.ns_id || 0,
  xong: !!m.xong, updatedAt: m.updated_at || null, _persisted: true
 }),
 _mapKH: (k, mocs) => ({
  id: k.id, ma: k.ma, ten: k.ten, crit: k.crit, ban: k.ban || [],
  ptIds: k.pt_ids || [], ptId: k.pt_id || (k.pt_ids && k.pt_ids[0]) || null,
  batDau: k.bat_dau, hanChot: k.han_chot, hienThi: k.hien_thi || '',
  tienDo: k.tien_do || 'chua', diem: Number(k.diem) || 0,
  chiTieu: k.chi_tieu || 0, donVi: k.don_vi || 'n', batBuoc: !!k.bat_buoc,
  ketQua: k.ket_qua || '', mc: k.mc || '', note: k.note || '',
  updatedAt: k.updated_at || null, _persisted: true,
  lich: (mocs || []).filter(m => m.kh_id === k.id).map(m => dataApi._mapMoc(m))
 }),
 _mapBC: b => ({
  id: b.id, khId: b.kh_id, cdId: b.cd_id, soLuot: b.so_luot,
  ngayNop: b.ngay_nop, treHan: !!b.tre_han, mc: b.mc || '',
  status: b.status || 'wait', nx: b.nx || '',
  updatedAt: b.updated_at || null, _persisted: true
 }),
 _mapHD: h => ({
  id: h.id, cdId: h.cd_id, crit: h.crit, ten: h.ten, ngay: h.ngay,
  sl: h.sl || 0, diem: Number(h.diem) || 0, status: h.status || 'wait',
  mc: h.mc || '', updatedAt: h.updated_at || null, _persisted: true
 }),
 _mapDV: d => ({
  id: d.id, cdId: d.cd_id, ten: d.ten, mssv: d.mssv,
  cv: d.cv || 'Đoàn viên', drl: d.drl || 0, doanPhi: !!d.doan_phi,
  soHD: d.so_hd || 0, ghiChu: d.ghi_chu || '',
  updatedAt: d.updated_at || null, _persisted: true
 }),
 _mapTep: t => ({
  id: t.id, hopId: t.hop_id, ten: t.ten, loai: t.loai || '', kieu: t.loai || '',
  co: Number(t.co) || 0, storagePath: t.storage_path || '',
  checksum: t.checksum_sha256 || '', taiLuc: (t.created_at || '').slice(0, 10),
  updatedAt: t.updated_at || null, _persisted: true
 }),
 _mapHop: (h, teps) => ({
  id: h.id, ten: h.ten, ngay: h.ngay, noiDung: h.noi_dung || '',
  bienBan: h.bien_ban || '', updatedAt: h.updated_at || null, _persisted: true,
  tep: (teps || []).filter(t => t.hop_id === h.id).map(t => dataApi._mapTep(t))
 }),
 _mapDD: d => ({
  hopId: d.hop_id, nsId: d.ns_id, co: !!d.co, muon: !!d.muon,
  updatedAt: d.updated_at || null
 }),

 async loadAll() {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) return;
  const epoch = this._sessionEpoch;

  const [cdRows, nsRows, khRows, mocRows, bcRows, hdRows, dvRows, hopRows, ddRows, tepRows] = await Promise.all([
   this._fetchAllRows(client, 'chi_doan', ['id']),
   this._fetchAllRows(client, 'nhan_su', ['id']),
   this._fetchAllRows(client, 'ke_hoach', ['id']),
   this._fetchAllRows(client, 'moc_cong_tac', ['id']),
   this._fetchAllRows(client, 'bao_cao', ['id']),
   this._fetchAllRows(client, 'hoat_dong', ['id']),
   this._fetchAllRows(client, 'doan_vien', ['id']),
   this._fetchAllRows(client, 'sinh_hoat', ['id']),
   this._fetchAllRows(client, 'diem_danh', ['hop_id', 'ns_id']),
   this._fetchAllRows(client, 'tep_tin', ['created_at', 'id'])
  ]);

  if (epoch !== this._sessionEpoch) return;

  DB = {
   cd: cdRows.map(c => this._mapCD(c)),
   ns: nsRows.map(u => this._mapNS(u)),
   kh: khRows.map(k => this._mapKH(k, mocRows)),
   hop: hopRows.map(h => this._mapHop(h, tepRows)),
   dd: ddRows.map(d => this._mapDD(d)),
   bc: bcRows.map(b => this._mapBC(b)),
   hd: hdRows.map(h => this._mapHD(h)),
   dv: dvRows.map(d => this._mapDV(d))
  };
 },

 async refetchTable(tableName) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) return;
  const epoch = this._sessionEpoch;

  if (tableName === 'chi_doan') {
   const rows = await this._fetchAllRows(client, 'chi_doan', ['id']);
   if (epoch === this._sessionEpoch) DB.cd = rows.map(c => this._mapCD(c));
  } else if (tableName === 'nhan_su') {
   const rows = await this._fetchAllRows(client, 'nhan_su', ['id']);
   if (epoch === this._sessionEpoch) DB.ns = rows.map(u => this._mapNS(u));
  } else if (tableName === 'ke_hoach' || tableName === 'moc_cong_tac') {
   const [khRows, mocRows] = await Promise.all([
    this._fetchAllRows(client, 'ke_hoach', ['id']),
    this._fetchAllRows(client, 'moc_cong_tac', ['id'])
   ]);
   if (epoch === this._sessionEpoch) DB.kh = khRows.map(k => this._mapKH(k, mocRows));
  } else if (tableName === 'bao_cao') {
   const rows = await this._fetchAllRows(client, 'bao_cao', ['id']);
   if (epoch === this._sessionEpoch) DB.bc = rows.map(b => this._mapBC(b));
  } else if (tableName === 'hoat_dong') {
   const rows = await this._fetchAllRows(client, 'hoat_dong', ['id']);
   if (epoch === this._sessionEpoch) DB.hd = rows.map(h => this._mapHD(h));
  } else if (tableName === 'doan_vien') {
   const rows = await this._fetchAllRows(client, 'doan_vien', ['id']);
   if (epoch === this._sessionEpoch) DB.dv = rows.map(d => this._mapDV(d));
  } else if (tableName === 'sinh_hoat' || tableName === 'tep_tin') {
   const [hopRows, tepRows] = await Promise.all([
    this._fetchAllRows(client, 'sinh_hoat', ['id']),
    this._fetchAllRows(client, 'tep_tin', ['created_at', 'id'])
   ]);
   if (epoch === this._sessionEpoch) DB.hop = hopRows.map(h => this._mapHop(h, tepRows));
  } else if (tableName === 'diem_danh') {
   const rows = await this._fetchAllRows(client, 'diem_danh', ['hop_id', 'ns_id']);
   if (epoch === this._sessionEpoch) DB.dd = rows.map(d => this._mapDD(d));
  }
 },

 startRealtime() {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client || typeof client.channel !== 'function') return;
  this.stopRealtime();

  const epoch = this._sessionEpoch;
  const channel = client.channel(`lcdkhud-sync-${epoch}`);
  this._rtChannel = channel;

  for (const tbl of REALTIME_TABLES) {
   channel.on('postgres_changes', { event: '*', schema: 'public', table: tbl }, payload => {
    if (epoch !== this._sessionEpoch) return;
    this._rtDirtyTables.add((payload && payload.table) || tbl);
    if (!this._rtTimer) {
     this._rtTimer = setTimeout(async () => {
      this._rtTimer = null;
      if (epoch !== this._sessionEpoch) return;
      const dirty = Array.from(this._rtDirtyTables);
      this._rtDirtyTables.clear();
      // Gộp các bảng có quan hệ cha-con để không refetch trùng
      const dedup = new Set();
      for (const t of dirty) {
       if (t === 'moc_cong_tac') dedup.add('ke_hoach');
       else if (t === 'tep_tin') dedup.add('sinh_hoat');
       else dedup.add(t);
      }
      try {
       await Promise.all(Array.from(dedup).map(t => this.refetchTable(t)));
       if (epoch === this._sessionEpoch && typeof render === 'function') {
        render();
       }
      } catch (err) {
       console.error('Lỗi đồng bộ Realtime:', err);
      }
     }, 250);
    }
   });
  }

  channel.subscribe(status => {
   if (epoch !== this._sessionEpoch) return;
   if (status === 'SUBSCRIBED') {
    const wasRetry = this._rtRetry > 0;
    this._rtRetry = 0;
    if (wasRetry) {
     this.loadAll().then(() => {
      if (epoch === this._sessionEpoch && typeof render === 'function') render();
     }).catch(e => console.error('Lỗi tải lại sau reconnect Realtime:', e));
    }
   } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
    if (!this._rtReconnectTimer) {
     const delay = Math.min(30000, 2000 * Math.pow(2, this._rtRetry++));
     this._rtReconnectTimer = setTimeout(() => {
      this._rtReconnectTimer = null;
      if (epoch === this._sessionEpoch && typeof auth !== 'undefined' && auth.currentUser) {
       this.startRealtime();
      }
     }, delay);
    }
   }
  });
 },

 stopRealtime() {
  if (this._rtTimer) { clearTimeout(this._rtTimer); this._rtTimer = null; }
  if (this._rtReconnectTimer) { clearTimeout(this._rtReconnectTimer); this._rtReconnectTimer = null; }
  this._rtDirtyTables.clear();
  this._rtRetry = 0;
  const ch = this._rtChannel;
  this._rtChannel = null;
  if (ch) {
   const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
   try {
    if (client && typeof client.removeChannel === 'function') client.removeChannel(ch);
    else if (typeof ch.unsubscribe === 'function') ch.unsubscribe();
   } catch (e) {}
  }
 },

 async _persistRecord(table, rec, payload, opts = {}) {
  const client = this._requireClient();
  const epoch = this._sessionEpoch;
  const isUpdate = opts.isUpdate !== undefined
   ? Boolean(opts.isUpdate)
   : Boolean(rec._persisted || (opts.isNew === false));

  let res;
  if (isUpdate) {
   if (!rec.id) throw new Error('Thiếu ID bản ghi để cập nhật.');
   let q = client.from(table).update(payload).eq('id', rec.id);
   if (rec.updatedAt && !opts.forceOverwrite) {
    q = q.eq('updated_at', rec.updatedAt);
   }
   res = await q.select();
  } else {
   res = await client.from(table).insert(payload).select();
  }

  if (res.error) throw res.error;
  if (!res.data || res.data.length === 0) {
   if (isUpdate) {
    const chk = await client.from(table).select('id, updated_at').eq('id', rec.id).maybeSingle();
    if (chk.error) throw chk.error;
    if (chk.data && rec.updatedAt && chk.data.updated_at !== rec.updatedAt) {
     await this.refetchTable(table).catch(() => {});
     const err = new Error('Xung đột dữ liệu: bản ghi đã được người khác cập nhật trước đó. Hệ thống đã tải lại bản mới nhất.');
     err.code = 'CONFLICT_UPDATED_AT';
     throw err;
    }
    throw new Error('Cập nhật thất bại: 0 dòng bị ảnh hưởng (không có quyền hoặc bản ghi không tồn tại).');
   }
   throw new Error('Tạo mới thất bại: máy chủ không trả về bản ghi đã lưu.');
  }
  if (epoch !== this._sessionEpoch) {
   throw new Error('Phiên đăng nhập đã thay đổi, huỷ ghi dữ liệu cũ.');
  }
  return res.data[0];
 },

 async _deleteRecord(table, id) {
  const client = this._requireClient();
  const res = await client.from(table).delete().eq('id', id).select('id');
  if (res.error) throw res.error;
  if (!res.data || res.data.length === 0) {
   throw new Error('Xoá thất bại: 0 dòng bị ảnh hưởng (không có quyền hoặc bản ghi không tồn tại).');
  }
  return res.data[0];
 },

 async luuBC(b, opts = {}) {
  const payload = {
   kh_id: b.khId,
   cd_id: b.cdId,
   so_luot: b.soLuot,
   ngay_nop: b.ngayNop,
   mc: b.mc,
   status: b.status,
   nx: b.nx
  };
  const row = await this._persistRecord('bao_cao', b, payload, opts);
  const mapped = this._mapBC(row);
  const idx = DB.bc.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.bc[idx] = mapped; else DB.bc.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaBC(id) {
  await this._deleteRecord('bao_cao', id);
  DB.bc = DB.bc.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuHD(h, opts = {}) {
  const payload = {
   cd_id: h.cdId,
   crit: h.crit,
   ten: h.ten,
   ngay: h.ngay,
   sl: h.sl,
   diem: h.diem,
   status: h.status,
   mc: h.mc
  };
  const row = await this._persistRecord('hoat_dong', h, payload, opts);
  const mapped = this._mapHD(row);
  const idx = DB.hd.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.hd[idx] = mapped; else DB.hd.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaHD(id) {
  await this._deleteRecord('hoat_dong', id);
  DB.hd = DB.hd.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuDV(d, opts = {}) {
  const payload = {
   cd_id: d.cdId,
   ten: d.ten,
   mssv: d.mssv,
   cv: d.cv,
   drl: d.drl,
   doan_phi: d.doanPhi,
   so_hd: d.soHD,
   ghi_chu: d.ghiChu
  };
  const row = await this._persistRecord('doan_vien', d, payload, opts);
  const mapped = this._mapDV(row);
  const idx = DB.dv.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.dv[idx] = mapped; else DB.dv.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaDV(id) {
  await this._deleteRecord('doan_vien', id);
  DB.dv = DB.dv.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuKH(k, opts = {}) {
  const isNew = opts.isNew === true || (!k._persisted && opts.isUpdate !== true);
  let ma = k.ma;
  if (!ma) {
   ma = 'KH-TMP-' + Date.now().toString(36).toUpperCase();
  }
  const payload = {
   ma,
   ten: k.ten,
   crit: k.crit,
   ban: k.ban,
   pt_ids: k.ptIds,
   pt_id: k.ptId || null,
   bat_dau: k.batDau,
   han_chot: k.hanChot,
   hien_thi: k.hienThi || '',
   tien_do: k.tienDo || 'chua',
   diem: k.diem || 0,
   chi_tieu: k.chiTieu || 0,
   don_vi: k.donVi || 'n',
   bat_buoc: !!k.batBuoc,
   ket_qua: k.ketQua || '',
   mc: k.mc || '',
   note: k.note || ''
  };
  let row = await this._persistRecord('ke_hoach', k, payload, { ...opts, isUpdate: !isNew });
  if (isNew && !k.ma && row.id) {
   const finalMa = 'KH-' + String(row.id).padStart(2, '0');
   const client = this._requireClient();
   const upd = await client.from('ke_hoach').update({ ma: finalMa }).eq('id', row.id).select();
   if (!upd.error && upd.data && upd.data[0]) row = upd.data[0];
  }
  const existing = DB.kh.find(x => x.id === row.id);
  const mapped = this._mapKH(row, []);
  mapped.lich = existing ? (existing.lich || []) : [];
  const idx = DB.kh.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.kh[idx] = mapped; else DB.kh.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaKH(id) {
  await this._deleteRecord('ke_hoach', id);
  DB.kh = DB.kh.filter(x => x.id !== id);
  DB.bc = DB.bc.filter(x => x.khId !== id);
  return { ok: true };
 },

 async luuMoc(khId, m, opts = {}) {
  const payload = {
   kh_id: Number(khId),
   ten: m.ten,
   han: m.han,
   ns_id: m.nsId && Number(m.nsId) > 0 ? Number(m.nsId) : null,
   xong: !!m.xong
  };
  const row = await this._persistRecord('moc_cong_tac', m, payload, opts);
  const mapped = this._mapMoc(row);
  const k = DB.kh.find(x => x.id === Number(khId));
  if (k) {
   k.lich = k.lich || [];
   const idx = k.lich.findIndex(x => x.id === mapped.id);
   if (idx !== -1) k.lich[idx] = mapped; else k.lich.push(mapped);
  }
  return { ok: true, data: mapped };
 },

 async xoaMoc(khId, mocId) {
  await this._deleteRecord('moc_cong_tac', mocId);
  const k = DB.kh.find(x => x.id === Number(khId));
  if (k && k.lich) k.lich = k.lich.filter(x => x.id !== mocId);
  return { ok: true };
 },

 async luuCD(c, opts = {}) {
  const payload = {
   ma: c.ma,
   ten: c.ten,
   nganh: c.nganh,
   si_so: c.siSo,
   bt: c.bt,
   sdt: c.sdt,
   diem_tru: c.diemTru
  };
  const row = await this._persistRecord('chi_doan', c, payload, opts);
  const mapped = this._mapCD(row);
  const idx = DB.cd.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.cd[idx] = mapped; else DB.cd.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaCD(id) {
  await this._deleteRecord('chi_doan', id);
  DB.cd = DB.cd.filter(x => x.id !== id);
  DB.bc = DB.bc.filter(x => x.cdId !== id);
  DB.hd = DB.hd.filter(x => x.cdId !== id);
  DB.dv = DB.dv.filter(x => x.cdId !== id);
  DB.ns.forEach(u => { u.theoDoi = (u.theoDoi || []).filter(i => i !== id); });
  return { ok: true };
 },

 async luuNS(u, opts = {}) {
  const payload = {
   ten: u.ten,
   vai_tro: u.vaiTro,
   ban: u.ban,
   lop: u.lop,
   sdt: u.sdt,
   mssv: u.mssv,
   fb: u.fb,
   bch: u.bch ? 1 : 0,
   nhom: u.nhom || 'bcm',
   theo_doi: u.theoDoi || []
  };
  const row = await this._persistRecord('nhan_su', u, payload, opts);
  const mapped = this._mapNS(row);
  const idx = DB.ns.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.ns[idx] = mapped; else DB.ns.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaNS(id) {
  await this._deleteRecord('nhan_su', id);
  DB.ns = DB.ns.filter(x => x.id !== id);
  DB.dd = DB.dd.filter(d => d.nsId !== id);
  DB.kh.forEach(k => {
   k.ptIds = (k.ptIds || []).filter(i => i !== id);
   k.ptId = k.ptIds[0] || null;
  });
  return { ok: true };
 },

 async luuHop(h, opts = {}) {
  const payload = {
   ten: h.ten,
   ngay: h.ngay,
   noi_dung: h.noiDung,
   bien_ban: h.bienBan
  };
  const row = await this._persistRecord('sinh_hoat', h, payload, opts);
  const existing = DB.hop.find(x => x.id === row.id);
  const mapped = this._mapHop(row, []);
  mapped.tep = existing ? (existing.tep || []) : [];
  const idx = DB.hop.findIndex(x => x.id === mapped.id);
  if (idx !== -1) DB.hop[idx] = mapped; else DB.hop.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaHop(id) {
  const client = this._requireClient();
  const h = DB.hop.find(x => x.id === id);
  const paths = h && h.tep ? h.tep.map(t => t.storagePath).filter(Boolean) : [];
  await this._deleteRecord('sinh_hoat', id);
  if (paths.length) {
   await client.storage.from(STORAGE_BUCKET).remove(paths).catch(() => {});
  }
  DB.hop = DB.hop.filter(x => x.id !== id);
  DB.dd = DB.dd.filter(d => d.hopId !== id);
  return { ok: true };
 },

 async luuDiemDanh(hopId, nsId, co, muon) {
  const client = this._requireClient();
  const res = await client.from('diem_danh').upsert({
   hop_id: Number(hopId),
   ns_id: Number(nsId),
   co: !!co,
   muon: !!muon
  }, { onConflict: 'hop_id,ns_id' }).select();
  if (res.error) throw res.error;
  if (!res.data || res.data.length === 0) {
   throw new Error('Lưu điểm danh thất bại: 0 dòng bị ảnh hưởng.');
  }
  const mapped = this._mapDD(res.data[0]);
  const idx = DB.dd.findIndex(x => x.hopId === mapped.hopId && x.nsId === mapped.nsId);
  if (idx !== -1) DB.dd[idx] = mapped; else DB.dd.push(mapped);
  return { ok: true, data: mapped };
 },

 async xoaDiemDanh(hopId, nsId) {
  const client = this._requireClient();
  const res = await client.from('diem_danh').delete().match({
   hop_id: Number(hopId),
   ns_id: Number(nsId)
  }).select('hop_id, ns_id');
  if (res.error) throw res.error;
  if (!res.data || res.data.length === 0) {
   throw new Error('Xoá điểm danh thất bại: 0 dòng bị ảnh hưởng.');
  }
  DB.dd = DB.dd.filter(x => !(x.hopId === Number(hopId) && x.nsId === Number(nsId)));
  return { ok: true };
 },

 async luuDiemDanhHangLoat(hopId, mode) {
  const client = this._requireClient();
  const res = await client.rpc('rpc_bulk_set_diem_danh', {
   p_hop_id: Number(hopId),
   p_mode: mode
  });
  if (res.error) throw res.error;
  if (!res.data || !res.data.ok) {
   throw new Error('Thao tác điểm danh hàng loạt không được máy chủ xác nhận.');
  }
  await this.refetchTable('diem_danh');
  return res.data;
 }
};

/* save() chỉ giữ làm ký hiệu tương thích — toàn bộ ghi thật đi qua dataApi */
const save = () => {};

/* ===================== SAO LƯU & PHỤC HỒI AN TOÀN ===================== */

/** Xuất bản sao lưu JSON (CHỈ xuất dữ liệu nghiệp vụ cho người dùng; KHÔNG xuất users, mật khẩu hay secrets) */
function xuatBackupJSON() {
 const backupData = {
  version: '2.4',
  kind: 'user_business_export',
  date: TODAY,
  data: {
   cd: DB.cd || [],
   ns: DB.ns || [],
   kh: DB.kh || [],
   hop: DB.hop || [],
   dd: DB.dd || [],
   bc: DB.bc || [],
   hd: DB.hd || [],
   dv: DB.dv || []
  }
 };

 const json = JSON.stringify(backupData, null, 2);
 const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `lcdkhud_export_${TODAY}.json`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** Phục hồi dữ liệu từ file JSON lên máy chủ Supabase (lập mapping ID cũ→mới cho khóa ngoại) */
function nhapBackupJSON(file) {
 return new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = async e => {
   try {
    const client = dataApi._requireClient();
    const raw = JSON.parse(e.target.result);
    if (!raw || typeof raw !== 'object') {
     return reject(new Error('File không hợp lệ hoặc không có cấu trúc JSON.'));
    }

    const payload = raw.data || raw;
    delete payload.users;
    delete payload.profiles;
    delete payload.auth;

    if (!Array.isArray(payload.cd) || !Array.isArray(payload.kh)) {
     return reject(new Error('File không đúng cấu trúc dữ liệu Sổ tay LCĐ KHUD (thiếu danh sách chi đoàn hoặc kế hoạch).'));
    }

    const isCd = typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.role === 'cd';
    const myCdId = isCd ? auth.currentUser.cdId : null;
    const summary = { cd: 0, ns: 0, kh: 0, moc: 0, hop: 0, dd: 0, bc: 0, hd: 0, dv: 0 };

    const cdMap = new Map();
    const nsMap = new Map();
    const khMap = new Map();
    const hopMap = new Map();

    if (!isCd) {
     for (const c of payload.cd || []) {
      const existing = DB.cd.find(x => x.ma === c.ma);
      const saved = await dataApi.luuCD({ ...existing, ...c, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
      cdMap.set(c.id, saved.data.id);
      summary.cd++;
     }
     for (const u of payload.ns || []) {
      const existing = DB.ns.find(x => (u.mssv && x.mssv === u.mssv) || x.ten === u.ten);
      const mappedTheoDoi = (u.theoDoi || []).map(oldId => cdMap.get(oldId) || oldId).filter(Boolean);
      const saved = await dataApi.luuNS({ ...existing, ...u, theoDoi: mappedTheoDoi, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
      nsMap.set(u.id, saved.data.id);
      summary.ns++;
     }
     for (const k of payload.kh || []) {
      const existing = DB.kh.find(x => x.ma === k.ma);
      const mappedPtIds = (k.ptIds || []).map(oldId => nsMap.get(oldId) || oldId).filter(Boolean);
      const mappedPtId = k.ptId ? (nsMap.get(k.ptId) || k.ptId) : (mappedPtIds[0] || null);
      const saved = await dataApi.luuKH({ ...existing, ...k, ptIds: mappedPtIds, ptId: mappedPtId, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
      khMap.set(k.id, saved.data.id);
      summary.kh++;
      for (const m of k.lich || []) {
       const exK = DB.kh.find(x => x.id === saved.data.id);
       const exM = exK && exK.lich ? exK.lich.find(x => x.ten === m.ten && x.han === m.han) : null;
       await dataApi.luuMoc(saved.data.id, { ...exM, ...m, nsId: m.nsId ? (nsMap.get(m.nsId) || m.nsId) : 0, id: exM ? exM.id : undefined }, { isNew: !exM, forceOverwrite: true });
       summary.moc++;
      }
     }
     for (const h of payload.hop || []) {
      const existing = DB.hop.find(x => x.ngay === h.ngay && x.ten === h.ten);
      const saved = await dataApi.luuHop({ ...existing, ...h, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
      hopMap.set(h.id, saved.data.id);
      summary.hop++;
     }
     for (const d of payload.dd || []) {
      const newHop = hopMap.get(d.hopId);
      const newNs = nsMap.get(d.nsId);
      if (newHop && newNs) {
       await dataApi.luuDiemDanh(newHop, newNs, d.co, d.muon);
       summary.dd++;
      }
     }
    }

    const dvList = isCd ? (payload.dv || []).filter(x => x.cdId === myCdId) : (payload.dv || []);
    for (const d of dvList) {
     const targetCd = isCd ? myCdId : (cdMap.get(d.cdId) || d.cdId);
     const existing = DB.dv.find(x => x.mssv === d.mssv);
     if (isCd && existing && existing.cdId !== myCdId) continue;
     await dataApi.luuDV({ ...existing, ...d, cdId: targetCd, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
     summary.dv++;
    }

    const bcList = isCd ? (payload.bc || []).filter(x => x.cdId === myCdId) : (payload.bc || []);
    for (const b of bcList) {
     const targetCd = isCd ? myCdId : (cdMap.get(b.cdId) || b.cdId);
     const targetKh = khMap.get(b.khId) || b.khId;
     const existing = DB.bc.find(x => x.khId === targetKh && x.cdId === targetCd);
     if (isCd && existing && existing.status === 'ok') continue;
     await dataApi.luuBC({ ...existing, ...b, khId: targetKh, cdId: targetCd, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
     summary.bc++;
    }

    const hdList = isCd ? (payload.hd || []).filter(x => x.cdId === myCdId) : (payload.hd || []);
    for (const h of hdList) {
     const targetCd = isCd ? myCdId : (cdMap.get(h.cdId) || h.cdId);
     const existing = DB.hd.find(x => x.cdId === targetCd && x.ten === h.ten && x.ngay === h.ngay);
     if (isCd && existing && existing.status === 'ok') continue;
     await dataApi.luuHD({ ...existing, ...h, cdId: targetCd, id: existing ? existing.id : undefined }, { isNew: !existing, forceOverwrite: true });
     summary.hd++;
    }

    await dataApi.loadAll();
    resolve({ ok: true, summary, clientReady: Boolean(client) });
   } catch (err) {
    reject(new Error('Lỗi phục hồi lên máy chủ: ' + (err.message || err)));
   }
  };
  r.onerror = () => reject(new Error('Không thể đọc file sao lưu.'));
  r.readAsText(file);
 });
}
