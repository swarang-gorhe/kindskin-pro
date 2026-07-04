-- Run in Supabase SQL Editor AFTER creating the auth user in Dashboard.
-- Dashboard → Authentication → Users → Add user:
--   Email: swanand.pushkaraj.akolkar@dpsnashik.in
--   Password: (set in dashboard — do not commit passwords to git)
--   ✓ Auto Confirm User

-- Ensure profiles table exists (migration 003)
-- Then promote to admin:
insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = lower('swanand.pushkaraj.akolkar@dpsnashik.in')
on conflict (id) do update
  set role = 'admin', email = excluded.email, updated_at = now();
