"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Upload, FileType, Settings, Twitter, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox for audio removal

// Constants for supported formats and presets
const VIDEO_FORMATS = [
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "gif",
  "mpeg",
  "flv",
];
const PRESETS = {
  twitter: {
    maxBitrate: "5M",
    maxDuration: 140,
    format: "mp4",
    resolution: "1280x720",
  },
  whatsapp: {
    maxBitrate: "3M",
    maxDuration: 30,
    format: "mp4",
    resolution: "848x480",
  },
} as const;

type PresetKey = keyof typeof PRESETS;

// Helper function to format seconds into HH:MM:SS
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoConverter() {
  // State variables
  const [loaded, setLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [quality, setQuality] = useState(80);
  const [startTime, setStartTime] = useState("00:00:00");
  const [duration, setDuration] = useState("00:00:30");
  const [preset, setPreset] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 30]);
  const [removeAudio, setRemoveAudio] = useState(false); // State for audio removal

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Hooks
  const { toast } = useToast();

  // Generate video thumbnails for the timeline
  const generateThumbnails = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Wait until video metadata is loaded
    if (video.readyState === 0) {
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
    }

    const videoDur = video.duration;
    const width = canvas.width;
    const height = canvas.height;
    const thumbnailCount = 10;
    const interval = videoDur / thumbnailCount;

    // Clear the canvas before drawing new thumbnails
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < thumbnailCount; i++) {
      video.currentTime = i * interval;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          context.drawImage(
            video,
            i * (width / thumbnailCount),
            0,
            width / thumbnailCount,
            height
          );
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
      });
    }
  }, []);

  // Initialize video and update duration when file changes
  useEffect(() => {
    if (!file || !videoRef.current) return;

    const handleMetadata = () => {
      if (videoRef.current) {
        const duration = Math.floor(videoRef.current.duration);
        setVideoDuration(duration);
        setTrimRange([0, Math.min(duration, 30)]); // Default to first 30s or full duration if shorter
      }
    };

    videoRef.current.src = URL.createObjectURL(file);
    videoRef.current.onloadedmetadata = handleMetadata;

    return () => {
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
      }
    };
  }, [file]);

  // Generate thumbnails when video is loaded
  useEffect(() => {
    if (file && videoRef.current && videoRef.current.readyState >= 1) {
      generateThumbnails();
    }
  }, [file, generateThumbnails]);

  // Update start time and duration when trim range changes
  useEffect(() => {
    setStartTime(formatTime(trimRange[0]));
    setDuration(formatTime(trimRange[1] - trimRange[0]));
  }, [trimRange]);

  // Load FFmpeg
  const load = async () => {
    if (!loaded && typeof window !== "undefined") {
      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        const ffmpeg = ffmpegRef.current;

        // Only load if not already loaded
        if (!ffmpeg.loaded) {
          await ffmpeg.load({
            coreURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.js`,
              "text/javascript"
            ),
            wasmURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.wasm`,
              "application/wasm"
            ),
          });
        }

        setLoaded(true);
      } catch (error) {
        console.error("Error loading FFmpeg:", error);
        toast({
          title: "Error",
          description: "Failed to load conversion tools. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      setTargetFormat("mp4"); // Reset to default format
      setPreset(""); // Clear any preset
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": VIDEO_FORMATS.map((format) => `.${format}`),
    },
    maxFiles: 1,
  });

  // Apply preset settings
  const applyPreset = (presetName: PresetKey) => {
    setPreset(presetName);
    setTargetFormat(PRESETS[presetName].format);
    setQuality(80); // Reset quality to default
  };

  // Convert video
  const convert = async () => {
    if (!file || !targetFormat) return;

    try {
      await load();
      setConverting(true);
      setProgress(0);

      const ffmpeg = ffmpegRef.current;
      const outputName = `output.${targetFormat}`;

      // Set up progress handler
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Write input file to FFmpeg virtual filesystem
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(file.name, fileData);

      // Build command
      let command = ["-i", file.name];

      // Add trim options if needed
      if (trimRange[0] > 0 || trimRange[1] < videoDuration) {
        command.push("-ss", startTime, "-t", duration);
      }

      // Add preset-specific settings
      if (preset && preset in PRESETS) {
        const presetConfig = PRESETS[preset as PresetKey];
        command.push(
          "-b:v",
          presetConfig.maxBitrate,
          "-vf",
          `scale=${presetConfig.resolution}`,
          "-maxrate",
          presetConfig.maxBitrate,
          "-bufsize",
          presetConfig.maxBitrate
        );
      } else {
        // Use quality setting instead
        command.push(
          "-c:v",
          "libx264",
          "-crf",
          String(Math.round((100 - quality) / 2))
        );
      }

      // Remove audio if the option is enabled
      if (removeAudio) {
        command.push("-an"); // -an flag removes audio
      }

      // Add output file
      command.push("-y", outputName); // Added -y to overwrite without asking

      // Execute FFmpeg command
      await ffmpeg.exec(command);

      // Read and download output file
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: `video/${targetFormat}` });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `converted_${file.name.split(".")[0]}.${targetFormat}`;
      a.click();

      // Clean up
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your video has been converted successfully.",
      });
    } catch (error) {
      console.error("Error during conversion:", error);
      toast({
        title: "Error",
        description: "Failed to convert video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  // Handle trim range change
  const handleRangeChange = (values: [number, number]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = values[0];
      setTrimRange(values);
    }
  };

  return (
    <Card className="p-8 bg-gray-800/50 border-gray-700">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-300">
          {isDragActive
            ? "Drop your video here..."
            : "Drag & drop your video here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: {VIDEO_FORMATS.join(", ")}
        </p>
      </div>

      {/* Video Editor (only visible when file is selected) */}
      {file && (
        <div className="mt-8 space-y-6">
          {/* File info */}
          <div className="flex items-center gap-4">
            <FileType className="h-8 w-8 text-blue-400" />
            <div>
              <p className="font-medium text-gray-200">{file.name}</p>
              <p className="text-sm text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Video preview */}
          <video
            ref={videoRef}
            className="w-full rounded-lg"
            controls
            preload="metadata"
          />

          {/* Thumbnail timeline and trim controls */}
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              className="w-full h-16 rounded bg-gray-900"
              width={600}
              height={64}
            />

            <div className="px-2">
              <RangeSlider
                className="trim-slider"
                min={0}
                max={videoDuration || 100}
                step={1}
                value={trimRange}
                onInput={handleRangeChange}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{formatTime(trimRange[0])}</span>
                <span>{formatTime(trimRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => applyPreset("twitter")}
            >
              <Twitter className="w-4 h-4" />
              Twitter Preset
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => applyPreset("whatsapp")}
            >
              <Phone className="w-4 h-4" />
              WhatsApp Preset
            </Button>
          </div>

          {/* Format and quality controls */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="format" className="text-white">
                Target Format
              </Label>
              <Select value={targetFormat} onValueChange={setTargetFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-white">Quality</Label>
                <span className="text-sm text-gray-400">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                max={100}
                step={1}
                className="trim-slider"
              />
            </div>

            {/* Audio removal checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remove-audio"
                checked={removeAudio}
                onCheckedChange={(checked) => setRemoveAudio(!!checked)}
                className="border-white"
              />
              <Label htmlFor="remove-audio" className="text-white">
                Remove Audio
              </Label>
            </div>
          </div>

          {/* Convert button or progress bar */}
          {converting ? (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-400">
                Converting... {progress}%
              </p>
            </div>
          ) : (
            <Button
              onClick={convert}
              className="w-full"
              disabled={!file || !targetFormat || converting}
            >
              <Settings className="mr-2 h-4 w-4" />
              Convert
            </Button>
          )}
        </div>
      )}

      {/* Slider styles */}
      <style jsx global>{`
        .trim-slider {
          height: 8px;
          background: #374151;
          border-radius: 4px;
        }
        .trim-slider .range-slider__range {
          background: #3b82f6;
          border-radius: 4px;
        }
        .trim-slider .range-slider__thumb {
          width: 16px;
          height: 16px;
          background: #60a5fa;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: grab;
        }
        .trim-slider .range-slider__thumb:hover {
          background: #93c5fd;
        }
      `}</style>
    </Card>
  );
}
