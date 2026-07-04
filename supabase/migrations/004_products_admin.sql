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
