"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { convertFile, formatFileSize, RESOLUTION_PRESETS } from "@/lib/ffmpeg-utils";
import VideoTimelineTrimmer from "./VideoTimelineTrimmer";
import {
  Play,
  FileVideo,
  Settings,
  ChevronDown,
  ChevronUp,
  Upload,
  Volume2,
  VolumeX,
  Scissors,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VIDEO_FORMATS = ["mp4", "webm", "gif"];

const RESOLUTIONS = [
  { value: "original", label: "Original" },
  { value: "4k", label: "4K UHD (3840x2160)" },
  { value: "1080p", label: "1080p (Full HD)" },
  { value: "720p", label: "720p (HD)" },
  { value: "480p", label: "480p (SD)" },
  { value: "360p", label: "360p (Low)" },
];

const FPS_OPTIONS = [
  { value: 0, label: "Original" },
  { value: 24, label: "24 fps" },
  { value: 30, label: "30 fps" },
  { value: 60, label: "60 fps" },
];

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Extracts the frame rate (FPS) from an MP4/MOV file header using binary inspection.
 */
async function parseMp4Fps(file: File): Promise<number | null> {
  try {
    // Read the first 1MB of the file (usually contains headers)
    const headerSize = Math.min(file.size, 1024 * 1024);
    const buffer = await file.slice(0, headerSize).arrayBuffer();
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Helper to find box offset by ASCII name
    const findBox = (name: string, start = 0): number => {
      const nameBytes = new TextEncoder().encode(name);
      for (let i = start; i < bytes.length - 8; i++) {
        if (
          bytes[i] === nameBytes[0] &&
          bytes[i + 1] === nameBytes[1] &&
          bytes[i + 2] === nameBytes[2] &&
          bytes[i + 3] === nameBytes[3]
        ) {
          const size = view.getUint32(i - 4);
          if (size > 0 && i - 4 + size <= file.size) {
            return i - 4;
          }
        }
      }
      return -1;
    };

    // Find mdhd to get timescale
    const mdhdOffset = findBox("mdhd");
    if (mdhdOffset === -1) return null;

    const version = view.getUint8(mdhdOffset + 8);
    let timescale = 0;
    if (version === 0) {
      timescale = view.getUint32(mdhdOffset + 20);
    } else {
      timescale = view.getUint32(mdhdOffset + 28);
    }

    // Find stts to get sample delta
    const sttsOffset = findBox("stts");
    if (sttsOffset === -1) return null;

    const entryCount = view.getUint32(sttsOffset + 12);
    if (entryCount === 0) return null;

    const sampleDelta = view.getUint32(sttsOffset + 20);

    if (sampleDelta > 0 && timescale > 0) {
      const fps = Math.round(timescale / sampleDelta);
      if (fps > 0 && fps < 1000) {
        return fps;
      }
    }
  } catch (e) {
    console.warn("Failed to parse MP4 FPS:", e);
  }
  return null;
}

export default function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [resolution, setResolution] = useState("original");
  const [quality, setQuality] = useState(50);
  const [fps, setFps] = useState(0);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:30");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<{
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
  }>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    if (videoMetadata.duration) {
      const maxDuration = formatTime(videoMetadata.duration);
      if (endTime > maxDuration) {
        setEndTime(maxDuration);
      }
    }
  }, [videoMetadata.duration, endTime]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Reset metadata and settings for new file
      setVideoMetadata({});
      setTrimEnabled(false);
      setStartTime("00:00:00");
      setEndTime("00:00:30");
      
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);

      // Load video metadata
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      
      video.onloadedmetadata = async () => {
        const duration = Math.floor(video.duration);
        const parsedFps = await parseMp4Fps(selectedFile);
        setVideoMetadata({
          width: video.videoWidth,
          height: video.videoHeight,
          fps: parsedFps || 30,
          duration: duration,
        });
        // Set default end time to 30 seconds or video duration, whichever is smaller
        const defaultEnd = Math.min(30, duration);
        setEndTime(formatTime(defaultEnd));
      };

      video.onerror = () => {
        // Clear metadata to avoid displaying stale data from previous files
        setVideoMetadata({});
        toast({
          title: "Preview Unavailable",
          description: "This browser cannot preview this video format natively (such as WebM or MKV on some browsers), but you can still proceed to convert it.",
        });
      };
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    maxFiles: 1,
    noClick: true,
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const convert = async () => {
    if (!file) return;

    try {
      setConverting(true);
      setProgress(0);

      // Build resolution options
      const resolutionOptions =
        resolution === "original"
          ? {}
          : {
              resolution:
                resolution as keyof typeof RESOLUTION_PRESETS,
            };

      // Build conversion options
      const conversionOptions: any = {
        quality,
        preset: "ultrafast",
        ...resolutionOptions,
        onProgress: (prog: number) => {
          setProgress(prog);
        },
      };

      // Add frame rate if not original
      if (fps > 0) {
        conversionOptions.fps = fps;
      }

      // Add audio removal
      if (removeAudio) {
        conversionOptions.removeAudio = true;
      }

      // Add trimming
      if (trimEnabled) {
        const startSeconds = parseTimeToSeconds(startTime);
        const endSeconds = parseTimeToSeconds(endTime);
        const duration = endSeconds - startSeconds;
        
        if (duration > 0) {
          conversionOptions.startTime = startTime;
          conversionOptions.duration = formatTime(duration);
        }
      }

      const result = await convertFile(file, targetFormat, conversionOptions);

      // Auto-download
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your video has been converted successfully.",
      });
      setHasConverted(true);
    } catch (error: any) {
      console.error("Error during conversion:", error);
      toast({
        title: "Error during conversion",
        description: error?.message || String(error) || "Failed to convert video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  const getQualityLabel = () => {
    if (quality <= 30) return "Small Size";
    if (quality <= 60) return "Medium (Balanced)";
    return "High Quality ↑";
  };

  const handleSettingChange = (action: () => void) => {
    if (hasConverted) {
      const confirm = window.confirm("Changing settings will clear your currently converted video state. Are you sure you want to proceed?");
      if (!confirm) return;
      setHasConverted(false);
    }
    action();
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    const startSeconds = parseTimeToSeconds(value);
    const endSeconds = parseTimeToSeconds(endTime);
    if (startSeconds >= endSeconds && videoMetadata.duration) {
      const newEnd = Math.min(startSeconds + 30, videoMetadata.duration);
      setEndTime(formatTime(newEnd));
    }
  };

  const handleEndTimeChange = (value: string) => {
    const startSeconds = parseTimeToSeconds(startTime);
    const endSeconds = parseTimeToSeconds(value);
    if (endSeconds <= startSeconds) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    setEndTime(value);
  };

  return (
    <div {...getRootProps()} className="max-w-7xl mx-auto">
      <input {...getInputProps()} ref={fileInputRef} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Video Preview & Timeline Trimmer */}
        <div className="lg:col-span-2 space-y-6">
          {file && videoUrl ? (
            <>
              {/* Video Player */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative aspect-video bg-gray-900">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-opacity duration-300">
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Details */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileVideo className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        {videoMetadata.width && videoMetadata.height && (
                          <>
                            <span>
                              {videoMetadata.width}x{videoMetadata.height}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        {videoMetadata.fps && (
                          <>
                            <span>{videoMetadata.fps}fps</span>
                            <span>•</span>
                          </>
                        )}
                        {videoMetadata.duration && (
                          <>
                            <span>{formatTime(videoMetadata.duration)}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Visual Video Timeline Trimmer */}
              {videoMetadata.duration && (
                <div>
                  <VideoTimelineTrimmer
                    videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                    duration={videoMetadata.duration}
                    onTrimChange={(start, end) => {
                      setTrimEnabled(true);
                      setStartTime(start);
                      setEndTime(end);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            /* Upload Card when No Video Selected */
            <div
              className={`bg-white rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Drop MP4, MOV, or WebM video file here
                  </p>
                  <p className="text-sm text-gray-500">or click to browse your computer</p>
                </div>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Select Video
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Conversion Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Conversion Settings</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Customize your output options</p>

            {/* Output Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Output Format
              </label>
              <div className="flex gap-2">
                {VIDEO_FORMATS.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleSettingChange(() => setTargetFormat(format))}
                    className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      targetFormat === format
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Resolution
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {RESOLUTIONS.map((res) => (
                  <button
                    key={res.value}
                    onClick={() => handleSettingChange(() => setResolution(res.value))}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                      resolution === res.value
                        ? "border-2 border-blue-600 text-blue-600 bg-blue-50"
                        : "border border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <p className="text-xs text-gray-500 mb-3">{getQualityLabel()}</p>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => handleSettingChange(() => setQuality(Number(e.target.value)))}
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${quality}%, #e5e7eb ${quality}%, #e5e7eb 100%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Small Size</span>
                <span>High Quality ↑</span>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Advanced Options</span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  {/* Frame Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frame Rate
                    </label>
                    <select
                      value={fps}
                      onChange={(e) => handleSettingChange(() => setFps(Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FPS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Audio Removal */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {removeAudio ? (
                        <VolumeX className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Remove Audio</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingChange(() => setRemoveAudio(!removeAudio))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        removeAudio ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          removeAudio ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Convert Button */}
            <button
              onClick={convert}
              disabled={!file || converting}
              className={`w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors ${
                !file || converting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {converting ? `Converting... ${progress}%` : "Convert Now"}
            </button>

            {converting && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
