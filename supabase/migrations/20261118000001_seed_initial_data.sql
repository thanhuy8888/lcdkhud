-- Seed initial master data (Chi doan, Nhan su, Ke hoach)
-- Notice: NO passwords or credentials are stored here.

--------------------------------------------------------------------------------
-- 1. INITIAL CHI DOAN
--------------------------------------------------------------------------------
insert into public.chi_doan (id, ma, ten, nganh, si_so, bt, sdt, diem_tru) values
(1, 'MIS2022B', 'Chi đoàn MIS2022B', 'MIS · K2022', 62, '(chưa cập nhật)', '', 0),
(2, 'MIS2023A', 'Chi đoàn MIS2023A', 'MIS · K2023', 58, '(chưa cập nhật)', '', 2),
(3, 'BDA2023A', 'Chi đoàn BDA2023A', 'BDA · K2023', 55, '(chưa cập nhật)', '', 0),
(4, 'FDB2023B', 'Chi đoàn FDB2023B', 'FDB · K2023', 49, '(chưa cập nhật)', '', 0),
(5, 'MIS2024B', 'Chi đoàn MIS2024B', 'MIS · K2024', 64, '(chưa cập nhật)', '', 4),
(6, 'BDA2024A', 'Chi đoàn BDA2024A', 'BDA · K2024', 71, '(chưa cập nhật)', '', 0),
(7, 'BDA2025A', 'Chi đoàn BDA2025A', 'BDA · K2025', 78, '(chưa cập nhật)', '', 1)
on conflict (id) do nothing;

select setval('public.chi_doan_id_seq', (select max(id) from public.chi_doan));

--------------------------------------------------------------------------------
-- 2. INITIAL NHAN SU LCD
--------------------------------------------------------------------------------
insert into public.nhan_su (id, ten, vai_tro, ban, lop, bch, nhom, theo_doi) values
(1,  'Bùi Nhật Lệ',            'Bí thư',    'Thường trực',             '',         1, 'bch', '{}'),
(2,  'Thân Quang Huy',         'Phó Bí thư','Thường trực',             'MIS2022B', 1, 'bch', '{1,2}'),
(3,  'Nguyễn Phụ Long',        'UV BTV',    'Ban Tình nguyện',         'FDB2023B', 1, 'bch', '{4}'),
(4,  'Mai Thị Uyên Trang',     'UV BCH',    'Ban Tổ chức – Kiểm tra',  'BDA2024A', 1, 'bch', '{6}'),
(5,  'Đào Duy Anh',            'UV BCH',    'Ban Tài chính – Hậu cần', 'BDA2024B', 1, 'bch', '{}'),
(6,  'Mạc Phạm Thiên Long',    'UV BCH',    'Ban Học tập & NCKH',      'MIS2022B', 1, 'bch', '{1}'),
(7,  'Giang Lê Hiệp',          'UV BCH',    'Ban Truyền thông',        'MIS2023A', 1, 'bch', '{2}'),
(8,  'Nguyễn Thị Thanh Huyền', 'UV BCH',    'Ban Phong trào',          'BDA2023A', 1, 'bch', '{3}'),
(9,  'Cao Mai Anh',            'UV BCH',    'Ban Phong trào',          'BDA2024A', 1, 'bch', '{7}'),
(10, 'Trần Thị Huyền',         'UV BCH',    'Ban Tình nguyện',         'BDA2024C', 1, 'bch', '{5}'),
(11, 'Nguyễn Thị Ánh Dương',   'UV BCH',    'Ban Truyền thông',        'MIS2024B', 1, 'bch', '{}'),
(12, 'Nguyễn Hương Giang',     'Phó ban',   'Ban Học tập & NCKH',      'MIS2024B', 0, 'bcm', '{}'),
(13, 'Chu Thị Thanh Thuý',     'Thành viên','Ban Tài chính – Hậu cần', 'MIS2024B', 0, 'bcm', '{}'),
(14, 'Vũ Thị Minh Phương',     'Thành viên','Ban Phong trào',          'MIS2023A', 0, 'bcm', '{}'),
(15, 'Lê Văn Mạnh',            'Thành viên','Ban Phong trào',          'FDB2023B', 0, 'bcm', '{}'),
(16, 'Nguyễn Hà Bảo Châu',     'Thành viên','Ban Tình nguyện',         'FDB2023B', 0, 'bcm', '{}'),
(17, 'Lâm Thị Bình Dương',     'Thành viên','Ban Truyền thông',        'MIS2025A', 0, 'bcm', '{}'),
(18, 'Lương Vũ Hà Phương',     'Thành viên','Ban Tổ chức – Kiểm tra',  'BDA2025A', 0, 'bcm', '{}'),
(19, 'Đỗ Thủy Linh',           'Thành viên','Ban Học tập & NCKH',      'MIS2024B', 0, 'bcm', '{}'),
(20, 'Phạm Thành Tân',         'Thành viên','Ban Tình nguyện',         'BDA2 K24', 0, 'nguon', '{}'),
(21, 'Trần Hà Linh',           'Thành viên','Ban Phong trào',          'BDA1 K24', 0, 'nguon', '{}'),
(22, 'Đào Hoàng Hiệp',         'Thành viên','Ban Tổ chức – Kiểm tra',  'BDA1 K24', 0, 'nguon', '{}'),
(23, 'Phùng Đức Tú',           'Thành viên','Ban Phong trào',          'BDA3 K24', 0, 'nguon', '{}'),
(24, 'Trần Minh Phương',       'Thành viên','Ban Truyền thông',        'BDA3 K24', 0, 'nguon', '{}'),
(25, 'Hoàng Thị Tú An',        'Thành viên','Ban Truyền thông',        'MIS2 K24', 0, 'nguon', '{}')
on conflict (id) do nothing;

select setval('public.nhan_su_id_seq', (select max(id) from public.nhan_su));

--------------------------------------------------------------------------------
-- 3. INITIAL KE HOACH TIMELINE
--------------------------------------------------------------------------------
insert into public.ke_hoach (id, ma, ten, crit, ban, pt_ids, bat_dau, han_chot, hien_thi, tien_do, diem, chi_tieu, don_vi, bat_buoc, ket_qua) values
(1,  'KH-01', 'FDB Talent',                            'ht', '{"Ban Học tập & NCKH"}',                   '{6}',       '2026-03-01', '2026-04-30', '3/2026 – 4/2026', 'xong', 9,  10,  'n', false, ''),
(2,  'KH-02', 'Hội thao Isport',                       'ht', '{"Ban Phong trào"}',                       '{1,3,8,9}','2026-03-01', '2026-03-31', '01/03/2026',     'dang', 10, 15,  'n', true,  ''),
(3,  'KH-03', 'Nộp hồ sơ Ngôi sao xanh',               'xd', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-03-06', '2026-03-06', '06/03/2026',     'xong', 0,  0,   'n', false, ''),
(4,  'KH-04', 'Khảo sát đăng ký Cảm tình Đảng',        'xd', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-03-12', '2026-03-20', '12/03/2026',     'xong', 8,  3,   'n', true,  ''),
(5,  'KH-05', 'Workshop nến thơm Light Up',            'tn', '{"Ban Tình nguyện"}',                      '{3,10}',    '2026-04-04', '2026-04-10', '04/04/2026',     'xong', 7,  8,   'n', false, 'Workshop Light Up'),
(6,  'KH-06', 'Kế hoạch Bonding LCĐ',                  'hc', '{"Ban Tài chính – Hậu cần"}',              '{5}',       '2026-03-01', '2026-03-15', '01/03/2026',     'xong', 0,  0,   'n', false, ''),
(7,  'KH-07', 'Tổ chức sinh hoạt theo chi đoàn',       'hc', '{"Thường trực","Ban Tổ chức – Kiểm tra"}', '{2,3,4}',  '2026-03-01', '2026-05-31', '01/03/2026',     'chua', 10, 100, '%', true,  ''),
(8,  'KH-08', 'Infographic “Theo dấu Nghị quyết”',      'ct', '{"Ban Truyền thông"}',                     '{7,11}',    '2026-03-01', '2026-03-25', '01/03/2026',     'xong', 0,  0,   'n', false, ''),
(9,  'KH-09', 'IBLUE Tiktok Challenge 2026',           'ct', '{"Ban Truyền thông"}',                     '{7,11}',    '2026-03-01', '2026-03-31', '01/03/2026',     'xong', 6,  5,   'n', false, ''),
(10, 'KH-10', 'Con đường ánh sáng 2026',               'tn', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-03-22', '2026-03-31', '22/03/2026',     'xong', 7,  6,   'n', false, ''),
(11, 'KH-11', 'Nộp hồ sơ bồi dưỡng và phát triển Đảng', 'xd', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-03-01', '2026-03-31', '01/03/2026',     'xong', 0,  0,   'n', false, ''),
(12, 'KH-12', 'Lớp tôi là số 1',                       'ct', '{"Ban Phong trào"}',                       '{8,9}',     '2026-04-01', '2026-04-30', '01/04/2026',     'dang', 10, 80,  '%', true,  ''),
(13, 'KH-13', 'Nộp văn kiện đại hội',                  'hc', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-04-01', '2026-04-15', '01/04/2026',     'xong', 0,  0,   'n', false, 'Đăng ký tham gia BCM LCĐ KHUD'),
(14, 'KH-14', 'Đại hội các chi đoàn năm 1, 2',         'hc', '{"Thường trực","Ban Tổ chức – Kiểm tra"}', '{1,2,3,4}','2026-04-01', '2026-05-31', '4/2026 – 5/2026', 'chua', 10, 100, '%', true,  'MIS K23, K24: các lớp đều tham gia'),
(15, 'KH-15', 'Cuộc thi tìm hiểu về Đảng',             'ct', '{"Ban Tổ chức – Kiểm tra"}',               '{2,4,17}',  '2026-04-01', '2026-04-30', '01/04/2026',     'xong', 10, 60,  '%', true,  ''),
(16, 'KH-16', 'Lấy ý kiến chuyển Đảng (Thúc Kha)',     'xd', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-04-01', '2026-04-30', '01/04/2026',     'xong', 0,  0,   'n', false, ''),
(17, 'KH-17', 'Lấy ý kiến chuyển Đảng (Đức Tú)',       'xd', '{"Ban Tổ chức – Kiểm tra"}',               '{4}',       '2026-05-01', '2026-05-31', '01/05/2026',     'dang', 0,  0,   'n', false, ''),
(18, 'KH-18', 'Study Buddy',                           'ht', '{"Ban Học tập & NCKH"}',                   '{6,12}',    '2026-05-01', '2026-06-30', '5/2026 – 6/2026', 'chua', 8,  10,  'n', false, ''),
(19, 'KH-19', 'Mùa vui Trung thu',                     'tn', '{"Ban Tài chính – Hậu cần"}',              '{2,5}',     '2026-09-15', '2026-09-25', '20/09/2026',     'xong', 9,  12,  'n', true,  ''),
(20, 'KH-20', 'Workshop làm hoa “Sắc hương”',          'tn', '{"Ban Tình nguyện"}',                      '{10,16}',   '2026-10-05', '2026-10-20', '20/10/2026',     'dang', 8,  8,   'n', false, ''),
(21, 'KH-21', 'Star Awards 2026',                      'ht', '{"Ban Học tập & NCKH"}',                   '{1,6}',     '2026-09-04', '2026-10-05', '04/09 – 05/10/26','xong', 11, 20,  'n', true,  '128/170 sinh viên tham dự'),
(22, 'KH-22', 'Kế hoạch BDA Talent 2026',              'ht', '{"Ban Học tập & NCKH"}',                   '{6}',       '2026-11-01', '2026-12-15', 'Coming soon',     'chua', 0,  0,   'n', false, ''),
(23, 'KH-23', 'ISTUBOX KHUD (tài liệu học tập)',       'ht', '{"Ban Học tập & NCKH"}',                   '{6,19}',    '2026-12-01', '2027-01-31', '12/2026 – 01/2027','chua', 0, 0,   'n', false, ''),
(24, 'KH-24', 'Bán dây thẻ KHUD',                      'hc', '{"Ban Tài chính – Hậu cần","Ban Truyền thông"}','{5,11}','2026-11-01', '2026-12-31', 'Coming soon',     'chua', 0,  0,   'n', false, '')
on conflict (id) do nothing;

select setval('public.ke_hoach_id_seq', (select max(id) from public.ke_hoach));

--------------------------------------------------------------------------------
-- 4. BOOTSTRAP INITIAL SYSTEM ADMIN FUNCTION
--------------------------------------------------------------------------------
-- This function allows creating the first system administrator safely.
-- It can only execute once: if an active admin already exists, it rejects.
create or replace function public.bootstrap_initial_admin(p_ten text default 'Quản trị viên')
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_uid uuid;
    v_email text;
    v_admin_count integer;
    v_all_quyen text[] := array[
        'xem_tongquan', 'duyet_bc', 'ql_kh', 'ql_nhansu',
        'nop_bc', 'tuchuc_hd', 'ql_doanvien', 'nhap_excel',
        'ql_csdl', 'ql_user'
    ];
begin
    v_uid := auth.uid();
    if v_uid is null then
        return json_build_object('ok', false, 'msg', 'Chưa xác thực phiên.');
    end if;

    select count(*) into v_admin_count from public.profiles where role = 'admin' and active = true;
    if v_admin_count > 0 then
        return json_build_object('ok', false, 'msg', 'Hệ thống đã có quản trị viên. Không thể bootstrap lại.');
    end if;

    select email into v_email from auth.users where id = v_uid;

    insert into public.profiles (id, email, ten, role, cd_id, active, quyen)
    values (v_uid, coalesce(v_email, ''), p_ten, 'admin', null, true, v_all_quyen)
    on conflict (id) do update set
        role = 'admin',
        active = true,
        quyen = v_all_quyen;

    return json_build_object('ok', true, 'msg', 'Đã thiết lập quản trị viên đầu tiên.');
end;
$$;
