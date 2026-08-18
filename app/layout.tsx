import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ToastProvider } from "@/components/ui/toast";

const websiteUrl =
  process.env.WEBSITE_URL || "https://convert-zone.vercel.app";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "ConvertZone - In-Browser Local Media Converter & Trimmer",
    template: "%s | ConvertZone",
  },
  description:
    "100% Private, browser-based media conversion tool powered by WebAssembly. Convert MP4, WebM, WebP, AVIF, MP3, WAV with 4K Lanczos upscaling, WaveSurfer trimming, and zero server uploads.",
  keywords: [
    "ConvertZone",
    "media converter",
    "4K video upscaling",
    "video trimmer",
    "audio converter",
    "audio volume booster",
    "waveform trimmer",
    "image converter",
    "webp converter",
    "avif converter",
    "local conversion",
    "privacy first",
    "browser WASM converter",
  ],
  authors: [{ name: "ConvertZone Team" }],
  creator: "ConvertZone",
  publisher: "ConvertZone",
  category: "Technology & Tools",
  openGraph: {
    title: "ConvertZone - In-Browser Local Media Converter",
    description:
      "Convert videos, images, and audio directly in your browser. 100% private, 0 bytes uploaded to servers.",
    url: websiteUrl,
    siteName: "ConvertZone",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertZone - In-Browser Local Media Converter",
    description:
      "Convert videos, images, and audio directly in your browser. 100% private, 0 bytes uploaded to servers.",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  metadataBase: new URL(websiteUrl),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cyber-black text-cyber-text font-mono">
        {/* Google Analytics GA4 */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `,
            }}
          />
        )}

        <ToastProvider>
          <div className="min-h-screen bg-cyber-grid bg-grid">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
