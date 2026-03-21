"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/features/ScoreBadge";
import { LiveOpportunityPanel } from "@/components/features/LiveOpportunityPanel";
import { WalletButton } from "@/components/features/WalletButton";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Shield, BarChart3, Coins, CheckCircle2, Globe, Users, Building2 } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useLangStore } from "@/store/langStore";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const { t } = useT();
  const { lang, setLang } = useLangStore();

  const steps = [
    { icon: Leaf, title: t("landing.flow.step1.title"), desc: t("landing.flow.step1.desc") },
    { icon: BarChart3, title: t("landing.flow.step2.title"), desc: t("landing.flow.step2.desc") },
    { icon: Shield, title: t("landing.flow.step3.title"), desc: t("landing.flow.step3.desc") },
    { icon: Coins, title: t("landing.flow.step4.title"), desc: t("landing.flow.step4.desc") },
  ];

  const trustItems = [
    { title: t("landing.trust.item1.title"), desc: t("landing.trust.item1.desc") },
    { title: t("landing.trust.item2.title"), desc: t("landing.trust.item2.desc") },
    { title: t("landing.trust.item3.title"), desc: t("landing.trust.item3.desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Leaf className="h-5 w-5 text-primary" />
            <span>{t("nav.brand")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="ghost" size="sm">{t("nav.dashboard")}</Button>
            </Link>
            <WalletButton />
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="container py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeUp}>
                <Badge variant="outline" className="mb-6 text-xs font-medium">
                  {t("landing.badge")}
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
              >
                {t("landing.hero.title")}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-muted-foreground leading-relaxed"
              >
                {t("landing.hero.subtitle")}
              </motion.p>

              {/* Bullets */}
              <motion.ul variants={fadeUp} className="mt-6 space-y-3">
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{t("landing.hero.bullets.bullet1")}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{t("landing.hero.bullets.bullet2")}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{t("landing.hero.bullets.bullet3")}</span>
                </li>
              </motion.ul>

              {/* CTAs - Investor first */}
              <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 flex-wrap">
                <Link href="/app/opportunities">
                  <Button variant="hero" size="lg" className="font-semibold">
                    {t("landing.cta.primary")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/app/register">
                  <Button variant="hero-outline" size="lg" className="font-semibold">
                    {t("landing.cta.secondary")}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Live Opportunity Panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:pl-8"
            >
              <LiveOpportunityPanel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two roles */}
      <section className="border-b border-border bg-secondary/20">
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-semibold text-foreground">{t("landing.roles.title")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-full border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("landing.roles.originator.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("landing.roles.originator.desc")}</p>
                  </div>
                  <Link href="/app/register" className="mt-auto">
                    <Button variant="accent" size="sm" className="w-full">
                      {t("landing.roles.originator.cta")}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="h-full border-accent/20 hover:border-accent/40 transition-colors">
                <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                  <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("landing.roles.investor.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("landing.roles.investor.desc")}</p>
                  </div>
                  <Link href="/app/financing" className="mt-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      {t("landing.roles.investor.cta")}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border">
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-semibold text-foreground">{t("landing.flow.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t("landing.flow.subtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
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
                    <div className="text-xs font-medium text-accent mb-1 tabular-nums">{i + 1}</div>
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
      <section className="border-b border-border bg-secondary/20">
        <div className="container py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-8">{t("landing.trust.title")}</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {trustItems.map((item) => (
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

      {/* Final CTA */}
      <section className="border-b border-border bg-primary">
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-semibold text-primary-foreground mb-3">
            {t("landing.finalCta.title")}
          </h2>
          <p className="text-sm text-primary-foreground/70 mb-6">
            {t("landing.finalCta.subtitle")}
          </p>
          <Link href="/app/register">
            <Button variant="accent" size="lg" className="h-12 px-8 text-base font-semibold">
              {t("landing.finalCta.btn")}
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
            <span>{t("landing.footer.brand")}</span>
          </div>
          <p>{t("landing.footer.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}
