"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Building2, User, CheckCircle2, XCircle, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const COUNTRIES = ["Perú", "Colombia", "Chile", "Brasil", "Ecuador", "Argentina"];

const LOCATION_DATA: Record<string, string[]> = {
  "Perú": [
    "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco",
    "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima (Metrop. + Prov.)",
    "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna",
    "Tumbes", "Ucayali"
  ],
  "Colombia": [
    "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá", "Caldas",
    "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía",
    "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander",
    "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre",
    "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
  ],
  "Chile": [
    "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso",
    "Metropolitana de Santiago", "Libertador Gral. Bernardo O'Higgins", "Maule", "Ñuble",
    "Biobío", "La Araucanía", "Los Ríos", "Los Lagos",
    "Aysén del Gral. Carlos Ibáñez del Campo", "Magallanes y de la Antártica Chilena"
  ],
  "Brasil": [
    "Mato Grosso (MT)", "Mato Grosso do Sul (MS)", "Goiás (GO)", "Paraná (PR)", "Rio Grande do Sul (RS)", 
    "São Paulo (SP)", "Minas Gerais (MG)", "Bahía (BA)", "Tocantins (TO)", "Maranhão (MA)", "Piauí (PI)", 
    "Pará (PA)", "Santa Catarina (SC)", "Ceará (CE)", "Pernambuco (PE)", "Alagoas (AL)", "Paraíba (PB)", 
    "Rio Grande do Norte (RN)", "Sergipe (SE)", "Espírito Santo (ES)", "Rio de Janeiro (RJ)", 
    "Rondônia (RO)", "Acre (AC)", "Amazonas (AM)", "Amapá (AP)", "Roraima (RR)", "Distrito Federal (DF)"
  ],
  "Ecuador": [
    "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", "Galápagos",
    "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana",
    "Pastaza", "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos",
    "Tungurahua", "Zamora Chinchipe"
  ],
  "Argentina": [
    "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa",
    "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta",
    "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego",
    "Tucumán", "C.A.B.A."
  ]
};

type Step = "location_role" | "identity" | "confirmation" | "account";

export default function SignupPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<Step>("location_role");
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");
  const [verifiedName, setVerifiedName] = useState("");
  const [apiData, setApiData] = useState<any>(null);

  // Form State
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [typeGeneral, setTypeGeneral] = useState<"Persona" | "Empresa" | "">("");

  const [docId, setDocId] = useState("");
  const [titularDoc, setTitularDoc] = useState("");

  const [selectedRole, setSelectedRole] = useState<"Agricultor" | "Inversionista" | "both" | "">("");
  
  // Credentials State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Helpers
  const docTypeLabel = () => {
    if (country === "Perú") return typeGeneral === "Persona" ? "DNI" : "RUC";
    if (country === "Colombia") return typeGeneral === "Persona" ? "NIT / CC" : "NIT";
    return "Documento de Identidad";
  };

  const handleCountryChange = (c: string) => {
    setCountry(c);
    setRegion("");
    setDistrict("");
  };

  const handleRegionChange = (r: string) => {
    setRegion(r);
    setDistrict("");
  };

  const validateStep1 = () => {
    if (!country || !region || !district || !typeGeneral) {
      toast.error("Por favor, complete todos los campos del paso 1.");
      return false;
    }
    return true;
  };

  const handleIdentityCheck = async () => {
    if (!docId) {
      toast.error(`Ingrese su ${docTypeLabel()}.`);
      return;
    }
    if (typeGeneral === "Empresa" && !titularDoc) {
      toast.error("Ingrese el documento del representante legal.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, typeGeneral, docId, titularDoc }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus("success");
        setApiData(data.data);
        if (data.data?.nombres) {
          setVerifiedName(data.data.nombres);
        } else if (data.data?.empresa?.razonSocial) {
          setVerifiedName(data.data.empresa.razonSocial);
        }
      } else {
        setVerificationStatus("error");
      }
    } catch (error) {
      console.error("Fetch verification error:", error);
      setVerificationStatus("error");
    } finally {
      setLoading(false);
      setStep("confirmation");
    }
  };

  const handleCancel = () => {
    setVerificationStatus("idle");
    router.push("/app");
  };

  const handleNextToAccount = () => {
    if (!selectedRole) {
      toast.error("Seleccione un rol antes de continuar.");
      return;
    }
    setStep("account");
  };

  const handleFinish = async () => {
    if (!email || password.length < 6) {
      toast.error("Ingrese un correo válido y una contraseña de al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: verifiedName,
            doc_identificacion: docId,
            country,
            region,
            district,
            type_general: typeGeneral,
            titular_identificacion: titularDoc,
            app_role: selectedRole
          }
        }
      });

      if (error) throw error;

      toast.success("Usuario registrado exitosamente en Supabase.");
      router.push("/app");
    } catch (err: any) {
      toast.error(err.message || "Error al registrar usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Registro de Usuario" description="Cree su cuenta en Cacao Flow para tokenizar o invertir." />
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <BadgeStep currentStep={step} step="location_role" label="Ubicación y Rol" idx={1} />
          <span className="text-border mx-0.5">→</span>
          <BadgeStep currentStep={step} step="identity" label="Identidad" idx={2} />
          <span className="text-border mx-0.5">→</span>
          <BadgeStep currentStep={step} step="confirmation" label="Confirmación" idx={3} />
          <span className="text-border mx-0.5">→</span>
          <BadgeStep currentStep={step} step="account" label="Cuenta" idx={4} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >

            {/* Step 1: Location & Role */}
            {step === "location_role" && (
              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-serif flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    País y Rol
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>País *</Label>
                      <Select value={country} onValueChange={handleCountryChange}>
                        <SelectTrigger><SelectValue placeholder="Seleccione un país" /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Región *</Label>
                      <Select value={region} onValueChange={handleRegionChange} disabled={!country || !LOCATION_DATA[country]}>
                        <SelectTrigger><SelectValue placeholder="Seleccione su región" /></SelectTrigger>
                        <SelectContent>
                          {country && LOCATION_DATA[country] ? LOCATION_DATA[country].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>) : null}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Distrito *</Label>
                    <Input 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)} 
                      placeholder="Ej. Chulucanas" 
                      disabled={!country || !region}
                    />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <Label>Tipo de Usuario *</Label>
                    <Select value={typeGeneral} onValueChange={(v: any) => setTypeGeneral(v)}>
                      <SelectTrigger><SelectValue placeholder="Persona o Empresa" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Persona">Persona Natural</SelectItem>
                        <SelectItem value="Empresa">Empresa / Organización</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-border/50 pt-4">
                  <Button variant="accent" onClick={() => validateStep1() && setStep("identity")}>
                    Continuar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 2: Identity */}
            {step === "identity" && (
              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-serif flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Datos de Identidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1.5 w-full sm:max-w-sm">
                    <Label>{docTypeLabel()} *</Label>
                    <Input value={docId} onChange={(e) => setDocId(e.target.value)} placeholder="Número de documento" />
                  </div>

                  {typeGeneral === "Empresa" && (
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50 mt-4">
                      <div className="space-y-1.5 w-full sm:max-w-sm">
                        <Label>Documento del Representante Legal *</Label>
                        <Input value={titularDoc} onChange={(e) => setTitularDoc(e.target.value)} placeholder="Identificación del representante" />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between border-t border-border/50 pt-4">
                  <Button variant="ghost" onClick={() => setStep("location_role")}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                  </Button>
                  <Button variant="accent" onClick={handleIdentityCheck} disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verificando...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 mr-2" /> Identificarse</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === "confirmation" && verificationStatus === "error" && (
              <Card className="border-destructive/30 bg-destructive/5 rounded-2xl">
                <CardHeader className="border-none pb-0">
                  <div className="mx-auto bg-destructive/10 p-4 rounded-2xl mb-3">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="text-center text-lg text-foreground font-serif">No se pudo verificar su identidad</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 pb-6">
                  <p className="text-sm text-muted-foreground mt-2">
                    Ocurrió un error consultando los datos o el documento ingresado es inválido. Por favor, revise la información e intente nuevamente.
                  </p>
                </CardContent>
                <CardFooter className="justify-center gap-3">
                  <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                  <Button variant="default" onClick={() => setStep("identity")}>Volver a intentar</Button>
                </CardFooter>
              </Card>
            )}

            {step === "confirmation" && verificationStatus === "success" && (
              <Card>
                <CardHeader className="border-b border-border/50 pb-4 text-center">
                  <div className="mx-auto bg-success/10 p-3 rounded-full mb-3 inline-block">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <CardTitle className="text-lg font-serif">¡Felicitaciones {verifiedName ? verifiedName.split(' ')[0] : typeGeneral}! </CardTitle>
                  <p className="text-sm text-muted-foreground">Sus datos han sido validados correctamente.</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {apiData && (
                    <div className="bg-secondary/40 border border-border/60 rounded-xl p-4 mb-6 text-sm space-y-3">
                      {apiData.empresa ? (
                        <>
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" /> Datos de la Empresa
                          </h4>
                          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-muted-foreground mb-4">
                            <div><strong className="text-foreground">RUC:</strong> {apiData.empresa.ruc}</div>
                            <div><strong className="text-foreground">Razón Social:</strong> {apiData.empresa.razonSocial}</div>
                            {apiData.empresa.estado && <div><strong className="text-foreground">Estado:</strong> {apiData.empresa.estado}</div>}
                            {apiData.empresa.condicion && <div><strong className="text-foreground">Condición:</strong> {apiData.empresa.condicion}</div>}
                          </div>
                          <h4 className="font-semibold text-foreground flex items-center gap-2 border-t border-border/50 pt-3">
                            <User className="h-4 w-4 text-primary" /> Representante Legal
                          </h4>
                          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-muted-foreground">
                            <div><strong className="text-foreground">Documento:</strong> {apiData.titular.dni}</div>
                            <div className="col-span-1 sm:col-span-2"><strong className="text-foreground">Nombres:</strong> {`${apiData.titular.nombres} ${apiData.titular.apellidoPaterno || ''} ${apiData.titular.apellidoMaterno || ''}`}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> Datos Extraídos de Consulta Oficial
                          </h4>
                          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-muted-foreground">
                            <div><strong className="text-foreground">Documento:</strong> {apiData.dni || docId}</div>
                            <div>
                              <strong className="text-foreground">Nombres:</strong>{" "}
                              {apiData.nombres ? `${apiData.nombres} ${apiData.apellidoPaterno || ''} ${apiData.apellidoMaterno || ''}` : verifiedName}
                            </div>
                            {apiData.estado && <div><strong className="text-foreground">Estado:</strong> {apiData.estado}</div>}
                            {apiData.condicion && <div><strong className="text-foreground">Condición:</strong> {apiData.condicion}</div>}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="text-center space-y-1.5 mb-6">
                    <Label className="text-base">¿Con qué rol desea operar en Cacao Flow?</Label>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Puede elegir empezar con cualquiera de estos roles o incluso operar con ambos. No está encasillado en una sola opción.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setSelectedRole("Agricultor")}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 text-center",
                        selectedRole === "Agricultor" ? "border-primary bg-primary/5" : "border-border/60"
                      )}
                    >
                      <h3 className="font-semibold text-primary">Agricultor</h3>
                      <p className="text-xs text-muted-foreground mt-1">Registrar y tokenizar activos</p>
                    </div>
                    <div 
                      onClick={() => setSelectedRole("Inversionista")}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-accent/50 text-center",
                        selectedRole === "Inversionista" ? "border-accent bg-accent/5" : "border-border/60"
                      )}
                    >
                      <h3 className="font-semibold text-accent">Inversionista</h3>
                      <p className="text-xs text-muted-foreground mt-1">Comprar tokens e invertir</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-border/50 pt-4">
                  <Button variant="ghost" onClick={() => setStep("account")}>
                    Omitir por ahora
                  </Button>
                  <Button variant="accent" onClick={handleNextToAccount}>
                    Continuar a Cuenta <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 4: Account Creation */}
            {step === "account" && (
              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-serif flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Cree sus Credenciales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1.5 align-middle w-full sm:max-w-sm">
                    <Label>Correo Electrónico *</Label>
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
                  <div className="space-y-1.5 w-full sm:max-w-sm">
                    <Label>Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        type="password" 
                        placeholder="Mínimo 6 caracteres" 
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-border/50 pt-4">
                  <Button variant="ghost" onClick={() => setStep("confirmation")} disabled={loading}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                  </Button>
                  <Button variant="accent" onClick={handleFinish} disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registrando...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar Registro</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

function BadgeStep({ currentStep, step, label, idx }: { currentStep: string, step: string, label: string, idx: number }) {
  const isActive = currentStep === step;
  const isPassed = 
    (currentStep === "identity" && idx < 2) || 
    (currentStep === "confirmation" && idx < 3) ||
    (currentStep === "account" && idx < 4);

  return (
    <div className={cn(
      "px-2.5 py-1 rounded-full font-medium transition-colors text-xs",
      isActive ? "bg-primary/10 text-primary border border-primary/20" : 
      isPassed ? "bg-success/10 text-success border border-success/20" : 
      "bg-secondary text-muted-foreground"
    )}>
      {isPassed && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
      {idx}. {label}
    </div>
  );
}
