import { Github, Zap } from "lucide-react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const websiteUrl =
  process.env.WEBSITE_URL || "https://www.mediaconverterpro.com";

export const metadata: Metadata = {
  title: "Media Converter Pro - Convert Images & Videos Online",
  description:
    "Media Converter Pro is the ultimate online tool for converting images and videos to different formats quickly and efficiently. Try it now!",
  keywords:
    "media converter, image converter, video converter, online converter, convert videos, convert images, format converter",
  openGraph: {
    title: "Media Converter Pro - Convert Images & Videos Online",
    description:
      "Easily convert images and videos to various formats with Media Converter Pro. Fast, secure, and free!",
    url: websiteUrl,
    type: "website",
    images: [
      {
        url: `${websiteUrl}/favicon.png`,
        width: 1200,
        height: 630,
        alt: "Media Converter Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Converter Pro - Convert Images & Videos Online",
    description:
      "Easily convert images and videos to various formats with Media Converter Pro. Fast, secure, and free!",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={`${websiteUrl}`} />
        <meta name="robots" content="index, follow" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
