import { Plus_Jakarta_Sans, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${inter.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-orange-100 selection:text-orange-900 font-sans">
        {children}
      </body>
    </html>
  );
}
