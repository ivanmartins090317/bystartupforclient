import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para produção na Vercel
  poweredByHeader: false,
  compress: true,
  
  // Configuração de imagens
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Configurações experimentais para melhor performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
    ],
  },
};

export default nextConfig;
