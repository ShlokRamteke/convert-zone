import Link from "next/link";

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
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45" />
            </div>
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
          <h2 className="text-xl font-bold text-gray-900">2. Analytics Integration (Google Analytics & Microsoft Clarity)</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            ConvertZone is integrated with industry-standard analytics platforms to improve user experience, optimize performance, and understand feature usage:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>
              <strong>Google Analytics (GA4)</strong>: Collects high-level traffic metrics, device types, and page interaction events.
            </li>
            <li>
              <strong>Microsoft Clarity</strong>: Provides anonymized session recordings, heatmaps, and UX interaction telemetry to identify rendering bugs and UI bottlenecks.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed text-sm font-medium">
            Note: Neither Google Analytics nor Microsoft Clarity has access to your media files, video contents, or converted outputs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">3. Cookies & Storage</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            ConvertZone uses essential browser local storage (`localStorage`) to remember your preferred settings (such as quality presets or resolution defaults). Standard analytics cookies may be stored by Google Analytics or Microsoft Clarity as outlined above.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">4. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            If you have questions about our privacy policy or data handling practices, reach out to <a href="mailto:privacy@convertzone.app" className="text-blue-600 underline">privacy@convertzone.app</a>.
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
