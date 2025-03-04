import ImageConverter from "@/components/ImageConverter";
import NoSSRWrapper from "@/components/NoSSRWrapper";
import Link from "next/link"; // Import the Link component
import { ArrowLeft, Zap } from "lucide-react"; // Import an icon for the button

export default function ImagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Back to Home Button */}
        <Link
          href="/" // Replace "/" with the path to your homepage
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <div className="flex items-start gap-2 mb-8 flex-col">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">MediaConverter</span>
            </div>
            <span className="italic text-xs">Click on logo to go to home</span>
          </div>
        </Link>

        {/* Page Title and Description */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Image Converter
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Convert and compress your images. Perfect for web and social media.
          </p>
        </div>

        {/* Image Converter Component */}
        <NoSSRWrapper>
          <ImageConverter />
        </NoSSRWrapper>
      </div>
    </div>
  );
}
