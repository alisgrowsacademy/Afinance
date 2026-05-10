import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afinance — Daily Trading Report",
  description: "Catat dan analisis performa trading harian Anda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-950 antialiased">{children}</body>
    </html>
  );
}
