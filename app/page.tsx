"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Shield,
  Lock,
  Zap,
  Video,
  ImageIcon,
  Music,
  Folder,
  RefreshCw,
  Download,
  Play,
  CloudOff,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(67);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Detect file type and route to appropriate converter
      const file = acceptedFiles[0];
      const mimeType = file.type.toLowerCase();
      
      if (mimeType.startsWith("video/")) {
        router.push("/video");
      } else if (mimeType.startsWith("image/")) {
        router.push("/image");
      } else if (mimeType.startsWith("audio/")) {
        router.push("/audio");
      } else {
        // Default to video converter
        router.push("/video");
      }
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
      "image/*": [],
      "audio/*": [],
    },
    noClick: true,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-gray-900 font-semibold text-lg">ConvertZone</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                How it Works
              </Link>
              <Link
                href="#privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Privacy
              </Link>
              <button
                onClick={() => router.push("/video")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Converting
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Convert Media Instantly.{" "}
              <span className="text-blue-600">100% Private.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The powerful media tool that runs entirely in your browser using
              WebAssembly. Your files never leave your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => router.push("/video")}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Start Converting Now
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <CloudOff className="w-5 h-5" />
                <span className="text-sm">No Uploads</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Free Forever</span>
              </div>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div {...getRootProps()} className="relative">
            <input {...getInputProps()} />
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-300 bg-gray-50"
              }`}
            >
              <Folder className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drag & Drop Files Here
              </p>
              <p className="text-sm text-gray-500 mb-6">Video, Audio, Images</p>
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Processing locally...</span>
                    <span className="text-sm font-medium text-gray-900">
                      {processingProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why ConvertZone Section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Why ConvertZone?
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We utilize advanced WebAssembly technology to process massive files
            directly on your machine, eliminating privacy risks and wait times.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Uploads Required
              </h3>
              <p className="text-gray-600">
                Your files never touch our servers. Everything happens locally
                within your browser sandbox.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                100% Private
              </h3>
              <p className="text-gray-600">
                Since data never leaves your computer, your privacy is guaranteed
                by design, not just policy.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Blazing Fast
              </h3>
              <p className="text-gray-600">
                No queuing or server wait times. Harness the full power of your
                own hardware (CPU/GPU).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All-in-One Media Toolset Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            All-in-One Media Toolset
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Whether you're a creator, developer, or casual user, handle all your
            media needs in one secure place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/video"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-100 rounded-lg p-4 mb-4 h-48 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded flex flex-col">
                  <div className="bg-gray-300 h-8 rounded-t flex items-center gap-2 px-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="bg-gray-400 h-24 rounded mb-2"></div>
                    <div className="bg-gray-300 h-2 rounded mb-1"></div>
                    <div className="bg-gray-300 h-2 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Video Tools
              </h3>
              <p className="text-gray-600">
                Convert formats like MP4, MKV, AVI. Compress file sizes for web,
                and trim clips effortlessly.
              </p>
            </Link>
            <Link
              href="/image"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-100 rounded-lg p-4 mb-4 h-48 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded flex flex-col">
                  <div className="bg-gray-300 h-8 rounded-t flex items-center gap-2 px-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-4 space-y-2">
                    <div className="bg-gray-400 h-16 rounded"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-300 h-8 rounded"></div>
                      <div className="flex-1 bg-gray-300 h-8 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Image Tools
              </h3>
              <p className="text-gray-600">
                Resize, optimize for SEO, and switch formats between PNG, JPG,
                WEBP, and AVIF instantly.
              </p>
            </Link>
            <Link
              href="/audio"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-100 rounded-lg p-4 mb-4 h-48 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded flex flex-col">
                  <div className="bg-gray-300 h-8 rounded-t flex items-center gap-2 px-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="space-y-2 mb-4">
                      <div className="bg-gray-400 h-2 rounded"></div>
                      <div className="bg-gray-400 h-2 rounded w-5/6"></div>
                      <div className="bg-gray-400 h-2 rounded w-4/6"></div>
                    </div>
                    <div className="bg-blue-600 h-8 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Convert</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Audio Tools
              </h3>
              <p className="text-gray-600">
                Extract audio from video files, change bitrates, convert MP3/WAV,
                and cut tracks with precision.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            How it Works
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Simple, secure, and streamlined.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Folder className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="w-0.5 h-16 bg-gray-300 mx-auto mt-2"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select your file
                  </h3>
                  <p className="text-gray-600">
                    Drag & drop any media file into the browser window. We support
                    hundreds of formats.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="w-0.5 h-16 bg-gray-300 mx-auto mt-2"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Process locally
                  </h3>
                  <p className="text-gray-600">
                    The conversion engine runs entirely on your device using
                    WebAssembly. No uploading needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Download instantly
                  </h3>
                  <p className="text-gray-600">
                    Since the file is already on your computer, saving it is
                    instant. No server wait times.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <button
                onClick={() => router.push("/video")}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Try it Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-gray-900 font-semibold text-lg">ConvertZone</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="#privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#terms"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="#contact"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Contact
              </Link>
            </nav>
            <p className="text-gray-500 text-sm">
              © 2023 ConvertZone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
