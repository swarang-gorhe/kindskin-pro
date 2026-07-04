export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen admin-page-bg flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
