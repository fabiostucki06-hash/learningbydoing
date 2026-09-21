import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "learningbydoing",
    template: "%s · learningbydoing",
  },
  description:
    "Die All-in-One-Lernplattform: Karteikarten, Quiz, Prüfungsplaner und Altprüfungen.",
  applicationName: "learningbydoing",
  // Manifest-Link erzeugt Next automatisch aus src/app/manifest.ts.
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "learningbydoing",
    // Inhalt reicht unter die Statusleiste; PhoneFrame hält die Zone dafür frei.
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Inhalt bis unter Notch/Home-Indicator; Abstände kommen über env(safe-area-inset-*).
  viewportFit: "cover",
  // Passend zum App-Hintergrund (--background, hell/dunkel).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
