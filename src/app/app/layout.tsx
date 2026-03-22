import { AppNavbar } from "@/components/shared/AppNavbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container py-8 space-y-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
