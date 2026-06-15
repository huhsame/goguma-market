import type { Metadata } from "next";
import { Gaegu, Jua } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const gaegu = Gaegu({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-gaegu",
});

const jua = Jua({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-jua",
});

export const metadata: Metadata = {
  title: "고구마마켓 🍠",
  description: "달콤한 중고거래, 고구마마켓",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${gaegu.variable} ${jua.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
