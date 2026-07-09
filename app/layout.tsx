import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";

const websiteUrl =
  process.env.WEBSITE_URL || "https://www.mediaconverterpro.com";

export const metadata: Metadata = {
  title: "ConvertZone - Power User Local Conversion Hub",
  description:
    "Convert and compress videos, audios, and images directly in your browser. No file upload required. Your data never leaves your device.",
  keywords:
    "convert zone, media converter, image converter, video converter, audio converter, online converter, convert videos, convert images, format converter, free converter, fast converter, secure converter, local processing, privacy first, batch converter",
  openGraph: {
    title: "ConvertZone - Power User Local Conversion Hub",
    description:
      "Convert and compress videos, audios, and images directly in your browser. No file upload required.",
    url: websiteUrl,
    type: "website",
    siteName: "ConvertZone",
    images: [
      {
        url: `${websiteUrl}/favicon.png`,
        width: 1200,
        height: 630,
        alt: "ConvertZone - Power User Local Conversion Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertZone - Power User Local Conversion Hub",
    description:
      "Convert and compress videos, audios, and images directly in your browser. No file upload required.",
    images: [
      {
        url: `${websiteUrl}/favicon.png`,
        width: 1200,
        height: 630,
        alt: "ConvertZone - Power User Local Conversion Hub",
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
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href={`${websiteUrl}`} />
        <link rel="icon" href={`${websiteUrl}/favicon.png`} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta
          name="google-site-verification"
          content={process.env.GOOGLE_SITE_VERIFICATION}
        />
      </head>
      <body className="min-h-screen bg-cyber-black text-cyber-text font-mono">
        <ToastProvider>
          <div className="min-h-screen bg-cyber-grid bg-grid">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
