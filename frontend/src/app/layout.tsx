import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { KvkkBanner } from "@/components/KvkkBanner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MSO Teknoloji — Balıkçılık, Outdoor ve Yaşam Ürünleri",
    template: "%s | MSO Teknoloji",
  },
  description: "Balıkçılık ekipmanları, kamp ve outdoor ürünleri, LED ve UV fenerler, bahçe, ev ve mutfak ihtiyaçları. MSO Teknoloji ile keşfet, hazır ol.",
  keywords: ["balıkçılık", "olta", "outdoor", "kamp", "UV fener", "bahçe", "MSO"],
  openGraph: {
    siteName: "MSO Teknoloji",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geist.variable} dark`}>
      <body className="bg-[#050507] text-white antialiased min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          {process.env.NEXT_PUBLIC_WHATSAPP_PHONE && <WhatsAppButton phoneNumber={process.env.NEXT_PUBLIC_WHATSAPP_PHONE} storeName="MSO Teknoloji" />}
          <KvkkBanner />
        </Providers>
      </body>
    </html>
  );
}
