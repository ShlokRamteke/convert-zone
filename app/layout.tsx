import { Github, Zap } from "lucide-react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });
const websiteUrl =
  process.env.WEBSITE_URL || "https://www.mediaconverterpro.com";

export const metadata: Metadata = {
  title: "ConvertZone - Convert Images & Videos Online",
  description:
    "ConvertZone is the ultimate online tool for converting images and videos to different formats quickly and efficiently. Try it now!",
  keywords:
    "convert zone,media converter, image converter, video converter, online converter, convert videos, convert images, format converter, free converter, fast converter, secure converter, image to JPG, image to PNG, video to MP4, video to AVI, video to GIF, compress images, compress videos, batch converter, web-based converter",
  openGraph: {
    title: "ConvertZone - Convert Images & Videos Online",
    description:
      "Easily convert images and videos to various formats with ConvertZone. Fast, secure, and free!",
    url: websiteUrl,
    type: "website",
    siteName: "ConvertZone",
    images: [
      {
        url: `${websiteUrl}/favicon.png`,
        width: 1200,
        height: 630,
        alt: "ConvertZone - Online Media Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertZone - Convert Images & Videos Online",
    description:
      "Easily convert images and videos to various formats with ConvertZone. Fast, secure, and free!",
    images: [
      {
        url: `${websiteUrl}/favicon.png`,
        width: 1200,
        height: 630,
        alt: "ConvertZone - Online Media Converter",
      },
    ],
    site: "@ConvertZone",
    creator: "@ConvertZone",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: websiteUrl,
  },
  icons: {
    icon: `${websiteUrl}/favicon.png`,
    apple: `${websiteUrl}/favicon.png`,
    shortcut: `${websiteUrl}/favicon.png`,
  },
  metadataBase: new URL(websiteUrl),
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
        <link rel="icon" href={`${websiteUrl}/favicon.png`} />
        <meta name="robots" content="index, follow" />
        <meta
          name="google-site-verification"
          content={process.env.GOOGLE_SITE_VERIFICATION}
        />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
