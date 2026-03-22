"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, BarChart, ArrowUpRight, DollarSign, Leaf, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalStatsPage() {
  const stats = [
    { title: "Usuarios Activos", value: "1,248", change: "+12.5%", icon: Users },
    { title: "Volumen Tokenizado (TVL)", value: "$4.2M", change: "+8.2%", icon: DollarSign },
    { title: "Hectáreas Registradas", value: "8,450 ha", change: "+24.1%", icon: Leaf },
    { title: "Transacciones Mensuales", value: "3,429", change: "+18.4%", icon: Activity },
  ];

  return (
    <>
      <PageHeader 
        title="Market Statistics" 
        description="Métricas globales y de la red de tokenización de activos de Cacao Flow en tiempo real." 
      />

      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className="border-border/50 bg-card hover:bg-secondary/20 transition-colors shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-md">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-status-success font-medium flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    {stat.change} vs último mes
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts and Maps Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Volumen de Inversión (Últimos 6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px] border-t border-border/30 bg-secondary/5 rounded-b-xl">
                {/* Aqui se integraría Recharts o Chart.js. Mockup visual simple para la demo: */}
                <div className="flex items-end justify-between w-full h-48 px-4 gap-2 opacity-80">
                  {[40, 55, 45, 70, 65, 90].map((h, i) => (
                    <div key={i} className="w-full flex flex-col justify-end items-center gap-2">
                      <div 
                        className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-all cursor-pointer" 
                        style={{ height: `${h}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" />
                  Distribución Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 border-t border-border/30">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Perú</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Colombia</span>
                    <span className="text-muted-foreground">30%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="bg-primary/80 h-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Ecuador</span>
                    <span className="text-muted-foreground">15%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="bg-accent h-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Otros LATAM</span>
                    <span className="text-muted-foreground">10%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="bg-muted-foreground/50 h-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
