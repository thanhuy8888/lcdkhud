# Sổ tay Vận hành Backup Tự động & Khôi phục (Runbook)

## 1. Phạm vi & Giới hạn gói Supabase Free
- Dự án dùng gói **Supabase Free**: nền tảng **không cung cấp** daily backup tự động hoặc Point-in-Time Recovery (PITR).
- Mọi dữ liệu cần được bảo vệ bằng quy trình backup ngoài độc lập tại [`scripts/backup/backup.mjs`](../scripts/backup/backup.mjs) và lịch tự động [`.github/workflows/daily-backup.yml`](../.github/workflows/daily-backup.yml).
- **RPO mục tiêu**: Tối đa **24 giờ** (theo lịch chạy hằng ngày mặc định lúc **02:00 Asia/Ho_Chi_Minh** = `0 19 * * *` UTC).
- **Retention mặc định**: Giữ **14 bản gần nhất** (có thể thay đổi qua biến `BACKUP_RETENTION_DAYS`). Bản cũ chỉ bị xoá **sau khi** bản mới tải lên kho lưu trữ ngoài và kiểm tra `HEAD` + kích thước thành công.

---

## 2. Phân biệt Export người dùng vs Backup vận hành
| Loại | Mục đích | Phạm vi | Nơi lưu |
|---|---|---|---|
| **Export JSON người dùng** (`xuatBackupJSON`) | Xuất/nhập số liệu nghiệp vụ trên giao diện | Chỉ dữ liệu nghiệp vụ mà vai trò hiện tại được đọc | Máy cá nhân người dùng |
| **Backup vận hành mã hóa** (`backup.mjs`) | Phục hồi thảm họa (DR) | Schema + dữ liệu `public`, sequence, policy/trigger, tùy chọn ánh xạ `auth.users`/`profiles` và toàn bộ file trong bucket `lcdkhud-files` | Bucket S3 riêng tư ngoài repo, mã hóa **AES-256-GCM** |

---

## 3. GitHub Secrets cần cấu hình (để kích hoạt workflow)
Khai báo trong **Settings → Secrets and variables → Actions** của repository (tuyệt đối không commit vào mã nguồn hay lưu chung mật khẩu giải mã trong cùng bucket backup):
1. `SUPABASE_DB_URL`: Postgres Direct/Session pooler URI có quyền đọc `public` (và `auth.users` nếu bật `BACKUP_INCLUDE_AUTH_MAP=true`).
2. `SUPABASE_URL`: URL dự án Supabase.
3. `SUPABASE_SERVICE_ROLE_KEY`: Service role key để liệt kê & tải file từ bucket private `lcdkhud-files`.
4. `BACKUP_ENCRYPTION_KEY`: Chuỗi khóa bí mật ≥ 32 ký tự để mã hóa **AES-256-GCM** (lưu riêng trong Password Manager của BCH/Admin).
5. `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`, `BACKUP_S3_REGION`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`: Kho lưu trữ S3-compatible riêng tư (VD: Cloudflare R2 / AWS S3 / Backblaze B2).

---

## 4. Phạm vi Auth / Profiles & Cách ánh xạ khi phục hồi
- Bảng `public.profiles` tham chiếu khóa ngoại `auth.users(id)`.
- Khi khôi phục vào một dự án **local/staging mới**:
  1. Nếu khôi phục đầy đủ cả `auth.users` từ `auth_users_sql_base64` trong gói backup (trên môi trường có quyền superuser/supabase_admin): giữ nguyên UUID và đăng nhập lại bình thường.
  2. Nếu khôi phục sang một Supabase project mới chỉ dùng bảng `public`:
     - Chạy các migration trong `supabase/migrations/` trước, hoặc restore `db_public.dump` sau khi tạo lại user trong Authentication.
     - Cập nhật lại `public.profiles.id` khớp với `auth.users.id` mới theo email:
       ```sql
       UPDATE public.profiles p
       SET id = u.id
       FROM auth.users u
       WHERE lower(p.email) = lower(u.email) AND p.id <> u.id;
       ```

---

## 5. Quy trình Thử khôi phục (chỉ chạy trên Local / Staging)
Không bao giờ thử khôi phục bằng cách ghi đè production. `restore.mjs` bắt buộc kiểm tra chốt an toàn `RESTORE_TARGET_ENV=local|staging` và `RESTORE_CONFIRM_NON_PROD=YES`:

```bash
export RESTORE_TARGET_ENV=staging
export RESTORE_CONFIRM_NON_PROD=YES
export RESTORE_PROD_HOST=your-prod-project-ref.supabase.co
export TARGET_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
export TARGET_SUPABASE_URL="http://127.0.0.1:54321"
export TARGET_SUPABASE_SERVICE_ROLE_KEY="<staging-service-role-key>"
export BACKUP_ENCRYPTION_KEY="<secret-from-vault>"
export BACKUP_S3_KEY="lcdkhud-backups/lcdkhud_YYYY-MM-DD....bak.enc"
# Hoặc thử từ file cục bộ: export BACKUP_FILE_PATH="/path/to/local.bak.enc"

node scripts/backup/restore.mjs
```

### Checklist kiểm tra sau khi khôi phục
1. Đối soát số lượng bản ghi các bảng (`chi_doan`, `nhan_su`, `ke_hoach`, `bao_cao`, `hoat_dong`, `doan_vien`, `sinh_hoat`, `diem_danh`, `tep_tin`) với `manifest.table_counts`.
2. Kiểm tra lại bộ đếm `sequence` (`SELECT setval(pg_get_serial_sequence('ke_hoach','id'), coalesce(max(id),1)) FROM ke_hoach;`).
3. Đăng nhập thử tài khoản `lcd` và `cd`: xác minh RLS chặn chi đoàn A xem/sửa chi đoàn B, công thức KPI khớp kết quả cũ, và mở/tải lại được file đã khôi phục từ `lcdkhud-files`.
4. Ghi lại thời gian khôi phục thực tế (RTO) vào nhật ký bảo trì.
