import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FeedbackProvider } from "@/components/ui/feedback-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Myth Covenant | Where Winds Meet",
  description:
    "Một landing page hiện đại, tối giản và đầy phong cách game kiếm hiệp cho Myth Covenant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#050816] text-slate-50">
        <FeedbackProvider>{children}</FeedbackProvider>
      </body>
    </html>
  );
}
