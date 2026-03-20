import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cacao Flow - Plataforma de Gestión de Cacao",
  description: "Gestiona tus lotes de cacao, portafolio y liquidaciones en una sola plataforma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
