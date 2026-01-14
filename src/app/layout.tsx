import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IntroOverlay } from "@/components/IntroOverlay";
import { SolanaProvider } from "@/components/SolanaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FUNSTRATEGY ($FUNSTR)",
  description:
    "Ever wanted to be apart of the (.)FUN ? FUNSTRATEGY got you covered.",
  icons: {
    icon: [
      { url: "/logoo.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          <IntroOverlay />
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}
