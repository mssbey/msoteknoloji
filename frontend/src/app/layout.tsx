import type { Metadata } from "next";
import { Manrope, Saira } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { KvkkBanner } from "@/components/KvkkBanner";

// Saira'nın köşeli harfleri logodaki MSO yazısıyla aynı karakterde; gövde metni Manrope.
const display = Saira({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
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
    <html lang="tr" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="bg-[#f6f5fb] text-[#23262b] antialiased min-h-screen flex flex-col" suppressHydrationWarning>
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
