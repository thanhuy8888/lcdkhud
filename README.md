# Sổ tay Liên chi đoàn KHUD

Phần mềm theo dõi công tác, KPI chi đoàn và nhân sự của Liên chi đoàn Khoa các Khoa học Ứng dụng
(Trường Quốc tế – ĐHQGHN), nhiệm kỳ 2025–2027.

Trang tĩnh thuần, không cần cài đặt gì: mở `index.html` bằng trình duyệt là chạy.
Dữ liệu lưu trong `localStorage` của máy người dùng — chưa có máy chủ, chưa có đăng nhập thật.

## Hai vai trò

| BCH Liên chi đoàn | BCH Chi đoàn |
|---|---|
| Tổng quan, công tác theo timeline, ma trận theo dõi, duyệt hồ sơ, so sánh chi đoàn | Tổng quan chi đoàn, hoạt động được giao, hoạt động tự tổ chức, KPI chi tiết |
| Nhân sự & đánh giá BCH LCĐ, sinh hoạt & điểm danh, nhân sự toàn khoa | Đoàn viên chi đoàn |
| Nhập / xuất Excel, tổng kết nhiệm kỳ | Nhập / xuất Excel |

Đổi vai trò bằng ô chọn ở góc trên bên trái.

## Cấu trúc

```
index.html           khung trang + nạp assets
assets/styles.css    toàn bộ giao diện (biến màu lấy theo logo LCĐ)
assets/data.js       khung tiêu chí, dữ liệu mẫu, lưu trữ localStorage
assets/kpi.js        công thức KPI chi đoàn + đánh giá uỷ viên BCH
assets/ui.js         thành phần dùng chung, biểu đồ, điều hướng
assets/pages.js      trang của LCĐ và chi đoàn + hộp thoại nhập liệu
assets/nhansu.js     nhân sự và đánh giá BCH LCĐ
assets/excel.js      nhập / xuất Excel
assets/sinhhoat.js   sinh hoạt LCĐ và điểm danh
assets/boot.js       tự kiểm tra công thức rồi khởi động
build-artifact.py    gộp tất cả thành dist/artifact.html (bản một file)
```

## Công thức chấm điểm

**Chi đoàn** — thang 100, gồm 5 tiêu chí mỗi tiêu chí tối đa 20 điểm
(chính trị tư tưởng · tình nguyện · học tập NCKH · xây dựng Đoàn · tổ chức báo cáo đoàn phí).

```
Điểm một đầu việc = điểm tối đa × tỷ lệ hoàn thành chỉ tiêu (trần 100%) × 0.8 nếu nộp sau hạn
Điểm tiêu chí     = min(tổng điểm các nguồn đã duyệt, 20)
Tổng              = Σ 5 tiêu chí − điểm trừ của LCĐ
```

Xếp loại: Xuất sắc ≥ 90 · Tốt ≥ 80 · Khá ≥ 65 · Trung bình ≥ 50 · Yếu < 50.
Điểm chỉ phát sinh từ hồ sơ **đã được LCĐ duyệt**.

**Uỷ viên BCH LCĐ** — thang 100: kết quả công tác được giao phụ trách (35) ·
chi đoàn được phân công theo dõi (25) · xử lý hồ sơ (20) · sinh hoạt và nhiệm vụ cá nhân (20).
Ba tiêu chí đầu lấy thẳng từ số liệu, tiêu chí cuối lấy từ bảng điểm danh.

Sửa khung tiêu chí ở `assets/data.js` (`CRIT`, `RANKS`, `BAN`, `VANG_CANH_BAO`)
và `assets/kpi.js` (`BCRIT`, `TRE_PHAT`).

## Nhập / xuất Excel

Nhận `.xlsx`, `.csv` hoặc dán trực tiếp từ Excel. Đọc đúng định dạng file
*CHECKLIST CÔNG TÁC VÀ ĐÁNH GIÁ LCĐ KHUD*: sheet DS nhân sự (hiểu dòng tên ban và
dòng "Key 2k7" là tiêu đề khối), sheet Công tác theo timeline, sheet Điểm danh.
Xuất ra 13 bảng giữ nguyên tên cột của file gốc.

## Tự kiểm tra

`assets/boot.js` chạy một loạt `console.assert` cho công thức KPI, chuyên cần và
bộ dò cột tiếng Việt mỗi lần tải trang. Mở Console của trình duyệt, thấy dòng
`✓ Tự kiểm tra công thức KPI, chuyên cần và nhập/xuất: đạt` là công thức còn đúng.

## Triển khai

```bash
vercel deploy --prod
```

Bản một file cho link artifact:

```bash
python build-artifact.py
```

## Việc còn lại trước khi dùng thật

- Máy chủ và đăng nhập thật (hiện mỗi máy giữ dữ liệu riêng trong trình duyệt).
- Tải ảnh minh chứng trực tiếp thay vì dán link Drive.
- Danh sách bí thư các chi đoàn và số điện thoại nhân sự — nhập từ file Excel.

## Góp sức sửa lỗi

Repo public, rất hoan nghênh mọi người vào fix bug.

**Chạy thử (không cần cài gì):**

```bash
git clone https://github.com/thanhuy8888/lcdkhud.git
cd lcdkhud
python -m http.server 5173
```

Mở http://localhost:5173 — hoặc mở thẳng `index.html` bằng trình duyệt cũng chạy.

**Tài khoản demo** (bấm sẵn trên trang đăng nhập): `admin` / `admin123`,
`bch.lcd` / `lcd123`, `cd_mis2022b` / `cd123`. Đây chỉ là dữ liệu mẫu trong
`assets/data.js`, không phải mật khẩu thật — cả app chạy ở trình duyệt,
chưa có máy chủ.

**Báo lỗi:** mở Issue, kèm bước tái hiện, vai trò đang dùng (LCĐ hay chi đoàn),
và log trong Console nếu có.

**Gửi PR:** fork → sửa → PR vào `main`. Vài điều nên giữ:

- JavaScript thuần, không build step, không thêm dependency. Thư viện ngoài duy
  nhất là SheetJS cho Excel, nạp qua CDN trong `index.html`.
- `console.assert` trong `assets/boot.js` phải còn báo `✓ đạt` sau khi sửa.
  Sửa công thức KPI thì thêm assert mới ở đó.
- Sửa file trong `assets/`, đừng sửa `dist/artifact.html` — file đó sinh ra từ
  `python build-artifact.py`.
