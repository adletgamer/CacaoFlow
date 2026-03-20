import { AppNavbar } from "@/components/shared/AppNavbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <AppNavbar />
      <main className="container py-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
