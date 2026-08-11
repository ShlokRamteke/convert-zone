import Link from "next/link";

export const metadata = {
  title: "Terms of Service - ConvertZone (2026)",
  description: "ConvertZone Terms of Service. Learn about client-side WebAssembly media conversion, usage guidelines, and service terms for 2026.",
};

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="ConvertZone" className="w-8 h-8 object-contain" />
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
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Updated for {currentYear}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm mt-1">Effective Date: January 1, {currentYear}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            By accessing or using ConvertZone ({currentYear} Edition), you agree to be bound by these Terms of Service. ConvertZone provides in-browser WebAssembly-powered video, audio, and image conversion tools. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">2. Local Browser Execution & Data Handling</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            ConvertZone operates on a <strong>100% client-side execution model</strong>. When you convert, upscale, or trim video, audio, or image files, the processing is performed entirely within your web browser using FFmpeg WebAssembly and WebAudio/Canvas APIs. Your original files and converted outputs are never uploaded to, transmitted across, or stored on ConvertZone servers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">3. User Responsibilities & Acceptable Use</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            You agree to use ConvertZone only for lawful purposes. You retain full ownership and responsibility for any media files processed using the platform. You must not use ConvertZone to convert or process material that infringes upon third-party intellectual property rights or violates applicable laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">4. Analytics & Service Improvements</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            To optimize performance and monitor application stability, ConvertZone integrates anonymous diagnostics and web analytics services. These services collect aggregate usage statistics (such as page views and session interactions) without collecting or inspecting your media files.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">5. Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            ConvertZone is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. While we strive to support high-performance conversion, results depend on your device's browser capabilities and available hardware resources.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">6. Contact Information</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            If you have questions regarding these terms, please contact us through our official support channels.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 text-center text-xs text-gray-500">
        <p>© {currentYear} ConvertZone. All rights reserved. Built with WebAssembly technology.</p>
      </footer>
    </div>
  );
}
