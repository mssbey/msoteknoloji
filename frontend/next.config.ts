import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// Sabit bir IP yazmak yerine makinenin o anki tüm IPv4 adreslerini kabul et:
// ağ değişince (ev Wi-Fi'si, hotspot, kablo) elle güncelleme gerekmiyor.
const lanDevOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanDevOrigins,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "msoteknoloji.sentos.com.tr" },
    ],
  },
};

export default nextConfig;
