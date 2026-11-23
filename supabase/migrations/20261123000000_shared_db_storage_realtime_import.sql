-- Migration: Shared DB Concurrency, Private Storage, Realtime & Batch Import Reconciliation
-- Depends on: 20261118000000_security_p0_schema_rls.sql

--------------------------------------------------------------------------------
-- 1. UPDATED_AT COLUMNS & TRIGGERS (FOR CONCURRENCY & AUDIT)
--------------------------------------------------------------------------------

alter table public.diem_danh
    add column if not exists updated_at timestamptz not null default now();

alter table public.tep_tin
    add column if not exists updated_at timestamptz not null default now(),
    add column if not exists checksum_sha256 text not null default '',
    add column if not exists created_by uuid references auth.users(id) on delete set null;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'chk_tep_tin_size_limit' and conrelid = 'public.tep_tin'::regclass
    ) then
        alter table public.tep_tin
            add constraint chk_tep_tin_size_limit check (co >= 0 and co <= 26214400);
    end if;
    if not exists (
        select 1 from pg_constraint
        where conname = 'chk_tep_tin_storage_path_len' and conrelid = 'public.tep_tin'::regclass
    ) then
        alter table public.tep_tin
            add constraint chk_tep_tin_storage_path_len check (length(storage_path) <= 512);
    end if;
end $$;

create or replace function public.fn_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    NEW.updated_at := now();
    return NEW;
end;
$$;

drop trigger if exists trg_touch_chi_doan on public.chi_doan;
create trigger trg_touch_chi_doan before update on public.chi_doan
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_nhan_su on public.nhan_su;
create trigger trg_touch_nhan_su before update on public.nhan_su
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_ke_hoach on public.ke_hoach;
create trigger trg_touch_ke_hoach before update on public.ke_hoach
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_moc_cong_tac on public.moc_cong_tac;
create trigger trg_touch_moc_cong_tac before update on public.moc_cong_tac
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_doan_vien on public.doan_vien;
create trigger trg_touch_doan_vien before update on public.doan_vien
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_sinh_hoat on public.sinh_hoat;
create trigger trg_touch_sinh_hoat before update on public.sinh_hoat
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_diem_danh on public.diem_danh;
create trigger trg_touch_diem_danh before update on public.diem_danh
for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_touch_tep_tin on public.tep_tin;
create trigger trg_touch_tep_tin before update on public.tep_tin
for each row execute function public.fn_touch_updated_at();

--------------------------------------------------------------------------------
-- 2. PRIVATE STORAGE BUCKET & IDENTITY/PERMISSION OBJECT POLICIES
--------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'lcdkhud-files',
    'lcdkhud-files',
    false,
    26214400,
    array[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain'
    ]
)
on conflict (id) do update set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_access_storage_object(
    p_bucket text,
    p_name text,
    p_mode text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth, storage
as $$
declare
    v_uid uuid;
    v_role text;
    v_active boolean;
    v_quyen text[];
    v_match text[];
    v_hop_id integer;
begin
    if p_bucket <> 'lcdkhud-files' then
        return false;
    end if;

    v_uid := auth.uid();
    if v_uid is null then
        return false;
    end if;

    select p.role, p.active, p.quyen
      into v_role, v_active, v_quyen
      from public.profiles p
     where p.id = v_uid;

    if not coalesce(v_active, false) or v_role is null then
        return false;
    end if;

    -- Object key must match opaque UUID path scoped to an existing sinh_hoat record (no filename/PII)
    v_match := regexp_match(p_name, '^sinh-hoat/([0-9]+)/[0-9a-fA-F-]{36}(\.[a-z0-9]{1,8})?$');
    if v_match is null then
        return false;
    end if;

    v_hop_id := v_match[1]::integer;
    if not exists (select 1 from public.sinh_hoat where id = v_hop_id) then
        return false;
    end if;

    if p_mode = 'read' then
        return v_role in ('admin', 'lcd', 'bbt', 'cd');
    end if;

    if p_mode in ('write', 'delete') then
        return v_role = 'admin' or (v_role = 'lcd' and 'ql_nhansu' = any(coalesce(v_quyen, '{}')));
    end if;

    return false;
end;
$$;

revoke all on function public.can_access_storage_object(text, text, text) from public, anon;
grant execute on function public.can_access_storage_object(text, text, text) to authenticated;

drop policy if exists "lcdkhud_files_select" on storage.objects;
create policy "lcdkhud_files_select" on storage.objects
for select to authenticated
using (
    bucket_id = 'lcdkhud-files'
    and public.can_access_storage_object(bucket_id, name, 'read')
);

drop policy if exists "lcdkhud_files_insert" on storage.objects;
create policy "lcdkhud_files_insert" on storage.objects
for insert to authenticated
with check (
    bucket_id = 'lcdkhud-files'
    and public.can_access_storage_object(bucket_id, name, 'write')
);

drop policy if exists "lcdkhud_files_update" on storage.objects;
create policy "lcdkhud_files_update" on storage.objects
for update to authenticated
using (
    bucket_id = 'lcdkhud-files'
    and public.can_access_storage_object(bucket_id, name, 'write')
)
with check (
    bucket_id = 'lcdkhud-files'
    and public.can_access_storage_object(bucket_id, name, 'write')
);

drop policy if exists "lcdkhud_files_delete" on storage.objects;
create policy "lcdkhud_files_delete" on storage.objects
for delete to authenticated
using (
    bucket_id = 'lcdkhud-files'
    and public.can_access_storage_object(bucket_id, name, 'delete')
);

--------------------------------------------------------------------------------
-- 3. BATCH IMPORT TRACKING, IDEMPOTENCY, RECONCILIATION & ROLLBACK
--------------------------------------------------------------------------------

create table if not exists public.import_batches (
    id uuid primary key default gen_random_uuid(),
    loai text not null check (loai in ('dv', 'bc', 'ns', 'tl', 'dd', 'json_restore')),
    file_name text not null default '',
    file_checksum text not null check (length(trim(file_checksum)) > 0),
    cd_id integer references public.chi_doan(id) on delete set null,
    created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
    status text not null default 'running' check (status in ('running', 'completed', 'partial', 'failed', 'rolled_back')),
    total_rows integer not null default 0 check (total_rows >= 0),
    created_count integer not null default 0 check (created_count >= 0),
    updated_count integer not null default 0 check (updated_count >= 0),
    skipped_count integer not null default 0 check (skipped_count >= 0),
    error_count integer not null default 0 check (error_count >= 0),
    summary jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    completed_at timestamptz
);

create unique index if not exists uq_import_batches_idem
    on public.import_batches (loai, file_checksum, coalesce(cd_id, 0))
    where status = 'completed';

create table if not exists public.import_batch_items (
    id bigserial primary key,
    batch_id uuid not null references public.import_batches(id) on delete cascade,
    table_name text not null check (table_name in ('chi_doan', 'nhan_su', 'ke_hoach', 'bao_cao', 'hoat_dong', 'doan_vien', 'sinh_hoat', 'diem_danh')),
    record_key text not null check (length(trim(record_key)) > 0),
    action text not null check (action in ('created', 'updated')),
    before_data jsonb,
    after_updated_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_import_batches_created_by on public.import_batches(created_by, created_at desc);
create index if not exists idx_import_batch_items_batch on public.import_batch_items(batch_id);

alter table public.import_batches enable row level security;
alter table public.import_batch_items enable row level security;

grant select, insert, update, delete on public.import_batches to authenticated;
grant select, insert, update, delete on public.import_batch_items to authenticated;
grant usage, select on sequence public.import_batch_items_id_seq to authenticated;

drop policy if exists "import_batches_select" on public.import_batches;
create policy "import_batches_select" on public.import_batches
for select to authenticated
using (
    public.is_admin()
    or public.is_lcd()
    or (created_by = (select auth.uid()) and (cd_id is null or cd_id = (select public.auth_cd_id())))
);

drop policy if exists "import_batches_insert" on public.import_batches;
create policy "import_batches_insert" on public.import_batches
for insert to authenticated
with check (
    created_by = (select auth.uid())
    and (
        public.is_admin()
        or (public.is_lcd() and public.has_permission('nhap_excel'))
        or (cd_id = (select public.auth_cd_id()) and public.has_permission('nhap_excel'))
    )
);

drop policy if exists "import_batches_update" on public.import_batches;
create policy "import_batches_update" on public.import_batches
for update to authenticated
using (
    public.is_admin()
    or public.is_lcd()
    or (created_by = (select auth.uid()) and (cd_id is null or cd_id = (select public.auth_cd_id())))
)
with check (
    public.is_admin()
    or public.is_lcd()
    or (created_by = (select auth.uid()) and (cd_id is null or cd_id = (select public.auth_cd_id())))
);

drop policy if exists "import_batch_items_select" on public.import_batch_items;
create policy "import_batch_items_select" on public.import_batch_items
for select to authenticated
using (
    exists (
        select 1 from public.import_batches b
        where b.id = batch_id
          and (
              public.is_admin()
              or public.is_lcd()
              or (b.created_by = (select auth.uid()) and (b.cd_id is null or b.cd_id = (select public.auth_cd_id())))
          )
    )
);

drop policy if exists "import_batch_items_insert" on public.import_batch_items;
create policy "import_batch_items_insert" on public.import_batch_items
for insert to authenticated
with check (
    exists (
        select 1 from public.import_batches b
        where b.id = batch_id
          and (
              public.is_admin()
              or public.is_lcd()
              or (b.created_by = (select auth.uid()) and (b.cd_id is null or b.cd_id = (select public.auth_cd_id())))
          )
    )
);

-- Atomic bulk attendance RPC (SECURITY INVOKER so RLS executes with caller identity)
create or replace function public.rpc_bulk_set_diem_danh(
    p_hop_id integer,
    p_mode text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
    v_affected integer := 0;
begin
    if not (public.is_admin() or (public.is_lcd() and public.has_permission('ql_nhansu'))) then
        raise exception 'Khong co quyen diem danh hang loat.';
    end if;

    if not exists (select 1 from public.sinh_hoat where id = p_hop_id) then
        raise exception 'Khong tim thay buoi sinh hoat.';
    end if;

    if p_mode = 'co' then
        insert into public.diem_danh (hop_id, ns_id, co, muon)
        select p_hop_id, n.id, true, false
        from public.nhan_su n
        on conflict (hop_id, ns_id) do update
            set co = true,
                muon = false,
                updated_at = now();
        get diagnostics v_affected = row_count;
    elsif p_mode = 'clear' then
        delete from public.diem_danh where hop_id = p_hop_id;
        get diagnostics v_affected = row_count;
    else
        raise exception 'Che do diem danh khong hop le: %', p_mode;
    end if;

    return jsonb_build_object('ok', true, 'affected', v_affected);
end;
$$;

revoke all on function public.rpc_bulk_set_diem_danh(integer, text) from public, anon;
grant execute on function public.rpc_bulk_set_diem_danh(integer, text) to authenticated;

-- Safe import batch rollback RPC (skips rows modified after the batch completed)
create or replace function public.rpc_rollback_import_batch(
    p_batch_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
    v_batch public.import_batches%rowtype;
    v_item record;
    v_deleted integer := 0;
    v_restored integer := 0;
    v_skipped integer := 0;
    v_rc integer := 0;
    v_parts text[];
begin
    select * into v_batch from public.import_batches where id = p_batch_id;
    if not found then
        raise exception 'Khong tim thay lo nhap hoac khong co quyen truy cap.';
    end if;

    if v_batch.status not in ('completed', 'partial') then
        raise exception 'Lo nhap o trang thai % khong the hoan tac.', v_batch.status;
    end if;

    for v_item in
        select * from public.import_batch_items
        where batch_id = p_batch_id
        order by id desc
    loop
        v_rc := 0;
        if v_item.action = 'created' then
            if v_item.table_name = 'doan_vien' then
                delete from public.doan_vien
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'bao_cao' then
                delete from public.bao_cao
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'nhan_su' then
                delete from public.nhan_su
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'ke_hoach' then
                delete from public.ke_hoach
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'sinh_hoat' then
                delete from public.sinh_hoat
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'diem_danh' then
                v_parts := string_to_array(v_item.record_key, ':');
                delete from public.diem_danh
                where hop_id = v_parts[1]::integer and ns_id = v_parts[2]::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            end if;
            if v_rc > 0 then v_deleted := v_deleted + 1; else v_skipped := v_skipped + 1; end if;

        elsif v_item.action = 'updated' and v_item.before_data is not null then
            if v_item.table_name = 'doan_vien' then
                update public.doan_vien set
                    cd_id = (v_item.before_data->>'cd_id')::integer,
                    ten = v_item.before_data->>'ten',
                    mssv = v_item.before_data->>'mssv',
                    cv = v_item.before_data->>'cv',
                    drl = (v_item.before_data->>'drl')::integer,
                    doan_phi = (v_item.before_data->>'doan_phi')::boolean,
                    so_hd = (v_item.before_data->>'so_hd')::integer,
                    ghi_chu = coalesce(v_item.before_data->>'ghi_chu', '')
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'bao_cao' then
                update public.bao_cao set
                    so_luot = (v_item.before_data->>'so_luot')::integer,
                    ngay_nop = (v_item.before_data->>'ngay_nop')::date,
                    mc = coalesce(v_item.before_data->>'mc', ''),
                    status = v_item.before_data->>'status',
                    nx = coalesce(v_item.before_data->>'nx', '')
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'nhan_su' then
                update public.nhan_su set
                    ten = v_item.before_data->>'ten',
                    vai_tro = v_item.before_data->>'vai_tro',
                    ban = v_item.before_data->>'ban',
                    lop = coalesce(v_item.before_data->>'lop', ''),
                    sdt = coalesce(v_item.before_data->>'sdt', ''),
                    mssv = coalesce(v_item.before_data->>'mssv', ''),
                    fb = coalesce(v_item.before_data->>'fb', ''),
                    bch = (v_item.before_data->>'bch')::smallint,
                    nhom = v_item.before_data->>'nhom'
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'ke_hoach' then
                update public.ke_hoach set
                    ten = v_item.before_data->>'ten',
                    hien_thi = coalesce(v_item.before_data->>'hien_thi', ''),
                    tien_do = v_item.before_data->>'tien_do',
                    mc = coalesce(v_item.before_data->>'mc', ''),
                    ket_qua = coalesce(v_item.before_data->>'ket_qua', ''),
                    note = coalesce(v_item.before_data->>'note', '')
                where id = v_item.record_key::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            elsif v_item.table_name = 'diem_danh' then
                v_parts := string_to_array(v_item.record_key, ':');
                update public.diem_danh set
                    co = (v_item.before_data->>'co')::boolean,
                    muon = (v_item.before_data->>'muon')::boolean
                where hop_id = v_parts[1]::integer and ns_id = v_parts[2]::integer
                  and (v_item.after_updated_at is null or updated_at <= v_item.after_updated_at);
                get diagnostics v_rc = row_count;
            end if;
            if v_rc > 0 then v_restored := v_restored + 1; else v_skipped := v_skipped + 1; end if;
        end if;
    end loop;

    update public.import_batches
       set status = 'rolled_back',
           summary = summary || jsonb_build_object(
               'rollback', jsonb_build_object(
                   'at', now(),
                   'deleted', v_deleted,
                   'restored', v_restored,
                   'skipped_modified', v_skipped
               )
           )
     where id = p_batch_id;

    return jsonb_build_object(
        'ok', true,
        'batch_id', p_batch_id,
        'deleted', v_deleted,
        'restored', v_restored,
        'skipped_modified', v_skipped
    );
end;
$$;

revoke all on function public.rpc_rollback_import_batch(uuid) from public, anon;
grant execute on function public.rpc_rollback_import_batch(uuid) to authenticated;

--------------------------------------------------------------------------------
-- 4. REALTIME PUBLICATION (BUSINESS TABLES ONLY — NEVER PROFILES)
--------------------------------------------------------------------------------

alter table public.diem_danh replica identity full;

do $$
declare
    v_tbl text;
    v_tables text[] := array[
        'chi_doan', 'nhan_su', 'ke_hoach', 'moc_cong_tac',
        'bao_cao', 'hoat_dong', 'doan_vien', 'sinh_hoat',
        'diem_danh', 'tep_tin'
    ];
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        foreach v_tbl in array v_tables loop
            if not exists (
                select 1 from pg_publication_tables
                where pubname = 'supabase_realtime'
                  and schemaname = 'public'
                  and tablename = v_tbl
            ) then
                execute format('alter publication supabase_realtime add table public.%I', v_tbl);
            end if;
        end loop;
    end if;
end $$;
