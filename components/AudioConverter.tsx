"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { convertAudio } from "@/lib/ffmpeg-utils";

const AUDIO_FORMATS = [
  { value: "mp3", label: "MP3 Audio" },
  { value: "wav", label: "WAV Audio" },
  { value: "aac", label: "AAC Audio" },
  { value: "ogg", label: "OGG Audio" },
  { value: "flac", label: "FLAC Audio" },
  { value: "m4a", label: "M4A Audio" },
];

const QUALITY_PRESETS = [
  { label: "Low (64k)", value: "64" },
  { label: "Medium (128k)", value: "128" },
  { label: "High (320k)", value: "320" },
];

type FileStatus = "waiting" | "converting" | "completed" | "error";

interface FileWithStatus {
  file: File;
  status: FileStatus;
  progress: number;
  convertedSize?: number;
  downloadUrl?: string;
}

export default function AudioConverter() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState("mp3");
  const [quality, setQuality] = useState("320");
  const { toast } = useToast();

  const downloadUrlsRef = useRef<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const newFiles: FileWithStatus[] = acceptedFiles.map((file) => ({
        file,
        status: "waiting" as FileStatus,
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Clean up download URL if exists
      if (prev[index]?.downloadUrl) {
        URL.revokeObjectURL(prev[index].downloadUrl!);
      }
      return newFiles;
    });
  };

  const clearAll = () => {
    // Clean up all download URLs
    files.forEach((file) => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    downloadUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    downloadUrlsRef.current = [];
    setFiles([]);
  };

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"],
    },
    maxFiles: 10,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const downloadFile = (fileWithStatus: FileWithStatus, index: number) => {
    if (fileWithStatus.downloadUrl) {
      const a = document.createElement("a");
      a.href = fileWithStatus.downloadUrl;
      a.download = `${fileWithStatus.file.name.replace(/\.[^/.]+$/, "")}_converted.${targetFormat}`;
      a.click();
    }
  };

  const convert = async () => {
    if (!files.length) return;

    try {
      setConverting(true);

      for (let i = 0; i < files.length; i++) {
        const fileWithStatus = files[i];
        if (fileWithStatus.status === "completed") continue;

        const file = fileWithStatus.file;

        setFiles((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: "converting", progress: 0 };
          return next;
        });

        try {
          const result = await convertAudio(file, targetFormat, {
            bitrate: `${quality}k`,
            onProgress: (prog: number) => {
              setFiles((prev) => {
                const next = [...prev];
                if (next[i]) {
                  next[i] = { ...next[i], progress: prog };
                }
                return next;
              });
            },
          });

          const url = URL.createObjectURL(result.blob);
          downloadUrlsRef.current.push(url);

          setFiles((prev) => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              status: "completed",
              progress: 100,
              convertedSize: result.convertedSize,
              downloadUrl: url,
            };
            return next;
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setFiles((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: "error" };
            return next;
          });
        }
      }

      toast({
        title: "Success!",
        description: "Your files have been processed successfully.",
      });
    } catch (error) {
      console.error("Error during conversion:", error);
      toast({
        title: "Error",
        description: "Failed to process files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-blue-600" />;
      case "converting":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "waiting":
        return <FileAudio className="w-5 h-5 text-gray-400" />;
      case "error":
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <FileAudio className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Card */}
      <div
        {...getRootProps()}
        className={`bg-white rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
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
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Drop MP3, WAV, or M4A files here
            </p>
            <p className="text-sm text-gray-500">or click to browse your computer</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* Output Settings */}
      {(files.length > 0 || !isDragActive) && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
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
                      status: f.status === "completed" || f.status === "error" ? "waiting" : f.status,
                      progress: 0,
                      downloadUrl: undefined,
                      convertedSize: undefined,
                    }))
                  );
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {AUDIO_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
              <div className="flex gap-2">
                {QUALITY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      const hasCompleted = files.some(f => f.status === "completed");
                      if (hasCompleted) {
                        const confirm = window.confirm("Changing the quality will clear your currently converted files. Are you sure you want to proceed?");
                        if (!confirm) return;
                      }

                      setQuality(preset.value);
                      setFiles((prev) =>
                        prev.map((f) => ({
                          ...f,
                          status: f.status === "completed" || f.status === "error" ? "waiting" : f.status,
                          progress: 0,
                          downloadUrl: undefined,
                          convertedSize: undefined,
                        }))
                      );
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      quality === preset.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={convert}
                disabled={converting || files.length === 0}
                className={`flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${
                  converting || files.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Zap className="w-4 h-4" />
                Convert All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Queue */}
      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">QUEUE ({files.length})</h3>
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
                    {getStatusIcon(fileWithStatus.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileWithStatus.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(fileWithStatus.file.size)}</span>
                        {fileWithStatus.status === "completed" && fileWithStatus.convertedSize && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">
                              Converted ({formatFileSize(fileWithStatus.convertedSize)})
                            </span>
                          </>
                        )}
                        {fileWithStatus.status === "waiting" && (
                          <span className="text-gray-400">Waiting...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {fileWithStatus.status === "converting" && (
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${fileWithStatus.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 min-w-[35px]">
                          {fileWithStatus.progress}%
                        </span>
                      </div>
                    )}

                    {fileWithStatus.status === "completed" && (
                      <button
                        onClick={() => downloadFile(fileWithStatus, index)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    )}

                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
