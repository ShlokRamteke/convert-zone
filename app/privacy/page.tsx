import Link from "next/link";
import ConvertZoneLogo from "@/components/ConvertZoneLogo";

export const metadata = {
  title: "Privacy Policy - ConvertZone (2026)",
  description: "ConvertZone Privacy Policy. 100% local browser execution, zero server uploads, Microsoft Clarity & Google Analytics awareness.",
};

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <ConvertZoneLogo size={34} />
            <span className="text-gray-900 font-semibold text-lg">ConvertZone</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
            Privacy First Architecture ({currentYear})
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mt-1">Last Updated: {currentYear}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. Zero Server Uploads (100% Local Processing)</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            At ConvertZone, your privacy is protected by computer science, not just promises. All media conversions (Video 4K upscaling, Audio waveform trimming, Image compression) execute <strong>entirely in your local web browser sandbox</strong> using WebAssembly (FFmpeg WASM) and WebAudio APIs. Your media files are never sent to external servers or cloud storage.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">2. Analytics & Performance Diagnostics</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            To optimize performance and monitor application stability, ConvertZone integrates anonymous diagnostics and performance telemetry. These services collect aggregate usage statistics (such as page views, device types, and user interface interactions) to identify rendering bottlenecks and improve user experience without collecting or inspecting your media files.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm font-medium">
            Note: Anonymous diagnostics services never have access to your media files, video contents, or converted outputs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">3. Memory & Storage</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            ConvertZone processes all media files entirely within volatile browser memory (`RAM`) during your session without storing persistent user settings or tracking data in `localStorage`. Standard session telemetry may be processed by integrated analytics services to maintain system performance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">4. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            If you have questions about our privacy policy or data handling practices, please contact our support team.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 text-center text-xs text-gray-500">
        <p>© {currentYear} ConvertZone. All rights reserved. Your privacy is guaranteed by design.</p>
      </footer>
    </div>
  );
}
