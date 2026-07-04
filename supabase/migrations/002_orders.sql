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
