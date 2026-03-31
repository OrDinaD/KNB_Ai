import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ФИЛОСОФИЯ x ИИ | КНБ",
  description: "Эксперимент по поведенческому детерминизму — ИИ предугадывает твой выбор.",
  openGraph: {
    title: "ФИЛОСОФИЯ x ИИ | Камень Ножницы Бумага",
    description: "Сможет ли алгоритм предсказать твою свободную волю? Проверь себя в эксперименте БГУИР.",
    type: "website",
    locale: "ru_RU",
    siteName: "Behavioral Determinism AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ФИЛОСОФИЯ x ИИ | Камень Ножницы Бумага",
    description: "Эксперимент по детерминизму на 62-й конференции БГУИР.",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
