"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { convertFile, formatFileSize } from "@/lib/ffmpeg-utils";
import {
  Upload,
  Check,
  X,
  Download,
  Loader2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff"];

const QUALITY_PRESETS = [
  { label: "High Quality", value: 90 },
  { label: "Balanced", value: 70 },
  { label: "Smaller File", value: 50 },
];

type FileStatus = "ready" | "converting" | "completed" | "error";

interface FileWithStatus {
  file: File;
  status: FileStatus;
  progress: number;
  originalFormat: string;
  targetFormat: string;
  originalSize: number;
  compressedSize?: number;
  compressionPercent?: number;
  downloadUrl?: string;
  previewUrl: string;
}

export default function ImageConverter() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [quality, setQuality] = useState(70);
  const [selectedPreset, setSelectedPreset] = useState("Balanced");
  const { toast } = useToast();

  const getFileFormat = (filename: string): string => {
    const parts = filename.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
    return "";
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles: FileWithStatus[] = acceptedFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          file,
          status: "ready" as FileStatus,
          progress: 0,
          originalFormat: getFileFormat(file.name),
          targetFormat: targetFormat.toUpperCase(),
          originalSize: file.size,
          previewUrl,
        };
      });
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, [targetFormat]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.downloadUrl) URL.revokeObjectURL(target.downloadUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": IMAGE_FORMATS.map((format) => `.${format}`),
    },
    maxFiles: 20,
  });

  const handlePresetChange = (presetLabel: string) => {
    const hasCompleted = files.some(f => f.status === "completed");
    if (hasCompleted) {
      const confirm = window.confirm("Changing the quality will clear your currently converted files. Are you sure you want to proceed?");
      if (!confirm) return;
    }

    setSelectedPreset(presetLabel);
    const preset = QUALITY_PRESETS.find((p) => p.label === presetLabel);
    if (preset) {
      setQuality(preset.value);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.status === "completed" || f.status === "error" ? "ready" : f.status,
          progress: 0,
          downloadUrl: undefined,
          compressedSize: undefined,
          compressionPercent: undefined,
        }))
      );
    }
  };

  const convertAll = async () => {
    const readyFiles = files.filter((f) => f.status === "ready");
    if (readyFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Please add images to convert.",
        variant: "destructive",
      });
      return;
    }

    setConverting(true);

    // Update all ready files to converting
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "ready"
          ? { ...f, status: "converting" as FileStatus, progress: 0 }
          : f
      )
    );

    try {
      for (let i = 0; i < files.length; i++) {
        const fileWithStatus = files[i];
        if (fileWithStatus.status !== "ready") continue;

        const file = fileWithStatus.file;

        try {
          const result = await convertFile(file, targetFormat, {
            quality,
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

          const compressionPercent =
            ((fileWithStatus.originalSize - result.convertedSize) /
              fileWithStatus.originalSize) *
            100;

          const url = URL.createObjectURL(result.blob);

          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i] = {
              ...newFiles[i],
              status: "completed" as FileStatus,
              progress: 100,
              compressedSize: result.convertedSize,
              compressionPercent,
              downloadUrl: url,
            };
            return newFiles;
          });
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
        description: `Converted ${readyFiles.length} image(s) successfully.`,
      });
    } catch (error) {
      console.error("Error during conversion:", error);
      toast({
        title: "Error",
        description: "Failed to convert images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const downloadAll = () => {
    const completedFiles = files.filter((f) => f.status === "completed" && f.downloadUrl);
    completedFiles.forEach((fileWithStatus, index) => {
      if (fileWithStatus.downloadUrl) {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = fileWithStatus.downloadUrl!;
          a.download = `${fileWithStatus.file.name.split(".")[0]}.${targetFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, index * 350);
      }
    });
  };

  const completedCount = files.filter((f) => f.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all mb-6 ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Drag images here or click to browse
            </p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP, AVIF</p>
          </div>
        </div>
      </div>

      {/* Conversion Settings Bar */}
      {files.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Convert to:</label>
                <select
                  value={targetFormat}
                  onChange={(e) => {
                    const newFormat = e.target.value;
                    const hasCompleted = files.some(f => f.status === "completed");
                    
                    if (hasCompleted) {
                      const confirm = window.confirm("Changing the format will clear your currently converted files. Are you sure you want to proceed?");
                      if (!confirm) return;
                    }
                    
                    setTargetFormat(newFormat);
                    setFiles((prev) =>
                      prev.map((f) => ({
                        ...f,
                        targetFormat: newFormat.toUpperCase(),
                        status: f.status === "completed" || f.status === "error" ? "ready" : f.status,
                        progress: 0,
                        downloadUrl: undefined,
                        compressedSize: undefined,
                        compressionPercent: undefined,
                      }))
                    );
                  }}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {IMAGE_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {QUALITY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetChange(preset.label)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPreset === preset.label
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={convertAll}
                disabled={converting || !files.some((f) => f.status === "ready")}
                className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${
                  converting || !files.some((f) => f.status === "ready")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Zap className="w-4 h-4" />
                {converting ? "Converting..." : "Convert All"}
              </button>

              <button
                onClick={downloadAll}
                disabled={completedCount === 0}
                className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${
                  completedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Download className="w-4 h-4" />
                Download All ({completedCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cards Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((fileWithStatus, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden relative"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={fileWithStatus.previewUrl}
                  alt={fileWithStatus.file.name}
                  className="w-full h-full object-cover"
                />
                {fileWithStatus.status === "converting" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                {fileWithStatus.status === "completed" && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                {/* Remove Button */}
                {fileWithStatus.status !== "converting" && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>

              {/* File Info */}
              <div className="p-3 space-y-2">
                {/* Format Label */}
                <div className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                  {fileWithStatus.originalFormat} → {fileWithStatus.targetFormat}
                </div>

                {/* Filename */}
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileWithStatus.file.name}
                </p>

                {/* Status and Progress */}
                {fileWithStatus.status === "converting" && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Processing...</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${fileWithStatus.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* File Sizes */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileWithStatus.originalSize)}
                  </p>
                  {fileWithStatus.status === "completed" && fileWithStatus.compressedSize && (
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-green-600">
                        {formatFileSize(fileWithStatus.compressedSize)}
                      </p>
                      {fileWithStatus.compressionPercent !== undefined && (
                        <p className="text-xs font-medium text-green-600">
                          ({fileWithStatus.compressionPercent > 0 ? "-" : "+"}
                          {Math.abs(fileWithStatus.compressionPercent).toFixed(0)}%)
                        </p>
                      )}
                    </div>
                  )}
                  {fileWithStatus.status === "converting" && (
                    <p className="text-xs text-gray-400">
                      ~{formatFileSize((fileWithStatus.originalSize * 0.3) | 0)}
                    </p>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
