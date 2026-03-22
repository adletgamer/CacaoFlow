import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/index.css";
import { Providers } from "./providers";

const fontSans = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Cacao Flow — Pre-Harvest Agricultural Finance",
  description: "Structured underwriting, auditable VPCs, and on-chain funding rails for pre-harvest cacao opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
