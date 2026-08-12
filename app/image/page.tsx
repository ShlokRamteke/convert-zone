import { Metadata } from "next";
import ImageConverter from "@/components/ImageConverter";
import NoSSRWrapper from "@/components/NoSSRWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Local In-Browser Image Converter & WebP/AVIF Optimizer",
  description:
    "Convert, resize, and compress PNG, JPG, WebP, and AVIF images locally in your browser with zero server uploads.",
};

export default function ImagePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Header activeTab="image" />

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          {/* Unified Page Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Lock className="w-3 h-3" />
              100% LOCAL & PRIVATE PROCESSING
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Convert & Compress <span className="text-blue-600">Images</span> Instantly
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Securely optimize and convert your images directly in your browser. Your files never leave your device.
            </p>
          </div>

          <NoSSRWrapper>
            <ImageConverter />
          </NoSSRWrapper>
        </div>
      </div>

      <Footer />
    </div>
  );
}
