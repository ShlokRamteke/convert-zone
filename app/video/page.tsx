import { Metadata } from "next";
import NoSSRWrapper from "@/components/NoSSRWrapper";
import VideoConverter from "@/components/VideoConverter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Local In-Browser Video Converter, Upscaler & Trimmer",
  description:
    "Convert, trim, crop, and upscale videos directly in your browser with WebAssembly FFmpeg. Zero file uploads, 100% private.",
};

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Header activeTab="video" />

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          {/* Unified Page Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Lock className="w-3 h-3" />
              100% LOCAL & PRIVATE PROCESSING
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Convert & Compress <span className="text-blue-600">Videos</span> Instantly
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Securely convert and optimize your videos directly in your browser. Powered by your device's CPU/GPU.
            </p>
          </div>

          <NoSSRWrapper>
            <VideoConverter />
          </NoSSRWrapper>
        </div>
      </div>

      <Footer />
    </div>
  );
}
