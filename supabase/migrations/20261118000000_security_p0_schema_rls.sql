-- Supabase Schema & Row-Level Security for So tay LCD KHUD
-- Security Level: P0

create schema if not exists public;

-- Enable UUID extension if not already available
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. TABLES
--------------------------------------------------------------------------------

-- Chi doan
create table if not exists public.chi_doan (
    id serial primary key,
    ma text not null unique check (length(trim(ma)) > 0),
    ten text not null check (length(trim(ten)) > 0),
    nganh text not null default '',
    si_so integer not null default 0 check (si_so >= 0),
    bt text not null default '',
    sdt text not null default '',
    diem_tru integer not null default 0 check (diem_tru >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Profiles (Linked to auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null check (length(trim(email)) > 0),
    ten text not null check (length(trim(ten)) > 0),
    role text not null check (role in ('admin', 'lcd', 'cd', 'bbt')),
    cd_id integer references public.chi_doan(id) on delete set null,
    sdt text not null default '',
    active boolean not null default true,
    quyen text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Nhan su LCD
create table if not exists public.nhan_su (
    id serial primary key,
    ten text not null check (length(trim(ten)) > 0),
    vai_tro text not null check (length(trim(vai_tro)) > 0),
    ban text not null check (length(trim(ban)) > 0),
    lop text not null default '',
    sdt text not null default '',
    mssv text not null default '',
    fb text not null default '',
    bch smallint not null default 0 check (bch in (0, 1)),
    nhom text not null default 'bcm' check (nhom in ('bch', 'bcm', 'nguon')),
    theo_doi integer[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Ke hoach & cong tac timeline
create table if not exists public.ke_hoach (
    id serial primary key,
    ma text not null unique check (length(trim(ma)) > 0),
    ten text not null check (length(trim(ten)) > 0),
    crit text not null check (crit in ('ct', 'tn', 'ht', 'xd', 'hc')),
    ban text[] not null default '{}',
    pt_ids integer[] not null default '{}',
    pt_id integer references public.nhan_su(id) on delete set null,
    bat_dau date not null,
    han_chot date not null,
    hien_thi text not null default '',
    tien_do text not null default 'chua' check (tien_do in ('chua', 'dang', 'xong')),
    diem numeric(5,2) not null default 0 check (diem >= 0),
    chi_tieu integer not null default 0 check (chi_tieu >= 0),
    don_vi text not null default 'n' check (don_vi in ('n', '%')),
    bat_buoc boolean not null default false,
    ket_qua text not null default '',
    mc text not null default '',
    note text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Moc cong tac
create table if not exists public.moc_cong_tac (
    id serial primary key,
    kh_id integer not null references public.ke_hoach(id) on delete cascade,
    ten text not null check (length(trim(ten)) > 0),
    han date not null,
    ns_id integer references public.nhan_su(id) on delete set null,
    xong boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Bao cao chi doan
create table if not exists public.bao_cao (
    id serial primary key,
    kh_id integer not null references public.ke_hoach(id) on delete cascade,
    cd_id integer not null references public.chi_doan(id) on delete cascade,
    so_luot integer not null default 0 check (so_luot >= 0),
    ngay_nop date not null default current_date,
    tre_han boolean not null default false,
    mc text not null default '',
    status text not null default 'wait' check (status in ('wait', 'ok', 'no')),
    nx text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_bao_cao_kh_cd unique (kh_id, cd_id)
);

-- Hoat dong tu to chuc cua chi doan
create table if not exists public.hoat_dong (
    id serial primary key,
    cd_id integer not null references public.chi_doan(id) on delete cascade,
    crit text not null check (crit in ('ct', 'tn', 'ht', 'xd', 'hc')),
    ten text not null check (length(trim(ten)) > 0),
    ngay date not null default current_date,
    sl integer not null default 0 check (sl >= 0),
    diem numeric(5,2) not null default 0 check (diem >= 0),
    status text not null default 'wait' check (status in ('wait', 'ok', 'no')),
    mc text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Doan vien
create table if not exists public.doan_vien (
    id serial primary key,
    cd_id integer not null references public.chi_doan(id) on delete cascade,
    ten text not null check (length(trim(ten)) > 0),
    mssv text not null check (length(trim(mssv)) > 0),
    cv text not null default 'Đoàn viên',
    drl integer not null default 0 check (drl >= 0 and drl <= 100),
    doan_phi boolean not null default false,
    so_hd integer not null default 0 check (so_hd >= 0),
    ghi_chu text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_doan_vien_mssv unique (mssv)
);

-- Sinh hoat LCD
create table if not exists public.sinh_hoat (
    id serial primary key,
    ten text not null check (length(trim(ten)) > 0),
    ngay date not null default current_date,
    noi_dung text not null default '',
    bien_ban text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Diem danh sinh hoat
create table if not exists public.diem_danh (
    hop_id integer not null references public.sinh_hoat(id) on delete cascade,
    ns_id integer not null references public.nhan_su(id) on delete cascade,
    co boolean not null default false,
    muon boolean not null default false,
    primary key (hop_id, ns_id)
);

-- Tep tin dinh kem
create table if not exists public.tep_tin (
    id text primary key check (length(trim(id)) > 0),
    hop_id integer not null references public.sinh_hoat(id) on delete cascade,
    ten text not null check (length(trim(ten)) > 0),
    loai text not null default '',
    co integer not null default 0 check (co >= 0),
    storage_path text not null default '',
    created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 2. INDEXES
--------------------------------------------------------------------------------

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_cd_id on public.profiles(cd_id);
create index if not exists idx_ke_hoach_crit on public.ke_hoach(crit);
create index if not exists idx_ke_hoach_tien_do on public.ke_hoach(tien_do);
create index if not exists idx_moc_cong_tac_kh on public.moc_cong_tac(kh_id);
create index if not exists idx_bao_cao_kh on public.bao_cao(kh_id);
create index if not exists idx_bao_cao_cd on public.bao_cao(cd_id);
create index if not exists idx_hoat_dong_cd on public.hoat_dong(cd_id);
create index if not exists idx_doan_vien_cd on public.doan_vien(cd_id);
create index if not exists idx_doan_vien_mssv on public.doan_vien(mssv);
create index if not exists idx_diem_danh_hop on public.diem_danh(hop_id);
create index if not exists idx_diem_danh_ns on public.diem_danh(ns_id);
create index if not exists idx_tep_tin_hop on public.tep_tin(hop_id);

--------------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS (SECURITY DEFINER WITH FIXED SEARCH_PATH)
--------------------------------------------------------------------------------

create or replace function public.current_user_profile()
returns table (
    user_id uuid,
    user_role text,
    user_cd_id integer,
    user_quyen text[],
    user_active boolean
)
language sql
stable
security definer
set search_path = public, auth
as $$
    select p.id, p.role, p.cd_id, p.quyen, p.active
    from public.profiles p
    where p.id = auth.uid() and p.active = true;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin' and active = true
    );
$$;

create or replace function public.is_lcd()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('admin', 'lcd') and active = true
    );
$$;

create or replace function public.auth_cd_id()
returns integer
language sql
stable
security definer
set search_path = public, auth
as $$
    select cd_id from public.profiles
    where id = auth.uid() and active = true;
$$;

create or replace function public.has_permission(p_quyen text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid()
          and active = true
          and (role = 'admin' or p_quyen = any(quyen))
    );
$$;

--------------------------------------------------------------------------------
-- 4. SERVER-SIDE ENFORCEMENT TRIGGERS (INTEGRITY & PRIVILEGE GUARD)
--------------------------------------------------------------------------------

-- Auto-verify bao_cao deadline and block self-approval by Chi doan
create or replace function public.fn_guard_bao_cao()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_role text;
    v_han_chot date;
begin
    select role into v_role from public.profiles where id = auth.uid() and active = true;

    select han_chot into v_han_chot from public.ke_hoach where id = NEW.kh_id;
    if v_han_chot is not null then
        NEW.tre_han := (NEW.ngay_nop > v_han_chot);
    end if;

    if v_role = 'cd' then
        if TG_OP = 'INSERT' then
            NEW.status := 'wait';
            NEW.nx := '';
        elsif TG_OP = 'UPDATE' then
            if OLD.status = 'ok' then
                raise exception 'Bao cao da duoc LCD duyet khong the tu y sua.';
            end if;
            if NEW.status <> 'wait' then
                raise exception 'Chi doan khong co quyen tu duyet bao cao.';
            end if;
            NEW.nx := OLD.nx;
            if NEW.cd_id <> OLD.cd_id then
                raise exception 'Khong duoc phep chuyen chi doan cua bao cao.';
            end if;
        end if;
    end if;

    NEW.updated_at := now();
    return NEW;
end;
$$;

drop trigger if exists trg_guard_bao_cao on public.bao_cao;
create trigger trg_guard_bao_cao
before insert or update on public.bao_cao
for each row execute function public.fn_guard_bao_cao();

-- Guard hoat_dong: Chi doan cannot award points or self-approve
create or replace function public.fn_guard_hoat_dong()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_role text;
begin
    select role into v_role from public.profiles where id = auth.uid() and active = true;

    if v_role = 'cd' then
        if TG_OP = 'INSERT' then
            NEW.status := 'wait';
            NEW.diem := 0;
        elsif TG_OP = 'UPDATE' then
            if OLD.status = 'ok' then
                raise exception 'Hoat dong da duoc LCD duyet khong the tu y sua.';
            end if;
            if NEW.status <> 'wait' then
                raise exception 'Chi doan khong co quyen tu duyet hoat dong.';
            end if;
            NEW.diem := OLD.diem;
            if NEW.cd_id <> OLD.cd_id then
                raise exception 'Khong duoc phep chuyen chi doan cua hoat dong.';
            end if;
        end if;
    end if;

    NEW.updated_at := now();
    return NEW;
end;
$$;

drop trigger if exists trg_guard_hoat_dong on public.hoat_dong;
create trigger trg_guard_hoat_dong
before insert or update on public.hoat_dong
for each row execute function public.fn_guard_hoat_dong();

-- Guard profiles: regular users cannot elevate role, change cd_id, active, or quyen
create or replace function public.fn_guard_profiles()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_admin() then
        if NEW.role <> OLD.role or
           NEW.cd_id is distinct from OLD.cd_id or
           NEW.active <> OLD.active or
           NEW.quyen <> OLD.quyen or
           NEW.id <> OLD.id then
            raise exception 'Chi co Quan tri vien moi co quyen thay doi vai tro va phan quyen.';
        end if;
    end if;
    NEW.updated_at := now();
    return NEW;
end;
$$;

drop trigger if exists trg_guard_profiles on public.profiles;
create trigger trg_guard_profiles
before update on public.profiles
for each row execute function public.fn_guard_profiles();

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.chi_doan enable row level security;
alter table public.nhan_su enable row level security;
alter table public.ke_hoach enable row level security;
alter table public.moc_cong_tac enable row level security;
alter table public.bao_cao enable row level security;
alter table public.hoat_dong enable row level security;
alter table public.doan_vien enable row level security;
alter table public.sinh_hoat enable row level security;
alter table public.diem_danh enable row level security;
alter table public.tep_tin enable row level security;

-- GRANTS
revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- PROFILES
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select to authenticated
using (
    id = (select auth.uid()) or
    public.is_lcd()
);

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
for insert to authenticated
with check (public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
for update to authenticated
using (
    id = (select auth.uid()) or public.is_admin()
)
with check (
    id = (select auth.uid()) or public.is_admin()
);

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles
for delete to authenticated
using (public.is_admin());

-- CHI DOAN
drop policy if exists "chi_doan_select" on public.chi_doan;
create policy "chi_doan_select" on public.chi_doan
for select to authenticated
using (true);

drop policy if exists "chi_doan_insert" on public.chi_doan;
create policy "chi_doan_insert" on public.chi_doan
for insert to authenticated
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_csdl')));

drop policy if exists "chi_doan_update" on public.chi_doan;
create policy "chi_doan_update" on public.chi_doan
for update to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('ql_csdl')) or
    id = (select public.auth_cd_id())
)
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('ql_csdl')) or
    id = (select public.auth_cd_id())
);

drop policy if exists "chi_doan_delete" on public.chi_doan;
create policy "chi_doan_delete" on public.chi_doan
for delete to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_csdl')));

-- KE HOACH & MOC CONG TAC
drop policy if exists "ke_hoach_select" on public.ke_hoach;
create policy "ke_hoach_select" on public.ke_hoach
for select to authenticated
using (true);

drop policy if exists "ke_hoach_write" on public.ke_hoach;
create policy "ke_hoach_write" on public.ke_hoach
for all to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_kh')))
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_kh')));

drop policy if exists "moc_cong_tac_select" on public.moc_cong_tac;
create policy "moc_cong_tac_select" on public.moc_cong_tac
for select to authenticated
using (true);

drop policy if exists "moc_cong_tac_write" on public.moc_cong_tac;
create policy "moc_cong_tac_write" on public.moc_cong_tac
for all to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_kh')))
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_kh')));

-- BAO CAO
drop policy if exists "bao_cao_select" on public.bao_cao;
create policy "bao_cao_select" on public.bao_cao
for select to authenticated
using (
    public.is_lcd() or
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'bbt') or
    cd_id = (select public.auth_cd_id())
);

drop policy if exists "bao_cao_insert" on public.bao_cao;
create policy "bao_cao_insert" on public.bao_cao
for insert to authenticated
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('nop_bc'))
);

drop policy if exists "bao_cao_update" on public.bao_cao;
create policy "bao_cao_update" on public.bao_cao
for update to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('nop_bc') and status <> 'ok')
)
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('nop_bc'))
);

drop policy if exists "bao_cao_delete" on public.bao_cao;
create policy "bao_cao_delete" on public.bao_cao
for delete to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and status = 'wait')
);

-- HOAT DONG
drop policy if exists "hoat_dong_select" on public.hoat_dong;
create policy "hoat_dong_select" on public.hoat_dong
for select to authenticated
using (
    public.is_lcd() or
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'bbt') or
    cd_id = (select public.auth_cd_id())
);

drop policy if exists "hoat_dong_insert" on public.hoat_dong;
create policy "hoat_dong_insert" on public.hoat_dong
for insert to authenticated
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('tuchuc_hd'))
);

drop policy if exists "hoat_dong_update" on public.hoat_dong;
create policy "hoat_dong_update" on public.hoat_dong
for update to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('tuchuc_hd') and status <> 'ok')
)
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('tuchuc_hd'))
);

drop policy if exists "hoat_dong_delete" on public.hoat_dong;
create policy "hoat_dong_delete" on public.hoat_dong
for delete to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('duyet_bc')) or
    (cd_id = (select public.auth_cd_id()) and status = 'wait')
);

-- DOAN VIEN
drop policy if exists "doan_vien_select" on public.doan_vien;
create policy "doan_vien_select" on public.doan_vien
for select to authenticated
using (
    public.is_lcd() or
    cd_id = (select public.auth_cd_id())
);

drop policy if exists "doan_vien_insert" on public.doan_vien;
create policy "doan_vien_insert" on public.doan_vien
for insert to authenticated
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('ql_nhansu')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('ql_doanvien'))
);

drop policy if exists "doan_vien_update" on public.doan_vien;
create policy "doan_vien_update" on public.doan_vien
for update to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('ql_nhansu')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('ql_doanvien'))
)
with check (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('ql_nhansu')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('ql_doanvien'))
);

drop policy if exists "doan_vien_delete" on public.doan_vien;
create policy "doan_vien_delete" on public.doan_vien
for delete to authenticated
using (
    public.is_admin() or
    (public.is_lcd() and public.has_permission('ql_nhansu')) or
    (cd_id = (select public.auth_cd_id()) and public.has_permission('ql_doanvien'))
);

-- NHAN SU
drop policy if exists "nhan_su_select" on public.nhan_su;
create policy "nhan_su_select" on public.nhan_su
for select to authenticated
using (true);

drop policy if exists "nhan_su_write" on public.nhan_su;
create policy "nhan_su_write" on public.nhan_su
for all to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')))
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')));

-- SINH HOAT & DIEM DANH
drop policy if exists "sinh_hoat_select" on public.sinh_hoat;
create policy "sinh_hoat_select" on public.sinh_hoat
for select to authenticated
using (true);

drop policy if exists "sinh_hoat_write" on public.sinh_hoat;
create policy "sinh_hoat_write" on public.sinh_hoat
for all to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')))
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')));

drop policy if exists "diem_danh_select" on public.diem_danh;
create policy "diem_danh_select" on public.diem_danh
for select to authenticated
using (true);

drop policy if exists "diem_danh_write" on public.diem_danh;
create policy "diem_danh_write" on public.diem_danh
for all to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')))
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')));

-- TEP TIN
drop policy if exists "tep_tin_select" on public.tep_tin;
create policy "tep_tin_select" on public.tep_tin
for select to authenticated
using (true);

drop policy if exists "tep_tin_write" on public.tep_tin;
create policy "tep_tin_write" on public.tep_tin
for all to authenticated
using (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')))
with check (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu')));
