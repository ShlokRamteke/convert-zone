"use client";

import Link from "next/link";
import {
  Video,
  ImageIcon,
  Music,
  Upload,
  Settings,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  convertFile, 
  convertFiles, 
  downloadResult, 
  formatFileSize,
  getSupportedFormats,
  RESOLUTION_PRESETS,
  VIDEO_QUALITY_PRESETS,
  AUDIO_BITRATE_PRESETS,
  type ConversionOptions,
} from "@/lib/ffmpeg-utils";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

// Format support matrix data
const FORMAT_MATRIX = {
  video: [
    { format: "MP4", vol: true, mov: true, jpg: true, eeb: true },
    { format: "AVI", vol: true, mov: true, jpg: true, eeb: true },
    { format: "MKV", vol: true, mov: true, jpg: true, eeb: true },
    { format: "MOV", vol: true, mov: true, jpg: true, eeb: true },
  ],
  audio: [
    { format: "MP3", vol: true, mov: true, jpg: true, eeb: true },
    { format: "WAV", vol: true, mov: true, jpg: true, eeb: true },
    { format: "AAC", vol: true, mov: true, jpg: true, eeb: true },
    { format: "FLAC", vol: true, mov: true, jpg: true, eeb: true },
  ],
  image: [
    { format: "JPG", vol: true, mov: false, jpg: true, eeb: true },
    { format: "PNG", vol: true, mov: false, jpg: true, eeb: true },
    { format: "WEBP", vol: true, mov: true, jpg: true, eeb: true },
    { format: "GIF", vol: true, mov: true, jpg: true, eeb: true },
  ],
};

// FAQ data
const FAQ_DATA = [
  {
    id: "security",
    title: "DATA SECURITY PROTOCOLS",
    content:
      "ConvertZone processes all files locally in your browser. No data is ever uploaded to external servers. Your files never leave your device, ensuring complete privacy and security.",
  },
  {
    id: "filesize",
    title: "FILE SIZE & CONCURRENCY",
    content:
      "There are no file size limits. Convert any number of files in parallel. Processing speed depends on your device's capabilities.",
  },
  {
    id: "api",
    title: "API ACCESS",
    content:
      "API access is available for enterprise users. Contact us for integration options and documentation.",
  },
  {
    id: "formats",
    title: "ADVANCED SETTINGS OF FORMATS",
    content:
      "Access advanced codec settings, bitrate controls, and format-specific options in each converter's settings panel.",
  },
];

// Console messages for the status display
const CONSOLE_MESSAGES: Array<
  | { type: "status"; text: string }
  | { type: "label"; label: string; value: string }
  | { type: "log"; text: string }
  | { type: "error"; text: string }
> = [
  { type: "status", text: "System initialized" },
  { type: "label", label: "Local code:", value: "20300" },
  { type: "label", label: "Video codec:", value: "80E" },
  { type: "label", label: "Image code:", value: "3095" },
  { type: "log", text: "Ready for conversion..." },
];

// Format options by media type
const FORMAT_OPTIONS = {
  video: ["MP4", "WEBM", "MOV", "AVI", "MKV", "GIF", "MPEG", "FLV"],
  image: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF"],
  audio: ["MP3", "WAV", "AAC", "OGG", "FLAC", "M4A"],
};

// Default output formats
const DEFAULT_OUTPUT_FORMATS = {
  video: "MP4",
  image: "JPG",
  audio: "MP3",
};

interface CustomPreset {
  name: string;
  options: ConversionOptions;
}

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>("security");
  const [fromFormat, setFromFormat] = useState("");
  const [toFormat, setToFormat] = useState("MP4");
  const [batchProcessing, setBatchProcessing] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [detectedType, setDetectedType] = useState<"video" | "image" | "audio" | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchProgress, setBatchProgress] = useState<number[]>([]);
  const [customPreset, setCustomPreset] = useState<string>("");
  const [showCodecOptions, setShowCodecOptions] = useState(false);
  const [showConversedOptions, setShowConversedOptions] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({});
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [consoleMessages, setConsoleMessages] = useState(CONSOLE_MESSAGES);
  const consoleRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Extract format from filename
  const getFileFormat = (filename: string): string => {
    const parts = filename.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
    return "";
  };

  // Detect media type from file
  const detectMediaType = (file: File): "video" | "image" | "audio" => {
    const mimeType = file.type.toLowerCase();
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    
    // Fallback: detect from extension
    const ext = getFileFormat(file.name).toLowerCase();
    const videoExts = ["mp4", "webm", "mov", "avi", "mkv", "gif", "mpeg", "flv", "wmv"];
    const imageExts = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "svg"];
    const audioExts = ["mp3", "wav", "aac", "ogg", "flac", "m4a", "wma"];
    
    if (videoExts.includes(ext)) return "video";
    if (imageExts.includes(ext)) return "image";
    if (audioExts.includes(ext)) return "audio";
    
    return "video"; // Default fallback
  };

  const addConsoleMessage = useCallback((message: string, type: "status" | "log" | "error" = "log") => {
    setConsoleMessages(prev => {
      const newMessages = [...prev, { type, text: message }];
      // Keep only last 50 messages
      return newMessages.slice(-50);
    });
    // Auto-scroll to bottom
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 0);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (batchProcessing) {
        // Batch mode: add all files
        setBatchFiles(prev => [...prev, ...acceptedFiles]);
        addConsoleMessage(`Added ${acceptedFiles.length} file(s) to batch`, "status");
      } else {
        // Single file mode
        const file = acceptedFiles[0];
        const mediaType = detectMediaType(file);
        const detectedFormat = getFileFormat(file.name);
        
        setSelectedFile(file);
        setDetectedType(mediaType);
        setFromFormat(detectedFormat);
        setToFormat(DEFAULT_OUTPUT_FORMATS[mediaType]);
        addConsoleMessage(`File loaded: ${file.name}`, "status");
      }
    }
  }, [batchProcessing, addConsoleMessage]);

  const handleQuickConvert = async () => {
    if (batchProcessing) {
      // Batch conversion
      if (batchFiles.length === 0 || !toFormat) {
        toast({
          title: "Error",
          description: "Please select files and output format for batch conversion.",
          variant: "destructive",
        });
        return;
      }

      try {
        setConverting(true);
        setProgress(0);
        setBatchProgress(new Array(batchFiles.length).fill(0));
        addConsoleMessage(`Starting batch conversion of ${batchFiles.length} file(s) to ${toFormat}`, "status");

        const results = await convertFiles(batchFiles, toFormat, {
          ...conversionOptions,
          onFileProgress: (fileIndex, fileProgress) => {
            setBatchProgress(prev => {
              const newProgress = [...prev];
              newProgress[fileIndex] = fileProgress;
              return newProgress;
            });
            addConsoleMessage(`File ${fileIndex + 1}/${batchFiles.length}: ${fileProgress}%`, "log");
          },
          onFileComplete: (fileIndex, result) => {
            downloadResult(result);
            addConsoleMessage(`✓ Completed: ${batchFiles[fileIndex].name} (${formatFileSize(result.originalSize)} → ${formatFileSize(result.convertedSize)})`, "status");
          },
          onProgress: (totalProgress) => setProgress(totalProgress),
        });

        addConsoleMessage(`Batch conversion complete! Processed ${results.length} file(s)`, "status");
        toast({
          title: "Success!",
          description: `Batch conversion complete! ${results.length} file(s) converted.`,
        });
      } catch (error) {
        console.error("Error during batch conversion:", error);
        addConsoleMessage(`Error: ${error instanceof Error ? error.message : "Batch conversion failed"}`, "error");
        toast({
          title: "Error",
          description: "Failed to convert files. Please try again.",
          variant: "destructive",
        });
      } finally {
        setConverting(false);
        setProgress(0);
        setBatchProgress([]);
      }
    } else {
      // Single file conversion
      if (!selectedFile || !detectedType || !toFormat) return;

      try {
        setConverting(true);
        setProgress(0);
        addConsoleMessage(`Converting ${selectedFile.name} to ${toFormat}...`, "status");

        // Merge custom preset options if selected
        const presetOptions = customPresets.find(p => p.name === customPreset)?.options || {};
        const finalOptions = { ...conversionOptions, ...presetOptions };

        // Convert file using the centralized FFmpeg utility
        const result = await convertFile(selectedFile, toFormat, {
          quality: 80, // Default quality
          bitrate: "192", // Default bitrate for audio
          ...finalOptions,
          onProgress: (prog) => {
            setProgress(prog);
            addConsoleMessage(`Progress: ${prog}%`, "log");
          },
        });

        // Download the converted file
        downloadResult(result);
        addConsoleMessage(`✓ Conversion complete: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.convertedSize)}`, "status");

        // Show success with file size info
        const savedPercent = result.compressionRatio > 0 
          ? ` (${result.compressionRatio.toFixed(1)}% smaller)`
          : "";
        
        toast({
          title: "Success!",
          description: `Converted to ${toFormat}. ${formatFileSize(result.originalSize)} → ${formatFileSize(result.convertedSize)}${savedPercent}`,
        });
      } catch (error) {
        console.error("Error during conversion:", error);
        addConsoleMessage(`Error: ${error instanceof Error ? error.message : "Conversion failed"}`, "error");
        toast({
          title: "Error",
          description: "Failed to convert file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setConverting(false);
        setProgress(0);
      }
    }
  };

  const handleBatchFileRemove = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
    addConsoleMessage(`Removed file from batch`, "log");
  };

  const handleClearBatch = () => {
    setBatchFiles([]);
    addConsoleMessage("Batch cleared", "status");
  };

  const handleSavePreset = () => {
    if (!customPreset) {
      toast({
        title: "Error",
        description: "Please enter a preset name.",
        variant: "destructive",
      });
      return;
    }
    setCustomPresets(prev => {
      const existing = prev.findIndex(p => p.name === customPreset);
      const newPreset: CustomPreset = { name: customPreset, options: conversionOptions };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newPreset;
        return updated;
      }
      return [...prev, newPreset];
    });
    addConsoleMessage(`Preset "${customPreset}" saved`, "status");
    toast({
      title: "Preset Saved",
      description: `Custom preset "${customPreset}" has been saved.`,
    });
  };

  const handleLoadPreset = (presetName: string) => {
    const preset = customPresets.find(p => p.name === presetName);
    if (preset) {
      setConversionOptions(preset.options);
      addConsoleMessage(`Preset "${presetName}" loaded`, "status");
    }
  };

  const resetFile = () => {
    setSelectedFile(null);
    setDetectedType(null);
    setFromFormat("");
    setToFormat("MP4");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    accept: {
      "video/*": [],
      "image/*": [],
      "audio/*": [],
    },
  });

  return (
    <div className="min-h-screen bg-cyber-black">
      {/* Navigation */}
      <header className="border-b border-cyber-border">
        <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyber-green/20 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-cyber-green" />
            </div>
              <span className="text-cyber-text font-display font-semibold tracking-wide">
                ConvertZone
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
                className="text-cyber-text-dim hover:text-cyber-green transition-colors text-sm"
            >
              Features
            </Link>
            <Link
                href="#docs"
                className="text-cyber-text-dim hover:text-cyber-green transition-colors text-sm"
            >
                Docs
            </Link>
            <Link
                href="#api"
                className="text-cyber-text-dim hover:text-cyber-green transition-colors text-sm"
            >
                API
            </Link>
            <Link
                href="https://github.com"
                target="_blank"
                className="flex items-center gap-2 text-cyber-text-dim hover:text-cyber-green transition-colors text-sm"
            >
                GitHub
                <Github className="w-4 h-4" />
            </Link>
          </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
      {/* Hero Section */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-cyber-text mb-4 tracking-tight">
                POWER USER LOCAL
                <br />
                <span className="text-cyber-green">CONVERSION HUB</span>
          </h1>
              <p className="text-cyber-text-dim text-sm max-w-xl">
                Convert and compress videos, audios, and images directly in
                <br />
                No file upload required. Your data never leaves your device.
              </p>
            </div>

            {/* Conversion Actions */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">CONVERSION ACTIONS</div>
              <div className="p-4 space-y-3">
            <Link href="/video">
                  <div className="converter-card flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-cyber-green/50 rounded flex items-center justify-center">
                        <Video className="w-5 h-5 text-cyber-green" />
                      </div>
                      <span className="text-cyber-text font-display tracking-wider text-sm">
                        [ VIDEO CONVERTER ]
                      </span>
                    </div>
                    <ArrowUpDown className="w-5 h-5 text-cyber-green" />
                  </div>
            </Link>

            <Link href="/image">
                  <div className="converter-card flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-cyber-green/50 rounded flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-cyber-green" />
                      </div>
                      <span className="text-cyber-text font-display tracking-wider text-sm">
                        [ IMAGE CONVERTER ]
                      </span>
                    </div>
                    <Settings className="w-5 h-5 text-cyber-green" />
                  </div>
            </Link>

            <Link href="/audio">
                  <div className="converter-card flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-cyber-green/50 rounded flex items-center justify-center">
                        <Music className="w-5 h-5 text-cyber-green" />
                      </div>
                      <span className="text-cyber-text font-display tracking-wider text-sm">
                        [ AUDIO CONVERTER ]
                      </span>
                    </div>
                    <Settings className="w-5 h-5 text-cyber-green" />
                  </div>
            </Link>
          </div>
        </div>

            {/* Quick Convert */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">QUICK CONVERT</div>
              <div className="p-4 space-y-4">
                {/* Drop Zone */}
                {!selectedFile ? (
                  <div
                    {...getRootProps()}
                    className={`drop-zone min-h-[150px] ${
                      isDragActive ? "active" : ""
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="drop-zone-icon" />
                    <span className="text-cyber-text font-display tracking-wider text-sm">
                      DRAG AND DROP ZONE
                    </span>
                    <span className="text-cyber-text-dim text-xs">
                      Drag and drop zone
                    </span>
                  </div>
                ) : batchProcessing && batchFiles.length > 0 ? (
                  <div className="border border-cyber-border bg-cyber-gray/30 p-4 space-y-3">
                    {/* Batch Files Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyber-text text-sm font-medium">
                          Batch Mode: {batchFiles.length} file(s)
                        </p>
                        <p className="text-cyber-text-dim text-xs">
                          {batchFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024) > 0
                            ? `${(batchFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total`
                            : `${(batchFiles.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB total`}
                        </p>
                      </div>
                      <button
                        onClick={handleClearBatch}
                        className="text-cyber-text-dim hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {batchProgress.length > 0 && (
                      <div className="space-y-1">
                        {batchFiles.map((file, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-cyber-text truncate flex-1" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-cyber-green ml-2">
                                {batchProgress[idx] || 0}%
                              </span>
                            </div>
                            <Progress value={batchProgress[idx] || 0} className="h-1" />
                          </div>
                        ))}
                      </div>
                    )}
                ) : (
                  <div className="border border-cyber-border bg-cyber-gray/30 p-4 space-y-3">
                    {/* File Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 border border-cyber-green/50 rounded flex items-center justify-center shrink-0">
                          {detectedType === "video" && <Video className="w-5 h-5 text-cyber-green" />}
                          {detectedType === "image" && <ImageIcon className="w-5 h-5 text-cyber-green" />}
                          {detectedType === "audio" && <Music className="w-5 h-5 text-cyber-green" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-cyber-text text-sm truncate" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <p className="text-cyber-text-dim text-xs">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetFile}
                        className="text-cyber-text-dim hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Detected Type Badge */}
                    {detectedType && (
                      <div className="flex items-center gap-2">
                        <span className="text-cyber-text-dim text-xs uppercase tracking-wider">
                          Detected:
                        </span>
                        <span className="status-badge text-xs">
                          {detectedType.toUpperCase()}
                        </span>
                        {fromFormat && (
                          <>
                            <span className="text-cyber-text-dim text-xs">→</span>
                            <span className="text-cyber-green text-xs font-mono">{fromFormat}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Format Selectors */}
                    <div className="flex items-center gap-4 pt-2 border-t border-cyber-border">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-cyber-text-dim text-xs uppercase tracking-wider">
                          From
                        </span>
                        <select
                          value={fromFormat}
                          disabled
                          className="cyber-select text-xs py-1 px-3 flex-1 bg-cyber-black/50"
                        >
                          <option value={fromFormat}>{fromFormat || "Auto-detected"}</option>
                        </select>
                      </div>
                      <ArrowUpDown className="w-4 h-4 text-cyber-green" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-cyber-text-dim text-xs uppercase tracking-wider">
                          To
                        </span>
                        <select
                          value={toFormat}
                          onChange={(e) => setToFormat(e.target.value)}
                          className="cyber-select text-xs py-1 px-3 flex-1"
                        >
                          {detectedType && FORMAT_OPTIONS[detectedType].map((format) => (
                            <option key={format} value={format}>
                              {format}
                            </option>
                          ))}
                        </select>
          </div>
        </div>

                    {/* Progress Bar */}
                    {converting && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2 bg-cyber-border" />
                        <p className="text-xs text-center text-cyber-green font-mono">
                          CONVERTING... {progress}%
                        </p>
                      </div>
                    )}

                    {/* Convert Button */}
                    <button
                      onClick={handleQuickConvert}
                      disabled={converting || !toFormat || (batchProcessing && batchFiles.length === 0)}
                      className={`cyber-btn cyber-btn-filled w-full py-2 text-sm ${
                        converting || !toFormat || (batchProcessing && batchFiles.length === 0) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Settings className="inline mr-2 h-3 w-3" />
                      {converting 
                        ? "CONVERTING..." 
                        : batchProcessing 
                          ? `CONVERT ${batchFiles.length} FILE(S) TO ${toFormat}`
                          : `CONVERT TO ${toFormat}`}
                    </button>
                  </div>
                )}

                {/* Format Selectors (when no file) */}
                {!selectedFile && (!batchProcessing || batchFiles.length === 0) && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-cyber-text-dim text-xs uppercase tracking-wider">
                        Format
                      </span>
                      <select
                        value={fromFormat}
                        onChange={(e) => setFromFormat(e.target.value)}
                        className="cyber-select text-xs py-1 px-3 min-w-[100px]"
                      >
                        <option value="">Select...</option>
                        <option value="MP4">MP4</option>
                        <option value="AVI">AVI</option>
                        <option value="MKV">MKV</option>
                        <option value="MOV">MOV</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyber-text-dim text-xs uppercase tracking-wider">
                        Format
                      </span>
                      <select
                        value={toFormat}
                        onChange={(e) => setToFormat(e.target.value)}
                        className="cyber-select text-xs py-1 px-3 min-w-[100px]"
                      >
                        <option value="MP4">MP4</option>
                        <option value="AVI">AVI</option>
                        <option value="MKV">MKV</option>
                        <option value="MOV">MOV</option>
                        <option value="WEBM">WEBM</option>
                        <option value="GIF">GIF</option>
                      </select>
                    </div>
                    <button className="p-2 border border-cyber-border hover:border-cyber-green transition-colors">
                      <RefreshCw className="w-4 h-4 text-cyber-text-dim" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">FAQ</div>
              <div className="cyber-accordion">
                {FAQ_DATA.map((faq) => (
                  <div key={faq.id} className="cyber-accordion-item">
                    <button
                      className="cyber-accordion-trigger"
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                    >
                      <span className="text-cyber-text">{faq.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-cyber-text-dim transition-transform ${
                          expandedFaq === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="cyber-accordion-content">
                        {faq.content}
              </div>
                    )}
            </div>
                ))}
            </div>
          </div>
        </div>

          {/* Right Column - Advanced Settings Panel */}
          <div className="space-y-6">
            {/* Advanced Settings & Batch */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">ADVANCED SETTINGS & BATCH</div>
              <div className="p-4 space-y-4">
                {/* Local Batch Processing Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-cyber-text text-xs uppercase tracking-wider">
                    Local Batch Processing
                  </span>
                  <button
                    onClick={() => {
                      setBatchProcessing(!batchProcessing);
                      if (!batchProcessing) {
                        setSelectedFile(null);
                        addConsoleMessage("Batch processing enabled", "status");
                      } else {
                        setBatchFiles([]);
                        addConsoleMessage("Single file mode enabled", "status");
                      }
                    }}
                    className={`cyber-toggle ${batchProcessing ? "active" : ""}`}
                  >
                    <div className="cyber-toggle-knob" />
                  </button>
                </div>
                <p className="text-cyber-text-dim text-xs">
                  {batchProcessing 
                    ? `Processing ${batchFiles.length} file(s) in batch.`
                    : "Select batch processing in browser."}
                </p>

                {/* Batch Files List */}
                {batchProcessing && batchFiles.length > 0 && (
                  <div className="space-y-2 py-2 border-t border-cyber-border">
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-text text-xs uppercase tracking-wider">
                        Batch Files ({batchFiles.length})
                      </span>
                      <button
                        onClick={handleClearBatch}
                        className="text-cyber-text-dim hover:text-red-500 text-xs"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {batchFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-cyber-gray/30 p-2 rounded">
                          <span className="text-cyber-text truncate flex-1" title={file.name}>
                            {file.name}
                          </span>
                          <button
                            onClick={() => handleBatchFileRemove(idx)}
                            className="text-cyber-text-dim hover:text-red-500 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversed Options */}
                <div className="py-2 border-t border-cyber-border">
                  <button
                    onClick={() => setShowConversedOptions(!showConversedOptions)}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="text-cyber-text text-xs uppercase tracking-wider">
                      Conversion Options
                    </span>
                    <ChevronRight 
                      className={`w-4 h-4 text-cyber-text-dim transition-transform ${
                        showConversedOptions ? "rotate-90" : ""
                      }`} 
                    />
                  </button>
                  {showConversedOptions && (
                    <div className="mt-3 space-y-3">
                      {detectedType === "video" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-cyber-text-dim text-xs">Quality (0-100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={conversionOptions.quality || 80}
                              onChange={(e) => setConversionOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                              className="cyber-select w-full text-xs py-1"
                            />
                </div>
                          <div className="space-y-1">
                            <label className="text-cyber-text-dim text-xs">Resolution</label>
                            <select
                              value={typeof conversionOptions.resolution === "string" ? conversionOptions.resolution : ""}
                              onChange={(e) => setConversionOptions(prev => ({ ...prev, resolution: e.target.value as keyof typeof RESOLUTION_PRESETS }))}
                              className="cyber-select w-full text-xs py-1"
                            >
                              <option value="">Default</option>
                              {Object.keys(RESOLUTION_PRESETS).map(res => (
                                <option key={res} value={res}>{RESOLUTION_PRESETS[res as keyof typeof RESOLUTION_PRESETS].label}</option>
                              ))}
                            </select>
                </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={conversionOptions.removeAudio || false}
                              onCheckedChange={(checked) => setConversionOptions(prev => ({ ...prev, removeAudio: checked as boolean }))}
                            />
                            <label className="text-cyber-text-dim text-xs">Remove Audio</label>
                </div>
                        </>
                      )}
                      {detectedType === "image" && (
                        <div className="space-y-1">
                          <label className="text-cyber-text-dim text-xs">Quality (0-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={conversionOptions.quality || 80}
                            onChange={(e) => setConversionOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                            className="cyber-select w-full text-xs py-1"
                          />
                </div>
                      )}
                      {detectedType === "audio" && (
                        <div className="space-y-1">
                          <label className="text-cyber-text-dim text-xs">Bitrate</label>
                          <select
                            value={conversionOptions.bitrate || "192k"}
                            onChange={(e) => setConversionOptions(prev => ({ ...prev, bitrate: e.target.value }))}
                            className="cyber-select w-full text-xs py-1"
                          >
                            {Object.entries(AUDIO_BITRATE_PRESETS).map(([key, preset]) => (
                              <option key={key} value={preset.bitrate}>{preset.label}</option>
                            ))}
                          </select>
                </div>
                      )}
                </div>
                  )}
                </div>

                {/* Custom Output Parameters */}
                <div className="space-y-2 py-2 border-t border-cyber-border">
                  <span className="text-cyber-text text-xs uppercase tracking-wider block">
                    Custom Output Parameters
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Preset name"
                      value={customPreset}
                      onChange={(e) => setCustomPreset(e.target.value)}
                      className="cyber-select flex-1 text-xs py-1"
                    />
                    <button
                      onClick={handleSavePreset}
                      className="cyber-btn text-xs px-3 py-1"
                    >
                      Save
                    </button>
              </div>
                  <select
                    value={customPreset}
                    onChange={(e) => {
                      setCustomPreset(e.target.value);
                      if (e.target.value) {
                        handleLoadPreset(e.target.value);
                      }
                    }}
                    className="cyber-select w-full text-xs py-2"
                  >
                    <option value="">Generate settings</option>
                    {customPresets.map((preset) => (
                      <option key={preset.name} value={preset.name}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-cyber-text-dim text-xs">
                    Use Custom output parameters.
                  </p>
                </div>

                {/* Codec Options */}
                <div className="space-y-2 py-2 border-t border-cyber-border">
                  <button
                    onClick={() => setShowCodecOptions(!showCodecOptions)}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="text-cyber-text text-xs uppercase tracking-wider">
                      Codec Options
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-cyber-text-dim transition-transform ${
                        showCodecOptions ? "rotate-180" : ""
                      }`} 
                    />
                  </button>
                  {showCodecOptions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-cyber-text-dim text-xs">
                        Codec options are automatically selected based on output format.
                      </p>
                      {detectedType && (
                        <div className="text-xs space-y-1">
                          <p className="text-cyber-text">
                            Supported formats: {getSupportedFormats(detectedType).join(", ")}
                          </p>
                        </div>
                      )}
                </div>
                  )}
                </div>

                {/* Status Console */}
                <div className="space-y-2 py-2 border-t border-cyber-border">
                  <span className="text-cyber-text text-xs uppercase tracking-wider block">
                    Status Console
                  </span>
                  <div 
                    ref={consoleRef}
                    className="terminal-console h-[140px] overflow-y-auto"
                  >
                    {consoleMessages.map((msg, idx) => (
                      <div key={idx} className="terminal-line">
                        {msg.type === "status" && (
                          <span className="terminal-status">{msg.text}</span>
                        )}
                        {msg.type === "label" && (
                          <>
                            <span className="terminal-label">{msg.label}</span>{" "}
                            <span className="text-cyber-text">{msg.value}</span>
                          </>
                        )}
                        {msg.type === "log" && (
                          <span className="text-cyber-text-dim">{msg.text}</span>
                        )}
                        {msg.type === "error" && (
                          <span className="text-red-500">{msg.text}</span>
                        )}
                </div>
                    ))}
                </div>
                </div>
              </div>
        </div>

            {/* Supported Formats Matrix */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">SUPPORTED FORMATS MATRIX</div>
              <div className="p-4">
                <table className="format-matrix">
                  <thead>
                    <tr>
                      <th className="text-left">Format</th>
                      <th>VOL</th>
                      <th>MOV</th>
                      <th>JPG</th>
                      <th>EEB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...FORMAT_MATRIX.video, ...FORMAT_MATRIX.image].map(
                      (row, idx) => (
                        <tr key={idx}>
                          <td className="text-left text-cyber-text">
                            {row.format}
                          </td>
                          <td>
                            {row.vol ? (
                              <Check className="w-4 h-4 mx-auto check-icon" />
                            ) : (
                              <X className="w-4 h-4 mx-auto cross-icon" />
                            )}
                          </td>
                          <td>
                            {row.mov ? (
                              <Check className="w-4 h-4 mx-auto check-icon" />
                            ) : (
                              <X className="w-4 h-4 mx-auto cross-icon" />
                            )}
                          </td>
                          <td>
                            {row.jpg ? (
                              <Check className="w-4 h-4 mx-auto check-icon" />
                            ) : (
                              <X className="w-4 h-4 mx-auto cross-icon" />
                            )}
                          </td>
                          <td>
                            {row.eeb ? (
                              <Check className="w-4 h-4 mx-auto check-icon" />
                            ) : (
                              <X className="w-4 h-4 mx-auto cross-icon" />
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
        </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cyber-text-dim text-xs">
              ConvertZone © {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
                  <Link
                href="#"
                className="text-cyber-text-dim hover:text-cyber-green text-xs transition-colors"
              >
                Terms
                  </Link>
              <Link
                href="#"
                className="text-cyber-text-dim hover:text-cyber-green text-xs transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-cyber-text-dim hover:text-cyber-green text-xs transition-colors"
              >
                Contact
              </Link>
              <div className="flex items-center gap-4 ml-4">
                <Link
                  href="#"
                  className="text-cyber-text-dim hover:text-cyber-green transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
                <Link
                  href="#"
                  className="text-cyber-text-dim hover:text-cyber-green transition-colors"
                >
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
