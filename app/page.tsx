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
  X,
  Cpu,
  FileCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(67);
  const [showDemoModal, setShowDemoModal] = useState(false);

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
            {/* Video Tools Card */}
            <Link
              href="/video"
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Header / Mockup */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-5">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-900">Video Engine</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                      4K UHD + Lanczos
                    </span>
                  </div>

                  {/* Feature Pills */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-blue-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Upscaling:</span>
                      <span className="text-blue-600 font-semibold font-mono">1080p → 4K (3840x2160)</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-blue-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Trimmer:</span>
                      <span className="text-amber-600 font-semibold">Pro Timeline Handles</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-blue-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Frame Rates:</span>
                      <span className="text-gray-900 font-mono font-medium">24, 30, 60 FPS</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  Video Tools
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Convert MP4, WebM, and GIF formats. Scale up to 4K UHD with Lanczos resampling, trim video clips on an interactive timeline, or mute audio streams.
                </p>

                {/* Formats Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["MP4", "WEBM", "GIF", "4K UHD", "60 FPS"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-[11px] font-mono bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Open Video Converter</span>
                <span>→</span>
              </div>
            </Link>

            {/* Image Tools Card */}
            <Link
              href="/image"
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Header / Mockup */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg p-4 mb-5">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-semibold text-gray-900">Image Compressor</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                      Batch Processing
                    </span>
                  </div>

                  {/* Feature Pills */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-emerald-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Formats:</span>
                      <span className="text-emerald-700 font-semibold">WebP, PNG, JPG, AVIF</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-emerald-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Quality Slider:</span>
                      <span className="text-blue-600 font-semibold font-mono">50% - 90% Compression</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-emerald-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Actions:</span>
                      <span className="text-gray-900 font-medium">Convert All & Download All</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  Image Tools
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Convert & compress batch images instantly to next-gen formats like WebP and AVIF for faster website load times without losing quality.
                </p>

                {/* Formats Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["PNG", "JPG", "WEBP", "AVIF", "GIF", "BMP", "TIFF"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-[11px] font-mono bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Open Image Converter</span>
                <span>→</span>
              </div>
            </Link>

            {/* Audio Tools Card */}
            <Link
              href="/audio"
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Header / Mockup */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-lg p-4 mb-5">
                  <div className="flex items-center justify-between border-b border-purple-200/60 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-900">Audio Suite</span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-600 text-white px-2 py-0.5 rounded font-bold">
                      WaveSurfer.js
                    </span>
                  </div>

                  {/* Feature Pills */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-purple-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Waveform:</span>
                      <span className="text-purple-700 font-semibold">Visual Region Trimmer</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-purple-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Volume Boost:</span>
                      <span className="text-blue-600 font-semibold font-mono">25% - 200% Louder</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-purple-100 shadow-2xs">
                      <span className="text-gray-600 font-medium">Quality & Channels:</span>
                      <span className="text-gray-900 font-mono font-medium">320k, 48kHz, Stereo/Mono</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  Audio Tools
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Trim audio with WaveSurfer.js interactive waveforms, boost volume up to 200%, convert MP3/WAV/FLAC, and customize sample rates and channels.
                </p>

                {/* Formats Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["MP3", "WAV", "AAC", "FLAC", "OGG", "M4A", "320k"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-[11px] font-mono bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Open Audio Converter</span>
                <span>→</span>
              </div>
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
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Contact
              </Link>
            </nav>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ConvertZone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
