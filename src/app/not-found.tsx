import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="mb-3 text-6xl font-bold font-serif text-primary">404</h1>
        <p className="mb-6 text-lg text-muted-foreground font-sans">
          La página que buscas no fue encontrada.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#004731] hover:bg-[#003625] text-white font-sans py-3 px-6 rounded-xl transition-all shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
