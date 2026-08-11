import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { ToastProvider } from "@/components/ui/toast";

const websiteUrl =
  process.env.WEBSITE_URL || "https://www.mediaconverterpro.com";

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
    images: [
      {
        url: `${websiteUrl}/favicon.svg`,
        width: 512,
        height: 512,
        alt: "ConvertZone Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertZone - In-Browser Local Media Converter",
    description:
      "Convert videos, images, and audio directly in your browser. 100% private, 0 bytes uploaded.",
    images: [`${websiteUrl}/favicon.svg`],
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
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  metadataBase: new URL(websiteUrl),
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
      <head>
        <link rel="canonical" href={`${websiteUrl}`} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#2563eb" />
        <meta
          name="google-site-verification"
          content={process.env.GOOGLE_SITE_VERIFICATION}
        />
      </head>
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
