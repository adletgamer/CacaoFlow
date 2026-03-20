"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/features/ScoreBadge";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Shield, BarChart3, Coins, CheckCircle2 } from "lucide-react";

const heroCacao = "/hero-cacao.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Leaf className="h-5 w-5 text-primary" />
            <span>Aleph Cacao</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/app/register">
              <Button variant="accent" size="sm">Registrar Lote</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroCacao} alt="Plantación de cacao" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        </div>
        <div className="container relative z-10 py-24 md:py-32">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-6 text-xs font-medium">
                RWA Protocol · Pre-Harvest Financing
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              De la tierra a la cadena de bloques.{" "}
              <span className="text-primary">Financiamiento pre-cosecha</span> sin fricciones.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              We turn cacao harvest projections into auditable claims (VPCs).
              Automated scoring, on-chain issuance, and access to capital — all in one platform.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-4">
              <Link href="/app/register">
                <Button variant="hero" size="lg">
                  Registrar Lote Productivo
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/app/financing">
                <Button variant="hero-outline" size="lg">
                  Financing Review
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Asset Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-16 max-w-md mx-auto"
          >
            <Card className="shadow-elevated border border-border/50">
              <div className="h-1 bg-primary rounded-t-lg" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">CACAO-2026-001</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Cooperativa San Martín · Huila, Colombia</p>
                  </div>
                  <ScoreBadge score="A" numeric={94} size="md" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Yield</p>
                    <p className="text-sm font-semibold tabular-nums">1.8 Ton</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Funding</p>
                    <p className="text-sm font-semibold tabular-nums">$3,600</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Riesgo</p>
                    <Badge variant="success" className="text-[10px] mt-0.5">Bajo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-semibold text-foreground">Cómo funciona</h2>
            <p className="text-sm text-muted-foreground mt-2">Del registro al financiamiento en 4 pasos</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Leaf, title: "Registra tu lote", desc: "Ingresa datos de producción, ubicación y tipo de cacao." },
              { icon: BarChart3, title: "Scoring automático", desc: "Nuestro motor calcula yield estimado y confiabilidad." },
              { icon: Shield, title: "VPC Issuance", desc: "An auditable claim (VPC) is generated and linked to your harvest on-chain." },
              { icon: Coins, title: "Financing access", desc: "Financiers fund your production based on verified, auditable data." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="pt-6 pb-6">
                    <div className="mx-auto mb-4 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-xs font-medium text-accent mb-1 tabular-nums">Paso {i + 1}</div>
                    <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border">
        <div className="container py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-8">Construido para confianza institucional</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Trazabilidad completa", desc: "Cada lote tiene un registro auditable desde el día cero." },
                { title: "Datos verificables", desc: "Scoring basado en datos agrícolas reales y proyecciones calibradas." },
                { title: "Auditable claims", desc: "VPCs backed by real cacao production data, verifiable on-chain." },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary">
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-semibold text-primary-foreground mb-3">
            Liquidity for the harvest of tomorrow.
          </h2>
          <p className="text-sm text-primary-foreground/70 mb-6">
            Comienza a digitalizar tu producción ahora.
          </p>
          <Link href="/app/register">
            <Button variant="accent" size="lg" className="h-12 px-8 text-base font-semibold">
              Comenzar Ahora
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span>Aleph Cacao © 2026</span>
          </div>
          <p>MVP Demo · Hackathon Build</p>
        </div>
      </footer>
    </div>
  );
}
