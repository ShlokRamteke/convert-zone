import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Image, Zap, Lock, Download, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star } from "lucide-react"; // Import Star icon

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">MediaConverter</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-gray-300 hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <div>
            <Link
              href={process.env.GITHUB_REPO_URL || "https://github.com/"}
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 border-blue-500 text-blue-400"
          >
            100% Browser-Based
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Media Converter Pro
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Convert and compress your videos and images instantly in your
            browser. No upload needed - everything happens locally!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link href="/video">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
              >
                <Video className="w-5 h-5" />
                Video Converter
              </Button>
            </Link>
            <Link href="/image">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 w-full sm:w-auto"
              >
                <Image className="w-5 h-5" />
                Image Converter
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Media Converter Pro?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="w-5 h-5 text-blue-400" />
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Your files never leave your device. All processing happens
                  locally in your browser, ensuring complete privacy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Download className="w-5 h-5 text-blue-400" />
                  Free & Unlimited
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  No subscription required. Convert as many files as you want
                  without any hidden fees or limitations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Files</h3>
              <p className="text-gray-300">
                Choose the video or image files you want to convert from your
                device.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Format</h3>
              <p className="text-gray-300">
                Select your desired output format and adjust quality settings if
                needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Download</h3>
              <p className="text-gray-300">
                Once conversion is complete, download your files directly to
                your device.
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Options */}
        <div className="py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Supported Formats
          </h2>
          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="video">Video Formats</TabsTrigger>
              <TabsTrigger value="image">Image Formats</TabsTrigger>
            </TabsList>
            <TabsContent
              value="video"
              className="bg-gray-800/50 p-6 rounded-lg border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-4">
                Video Conversion Options
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">MP4</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">WebM</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">MOV</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">AVI</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">MKV</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">GIF</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">MPEG</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">FLV</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="image"
              className="bg-gray-800/50 p-6 rounded-lg border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-4">
                Image Conversion Options
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">JPG/JPEG</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">PNG</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">WebP</p>
                </div>

                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">GIF</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">BMP</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-md text-center">
                  <p className="font-medium">TIFF</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="py-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-gray-700">
              <AccordionTrigger className="text-left">
                Is Media Converter Pro really free?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Yes, Media Converter Pro is completely free to use. There are no
                hidden fees, subscriptions, or limitations on the number of
                files you can convert.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-gray-700">
              <AccordionTrigger className="text-left">
                How is my privacy protected?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                All file processing happens directly in your browser. Your files
                are never uploaded to any server, ensuring complete privacy and
                security of your data.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-gray-700">
              <AccordionTrigger className="text-left">
                What are the file size limits?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Since processing happens in your browser, the file size limits
                depend on your device's memory. Most modern devices can handle
                files up to 1GB without issues.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-gray-700">
              <AccordionTrigger className="text-left">
                Can I use this on my mobile device?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Yes, Media Converter Pro works on all modern browsers, including
                mobile browsers. However, processing large files might be slower
                on mobile devices.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-gray-700">
              <AccordionTrigger className="text-left">
                Do I need to install anything?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                No installation is required. Media Converter Pro runs entirely
                in your web browser, making it accessible from any device with
                an internet connection.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Convert Your Media?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Start converting your videos and images now. No sign-up required,
              just select your files and go!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/video">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Video className="w-5 h-5" />
                  Convert Videos
                </Button>
              </Link>
              <Link href="/image">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Image className="w-5 h-5" />
                  Convert Images
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}

      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          {/* Grid layout for footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Branding and description */}
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">MediaConverter</span>
              </div>
              <p className="text-gray-400 text-sm">
                Convert and compress your media files directly in your browser.
                Fast, free, and private.
              </p>
            </div>

            {/* Tools section */}
            <div className="mb-6 md:mb-0">
              <h3 className="font-semibold text-white mb-3">Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/video"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Video Converter
                  </Link>
                </li>
                <li>
                  <Link
                    href="/image"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Image Converter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social links */}
            <div className="flex items-center justify-start md:justify-end gap-4">
              <Link
                href={process.env.GITHUB_PROFILE_URL || "https://github.com/"}
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href={
                  process.env.LINKEDIN_PROFILE_URL || "https://linkedin.com"
                }
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
          </div>

          {/* Copyright text */}
          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Media Converter Pro. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
