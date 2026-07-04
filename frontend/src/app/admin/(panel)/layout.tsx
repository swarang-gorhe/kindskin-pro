import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminUser } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  let supabase;
  try {
    supabase = createClient(cookieStore);
  } catch {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  const profilesMissing = profileError?.code === "PGRST205";
  if (profileError && !profilesMissing) {
    redirect("/admin/login");
  }

  if (!isAdminUser(user, profile)) {
    redirect("/admin/login");
  }

  const displayEmail =
    profile?.email || user.email || (user.app_metadata?.email as string) || "Admin";

  return (
    <AdminShell email={displayEmail}>{children}</AdminShell>
  );
}
