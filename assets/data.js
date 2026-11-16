/* Khung tiêu chí, dữ liệu mẫu và lưu trữ cục bộ. */
/* ===================== KHUNG TIÊU CHÍ ===================== */
const TODAY=new Date().toISOString().slice(0,10); // ngày thật của máy, dữ liệu mẫu neo quanh tháng 10/2026
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
const TRE_PHAT=0.8; // nộp sau hạn chót chỉ còn 80% điểm

/* ===================== DỮ LIỆU MẪU ===================== */
/* Cơ cấu lấy theo file CHECKLIST CÔNG TÁC VÀ ĐÁNH GIÁ LCĐ KHUD (nhiệm kỳ 25–27):
   nhân sự theo ban chuyên môn · công tác theo timeline · sinh hoạt hàng tuần · điểm danh. */
const BAN=['Thường trực','Ban Phong trào','Ban Tình nguyện','Ban Tài chính – Hậu cần','Ban Truyền thông','Ban Tổ chức – Kiểm tra','Ban Học tập & NCKH'];
const VAITRO=['Bí thư','Phó Bí thư','UV BTV','UV BCH','Trưởng ban','Phó ban','Thành viên'];
const NHOM=[['bch','Ban Chấp hành Liên chi đoàn'],['bcm','Ban chuyên môn'],['nguon','Key 2k7 — cán bộ nguồn']];
const tenNhom=n=>(NHOM.find(x=>x[0]===n)||NHOM[1])[1];
const TIENDO={chua:['Chưa triển khai','p-mute'],dang:['Đang triển khai','p-xs'],xong:['Hoàn thành','p-good']};
const VANG_CANH_BAO=3; // nghỉ từ 3 buổi sinh hoạt sẽ bị xem xét theo quy định của LCĐ

/* Lịch công tác: các mốc nhỏ của từng đầu việc — [tên mốc, hạn, người phụ trách, đã xong] */
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
 /* Chi đoàn trực thuộc = chi đoàn theo lớp */
 const cd=[
  {id:1,ma:'MIS2022B',ten:'Chi đoàn MIS2022B',nganh:'MIS · K2022',siSo:62,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:2,ma:'MIS2023A',ten:'Chi đoàn MIS2023A',nganh:'MIS · K2023',siSo:58,bt:'(chưa cập nhật)',sdt:'',diemTru:2},
  {id:3,ma:'BDA2023A',ten:'Chi đoàn BDA2023A',nganh:'BDA · K2023',siSo:55,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:4,ma:'FDB2023B',ten:'Chi đoàn FDB2023B',nganh:'FDB · K2023',siSo:49,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:5,ma:'MIS2024B',ten:'Chi đoàn MIS2024B',nganh:'MIS · K2024',siSo:64,bt:'(chưa cập nhật)',sdt:'',diemTru:4},
  {id:6,ma:'BDA2024A',ten:'Chi đoàn BDA2024A',nganh:'BDA · K2024',siSo:71,bt:'(chưa cập nhật)',sdt:'',diemTru:0},
  {id:7,ma:'BDA2025A',ten:'Chi đoàn BDA2025A',nganh:'BDA · K2025',siSo:78,bt:'(chưa cập nhật)',sdt:'',diemTru:1},
 ];
 /* Nhân sự Liên chi đoàn theo ban chuyên môn. SĐT / MSSV / Facebook để trống —
    nhập thẳng từ sheet "DS NHÂN SỰ" ở trang Nhập / xuất Excel. */
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

 /* Công tác theo timeline: hoạt động có chỉ tiêu được chấm KPI chi đoàn,
    hoạt động chỉ tiêu 0 là việc nội bộ LCĐ — chỉ theo dõi tiến độ. */
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
 ].map((k,i)=>({id:i+1,lich:(LICH[k.ma]||[]).map((m,j)=>({id:j+1,ten:m[0],han:m[1],nsId:m[2],xong:!!m[3]})),...k,batBuoc:!!k.batBuoc,ptId:k.ptIds[0],mc:k.tienDo==='xong'?'drive.google.com/'+k.ma.toLowerCase():'',note:''}));

 /* Sinh hoạt Liên chi đoàn + điểm danh */
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

 /* Đoàn viên các chi đoàn */
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

 /* Báo cáo của chi đoàn cho các hoạt động có giao chỉ tiêu */
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
     mc:'drive.google.com/'+k.ma.toLowerCase()+'-'+c.ma.toLowerCase(),status:st,
     nx:st==='no'?'Minh chứng chưa đủ, đề nghị bổ sung ảnh và danh sách ký tên.':''});
  });
 });
 /* Hoạt động do chi đoàn tự tổ chức */
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
 ].map((h,i)=>({id:i+1,cdId:h[0],crit:h[1],ten:h[2],ngay:h[3],sl:h[4],diem:h[5],status:h[6],mc:'drive.google.com/hd-'+(i+1)}));

 const users = seedDefaultUsers(cd);
 return {cd,ns,kh,hop,dd,bc,hd,dv,users};
}

/** Danh mục tất cả quyền hạn có thể phân quyền trong hệ thống */
const DANH_SACH_QUYEN = [
 { id: 'xem_tongquan', ma: 'TỔNG QUAN', ten: 'Xem Tổng quan & Xếp hạng', nhom: 'Chung', desc: 'Xem trang tổng quan, ma trận tiến độ và bảng xếp hạng thi đua' },
 { id: 'duyet_bc',     ma: 'DUYỆT BC',   ten: 'Duyệt báo cáo & Chấm KPI', nhom: 'Nghiệp vụ LCĐ', desc: 'Thẩm định hồ sơ, minh chứng Google Drive/ảnh, duyệt hoặc trả lại' },
 { id: 'ql_kh',        ma: 'KẾ HOẠCH',   ten: 'Quản lý Hoạt động & Chỉ tiêu', nhom: 'Nghiệp vụ LCĐ', desc: 'Thêm, sửa công tác theo timeline, giao chỉ tiêu cho các chi đoàn' },
 { id: 'ql_nhansu',    ma: 'NHÂN SỰ',    ten: 'Quản lý Nhân sự & Điểm danh', nhom: 'Nghiệp vụ LCĐ', desc: 'Quản lý BCH LCĐ, phân công nhiệm vụ và điểm danh sinh hoạt' },
 { id: 'nop_bc',       ma: 'NỘP BC',     ten: 'Nộp báo cáo & Minh chứng', nhom: 'Chi đoàn', desc: 'Chi đoàn gửi link minh chứng, số liệu tham gia cho hoạt động được giao' },
 { id: 'tuchuc_hd',    ma: 'TỰ TỔ CHỨC', ten: 'Đăng ký Hoạt động tự tổ chức', nhom: 'Chi đoàn', desc: 'Khai báo các hoạt động do Chi đoàn lớp tự tổ chức' },
 { id: 'ql_doanvien',  ma: 'ĐOÀN VIÊN',  ten: 'Quản lý Đoàn viên & Đoàn phí', nhom: 'Chi đoàn', desc: 'Quản lý danh sách sinh viên lớp, điểm rèn luyện và đóng đoàn phí' },
 { id: 'nhap_excel',   ma: 'EXCEL',      ten: 'Nhập / Xuất dữ liệu Excel', nhom: 'Dữ liệu', desc: 'Nhập xuất danh sách sinh viên, nhân sự, đoàn phí bằng Excel' },
 { id: 'ql_csdl',      ma: 'CSDL DATA',  ten: 'Quản lý Dữ liệu & Backup', nhom: 'Hệ thống', desc: 'Sao lưu, phục hồi file JSON, khởi tạo dữ liệu thật / demo' },
 { id: 'ql_user',      ma: 'PHÂN QUYỀN', ten: 'Phân quyền & Quản trị User', nhom: 'Hệ thống', desc: 'Tạo tài khoản, tích chọn phân quyền và khóa/mở khóa tài khoản' },
];

const QUYEN_THEO_VAI_TRO = {
 admin: DANH_SACH_QUYEN.map(q => q.id),
 lcd:   ['xem_tongquan', 'duyet_bc', 'ql_kh', 'ql_nhansu', 'nhap_excel', 'ql_csdl', 'ql_user'],
 cd:    ['xem_tongquan', 'nop_bc', 'tuchuc_hd', 'ql_doanvien', 'nhap_excel'],
 bbt:   ['xem_tongquan', 'nhap_excel']
};

/** Danh sách tài khoản mặc định phân quyền cho hệ thống */
function seedDefaultUsers(cdList=[]){
 const defaultUsers = [
  {id:1, username:'admin', password:'admin123', ten:'Quản trị viên hệ thống', role:'admin', cdId:null, email:'admin@is.vnu.edu.vn', sdt:'0988888888', active:true, ngayTao:'2026-01-01', lanCuoi:'', quyen:[...QUYEN_THEO_VAI_TRO.admin]},
  {id:2, username:'bch.lcd', password:'lcd123', ten:'BCH Liên chi đoàn KHUD', role:'lcd', cdId:null, email:'lcd.khud@is.vnu.edu.vn', sdt:'0966666666', active:true, ngayTao:'2026-01-01', lanCuoi:'', quyen:[...QUYEN_THEO_VAI_TRO.lcd]},
 ];
 let nextUid = 3;
 (cdList||[]).forEach(c=>{
  const uName = 'cd_' + String(c.ma||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  defaultUsers.push({
   id: nextUid++,
   username: uName,
   password: 'cd123',
   ten: 'BCH ' + (c.ten||c.ma),
   role: 'cd',
   cdId: c.id,
   email: '',
   sdt: c.sdt||'',
   active: true,
   ngayTao: '2026-01-01',
   lanCuoi: '',
   quyen: [...QUYEN_THEO_VAI_TRO.cd]
  });
 });
 return defaultUsers;
}
const dayAdd=(d,n)=>{const t=new Date(d+'T00:00:00');t.setDate(t.getDate()+n);return t.toISOString().slice(0,10)};
const dmy=d=>d?d.slice(8,10)+'/'+d.slice(5,7)+(d.slice(0,4)!=='2026'?'/'+d.slice(2,4):''):'–';
const chiTieuSo=(k,c)=>k.donVi==='%'?Math.round(c.siSo*k.chiTieu/100):k.chiTieu;

/** Tính khoảng cách (số ngày) từ hoạt động đến mốc ngày today (mặc định TODAY) */
function khoangCachNgayKH(k, today = TODAY){
 const bd = k.batDau || today;
 const hc = k.hanChot || bd;
 if (bd <= today && today <= hc) return 0; // Đang diễn ra trong khoảng thời gian này
 const tNow = new Date(today + 'T00:00:00').getTime();
 if (today < bd) {
  return Math.round(Math.abs(new Date(bd + 'T00:00:00').getTime() - tNow) / 86400000);
 }
 return Math.round(Math.abs(tNow - new Date(hc + 'T00:00:00').getTime()) / 86400000);
}

/** So sánh thứ tự giữa 2 hoạt động theo tiêu chí sắp xếp */
function soSanhKH(a, b, kieu = 'near', today = TODAY){
 if(kieu === 'near'){
  const ca = khoangCachNgayKH(a, today);
  const cb = khoangCachNgayKH(b, today);
  if(ca !== cb) return ca - cb; // Càng gần ngày bây giờ càng lên đầu
  // Nếu khoảng cách bằng nhau: việc chưa xong ưu tiên hơn việc đã xong
  if(a.tienDo === 'xong' && b.tienDo !== 'xong') return 1;
  if(b.tienDo === 'xong' && a.tienDo !== 'xong') return -1;
  // Ưu tiên việc đang/sắp diễn ra trước việc đã kết thúc
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


/* ===================== LƯU TRỮ ===================== */
const KEY='lcdkhud.v2';
let DB;
try{DB=JSON.parse(localStorage.getItem(KEY))||seed()}catch(e){DB=seed()}
if(!DB.users || !Array.isArray(DB.users) || DB.users.length === 0){
 DB.users = seedDefaultUsers(DB.cd || []);
 try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}
} else {
 // Đảm bảo toàn bộ user đều có mảng quyen
 let changed = false;
 DB.users.forEach(u => {
  if(!u.quyen || !Array.isArray(u.quyen)){
   u.quyen = [...(QUYEN_THEO_VAI_TRO[u.role] || QUYEN_THEO_VAI_TRO.cd)];
   changed = true;
  }
 });
 if(changed) try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}
}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}};
/* Kho tệp đính kèm: thông tin tệp nằm cùng dữ liệu, nội dung tệp nằm trong IndexedDB
   của trình duyệt (chứa được hàng trăm MB, không giới hạn 5MB như localStorage). */
const TEP_KHO='lcdkhud-tep';
const moKho=()=>new Promise((ok,loi)=>{
 const r=indexedDB.open(TEP_KHO,1);
 r.onupgradeneeded=()=>r.result.createObjectStore('tep');
 r.onsuccess=()=>ok(r.result);r.onerror=()=>loi(r.error);
});
const luuTep=(id,blob)=>moKho().then(db=>new Promise((ok,loi)=>{
 const t=db.transaction('tep','readwrite');t.objectStore('tep').put(blob,id);
 t.oncomplete=()=>ok();t.onerror=()=>loi(t.error);
}));
const layTep=id=>moKho().then(db=>new Promise((ok,loi)=>{
 const r=db.transaction('tep','readonly').objectStore('tep').get(id);
 r.onsuccess=()=>ok(r.result);r.onerror=()=>loi(r.error);
}));
const xoaTepKho=id=>moKho().then(db=>new Promise(ok=>{
 const t=db.transaction('tep','readwrite');t.objectStore('tep').delete(id);t.oncomplete=()=>ok();
}));
/** 1536000 -> "1,5 MB" */
const coTep=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1).replace('.',',')+' MB';
const idTep=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const TEP_TOI_DA=25*1048576;

const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const nextId=a=>(a&&a.length)?a.reduce((m,x)=>Math.max(m,x.id||0),0)+1:1;

/** Chuẩn hóa link để luôn mở được trong tab mới */
const chuanHoaLink=u=>{
 if(!u||u==='(chưa có)'||u==='–') return '';
 const s=String(u).trim();
 if(s.startsWith('http://')||s.startsWith('https://')) return s;
 return 'https://'+s;
};

/** Khởi tạo dữ liệu thật hoặc khôi phục mẫu */
function khoiTaoDataThat(cheDo='giu-khung'){
 if(cheDo==='demo'){
  DB=seed();
 } else if(cheDo==='giu-khung'){
  // Giữ danh sách chi đoàn, nhân sự LCĐ & tài khoản người dùng hiện tại, xóa toàn bộ hoạt động, báo cáo, điểm danh, đoàn viên
  const cdCu = (DB.cd && DB.cd.length) ? DB.cd.map(c=>({...c, diemTru:0})) : seed().cd;
  const nsCu = (DB.ns && DB.ns.length) ? DB.ns : seed().ns;
  const usersCu = (DB.users && DB.users.length) ? DB.users : seedDefaultUsers(cdCu);
  DB={
   cd: cdCu,
   ns: nsCu,
   users: usersCu,
   kh: [],
   hop: [],
   dd: [],
   bc: [],
   hd: [],
   dv: []
  };
 } else if(cheDo==='trang-tinh'){
  // Trắng tinh vẫn bảo toàn tài khoản quản trị để không bị khoá ngoài hệ thống
  const adminUsers = (DB.users && DB.users.length) 
   ? DB.users.filter(u=>u.role==='admin'||u.role==='lcd') 
   : [
      {id:1, username:'admin', password:'admin123', ten:'Quản trị viên hệ thống', role:'admin', cdId:null, email:'admin@is.vnu.edu.vn', sdt:'0988888888', active:true, ngayTao:TODAY, lanCuoi:''}
     ];
  DB={cd:[], ns:[], users:adminUsers, kh:[], hop:[], dd:[], bc:[], hd:[], dv:[]};
 }
 save();
}

/** Xuất toàn bộ CSDL ra file JSON backup */
function xuatBackupJSON(){
 const json=JSON.stringify(DB,null,2);
 const blob=new Blob([json],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;
 a.download=`lcdkhud_backup_${TODAY}.json`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}

/** Nhập toàn bộ CSDL từ file JSON backup */
function nhapBackupJSON(file){
 return new Promise((resolve,reject)=>{
  const r=new FileReader();
  r.onload=e=>{
   try{
    const d=JSON.parse(e.target.result);
    if(!d||typeof d!=='object'||!Array.isArray(d.cd)||!Array.isArray(d.kh)){
     return reject(new Error('File không đúng cấu trúc dữ liệu Sổ tay LCĐ KHUD.'));
    }
    if(!d.users || !Array.isArray(d.users) || d.users.length === 0){
     d.users = seedDefaultUsers(d.cd || []);
    }
    DB=d;
    save();
    resolve(d);
   }catch(err){
    reject(new Error('File JSON bị lỗi cú pháp: '+err.message));
   }
  };
  r.onerror=()=>reject(new Error('Không thể đọc file.'));
  r.readAsText(file);
 });
}
