import type { Metadata, Viewport } from "next";
import { Archivo_Black, Bebas_Neue, Space_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PwaNudge } from "@/components/PwaNudge";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Brain Rot Game — Train Your Attention",
  description: "Attention training games. Fight brain rot.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brain Rot Game",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${archivoBlack.variable} ${spaceMono.variable}`}
    >
      <body className="relative">
        <div className="mx-auto min-h-screen w-full max-w-app">{children}</div>
        <ServiceWorkerRegister />
        <PwaNudge />
      </body>
    </html>
  );
}
