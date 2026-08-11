"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Settings,
  X,
  Video,
  ImageIcon,
  Music,
  FileAudio,
  FileImage,
  FileVideo,
  Lock,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  convertFile,
  formatFileSize,
  getSupportedFormats,
  type ConversionOptions,
} from "@/lib/ffmpeg-utils";

type FileStatus = "ready" | "converting" | "completed" | "error";

interface FileWithStatus {
  file: File;
  status: FileStatus;
  progress: number;
  targetFormat: string;
  convertedSize?: number;
  downloadUrl?: string;
}

const FORMAT_OPTIONS = {
  video: ["MP4", "WEBM", "MOV", "AVI", "MKV", "GIF"],
  image: ["PNG", "JPG", "WEBP", "GIF", "BMP"],
  audio: ["MP3", "WAV", "AAC", "OGG", "FLAC", "M4A"],
};

const DEFAULT_FORMATS = {
  video: "MP4",
  image: "JPG",
  audio: "MP3",
};

export default function QuickConvertPage() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [converting, setConverting] = useState(false);
  const [globalTargetFormat, setGlobalTargetFormat] = useState("Original (Mix)");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const detectMediaType = (file: File): "video" | "image" | "audio" => {
    const mimeType = file.type.toLowerCase();
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";

    // Fallback: detect from extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const videoExts = ["mp4", "webm", "mov", "avi", "mkv", "gif", "mpeg", "flv"];
    const imageExts = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff"];
    const audioExts = ["mp3", "wav", "aac", "ogg", "flac", "m4a"];

    if (videoExts.includes(ext)) return "video";
    if (imageExts.includes(ext)) return "image";
    if (audioExts.includes(ext)) return "audio";

    return "video"; // Default fallback
  };

  const getFileIcon = (file: File) => {
    const type = detectMediaType(file);
    switch (type) {
      case "video":
        return <FileVideo className="w-5 h-5 text-blue-600" />;
      case "image":
        return <FileImage className="w-5 h-5 text-blue-600" />;
      case "audio":
        return <FileAudio className="w-5 h-5 text-blue-600" />;
      default:
        return <FileAudio className="w-5 h-5 text-blue-600" />;
    }
  };

  const getDefaultFormat = (file: File): string => {
    const type = detectMediaType(file);
    return DEFAULT_FORMATS[type];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles: FileWithStatus[] = acceptedFiles.map((file) => ({
        file,
        status: "ready" as FileStatus,
        progress: 0,
        targetFormat: getDefaultFormat(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target?.downloadUrl) {
        URL.revokeObjectURL(target.downloadUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAll = () => {
    files.forEach((file) => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
      "image/*": [],
      "audio/*": [],
    },
    maxFiles: 20,
  });

  const updateFileFormat = (index: number, format: string) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], targetFormat: format };
      return newFiles;
    });
  };

  const convertAll = async () => {
    const readyFiles = files.filter((f) => f.status === "ready");
    if (readyFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Please add files to convert.",
        variant: "destructive",
      });
      return;
    }

    setConverting(true);

    // Update all ready files to converting
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "ready" ? { ...f, status: "converting" as FileStatus, progress: 0 } : f
      )
    );

    try {
      for (let i = 0; i < files.length; i++) {
        const fileWithStatus = files[i];
        if (fileWithStatus.status !== "ready") continue;

        const file = fileWithStatus.file;
        const targetFormat = globalTargetFormat === "Original (Mix)" 
          ? fileWithStatus.targetFormat 
          : globalTargetFormat.toLowerCase();

        try {
          const result = await convertFile(file, targetFormat, {
            onProgress: (prog) => {
              setFiles((prev) => {
                const newFiles = [...prev];
                if (newFiles[i]) {
                  newFiles[i] = { ...newFiles[i], progress: prog };
                }
                return newFiles;
              });
            },
          });

          const url = URL.createObjectURL(result.blob);

          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i] = {
              ...newFiles[i],
              status: "completed" as FileStatus,
              progress: 100,
              convertedSize: result.convertedSize,
              downloadUrl: url,
            };
            return newFiles;
          });

          // Auto-download
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename;
          a.click();
        } catch (error) {
          console.error(`Error converting file ${file.name}:`, error);
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i] = { ...newFiles[i], status: "error" as FileStatus };
            return newFiles;
          });
        }
      }

      toast({
        title: "Success!",
        description: `Converted ${readyFiles.length} file(s) successfully.`,
      });
    } catch (error) {
      console.error("Error during conversion:", error);
      toast({
        title: "Error",
        description: "Failed to convert files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const getAvailableFormats = (file: File): string[] => {
    const type = detectMediaType(file);
    return FORMAT_OPTIONS[type] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-semibold text-lg">ConvertZone</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#how-it-works"
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                How it Works
              </Link>
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                Privacy
              </Link>
              <Link
                href="#support"
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                Support
              </Link>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Donate
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Lock className="w-3 h-3" />
            FILES NEVER LEAVE YOUR DEVICE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Convert, Compress, & Trim.{" "}
            <span className="text-blue-600">Locally & Securely.</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            No server uploads. 100% private. Powered by your browser's processing
            power for maximum safety.
          </p>
        </div>

        {/* File Drop Zone */}
        <div
          {...getRootProps()}
          className={`bg-white border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all mb-6 ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drop video, audio, or images here
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, MOV, MP3, PNG, JPG and more
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                (document.querySelector('input[type="file"]') as HTMLInputElement | null)?.click();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Files to Convert Section */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">
                Files to Convert {files.length}
              </h3>
              <button
                onClick={clearAll}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {files.map((fileWithStatus, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(fileWithStatus.file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileWithStatus.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileWithStatus.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {fileWithStatus.status === "ready" && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Ready
                        </span>
                      )}
                      {fileWithStatus.status === "converting" && (
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <span className="text-xs text-gray-500">
                            Converting... {fileWithStatus.progress}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${fileWithStatus.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {fileWithStatus.status === "completed" && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Completed
                        </span>
                      )}

                      <div className="relative">
                        <select
                          value={fileWithStatus.targetFormat}
                          onChange={(e) => updateFileFormat(index, e.target.value)}
                          disabled={fileWithStatus.status === "converting"}
                          className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-900 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">TO {fileWithStatus.targetFormat}</option>
                          {getAvailableFormats(fileWithStatus.file).map((format) => (
                            <option key={format} value={format}>
                              TO {format}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Settings and Convert All */}
            <div className="px-6 py-4 bg-blue-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Global Settings</span>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-100 text-xs hover:text-white transition-colors"
                >
                  Show advanced options
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={globalTargetFormat}
                    onChange={(e) => setGlobalTargetFormat(e.target.value)}
                    disabled={converting}
                    className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-sm font-medium text-gray-900 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="Original (Mix)">Convert all to: Original (Mix)</option>
                    <option value="MP4">Convert all to: MP4</option>
                    <option value="MP3">Convert all to: MP3</option>
                    <option value="PNG">Convert all to: PNG</option>
                    <option value="JPG">Convert all to: JPG</option>
                    <option value="WEBP">Convert all to: WEBP</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  onClick={convertAll}
                  disabled={converting || files.filter((f) => f.status === "ready").length === 0}
                  className={`bg-white text-blue-600 px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                    converting || files.filter((f) => f.status === "ready").length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Convert All →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">End-to-end Local Processing</span>
          </div>
          <p className="text-gray-500 text-sm">© 2023 ConvertZone. Built for privacy.</p>
        </div>
      </footer>
    </div>
  );
}
