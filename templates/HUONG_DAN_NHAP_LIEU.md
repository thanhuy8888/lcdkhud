# Hướng dẫn Chuẩn hóa & Nhập Dữ liệu Excel (`templates/`)

Tài liệu quy định cấu trúc các tệp mẫu (`.xlsx`) dùng cho chức năng **Nhập dữ liệu** trong Sổ tay Liên chi đoàn KHUD.

---

## 1. Quy tắc chung bắt buộc

1. **Dòng tiêu đề (Dòng 1)**: Giữ đúng tên cột ở dòng 1 (hệ thống nhận diện không phân biệt dấu/hoa-thường nhưng phải khớp tên cột chuẩn).
2. **MSSV và Số điện thoại (SĐT) là CHUỖI (Text)**:
   - Bắt buộc định dạng ô ở kiểu **Text** (`@`) trong Excel hoặc thêm dấu nháy đơn phía trước (ví dụ `'0912345678`, `'02307001`) để **không bị mất số `0` ở đầu**.
3. **Ngày tháng**:
   - Dùng định dạng chuẩn `YYYY-MM-DD` (ví dụ `2026-10-20`) hoặc `DD/MM/YYYY` (ví dụ `20/10/2026`).
   - Hệ thống kiểm tra ngày hợp lệ theo lịch thực tế (từ chối `30/02/2026`, `31/04/2026`...).
4. **Họ và tên**: Không ghép ghi chú/mã lớp vào cột họ tên. Hệ thống chỉ chuẩn hóa Unicode NFC và thu gọn khoảng trắng thừa, **không tự đoán hoặc tự sửa tên người**.
5. **Giới hạn bảo mật khi nhập**:
   - Mọi tệp nhập không tin cậy **không thể** thay đổi quyền người dùng, tài khoản đăng nhập, trạng thái duyệt chính thức (`ok`) hay điểm KPI chính thức.
   - Tài khoản **Chi đoàn** chỉ được nhập dữ liệu thuộc chi đoàn của mình; MSSV trùng sang chi đoàn khác sẽ bị báo xung đột và chặn ghi đè.

---

## 2. Chi tiết từng mẫu biểu

### A. Danh sách Đoàn viên (`mau_doan_vien.xlsx`) — Khóa nhận diện: `MSSV`
| Cột | Bắt buộc | Kiểu dữ liệu / Quy ước |
|---|---|---|
| `Họ và tên` | Có | Chuỗi văn bản Unicode |
| `MSSV` | Có | **Chuỗi (Text)**, giữ đủ số 0 đầu, duy nhất toàn hệ thống |
| `Chi đoàn` | Bắt buộc với LCĐ | Mã chi đoàn hợp lệ có sẵn trong hệ thống (VD: `MIS2022B`, `BDA2023A`) |
| `Chức vụ` | Không (mặc định `Đoàn viên`) | `Bí thư` \| `Phó Bí thư` \| `Uỷ viên BCH` \| `Đoàn viên` |
| `ĐRL` | Không (mặc định `0`) | Số nguyên từ `0` đến `100` |
| `Số HĐ` | Không (mặc định `0`) | Số nguyên $\ge 0$ |
| `Đoàn phí` | Không | `x`, `có`, `1`, `true`, `đã nộp` (để trống = chưa nộp) |
| `Ghi chú` | Không | Chuỗi văn bản ngắn |

### B. Số liệu Báo cáo Kế hoạch (`mau_bao_cao.xlsx`) — Khóa nhận diện: `Mã kế hoạch` + `Chi đoàn`
| Cột | Bắt buộc | Kiểu dữ liệu / Quy ước |
|---|---|---|
| `Mã kế hoạch` | Có | Mã kế hoạch đã tồn tại (VD: `KH-01`) |
| `Chi đoàn` | Bắt buộc với LCĐ | Mã chi đoàn hợp lệ |
| `Số lượt` | Có | Số nguyên $\ge 0$ |
| `Ngày nộp` | Không (mặc định hôm nay) | Ngày hợp lệ `YYYY-MM-DD` hoặc `DD/MM/YYYY` |
| `Minh chứng` | Không | Đường dẫn `https://...` hợp lệ (chặn `javascript:`, `data:`...) |

*Lưu ý*: Hồ sơ nhập từ Excel luôn vào trạng thái **Chờ duyệt (`wait`)** để BCH LCĐ thẩm định trên server.

### C. Danh sách Nhân sự LCĐ (`mau_nhan_su_lcd.xlsx`) — Chỉ LCĐ / Admin
- Dòng chỉ có 1 ô chứa tên ban (VD: `Ban Phong trào`) hoặc tên khối (`Ban Chấp hành`, `Key 2k7`) đóng vai trò tiêu đề nhóm cho các dòng bên dưới.
- Các cột: `No.`, `Họ và Tên` *(bắt buộc)*, `SĐT` *(Text)*, `MSSV` *(Text)*, `Lớp`, `Vai trò` (`Bí thư`, `Phó Bí thư`, `UV BTV`, `UV BCH`, `Trưởng ban`, `Phó ban`, `Thành viên`), `Ban`, `Link FB` (`https://...`).

### D. Công tác theo Timeline (`mau_timeline_kehoach.xlsx`) — Chỉ LCĐ / Admin
- Cột bắt buộc: `HOẠT ĐỘNG`.
- Các cột khác: `STT`, `THỜI GIAN` (`DD/MM/YYYY` hoặc `YYYY-MM-DD`), `TIẾN ĐỘ` (`Chưa triển khai` \| `Đang triển khai` \| `Hoàn thành`), `Ban Phụ Trách` (cách nhau bằng dấu phẩy `,`), `PHỤ TRÁCH` (tên cán bộ cách nhau bởi `/`), `NOTE`, `Minh Chứng` (`https://...`), `Kết quả`.

### E. Bảng Điểm danh Sinh hoạt (`mau_diem_danh.xlsx`) — Chỉ LCĐ / Admin
- Cột bắt buộc: `Họ và Tên` (khớp với nhân sự đã có trong hệ thống) và ít nhất 1 cột tiêu đề là **ngày sinh hoạt** hợp lệ (`YYYY-MM-DD` hoặc `DD/MM/YYYY`).
- Giá trị ô: `x` / `TRUE` / `1` = Có mặt; `muon` / `MUON` = Đi muộn; `FALSE` / `0` = Vắng; trống = bỏ qua.

---

## 3. Quy trình Nhập an toàn (Dry-Run → Batch → Đối soát)
1. **Dry-Run**: Đọc file/dữ liệu dán, chuẩn hóa và kiểm tra trước mà **không ghi vào DB**. Hiển thị rõ số dòng: `Tạo mới`, `Cập nhật`, `Bỏ qua`, `Lỗi / Xung đột`.
2. **Chống nhập trùng**: Mỗi file sinh mã băm `SHA-256`; nếu đã hoàn tất nhập lô giống hệt trước đó, hệ thống chặn ghi đè trùng lặp.
3. **Đối soát & Hoàn tác**: Sau khi lưu theo chunk có checkpoint lên Supabase, hệ thống đối soát lại theo `batch_id`:
   $$\text{Tổng dòng nguồn} = \text{Tạo mới} + \text{Cập nhật} + \text{Bỏ qua} + \text{Lỗi}$$
   Có nút **Hoàn tác lô nhập (Rollback)** an toàn: chỉ hoàn tác các bản ghi chưa bị chỉnh sửa tiếp sau thời điểm nhập.
