import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { LayoutContent } from "@/components/layout/layout-content";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intranet IMCP",
  description: "Sistema de intranet corporativa - Instituto Mexicano de Contadores Públicos",
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
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
