-- KindSkin: all migrations (001-005). Paste in Supabase SQL Editor and Run.

-- ===== 001_kb_entries.sql =====
-- Enable pgvector and create knowledge base table for RAG chatbot
create extension if not exists vector;

create table if not exists kb_entries (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists kb_entries_embedding_idx
  on kb_entries using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC for semantic search (used by async retrieval)
create or replace function match_kb_entries(
  query_embedding vector(1536),
  match_threshold float default 0.72,
  match_count int default 5
)
returns table (
  id text,
  category text,
  question text,
  answer text,
  similarity float
)
language sql stable
as $$
  select
    kb_entries.id,
    kb_entries.category,
    kb_entries.question,
    kb_entries.answer,
    1 - (kb_entries.embedding <=> query_embedding) as similarity
  from kb_entries
  where kb_entries.embedding is not null
    and 1 - (kb_entries.embedding <=> query_embedding) > match_threshold
  order by kb_entries.embedding <=> query_embedding
  limit match_count;
$$;

-- ===== 002_orders.sql =====
-- Orders and order items for KindSkin commerce flow

create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text not null,
  pincode text not null,
  total_amount integer not null,
  status text not null default 'confirmed',
  tracking_number text,
  carrier text default 'KindSkin Delivery',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

create index if not exists orders_email_idx on orders (customer_email);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists order_items_order_id_idx on order_items (order_id);

-- Order status history for tracking timeline
create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  status text not null,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists order_status_events_order_id_idx on order_status_events (order_id);

-- ===== 003_profiles.sql =====
-- User profiles linked to Supabase Auth (roles for admin access)

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on profiles (email);
create index if not exists profiles_role_idx on profiles (role);

-- Keep updated_at fresh on role changes
create or replace function profiles_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function profiles_set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- RLS: users read own profile; only service role / admin flows update roles via backend scripts
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- Role changes are performed only via service-role scripts (e.g. create_admin.py), not by clients.

-- ===== 004_products_admin.sql =====
-- Products catalog, stock tracking, and admin audit log

-- Extend profiles roles for future staff access
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('user', 'customer', 'staff', 'admin'));

-- Products (slug matches existing order_items.product_id text ids)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text not null default '',
  short_description text not null default '',
  price integer not null check (price >= 0),
  category text not null default 'General',
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  rating numeric(3, 2) not null default 4.5,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_slug_idx on products (slug);
create index if not exists products_active_idx on products (is_active);
create index if not exists products_stock_idx on products (stock_quantity);

-- Seed existing catalog (idempotent via slug)
insert into products (slug, name, tagline, short_description, description, price, category, image, images, benefits, stock_quantity, rating, review_count)
values
  (
    'aloe-vera-gel',
    'Aloe Vera Gel',
    'Pure Hydration. Everyday Care.',
    'Experience the refreshing goodness of pure Aloe Vera in a lightweight gel that instantly hydrates, soothes, and revitalizes your skin.',
    'KindSkin Co. Aloe Vera Gel is made using fresh Aloe Vera with purified water to deliver a lightweight, cooling formula suitable for daily skincare.',
    100,
    'Face & Body',
    '/images/products/aloe-vera-gel.jpg',
    '["/images/products/aloe-vera-gel.jpg","/images/products/aloe-texture.jpg","/images/products/aloe-vera-gel-1.jpg"]'::jsonb,
    '["Deep hydration","Cooling sensation","Lightweight formula"]'::jsonb,
    100,
    4.8,
    124
  ),
  (
    'lip-balm',
    'Nourishing Lip Balm',
    'Soft Lips. Natural Care.',
    'A nourishing lip balm crafted to keep your lips soft, smooth, and moisturized.',
    'KindSkin Co. Lip Balm is designed to provide long-lasting hydration while leaving your lips feeling soft and comfortable throughout the day.',
    50,
    'Lip Care',
    '/images/products/lip-balm-lineup.jpg',
    '["/images/products/lip-balm-lineup.jpg","/images/products/lip-balm-strawberry.jpg","/images/products/lip-balm.jpg"]'::jsonb,
    '["Moisturizes dry lips","Softens lips","Lightweight texture"]'::jsonb,
    100,
    4.7,
    89
  ),
  (
    'abhyang-tel',
    'Abhyang Tel',
    'Ayurvedic Body Nourishment.',
    'Traditional Ayurvedic massage oil for relaxing body care and deep nourishment.',
    'Abhyang Tel is an Ayurvedic-inspired massage oil designed for relaxing body massage and skin nourishment.',
    120,
    'Body Care',
    '/images/products/abhyang-tel.jpg',
    '["/images/products/abhyang-tel.jpg","/images/products/abhyang-oil.jpg","/images/products/abhyang-herbs.jpg"]'::jsonb,
    '["Deep nourishment","Relaxing massage","Natural herbs"]'::jsonb,
    100,
    4.9,
    67
  )
on conflict (slug) do nothing;

-- Stock movement log
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete restrict,
  change_amount integer not null,
  reason text not null check (reason in (
    'order_placed', 'order_cancelled', 'manual_adjustment', 'restock', 'correction'
  )),
  reference_order_id text references orders (id) on delete set null,
  admin_id uuid references profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx on stock_movements (product_id);
create index if not exists stock_movements_order_idx on stock_movements (reference_order_id);

-- Admin audit log
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles (id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_admin_idx on admin_audit_log (admin_id);
create index if not exists admin_audit_log_entity_idx on admin_audit_log (entity_type, entity_id);

-- Order admin fields
alter table orders add column if not exists payment_status text not null default 'unpaid';
alter table orders add column if not exists internal_notes text not null default '';

alter table orders drop constraint if exists orders_payment_status_check;
alter table orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'paid', 'refunded', 'failed'));

-- ===== 005_discounts.sql =====
-- Discount codes for KindSkin checkout (admin-managed)

create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null default '',
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  value integer not null check (value >= 0),
  min_order_amount integer not null default 0 check (min_order_amount >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  applies_to text not null default 'all' check (applies_to in ('all', 'product', 'category')),
  product_slugs jsonb not null default '[]'::jsonb,
  category text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discounts_code_idx on discounts (code);
create index if not exists discounts_active_idx on discounts (is_active);

-- Seed example (optional — deactivate from admin)
insert into discounts (code, name, description, discount_type, value, min_order_amount, is_active)
values (
  'KIND10',
  '10% off',
  'Ten percent off orders above ₹200',
  'percentage',
  10,
  200,
  false
)
on conflict (code) do nothing;

-- ===== 005_discounts.sql =====
-- Discount codes for KindSkin checkout (admin-managed)

create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null default '',
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  value integer not null check (value >= 0),
  min_order_amount integer not null default 0 check (min_order_amount >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  applies_to text not null default 'all' check (applies_to in ('all', 'product', 'category')),
  product_slugs jsonb not null default '[]'::jsonb,
  category text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discounts_code_idx on discounts (code);
create index if not exists discounts_active_idx on discounts (is_active);

-- Seed example (optional — deactivate from admin)
insert into discounts (code, name, description, discount_type, value, min_order_amount, is_active)
values (
  'KIND10',
  '10% off',
  'Ten percent off orders above ₹200',
  'percentage',
  10,
  200,
  false
)
on conflict (code) do nothing;

