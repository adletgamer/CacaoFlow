"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor ingrese su correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("¡Inicio de sesión exitoso!");
      router.push("/app");
      router.refresh(); // Refresh to update navbar state
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión. Verifique sus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Iniciar Sesión" description="Accede a Cacao Flow para gestionar tus activos o inversiones." />
      
      <div className="max-w-md mx-auto mt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-border/40 shadow-card rounded-2xl">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto bg-primary/10 p-4 rounded-2xl mb-4 inline-flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-serif">Bienvenido de vuelta</CardTitle>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5 align-middle">
                  <Label>Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      type="email" 
                      placeholder="tu@correo.com" 
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 align-middle w-full">
                  <Label>Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      type="password" 
                      placeholder="Tu contraseña secreta" 
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border/40 pt-6 pb-8">
                <Button type="submit" variant="accent" className="w-full h-11 rounded-xl text-base font-semibold" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Autenticando...</>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  ¿No tienes una cuenta aún?{" "}
                  <Link href="/app/signup" className="text-primary hover:underline font-medium">
                    Regístrate aquí
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
