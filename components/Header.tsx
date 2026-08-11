"use client";

import Link from "next/link";
import ConvertZoneLogo from "@/components/ConvertZoneLogo";
import { Lock, HelpCircle } from "lucide-react";

interface HeaderProps {
  activeTab: "image" | "video" | "audio";
}

export default function Header({ activeTab }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ConvertZoneLogo size={34} />
            <span className="text-gray-900 font-semibold text-lg">ConvertZone</span>
          </Link>

          {/* Segmented Navigation */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Link
              href="/image"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "image"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Images
            </Link>
            <Link
              href="/video"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "video"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Video
            </Link>
            <Link
              href="/audio"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "audio"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Audio
            </Link>
          </nav>

          {/* Privacy & Help */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Privacy First — No Uploads</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
