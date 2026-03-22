"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveOpportunityPanel } from "@/components/features/LiveOpportunityPanel";
import { WalletButton } from "@/components/features/WalletButton";
import { motion } from "framer-motion";
import {
  ArrowRight, Shield, BarChart3, Coins, CheckCircle2, Globe,
  Users, Building2, Zap, Layers, GitBranch, ArrowUpRight,
  Lock, Activity,
} from "lucide-react";
import { useT } from "@/hooks/useT";
import { useLangStore } from "@/store/langStore";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const CHAIN_ROADMAP = [
  {
    phase: "MVP · Hackathon",
    status: "live" as const,
    chain: "Avalanche Fuji",
    tag: "Testnet · Only chain in scope",
    features: [
      "MockUSDC funding rails",
      "Full lifecycle: Draft → Repaid",
      "Real-time funding progress",
      "Investor position tracking",
    ],
  },
  {
    phase: "Post-MVP",
    status: "next" as const,
    chain: "Avalanche C-Chain",
    tag: "Mainnet · After hackathon",
    features: [
      "Native USDC (Circle)",
      "Production contract deploy",
      "Snowtrace verification",
      "Real capital, real cacao",
    ],
  },
  {
    phase: "Expansion",
    status: "planned" as const,
    chain: "USDC CCTP Bridge",
    tag: "Cross-chain · Roadmap",
    features: [
      "Circle CCTP protocol",
      "Invest from Arbitrum / ETH",
      "No wrapped tokens",
      "Unified USDC liquidity",
    ],
  },
  {
    phase: "Future",
    status: "future" as const,
    chain: "Chain Abstraction",
    tag: "ZeroDev · Smart Accounts",
    features: [
      "Account abstraction (AA)",
      "Invest from any EVM chain",
      "Gas sponsorship",
      "Smart account sessions",
    ],
  },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useT();
  const { lang, setLang } = useLangStore();

  const steps = [
    { icon: Zap,      label: "01", title: t("landing.flow.step1.title"), desc: t("landing.flow.step1.desc") },
    { icon: BarChart3,label: "02", title: t("landing.flow.step2.title"), desc: t("landing.flow.step2.desc") },
    { icon: Shield,   label: "03", title: t("landing.flow.step3.title"), desc: t("landing.flow.step3.desc") },
    { icon: Coins,    label: "04", title: t("landing.flow.step4.title"), desc: t("landing.flow.step4.desc") },
  ];

  const trustItems = [
    { icon: Lock,     title: t("landing.trust.item1.title"), desc: t("landing.trust.item1.desc") },
    { icon: Activity, title: t("landing.trust.item2.title"), desc: t("landing.trust.item2.desc") },
    { icon: Layers,   title: t("landing.trust.item3.title"), desc: t("landing.trust.item3.desc") },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-[66px] items-center justify-between">
          <Link href="/" className="relative flex items-center h-[50px] w-[140px] shrink-0">
            <Image src="/logo.png" alt="Cacao Flow" fill className="object-contain object-left" priority />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/app">
                {t("nav.dashboard")}
              </Link>
            </Button>
            <WalletButton />
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/60"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Protocol bar ─────────────────────────────────────── */}
      <div className="border-b border-border bg-primary/[0.03]">
        <div className="container h-9 flex items-center gap-6 overflow-x-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-medium text-accent">Live</span>
            · Avalanche Fuji Testnet
          </span>
          <span className="text-border">|</span>
          <span className="shrink-0">MockUSDC · Faucet available</span>
          <span className="text-border">|</span>
          <span className="shrink-0">On-chain lifecycle</span>
          <span className="text-border">|</span>
          <span className="shrink-0">Open source · MIT</span>
          <span className="text-border hidden sm:block">|</span>
          <span className="shrink-0 hidden sm:block">Aleph Hackathon 2026</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div variants={stagger} initial="initial" animate="animate">

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-5 flex-wrap">
                <Badge variant="outline" className="text-xs font-medium tracking-wide">
                  {t("landing.badge")}
                </Badge>
                <Badge className="text-xs font-medium bg-accent/10 text-accent border-accent/20 hover:bg-accent/10 gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  Avalanche Fuji
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-foreground leading-[1.08]"
              >
                {t("landing.hero.title")}
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-5 text-base text-muted-foreground leading-relaxed max-w-[480px]">
                {t("landing.hero.subtitle")}
              </motion.p>

              <motion.ul variants={fadeUp} className="mt-6 space-y-2.5">
                {[
                  t("landing.hero.bullets.bullet1"),
                  t("landing.hero.bullets.bullet2"),
                  t("landing.hero.bullets.bullet3"),
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" style={{width:18,height:18}} />
                    {b}
                  </li>
                ))}
              </motion.ul>

              <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3 flex-wrap">
                <Button variant="hero" size="lg" className="font-semibold gap-2" asChild>
                  <Link href="/app/opportunities">
                    {t("landing.cta.primary")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="font-semibold" asChild>
                  <Link href="/app/signup">
                    {t("landing.cta.secondary")}
                  </Link>
                </Button>
              </motion.div>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:pl-4"
            >
              <LiveOpportunityPanel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Two roles ────────────────────────────────────────── */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Platform</p>
            <h2 className="text-2xl font-semibold text-foreground">{t("landing.roles.title")}</h2>
          </motion.div>

          {!isLoggedIn ? (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="bg-background border border-border/60 p-8 rounded-xl shadow-sm">
                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Acceso a la Plataforma</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Cacao Flow es una plataforma segura. Por conveniencia del sistema y para garantizar la integridad de las transacciones, requerimos que los usuarios creen una cuenta gratuita. No existen cargos ocultos ni comisiones por registro.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button variant="outline" size="lg" onClick={() => setIsLoggedIn(true)}>
                    Simular Sesión Activa (Login)
                  </Button>
                  <Button variant="accent" size="lg" asChild>
                    <Link href="/app/signup">
                      Crear mi cuenta gratis
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto relative">
              <div className="absolute -top-12 right-0">
                <Button variant="outline" size="sm" onClick={() => setIsLoggedIn(false)} className="text-xs">
                  Cerrar Sesión (Simulado)
                </Button>
              </div>
              {[
                {
                  icon: Building2, color: "primary" as const,
                  title: t("landing.roles.originator.title"),
                  desc: t("landing.roles.originator.desc"),
                  cta: t("landing.roles.originator.cta"),
                  href: "/app/signup",
                  variant: "accent" as const,
                },
                {
                  icon: Users, color: "accent" as const,
                  title: t("landing.roles.investor.title"),
                  desc: t("landing.roles.investor.desc"),
                  cta: t("landing.roles.investor.cta"),
                  href: "/app/financing",
                  variant: "outline" as const,
                },
              ].map((role, i) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className={`h-full transition-colors hover:border-${role.color}/40 border-${role.color}/20`}>
                    <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                      <div className={`h-10 w-10 rounded-lg bg-${role.color}/10 flex items-center justify-center`}>
                        <role.icon className={`h-5 w-5 text-${role.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.desc}</p>
                      </div>
                      <Button variant={role.variant} size="sm" className="w-full gap-1 mt-auto" asChild>
                        <Link href={role.href}>
                          {role.cta} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Workflow</p>
            <h2 className="text-2xl font-semibold text-foreground">{t("landing.flow.title")}</h2>
            <p className="text-sm text-muted-foreground mt-1.5">{t("landing.flow.subtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Card className="h-full group hover:border-primary/30 transition-colors">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-2xl font-bold text-muted-foreground/20 leading-none mt-0.5 tabular-nums">
                        {step.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Multi-Chain Roadmap ───────────────────────────────── */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Infrastructure</p>
            <h2 className="text-2xl font-semibold text-foreground">Multi-Chain Roadmap</h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto">
              The hackathon MVP runs exclusively on Avalanche Fuji. Multichain expansion is explicitly post-MVP.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {CHAIN_ROADMAP.map((item, i) => {
              const isLive    = item.status === "live";
              const isNext    = item.status === "next";
              const isPlanned = item.status === "planned";

              return (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Card className={`h-full relative overflow-hidden transition-colors ${
                    isLive
                      ? "border-primary/40 bg-primary/[0.03]"
                      : isNext
                      ? "border-accent/30 bg-accent/[0.02]"
                      : "border-border/60"
                  }`}>
                    {isLive && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                    {isNext && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
                    )}
                    <CardContent className="pt-5 pb-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.phase}
                        </span>
                        {isLive && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 gap-1">
                            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                            Live
                          </Badge>
                        )}
                        {isNext && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-accent/10 text-accent border-accent/20 hover:bg-accent/10">
                            Next
                          </Badge>
                        )}
                        {isPlanned && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Planned
                          </Badge>
                        )}
                        {item.status === "future" && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                            Future
                          </Badge>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <GitBranch className={`h-3.5 w-3.5 shrink-0 ${isLive ? "text-primary" : isNext ? "text-accent" : "text-muted-foreground"}`} />
                          <h3 className={`font-semibold text-sm ${isLive ? "text-primary" : isNext ? "text-foreground" : "text-muted-foreground"}`}>
                            {item.chain}
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.tag}</p>
                      </div>

                      <ul className="space-y-1.5 mt-1">
                        {item.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <CheckCircle2 className={`h-3 w-3 shrink-0 mt-0.5 ${isLive ? "text-primary" : isNext ? "text-accent/80" : "text-border"}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 max-w-2xl mx-auto grid sm:grid-cols-3 gap-4 text-center"
          >
            {[
              { label: "Avalanche Fuji only", desc: "Single chain for the MVP" },
              { label: "CCTP post-MVP", desc: "Circle bridge after hackathon" },
              { label: "ZeroDev future", desc: "Chain abstraction, smart accounts" },
            ].map((item) => (
              <div key={item.label} className="px-4 py-3 rounded-lg border border-border/60 bg-background">
                <p className="text-xs font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust / Security ─────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container py-14">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Architecture</p>
              <h2 className="text-2xl font-semibold">{t("landing.trust.title")}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {trustItems.map((item) => (
                <div key={item.title} className="flex flex-col gap-3 p-4 rounded-lg border border-border/60 bg-secondary/20">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="container py-14 text-center">
          <div className="max-w-xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-3">Get started</p>
            <h2 className="text-2xl font-semibold text-primary-foreground mb-2">
              {t("landing.finalCta.title")}
            </h2>
            <p className="text-sm text-primary-foreground/60 mb-7">
              {t("landing.finalCta.subtitle")}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button variant="accent" size="lg" className="h-11 px-7 font-semibold gap-2" asChild>
                <Link href="/app/signup">
                  {t("landing.finalCta.btn")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" className="h-11 px-7 font-semibold bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/20 gap-2" asChild>
                <Link href="/app/opportunities">
                  Browse Opportunities
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border py-5">
        <div className="container flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-24 shrink-0">
              <Image src="/logo.png" alt="Cacao Flow" fill className="object-contain object-left opacity-60" />
            </div>
            <span>{t("landing.footer.brand")}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
              Avalanche Fuji
            </span>
            <span>{t("landing.footer.tagline")}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
