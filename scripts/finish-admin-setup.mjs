#!/usr/bin/env node
/**
 * Finish KindSkin admin setup (confirm email + promote to admin).
 * Requires SUPABASE_SERVICE_KEY in environment.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY='sb_secret_...' node scripts/finish-admin-setup.mjs
 */

const PROJECT_URL = "https://gcaaupopzmxxwkkjwzij.supabase.co";
const ADMIN_EMAIL = "swanand.pushkaraj.akolkar@dpsnashik.in";
const USER_ID = "74a4a1e5-58e7-4221-8822-3bdb1d5579b6";

const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim();
if (!serviceKey) {
  console.error("Error: Set SUPABASE_SERVICE_KEY (service role key from Supabase Dashboard → API).");
  process.exit(1);
}

async function adminFetch(path, options = {}) {
  const res = await fetch(`${PROJECT_URL}${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  console.log("1. Confirming email for admin user…");
  await adminFetch(`/auth/v1/admin/users/${USER_ID}`, {
    method: "PUT",
    body: JSON.stringify({ email_confirm: true }),
  });
  console.log("   ✓ Email confirmed");

  console.log("2. Promoting to admin in profiles…");
  const profile = await adminFetch("/rest/v1/profiles", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: USER_ID,
      email: ADMIN_EMAIL,
      role: "admin",
    }),
  });
  console.log("   ✓ Profile:", profile);

  console.log("\nDone. Sign in at https://kindskin-pro.vercel.app/admin/login");
  console.log(`Email: ${ADMIN_EMAIL}`);
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  if (String(err.message).includes("profiles")) {
    console.error(
      "\nProfiles table missing. Run supabase/one_click_admin_setup.sql in Supabase SQL Editor first."
    );
  }
  process.exit(1);
});
