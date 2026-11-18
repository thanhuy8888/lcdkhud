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

/* Kho tệp đính kèm IndexedDB */
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
const coTep=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1).replace('.',',')+' MB';
const idTep=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const TEP_TOI_DA=25*1048576;

/* ===================== DATA ADAPTER LAYER (SUPABASE + MEMORY) ===================== */

const dataApi = {
 async loadAll() {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   // Khi chưa kết nối máy chủ Supabase: giữ DB rỗng, không tự động fallback seed
   return;
  }

  try {
   const [resCd, resNs, resKh, resMoc, resBc, resHd, resDv, resHop, resDd, resTep] = await Promise.all([
    client.from('chi_doan').select('*').order('id'),
    client.from('nhan_su').select('*').order('id'),
    client.from('ke_hoach').select('*').order('id'),
    client.from('moc_cong_tac').select('*').order('id'),
    client.from('bao_cao').select('*').order('id'),
    client.from('hoat_dong').select('*').order('id'),
    client.from('doan_vien').select('*').order('id'),
    client.from('sinh_hoat').select('*').order('id'),
    client.from('diem_danh').select('*'),
    client.from('tep_tin').select('*').order('created_at')
   ]);

   if (resCd.error) throw resCd.error;
   if (resNs.error) throw resNs.error;
   if (resKh.error) throw resKh.error;

   const cd = (resCd.data || []).map(c => ({
    id: c.id,
    ma: c.ma,
    ten: c.ten,
    nganh: c.nganh || '',
    siSo: c.si_so || 0,
    bt: c.bt || '',
    sdt: c.sdt || '',
    diemTru: c.diem_tru || 0
   }));

   const ns = (resNs.data || []).map(u => ({
    id: u.id,
    ten: u.ten,
    vaiTro: u.vai_tro,
    ban: u.ban,
    lop: u.lop || '',
    sdt: u.sdt || '',
    mssv: u.mssv || '',
    fb: u.fb || '',
    bch: u.bch || 0,
    nhom: u.nhom || 'bcm',
    theoDoi: u.theo_doi || []
   }));

   const mocs = resMoc.data || [];
   const kh = (resKh.data || []).map(k => ({
    id: k.id,
    ma: k.ma,
    ten: k.ten,
    crit: k.crit,
    ban: k.ban || [],
    ptIds: k.pt_ids || [],
    ptId: k.pt_id || (k.pt_ids && k.pt_ids[0]) || null,
    batDau: k.bat_dau,
    hanChot: k.han_chot,
    hienThi: k.hien_thi || '',
    tienDo: k.tien_do || 'chua',
    diem: Number(k.diem) || 0,
    chiTieu: k.chi_tieu || 0,
    donVi: k.don_vi || 'n',
    batBuoc: !!k.bat_buoc,
    ketQua: k.ket_qua || '',
    mc: k.mc || '',
    note: k.note || '',
    lich: mocs.filter(m => m.kh_id === k.id).map(m => ({
     id: m.id,
     ten: m.ten,
     han: m.han,
     nsId: m.ns_id,
     xong: !!m.xong
    }))
   }));

   const bc = (resBc.data || []).map(b => ({
    id: b.id,
    khId: b.kh_id,
    cdId: b.cd_id,
    soLuot: b.so_luot,
    ngayNop: b.ngay_nop,
    treHan: !!b.tre_han,
    mc: b.mc || '',
    status: b.status || 'wait',
    nx: b.nx || ''
   }));

   const hd = (resHd.data || []).map(h => ({
    id: h.id,
    cdId: h.cd_id,
    crit: h.crit,
    ten: h.ten,
    ngay: h.ngay,
    sl: h.sl || 0,
    diem: Number(h.diem) || 0,
    status: h.status || 'wait',
    mc: h.mc || ''
   }));

   const dv = (resDv.data || []).map(d => ({
    id: d.id,
    cdId: d.cd_id,
    ten: d.ten,
    mssv: d.mssv,
    cv: d.cv || 'Đoàn viên',
    drl: d.drl || 0,
    doanPhi: !!d.doan_phi,
    soHD: d.so_hd || 0,
    ghiChu: d.ghi_chu || ''
   }));

   const teps = resTep.data || [];
   const hop = (resHop.data || []).map(h => ({
    id: h.id,
    ten: h.ten,
    ngay: h.ngay,
    noiDung: h.noi_dung || '',
    bienBan: h.bien_ban || '',
    tep: teps.filter(t => t.hop_id === h.id).map(t => ({
     id: t.id,
     ten: t.ten,
     loai: t.loai,
     co: t.co
    }))
   }));

   const dd = (resDd.data || []).map(d => ({
    hopId: d.hop_id,
    nsId: d.ns_id,
    co: !!d.co,
    muon: !!d.muon
   }));

   DB = { cd, ns, kh, hop, dd, bc, hd, dv };
  } catch (err) {
   console.error('Lỗi khi tải dữ liệu từ máy chủ:', err);
   alert('Lỗi nạp dữ liệu từ máy chủ: ' + (err.message || 'Không thể đồng bộ.'));
  }
 },

 async luuBC(b) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.bc.findIndex(x => x.id === b.id);
   if (idx !== -1) DB.bc[idx] = b; else DB.bc.push(b);
   return { ok: true };
  }
  const payload = {
   kh_id: b.khId,
   cd_id: b.cdId,
   so_luot: b.soLuot,
   ngay_nop: b.ngayNop,
   mc: b.mc,
   status: b.status,
   nx: b.nx
  };
  let res;
  if (b.id && DB.bc.some(x => x.id === b.id)) {
   res = await client.from('bao_cao').update(payload).eq('id', b.id).select();
  } else {
   res = await client.from('bao_cao').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) {
   b.id = res.data[0].id;
   b.treHan = !!res.data[0].tre_han;
   b.status = res.data[0].status;
  }
  const idx = DB.bc.findIndex(x => x.id === b.id);
  if (idx !== -1) DB.bc[idx] = b; else DB.bc.push(b);
  return { ok: true };
 },

 async xoaBC(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('bao_cao').delete().eq('id', id);
   if (error) throw error;
  }
  DB.bc = DB.bc.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuHD(h) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.hd.findIndex(x => x.id === h.id);
   if (idx !== -1) DB.hd[idx] = h; else DB.hd.push(h);
   return { ok: true };
  }
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
  let res;
  if (h.id && DB.hd.some(x => x.id === h.id)) {
   res = await client.from('hoat_dong').update(payload).eq('id', h.id).select();
  } else {
   res = await client.from('hoat_dong').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) {
   h.id = res.data[0].id;
   h.status = res.data[0].status;
   h.diem = Number(res.data[0].diem) || 0;
  }
  const idx = DB.hd.findIndex(x => x.id === h.id);
  if (idx !== -1) DB.hd[idx] = h; else DB.hd.push(h);
  return { ok: true };
 },

 async xoaHD(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('hoat_dong').delete().eq('id', id);
   if (error) throw error;
  }
  DB.hd = DB.hd.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuDV(d) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.dv.findIndex(x => x.id === d.id);
   if (idx !== -1) DB.dv[idx] = d; else DB.dv.push(d);
   return { ok: true };
  }
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
  let res;
  if (d.id && DB.dv.some(x => x.id === d.id)) {
   res = await client.from('doan_vien').update(payload).eq('id', d.id).select();
  } else {
   res = await client.from('doan_vien').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) {
   d.id = res.data[0].id;
  }
  const idx = DB.dv.findIndex(x => x.id === d.id);
  if (idx !== -1) DB.dv[idx] = d; else DB.dv.push(d);
  return { ok: true };
 },

 async xoaDV(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('doan_vien').delete().eq('id', id);
   if (error) throw error;
  }
  DB.dv = DB.dv.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuKH(k) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.kh.findIndex(x => x.id === k.id);
   if (idx !== -1) DB.kh[idx] = k; else DB.kh.push(k);
   return { ok: true };
  }
  const payload = {
   ma: k.ma,
   ten: k.ten,
   crit: k.crit,
   ban: k.ban,
   pt_ids: k.ptIds,
   pt_id: k.ptId,
   bat_dau: k.batDau,
   han_chot: k.hanChot,
   hien_thi: k.hienThi,
   tien_do: k.tienDo,
   diem: k.diem,
   chi_tieu: k.chiTieu,
   don_vi: k.donVi,
   bat_buoc: k.batBuoc,
   ket_qua: k.ketQua,
   mc: k.mc,
   note: k.note
  };
  let res;
  if (k.id && DB.kh.some(x => x.id === k.id)) {
   res = await client.from('ke_hoach').update(payload).eq('id', k.id).select();
  } else {
   res = await client.from('ke_hoach').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) k.id = res.data[0].id;
  const idx = DB.kh.findIndex(x => x.id === k.id);
  if (idx !== -1) DB.kh[idx] = k; else DB.kh.push(k);
  return { ok: true };
 },

 async xoaKH(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('ke_hoach').delete().eq('id', id);
   if (error) throw error;
  }
  DB.kh = DB.kh.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuCD(c) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.cd.findIndex(x => x.id === c.id);
   if (idx !== -1) DB.cd[idx] = c; else DB.cd.push(c);
   return { ok: true };
  }
  const payload = {
   ma: c.ma,
   ten: c.ten,
   nganh: c.nganh,
   si_so: c.siSo,
   bt: c.bt,
   sdt: c.sdt,
   diem_tru: c.diemTru
  };
  let res;
  if (c.id && DB.cd.some(x => x.id === c.id)) {
   res = await client.from('chi_doan').update(payload).eq('id', c.id).select();
  } else {
   res = await client.from('chi_doan').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) c.id = res.data[0].id;
  const idx = DB.cd.findIndex(x => x.id === c.id);
  if (idx !== -1) DB.cd[idx] = c; else DB.cd.push(c);
  return { ok: true };
 },

 async xoaCD(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('chi_doan').delete().eq('id', id);
   if (error) throw error;
  }
  DB.cd = DB.cd.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuNS(u) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.ns.findIndex(x => x.id === u.id);
   if (idx !== -1) DB.ns[idx] = u; else DB.ns.push(u);
   return { ok: true };
  }
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
  let res;
  if (u.id && DB.ns.some(x => x.id === u.id)) {
   res = await client.from('nhan_su').update(payload).eq('id', u.id).select();
  } else {
   res = await client.from('nhan_su').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) u.id = res.data[0].id;
  const idx = DB.ns.findIndex(x => x.id === u.id);
  if (idx !== -1) DB.ns[idx] = u; else DB.ns.push(u);
  return { ok: true };
 },

 async xoaNS(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('nhan_su').delete().eq('id', id);
   if (error) throw error;
  }
  DB.ns = DB.ns.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuHop(h) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
   const idx = DB.hop.findIndex(x => x.id === h.id);
   if (idx !== -1) DB.hop[idx] = h; else DB.hop.push(h);
   return { ok: true };
  }
  const payload = {
   ten: h.ten,
   ngay: h.ngay,
   noi_dung: h.noiDung,
   bien_ban: h.bienBan
  };
  let res;
  if (h.id && DB.hop.some(x => x.id === h.id)) {
   res = await client.from('sinh_hoat').update(payload).eq('id', h.id).select();
  } else {
   res = await client.from('sinh_hoat').insert(payload).select();
  }
  if (res.error) throw res.error;
  if (res.data && res.data[0]) h.id = res.data[0].id;
  const idx = DB.hop.findIndex(x => x.id === h.id);
  if (idx !== -1) DB.hop[idx] = h; else DB.hop.push(h);
  return { ok: true };
 },

 async xoaHop(id) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('sinh_hoat').delete().eq('id', id);
   if (error) throw error;
  }
  DB.hop = DB.hop.filter(x => x.id !== id);
  return { ok: true };
 },

 async luuDiemDanh(hopId, nsId, co, muon) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('diem_danh').upsert({
    hop_id: hopId,
    ns_id: nsId,
    co: !!co,
    muon: !!muon
   });
   if (error) throw error;
  }
  const idx = DB.dd.findIndex(x => x.hopId === hopId && x.nsId === nsId);
  if (idx !== -1) {
   DB.dd[idx].co = !!co;
   DB.dd[idx].muon = !!muon;
  } else {
   DB.dd.push({ hopId, nsId, co: !!co, muon: !!muon });
  }
 },

 async xoaDiemDanh(hopId, nsId) {
  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (client) {
   const { error } = await client.from('diem_danh').delete().match({
    hop_id: hopId,
    ns_id: nsId
   });
   if (error) throw error;
  }
  DB.dd = DB.dd.filter(x => !(x.hopId === hopId && x.nsId === nsId));
 }
};

/* Giữ hàm save() đồng bộ bộ nhớ */
const save = () => {};

/* ===================== SAO LƯU & PHỤC HỒI AN TOÀN ===================== */

/** Xuất bản sao lưu JSON (CHỈ xuất dữ liệu nghiệp vụ đã được máy chủ cho phép đọc; KHÔNG xuất users, mật khẩu hay secrets) */
function xuatBackupJSON() {
 const backupData = {
  version: '2.3',
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
 a.download = `lcdkhud_backup_${TODAY}.json`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** Nhập dữ liệu từ file JSON backup với kiểm tra ranh giới bảo mật nghiêm ngặt */
function nhapBackupJSON(file) {
 return new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = async e => {
   try {
    const raw = JSON.parse(e.target.result);
    if (!raw || typeof raw !== 'object') {
     return reject(new Error('File không hợp lệ hoặc không có cấu trúc JSON.'));
    }

    const payload = raw.data || raw;

    // Chặn hoàn toàn việc chèn tài khoản/quyền từ file JSON client
    delete payload.users;
    delete payload.profiles;
    delete payload.auth;

    if (!Array.isArray(payload.cd) || !Array.isArray(payload.kh)) {
     return reject(new Error('File không đúng cấu trúc dữ liệu Sổ tay LCĐ KHUD (thiếu danh sách chi đoàn hoặc kế hoạch).'));
    }

    // Nếu người dùng là Chi đoàn: kiểm tra phạm vi chỉ được phục hồi dữ liệu thuộc chi đoàn mình
    if (typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.role === 'cd') {
     const myCdId = auth.currentUser.cdId;
     if (payload.dv) payload.dv = payload.dv.filter(x => x.cdId === myCdId);
     if (payload.bc) payload.bc = payload.bc.filter(x => x.cdId === myCdId);
     if (payload.hd) payload.hd = payload.hd.filter(x => x.cdId === myCdId);
     delete payload.cd;
     delete payload.ns;
     delete payload.kh;
     delete payload.hop;
     delete payload.dd;
    }

    // Gán dữ liệu vào bộ nhớ sau khi lọc an toàn
    if (payload.cd) DB.cd = payload.cd;
    if (payload.ns) DB.ns = payload.ns;
    if (payload.kh) DB.kh = payload.kh;
    if (payload.hop) DB.hop = payload.hop;
    if (payload.dd) DB.dd = payload.dd;
    if (payload.bc) DB.bc = payload.bc;
    if (payload.hd) DB.hd = payload.hd;
    if (payload.dv) DB.dv = payload.dv;

    resolve(DB);
   } catch (err) {
    reject(new Error('Lỗi khi đọc file sao lưu: ' + err.message));
   }
  };
  r.onerror = () => reject(new Error('Không thể đọc file sao lưu.'));
  r.readAsText(file);
 });
}
