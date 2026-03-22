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
  Lock, Activity, Leaf, Droplets, Sun
} from "lucide-react";
import { useT } from "@/hooks/useT";
import { useLangStore } from "@/store/langStore";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useT();
  const { lang, setLang } = useLangStore();

  const features = [
    { icon: Droplets, title: "Trazabilidad Total", desc: "Monitorea cada etapa del cultivo con datos inmutables en la blockchain." },
    { icon: Shield, title: "Auditorías Inteligentes", desc: "Contratos que verifican automáticamente el estado de los activos." },
    { icon: BarChart3, title: "Rendimientos Claros", desc: "Simulaciones de cosecha en tiempo real respaldadas por algoritmos." },
  ];

  const crops = [
    { title: "Cacao Fino de Aroma", desc: "Alta demanda internacional, notas florales puras.", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
    { title: "Cacao Orgánico Premium", desc: "Cultivo sostenible certificado, libre de pesticidas.", color: "bg-amber-50 text-amber-900 border-amber-200" },
    { title: "Cacao CCN-51", desc: "Alto rendimiento y resistencia comprobada en campo.", color: "bg-blue-50 text-blue-900 border-blue-200" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-[72px] items-center justify-between">
          <Link href="/" className="relative flex items-center h-[50px] w-[140px] shrink-0">
            <Image src="/logo.png" alt="Cacao Flow" fill className="object-contain object-left" priority />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground font-medium hidden sm:flex" asChild>
              <Link href="/app">{t("nav.dashboard")}</Link>
            </Button>
            <WalletButton />
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-secondary transition-all border border-border/80"
            >
              <Globe className="h-4 w-4" />
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero B2B (Fondo Oscuro) ──────────────────────────── */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        {/* Decorative subtle pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        <div className="container relative z-10 py-24 md:py-32 flex flex-col items-center text-center">
          <motion.div variants={stagger} initial="initial" animate="animate" className="max-w-4xl mx-auto flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="mb-8">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-primary-foreground/30 text-primary-foreground/90 backdrop-blur-sm rounded-full">
                {t("landing.badge")} <span className="ml-2 h-2 w-2 rounded-full inline-block bg-accent animate-pulse" />
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white leading-[1.1] mb-6"
            >
              Transformando el Capital Agrícola
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl mb-10 font-sans">
              Plataforma institucional de financiamiento para activos agrícolas. Trazabilidad inmutable, originación clara y capital directo a donde más se necesita.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap justify-center">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-white text-primary hover:bg-secondary shadow-lg rounded-xl" asChild>
                <Link href="/app/opportunities">
                  Explorar Oportunidades
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-transparent text-white border-2 border-white/30 hover:bg-white/10 rounded-xl" asChild>
                <Link href="/app/signup">
                  {t("landing.cta.secondary")}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Grid Tipos de Cultivo ────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Portafolio de Activos</h2>
            <p className="text-muted-foreground font-sans">
              Descubra la diversidad de opciones de rendimiento respaldadas por lotes productivos reales y verificados en campo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {crops.map((crop, i) => (
              <motion.div
                key={crop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                  <div className={`h-32 w-full ${crop.color} flex items-center justify-center`}>
                    <Leaf className="h-12 w-12 opacity-60" />
                  </div>
                  <CardContent className="p-8 text-center bg-white">
                    <h3 className="text-xl font-serif font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">{crop.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{crop.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sección de Características con Iconos ────────────── */}
      <section className="py-24 bg-secondary/30 border-t border-border/40">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                Por qué los líderes confían en Tend / Cacao Flow
              </h2>
              <p className="text-muted-foreground text-lg mb-8 font-sans leading-relaxed">
                Nuestra plataforma unifica la recolección de datos de campo, la gestión de riesgos y el flujo de capital en un solo entorno de confianza cero.
              </p>

              <div className="space-y-8">
                {features.map((feat) => (
                  <div key={feat.title} className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <feat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 font-serif text-foreground">{feat.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Replacing the image with the Live Opportunity Panel to keep hackathon functionality */}
              <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-border/60">
                <div className="bg-secondary/20 rounded-[1.5rem] overflow-hidden">
                   <LiveOpportunityPanel />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────── */}
      <section className="py-24 bg-background text-center">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Modernice su flujo de trabajo agrícola
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Únase a la red de originadores e inversionistas institucionales que están redefiniendo el futuro del campo.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg rounded-xl shadow-lg" asChild>
            <Link href="/app/signup">
              Comenzar sin costo
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 bg-white">
        <div className="container flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-24 shrink-0">
              <Image src="/logo.png" alt="Cacao Flow" fill className="object-contain object-left opacity-80" />
            </div>
            <span>© 2026 Cacao Flow. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Hackathon Version
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
