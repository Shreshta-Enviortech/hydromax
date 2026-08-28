-- ============================================================================
-- HYDROMAX — SUPABASE SCHEMA
-- Blog system + CRM shell
--
-- HOW TO RUN:
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file -> Run
--   Safe to re-run: everything uses IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================================


-- ============================================================================
-- 1. HELPERS
-- ============================================================================

-- Keeps updated_at accurate on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- 2. BLOG
-- ============================================================================

create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),

  -- core content
  title             text not null,
  slug              text not null unique,
  excerpt           text,
  category          text,
  content           text,
  -- how `content` should be rendered on the public site
  content_format    text not null default 'markdown'
                      check (content_format in ('markdown','html')),

  -- byline
  author_name       text,
  author_role       text,

  -- media (full URL; either a Supabase Storage public URL or any external URL)
  featured_image_url text,

  -- publishing
  status            text not null default 'draft'
                      check (status in ('draft','published','archived')),
  publish_date      timestamptz,
  read_time_minutes integer,

  -- SEO
  seo_title         text,
  seo_description   text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Indexes that match how the site actually queries.
create index if not exists blog_posts_status_publish_idx
  on public.blog_posts (status, publish_date desc);
create index if not exists blog_posts_slug_idx
  on public.blog_posts (slug);
create index if not exists blog_posts_category_idx
  on public.blog_posts (category);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();


-- ============================================================================
-- 3. CRM SHELL
-- ============================================================================

create table if not exists public.accounts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  industry     text,
  website      text,
  phone        text,
  address      text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid references public.accounts(id) on delete set null,
  first_name   text not null,
  last_name    text,
  email        text,
  phone        text,
  job_title    text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  phone        text,
  company      text,
  -- where the lead came from: 'website-form', 'referral', 'call', ...
  source       text,
  status       text not null default 'new'
                 check (status in ('new','contacted','qualified','unqualified','converted')),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.deals (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid references public.accounts(id) on delete set null,
  contact_id    uuid references public.contacts(id) on delete set null,
  title         text not null,
  value         numeric(14,2),
  currency      text not null default 'INR',
  stage         text not null default 'enquiry'
                  check (stage in ('enquiry','site-visit','quotation','negotiation','won','lost')),
  expected_close date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  due_date     date,
  priority     text not null default 'medium'
                 check (priority in ('low','medium','high')),
  status       text not null default 'open'
                 check (status in ('open','in-progress','done','cancelled')),
  -- optional links back to CRM records
  account_id   uuid references public.accounts(id) on delete cascade,
  contact_id   uuid references public.contacts(id) on delete cascade,
  deal_id      uuid references public.deals(id)    on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  -- 'call' | 'email' | 'meeting' | 'site-visit' | 'note'
  activity_type text not null default 'note',
  subject       text,
  body          text,
  occurred_at   timestamptz not null default now(),
  account_id    uuid references public.accounts(id) on delete cascade,
  contact_id    uuid references public.contacts(id) on delete cascade,
  deal_id       uuid references public.deals(id)    on delete cascade,
  lead_id       uuid references public.leads(id)    on delete cascade,
  created_at    timestamptz not null default now()
);

-- CRM indexes
create index if not exists contacts_account_idx   on public.contacts (account_id);
create index if not exists deals_account_idx      on public.deals (account_id);
create index if not exists deals_stage_idx        on public.deals (stage);
create index if not exists leads_status_idx       on public.leads (status);
create index if not exists tasks_status_due_idx   on public.tasks (status, due_date);
create index if not exists activities_occurred_idx on public.activities (occurred_at desc);

-- updated_at triggers
drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at before update on public.accounts
  for each row execute function public.set_updated_at();

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists deals_set_updated_at on public.deals;
create trigger deals_set_updated_at before update on public.deals
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();


-- ============================================================================
-- 4. ROW LEVEL SECURITY
--
-- The anon key is public — it ships inside your JavaScript. RLS is therefore
-- the ONLY thing standing between a stranger and your data. Rules below:
--
--   blog_posts : anyone may READ published posts. Only a logged-in admin may
--                read drafts or write anything.
--   CRM tables : logged-in admin only, for both read and write.
-- ============================================================================

alter table public.blog_posts enable row level security;
alter table public.accounts   enable row level security;
alter table public.contacts   enable row level security;
alter table public.leads      enable row level security;
alter table public.deals      enable row level security;
alter table public.tasks      enable row level security;
alter table public.activities enable row level security;

-- ---- blog_posts -----------------------------------------------------------

-- Public site: published posts only.
drop policy if exists "public reads published posts" on public.blog_posts;
create policy "public reads published posts"
  on public.blog_posts for select
  to anon
  using (status = 'published');

-- Admin: full access once signed in.
drop policy if exists "admin reads all posts" on public.blog_posts;
create policy "admin reads all posts"
  on public.blog_posts for select
  to authenticated
  using (true);

drop policy if exists "admin inserts posts" on public.blog_posts;
create policy "admin inserts posts"
  on public.blog_posts for insert
  to authenticated
  with check (true);

drop policy if exists "admin updates posts" on public.blog_posts;
create policy "admin updates posts"
  on public.blog_posts for update
  to authenticated
  using (true) with check (true);

drop policy if exists "admin deletes posts" on public.blog_posts;
create policy "admin deletes posts"
  on public.blog_posts for delete
  to authenticated
  using (true);

-- ---- CRM tables: authenticated only, all operations ------------------------

do $$
declare t text;
begin
  foreach t in array array['accounts','contacts','leads','deals','tasks','activities']
  loop
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I
         for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;


-- ============================================================================
-- 5. STORAGE — blog media bucket
--
-- Creates a public-read bucket for featured images and in-post media.
-- Public read is intentional: images must load for site visitors.
-- Uploads and deletes require a logged-in admin.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public reads blog media" on storage.objects;
create policy "public reads blog media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "admin uploads blog media" on storage.objects;
create policy "admin uploads blog media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-media');

drop policy if exists "admin updates blog media" on storage.objects;
create policy "admin updates blog media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "admin deletes blog media" on storage.objects;
create policy "admin deletes blog media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-media');


-- ============================================================================
-- 6. SEED — one sample post so the public pages have something to render
-- ============================================================================

insert into public.blog_posts
  (title, slug, excerpt, category, content, content_format,
   author_name, author_role, status, publish_date, read_time_minutes,
   seo_title, seo_description)
values
  ('Why Regular STP Maintenance Protects Your Investment',
   'why-regular-stp-maintenance-protects-your-investment',
   'Preventive maintenance costs a fraction of emergency repairs — and keeps your plant compliant.',
   'Maintenance',
   E'## The cost of waiting\n\nMost sewage treatment plant failures do not happen suddenly. They build up over months through worn diffusers, scaled membranes, and drifting dosing rates.\n\n### What a maintenance contract covers\n\n- Scheduled inspection of pumps, blowers and panels\n- Membrane and diffuser condition checks\n- Dosing calibration\n- Compliance record keeping for the Pollution Control Board\n\nA plant under contract typically avoids the two most expensive failure modes: complete blower loss and membrane replacement caused by fouling.',
   'markdown',
   'Somesh Vemula', 'Founder & Managing Director',
   'published', now(), 4,
   'Why Regular STP Maintenance Protects Your Investment | Hydromax',
   'Preventive STP maintenance costs far less than emergency repairs. Here is what a Hydromax AMC covers and why it matters.')
on conflict (slug) do nothing;


-- ============================================================================
-- DONE
--
-- Next: Authentication -> Users -> Add user  (this is your single admin login)
--       Settings -> API   -> copy Project URL + anon public key
-- ============================================================================
