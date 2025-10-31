import type {Metadata, Viewport} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "ByStartup - Portal do Cliente",
  description: "Portal exclusivo para clientes ByStartup",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {url: "/favico-bystartup.svg", sizes: "any"},
      {url: "/favico-bystartup.svg", type: "image/svg+xml"}
    ],
    apple: "/favico-bystartup.svg"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ByStartup"
  }
};

export const viewport: Viewport = {
  themeColor: "#34372e"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
