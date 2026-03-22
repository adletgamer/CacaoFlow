"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, FilePlus, Briefcase, Calculator, LayoutDashboard, Globe, TrendingUp, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LogIn } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useLangStore } from "@/store/langStore";
import { WalletButton } from "@/components/features/WalletButton";
import { supabase } from "@/lib/supabase";

export function AppNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useT();
  const { lang, setLang } = useLangStore();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Restaurando el menú completo para todos, agregando Estadísticas, y removiendo Register Plot.
  const navItems = [
    { href: "/app", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/app/opportunities", label: t("nav.opportunities"), icon: TrendingUp },
    { href: "/app/lots", label: t("nav.myPlots"), icon: BarChart3 },
    { href: "/app/financing", label: t("nav.financingReview"), icon: Briefcase },
    { href: "/app/simulation", label: t("nav.outcomeSimulation"), icon: Calculator },
    { href: "/app/stats", label: "Market Stats", icon: TrendingUp }, // Nueva sección
  ];

  function toggleLang() {
    setLang(lang === "en" ? "es" : "en");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[66px] items-center justify-between">
        <Link href="/" className="relative flex items-center h-[50px] w-[140px] shrink-0">
          <Image src="/logo.png" alt="Cacao Flow" fill className="object-contain object-left" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3 border-r border-border/50 pr-4 mr-1">
              <span className="text-sm font-medium text-foreground">
                {session.user.user_metadata?.display_name || session.user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-r border-border/50 pr-4 mr-1">
              <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 px-3">
                <Link href="/app/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="accent" size="sm" asChild className="h-8 gap-1.5 px-3">
                <Link href="/app/signup">
                  <UserPlus className="h-4 w-4" />
                  Registro
                </Link>
              </Button>
            </div>
          )}
          <WalletButton />
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50"
            title={lang === "en" ? t("nav.lang.es") : t("nav.lang.en")}
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "ES" : "EN"}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "ES" : "EN"}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
