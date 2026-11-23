# Sổ tay Liên chi đoàn KHUD

Phần mềm theo dõi công tác, KPI chi đoàn và nhân sự của Liên chi đoàn Khoa các Khoa học Ứng dụng (Trường Quốc tế – ĐHQGHN), nhiệm kỳ 2025–2027.

Hệ thống được thiết kế trên nền tảng Frontend thuần (HTML/CSS/JavaScript), kết nối dịch vụ xác thực Supabase Auth và cơ sở dữ liệu PostgreSQL bảo vệ bởi Row Level Security (RLS). Toàn bộ dữ liệu nghiệp vụ và phân quyền được xác minh phía máy chủ.

## 1. Cài đặt & Khởi chạy

### Yêu cầu môi trường
- Python ≥ 3.8 (chỉ sử dụng thư viện chuẩn `http.server`, `re`, `io`, `os`).
- Node.js ≥ 18 (tuỳ chọn, phục vụ chạy test suite và build artifact).
- Không yêu cầu cài đặt thêm các gói bên ngoài qua `pip` hay `npm`.

### Khởi chạy môi trường phát triển cục bộ

```bash
# Khởi chạy máy chủ phát triển cục bộ
python -B -m http.server 5173
# Truy cập tại: http://localhost:5173
```

### Đóng gói Artifact độc lập (Single-file)

Cả hai công cụ đóng gói Python và Node.js đều cho kết quả đồng nhất `dist/artifact.html`:

```bash
# Đóng gói bằng Python
python -B build-artifact.py

# Hoặc đóng gói bằng Node.js
node build-artifact.js
```

## 2. Cấu hình Môi trường & Cơ sở Dữ liệu

### Cấu hình biến môi trường
Sao chép tệp mẫu và cập nhật thông tin dự án Supabase:

```bash
cp .env.example .env.local
```

Khai báo các tham số trong `.env.local` hoặc cấu hình biến môi trường trên nền tảng hosting:
- `SUPABASE_URL`: Đường dẫn URL dự án Supabase (`https://<project-ref>.supabase.co`).
- `SUPABASE_ANON_KEY`: Khóa công khai (`anon` / `publishable key`) cấp quyền truy cập phía trình duyệt qua RLS.
- *Lưu ý*: Tuyệt đối không đưa `SUPABASE_SERVICE_ROLE_KEY` vào mã nguồn client hoặc kho lưu trữ Git.

### Chạy Migration trên Supabase

Khởi tạo cơ sở dữ liệu và chính sách bảo mật RLS bằng cách áp dụng các tệp SQL theo thứ tự trong thư mục `supabase/migrations/`:

1. `20261118000000_security_p0_schema_rls.sql`:
   - Định nghĩa bảng danh mục: `chi_doan`, `nhan_su`, `ke_hoach`, `moc_cong_tac`, `bao_cao`, `hoat_dong`, `doan_vien`, `sinh_hoat`, `diem_danh`, `tep_tin`, `profiles`.
   - Bật Row Level Security (RLS) trên 100% các bảng.
   - Thiết lập hàm hỗ trợ `SECURITY DEFINER` với `search_path = public, auth` cố định.
   - Thiết lập trigger kiểm soát duyệt báo cáo và điểm số: chặn chi đoàn tự duyệt hoặc sửa điểm của chính mình.
   - Phân quyền theo vai trò (`admin`, `lcd`, `cd`, `bbt`).
2. `20261118000001_seed_initial_data.sql`:
   - Nạp dữ liệu danh mục ban đầu (chi đoàn, nhân sự, danh mục kế hoạch mẫu) — hoàn toàn không chứa mật khẩu hay thông tin định danh người dùng.
   - Cung cấp hàm khởi tạo quản trị viên đầu tiên `bootstrap_initial_admin(p_ten)`.

### Khởi tạo Quản trị viên Đầu tiên (First Admin Bootstrap)

Để đảm bảo an toàn, hệ thống không tạo sẵn tài khoản quản trị mặc định:
1. Đăng ký tài khoản người dùng đầu tiên qua Supabase Dashboard (Auth > Users > Invite user / Add user).
2. Sau khi tài khoản được tạo và xác nhận email, người dùng đăng nhập lần đầu vào giao diện ứng dụng.
3. Khi hệ thống chưa có quản trị viên nào, người dùng có thể kích hoạt quyền quản trị thông qua hàm:
   ```sql
   SELECT public.bootstrap_initial_admin('Tên Quản Trị Viên');
   ```
4. Hàm này tự động khóa vĩnh viễn tính năng self-bootstrap ngay sau khi đã có ít nhất một tài khoản `admin` tồn tại. Các tài khoản tiếp theo sẽ do quản trị viên cấp phát và phân quyền trong trang **Quản trị người dùng**.

## 3. Thư viện Phụ thuộc (Vendored Libraries)

Nhằm đảm bảo an toàn chuỗi cung ứng (Supply Chain Security), chặn rủi ro CDN hijacking và giải quyết các lỗ hổng đã công bố, toàn bộ thư viện trình duyệt được lưu trữ trực tiếp tại `assets/vendor/`:

- **SheetJS (xlsx) Community Edition v0.20.3** (`assets/vendor/xlsx.full.min.js`):
  - Khắc phục triệt để lỗ hổng Prototype Pollution (CVE-2023-30533, CVE-2024-22363) tồn tại trên bản cũ 0.18.5 nạp từ cdnjs.
  - Vận hành hoàn toàn offline, không gửi dữ liệu ra bên ngoài.
- **Supabase JS Client v2.49.1** (`assets/vendor/supabase.js`):
  - Quản lý phiên xác thực an toàn qua Supabase Auth và giao tiếp PostgreSQL qua REST/PostgREST.

Chi tiết nguồn gốc, mã băm sha256 và giấy phép xem tại [`assets/vendor/README.md`](assets/vendor/README.md).

## 4. Bảng Kiểm kê Dữ liệu Cá nhân (Privacy by Design)

Thực hiện rà soát và thu nhỏ tối đa dữ liệu cá nhân thu thập theo nguyên tắc Privacy by Design:

| Trường thông tin | Mục đích sử dụng | Tính chất | Phạm vi truy cập | Thời hạn lưu trữ | Trạng thái phê duyệt BCH |
|---|---|---|---|---|---|
| **Họ và tên** | Định danh đoàn viên / cán bộ Đoàn | Bắt buộc | Chi đoàn sở tại, LCĐ, Admin | Hết nhiệm kỳ công tác | Đã duyệt |
| **MSSV** | Khóa định danh sinh viên, xếp loại thi đua | Bắt buộc | Chi đoàn sở tại, LCĐ, Admin | Hết khóa học sinh viên | Đã duyệt |
| **Email** | Xác thực tài khoản đăng nhập Supabase | Bắt buộc với user | Chủ tài khoản, Admin | Theo thời gian hoạt động tài khoản | Đã duyệt |
| **Lớp / Chi đoàn** | Phân cấp quản lý thi đua và sinh hoạt | Bắt buộc | Chi đoàn sở tại, LCĐ, Admin | Hết khóa học sinh viên | Đã duyệt |
| **Số điện thoại** | Liên hệ công tác đột xuất | Tùy chọn | LCĐ, Admin | Hết nhiệm kỳ công tác | Đã duyệt |
| **Link Facebook** | Phối hợp truyền thông & hoạt động Đoàn | Tùy chọn | LCĐ, Admin | Hết nhiệm kỳ công tác | Đã duyệt |
| **Điểm rèn luyện (ĐRL)** | Đánh giá xếp loại thi đua đoàn viên | Tùy chọn | Chi đoàn sở tại, LCĐ, Admin | Hết năm học | Đã duyệt |
| **Số hoạt động tham gia** | Tính tỷ lệ huy động lực lượng chi đoàn | Tự động tính | Chi đoàn sở tại, LCĐ, Admin | Hết năm học | Đã duyệt |
| **Ghi chú đoàn viên** | Ghi nhận hoàn cảnh đặc biệt / Đảng viên | Tùy chọn | Chi đoàn sở tại, LCĐ, Admin | Hết năm học | Đã duyệt |

*Lưu ý an toàn*: Hệ thống không thu thập ngày sinh, số CCCD/CMND, địa chỉ cư trú hoặc thông tin nhạy cảm khác.

## 5. Phân quyền Hệ thống (RBAC & RLS)

- **Quản trị viên (`admin`)**: Toàn quyền cấu hình hệ thống, quản lý tài khoản người dùng, phân vai trò và cấp phát quyền hạn chi tiết.
- **Ban Chấp hành LCĐ (`lcd`)**: Quản lý kế hoạch tiến độ, thẩm định & duyệt báo cáo minh chứng của chi đoàn, quản lý nhân sự LCĐ và sổ sinh hoạt/điểm danh.
- **Ban Chấp hành Chi đoàn (`cd`)**: Chỉ được xem và cập nhật dữ liệu thuộc chi đoàn được gán (`cdId`). Báo cáo gửi lên luôn ở trạng thái "Chờ duyệt", không được phép tự duyệt hoặc tự gán điểm thi đua.
- **Ban Biên tập (`bbt`)**: Mặc định chỉ có quyền đọc tối thiểu để theo dõi tổng quan và viết tin bài truyền thông.

## 6. Kiểm tra & Tự động Hóa Kiểm thử

Chạy bộ kiểm thử bảo mật và hồi quy KPI:

```bash
node tests/test_security_verification.js
```

Bộ kiểm tra xác minh 7 nhóm tiêu chuẩn:
1. Thoát mã HTML (`esc`, `escJs`) chống Cross-Site Scripting (XSS).
2. Kiểm định URL (`isSafeUrl`, `chuanHoaLink`), chặn các URI nguy hiểm `javascript:`, `data:`, `vbscript:`.
3. Phân lập dữ liệu chi đoàn: Chi đoàn không thể ghi đè hoặc chuyển nhượng đoàn viên của chi đoàn khác khi nhập Excel.
4. Xác minh hoạt động offline của thư viện SheetJS và Supabase Client (không gọi CDN ngoài).
5. Kiểm định bản sao lưu JSON: không rò rỉ mật khẩu, thông tin tài khoản hoặc secrets.
6. Hồi quy công thức tính KPI chi đoàn và chấm điểm uỷ viên BCH theo đúng quy định.
7. Cơ chế Fail-Closed: Khóa toàn bộ quyền truy cập và dữ liệu khi thiếu module xác thực hoặc phiên đăng nhập không hợp lệ.

## 7. Ghi chú

### Quyết định kiến trúc Backend
- **Lựa chọn**: **Supabase** (Supabase Auth + PostgreSQL với Row Level Security + private Storage + Realtime).
- **Lý do**:
  - Tương thích trực tiếp với ứng dụng HTML/CSS/JavaScript thuần qua SDK `@supabase/supabase-js` v2.49.1 lưu cục bộ tại `assets/vendor/supabase.js`, không cần chuyển framework hay dựng thêm máy chủ API trung gian.
  - PostgreSQL + RLS bảo vệ dữ liệu đa người dùng theo vai trò (`admin`, `lcd`, `cd`, `bbt`), ép toàn vẹn khóa ngoại, duy nhất MSSV và chặn tự duyệt báo cáo/điểm bằng trigger phía máy chủ.
  - Bucket Storage riêng tư (`lcdkhud-files`) dùng chung cho mọi trình duyệt/thiết bị thay cho IndexedDB cục bộ, truy cập bằng phiên xác thực hoặc signed URL ngắn hạn.
  - Supabase Realtime đồng bộ thay đổi giữa các phiên (chi đoàn / LCĐ) mà không cần tải lại toàn bộ trang hay toàn bộ DB.
  - Hỗ trợ sao lưu chuẩn PostgreSQL (`pg_dump`/`pg_restore`) cùng API Storage để vận hành độc lập.
- **Giới hạn gói Supabase Free & Sao lưu**: Gói Supabase Free **không có sẵn** daily backup tự động hoặc Point-in-Time Recovery (PITR). Vì vậy dự án tách riêng **Export JSON cho người dùng** khỏi **Backup vận hành mã hóa AES-256-GCM** (xem `scripts/backup/`, `.github/workflows/daily-backup.yml` và [`docs/BACKUP_AND_RESTORE_RUNBOOK.md`](docs/BACKUP_AND_RESTORE_RUNBOOK.md)).
