import type { Metadata } from "next";
import { Newsreader, Crimson_Pro, Source_Serif_4, DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-newsreader",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journo Journal - Organize Your Stories",
  description: "A modern SaaS platform for journalists to capture, organize, and develop story ideas with AI-powered assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${crimson.variable} ${sourceSerif.variable} ${dmSans.variable} font-source antialiased bg-newsprint text-ink`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
