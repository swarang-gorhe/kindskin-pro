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
