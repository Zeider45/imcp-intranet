import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { LayoutContent } from "@/components/layout/layout-content";
import localFont from "next/font/local";

import "./globals.css";

const myFont = localFont({
  // Coloca el archivo de fuente en `public/fonts/` y referencia la ruta desde la raíz
  // Ejemplo: frontend/public/fonts/Montserrat-VariableFont_wght.ttf
  src: "../public/fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-custom",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Intranet IMCP",
  description:
    "Sistema de intranet corporativa - Instituto Mexicano de Contadores Públicos",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={myFont.variable}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
