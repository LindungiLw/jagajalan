import { Instrument_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "JagaJalan — Platform Transparansi Kewenangan & Anggaran Infrastruktur Jalan",
  description: "Membuka kotak hitam birokrasi jalan rusak: pemetaan wewenang otomatis, transparansi anggaran APBD, dan penguncian SLA penanganan berbasis data Ombudsman RI.",
  keywords: ["JagaJalan", "transparansi publik", "jalan rusak", "APBD", "ombudsman", "open government data", "infrastruktur jalan"],
  authors: [{ name: "JagaJalan Initiative" }],
  icons: {
    icon: [
      { url: "/logo/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${instrumentSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-orange-100 selection:text-orange-900 font-sans">
        {children}
      </body>
    </html>
  );
}
