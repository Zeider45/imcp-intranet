import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intranet IMCP",
  description: "Sistema de intranet con Next.js y Django",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

