import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// FFmpeg instance management
let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;
let currentProgressHandler: ((event: { progress: number }) => void) | null = null;

// Supported formats with their codecs and MIME types
const VIDEO_CODECS: Record<string, { codec: string; mimeType: string }> = {
  mp4: { codec: "libx264", mimeType: "video/mp4" },
  webm: { codec: "libvpx", mimeType: "video/webm" },
  avi: { codec: "mpeg4", mimeType: "video/x-msvideo" },
  mkv: { codec: "libx264", mimeType: "video/x-matroska" },
  mov: { codec: "libx264", mimeType: "video/quicktime" },
  gif: { codec: "gif", mimeType: "image/gif" },
  mpeg: { codec: "mpeg2video", mimeType: "video/mpeg" },
  flv: { codec: "flv1", mimeType: "video/x-flv" },
  wmv: { codec: "wmv2", mimeType: "video/x-ms-wmv" },
  ts: { codec: "libx264", mimeType: "video/mp2t" },
};

const AUDIO_CODECS: Record<string, { codec: string; mimeType: string }> = {
  mp3: { codec: "libmp3lame", mimeType: "audio/mpeg" },
  wav: { codec: "pcm_s16le", mimeType: "audio/wav" },
  aac: { codec: "aac", mimeType: "audio/aac" },
  ogg: { codec: "libvorbis", mimeType: "audio/ogg" },
  flac: { codec: "flac", mimeType: "audio/flac" },
  m4a: { codec: "aac", mimeType: "audio/mp4" },
  wma: { codec: "wmav2", mimeType: "audio/x-ms-wma" },
  opus: { codec: "libopus", mimeType: "audio/opus" },
};

const IMAGE_FORMATS: Record<string, { mimeType: string }> = {
  jpg: { mimeType: "image/jpeg" },
  jpeg: { mimeType: "image/jpeg" },
  png: { mimeType: "image/png" },
  webp: { mimeType: "image/webp" },
  gif: { mimeType: "image/gif" },
  bmp: { mimeType: "image/bmp" },
  tiff: { mimeType: "image/tiff" },
  tif: { mimeType: "image/tiff" },
};

// Resolution presets
export const RESOLUTION_PRESETS = {
  "4k": { width: 3840, height: 2160, label: "4K UHD" },
  "1080p": { width: 1920, height: 1080, label: "Full HD" },
  "720p": { width: 1280, height: 720, label: "HD" },
  "480p": { width: 854, height: 480, label: "SD" },
  "360p": { width: 640, height: 360, label: "Low" },
  "240p": { width: 426, height: 240, label: "Very Low" },
} as const;

// Video quality presets (CRF values - lower = better quality)
export const VIDEO_QUALITY_PRESETS = {
  lossless: { crf: 0, label: "Lossless", description: "No quality loss, largest file" },
  high: { crf: 18, label: "High Quality", description: "Visually lossless" },
  medium: { crf: 23, label: "Medium Quality", description: "Balanced quality/size" },
  low: { crf: 28, label: "Low Quality", description: "Smaller file size" },
  veryLow: { crf: 35, label: "Very Low", description: "Smallest file" },
} as const;

// Audio bitrate presets
export const AUDIO_BITRATE_PRESETS = {
  high: { bitrate: "320", label: "High Quality (320kbps)" },
  medium: { bitrate: "192", label: "Medium Quality (192kbps)" },
  low: { bitrate: "128", label: "Low Quality (128kbps)" },
  veryLow: { bitrate: "64", label: "Very Low (64kbps)" },
} as const;

/**
 * Video conversion options
 */
export interface VideoConversionOptions {
  quality?: number; // 0-100, converted to CRF
  crf?: number; // Direct CRF value (0-51)
  bitrate?: string; // e.g., "4000k", "2M"
  maxBitrate?: string; // Max bitrate for VBR
  bufferSize?: string; // Buffer size for rate control
  resolution?: keyof typeof RESOLUTION_PRESETS | { width: number; height: number };
  fps?: number; // Frame rate
  startTime?: string; // Start time for trimming (e.g., "00:01:30" or "90")
  duration?: string; // Duration (e.g., "00:00:30" or "30")
  endTime?: string; // End time (alternative to duration)
  removeAudio?: boolean;
  codec?: string; // Override default codec
  preset?: "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower" | "veryslow";
  onProgress?: (progress: number) => void;
}

/**
 * Image conversion options
 */
export interface ImageConversionOptions {
  quality?: number; // 0-100
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Audio conversion options
 */
export interface AudioConversionOptions {
  bitrate?: string; // e.g., "192k", "320k"
  sampleRate?: number; // e.g., 44100, 48000
  channels?: number; // 1 for mono, 2 for stereo
  extractFromVideo?: boolean;
  codec?: string; // Override default codec
  onProgress?: (progress: number) => void;
}

/**
 * Universal conversion options
 */
export interface ConversionOptions extends VideoConversionOptions, ImageConversionOptions, AudioConversionOptions {}

/**
 * Conversion result with metadata
 */
export interface ConversionResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
  mimeType: string;
}

/**
 * Initialize and load FFmpeg (singleton pattern)
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (isLoaded && ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    ffmpegInstance.on("log", ({ message }) => {
      console.log("[FFmpeg Log]", message);
    });
  }

  if (!ffmpegInstance.loaded) {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
  }

  isLoaded = true;
  return ffmpegInstance;
}

/**
 * Terminate FFmpeg and free memory
 */
export async function terminateFFmpeg(): Promise<void> {
  if (ffmpegInstance) {
    try {
      await ffmpegInstance.terminate();
    } catch (e) {}
    ffmpegInstance = null;
    isLoaded = false;
  }
}

/**
 * Set up progress handler with cleanup
 */
function setupProgressHandler(
  ffmpeg: FFmpeg,
  onProgress?: (progress: number) => void
): void {
  // Clean up existing handler
  if (currentProgressHandler) {
    try {
      ffmpeg.off("progress", currentProgressHandler);
    } catch {
      // Ignore
    }
    currentProgressHandler = null;
  }

  if (onProgress) {
    currentProgressHandler = ({ progress }: { progress: number }) => {
      onProgress(Math.round(progress * 100));
    };
    ffmpeg.on("progress", currentProgressHandler);
  }
}

/**
 * Clean up progress handler
 */
function cleanupProgressHandler(ffmpeg: FFmpeg): void {
  if (currentProgressHandler) {
    try {
      ffmpeg.off("progress", currentProgressHandler);
    } catch {
      // Ignore
    }
    currentProgressHandler = null;
  }
}

/**
 * Clean up virtual filesystem files
 */
async function cleanupFiles(ffmpeg: FFmpeg, filenames: string[]): Promise<void> {
  for (const filename of filenames) {
    try {
      await ffmpeg.deleteFile(filename);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Convert FFmpeg FileData to ArrayBuffer
 */
function convertFileDataToArrayBuffer(data: Uint8Array | string): ArrayBuffer {
  if (data instanceof Uint8Array) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    return new TextEncoder().encode(data).buffer;
  }
}

/**
 * Parse time string to seconds
 */
function parseTimeToSeconds(time: string): number {
  // If it's already a number string, return it
  if (/^\d+(\.\d+)?$/.test(time)) {
    return parseFloat(time);
  }
  
  // Parse HH:MM:SS or MM:SS format
  const parts = time.split(":").map(parseFloat);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parseFloat(time) || 0;
}

/**
 * Format seconds to HH:MM:SS.mmm
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.padStart(6, "0")}`;
}

/**
 * Get output filename with new extension
 */
function getOutputFilename(originalName: string, newFormat: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}_converted.${newFormat.toLowerCase()}`;
}

/**
 * Convert video file with advanced options
 */
export async function convertVideo(
  file: File,
  outputFormat: string,
  options: VideoConversionOptions = {}
): Promise<ConversionResult> {
  const ffmpeg = await loadFFmpeg();
  const format = outputFormat.toLowerCase();
  const outputName = `output.${format}`;
  const formatConfig = VIDEO_CODECS[format] || VIDEO_CODECS.mp4;

  setupProgressHandler(ffmpeg, options.onProgress);

  try {
    // Write input file
    const fileData = await fetchFile(file);
    await ffmpeg.writeFile(file.name, fileData);

    // Build FFmpeg command
    const command: string[] = [];

    // Input seeking (before -i for faster seeking)
    if (options.startTime) {
      command.push("-ss", options.startTime);
    }

    // Input file
    command.push("-i", file.name);

    // Duration/end time (after -i)
    if (options.duration) {
      command.push("-t", options.duration);
    } else if (options.endTime && options.startTime) {
      const startSec = parseTimeToSeconds(options.startTime);
      const endSec = parseTimeToSeconds(options.endTime);
      command.push("-t", String(endSec - startSec));
    }

    // Video codec
    const codec = options.codec || formatConfig.codec;
    if (format === "gif") {
      // Special handling for GIF
      command.push("-vf", "fps=10,scale=480:-1:flags=lanczos");
    } else {
      command.push("-c:v", codec);

      // Quality settings (CRF takes priority over quality percentage)
      if (options.crf !== undefined) {
        command.push("-crf", String(options.crf));
      } else if (options.quality !== undefined) {
        // Convert 0-100 quality to CRF (0-51, lower is better)
        const crf = Math.round(51 - (options.quality / 100) * 51);
        command.push("-crf", String(Math.max(0, Math.min(51, crf))));
      }

      // Bitrate control
      if (options.bitrate) {
        command.push("-b:v", options.bitrate);
        
        // Add maxrate and bufsize for constrained encoding
        if (options.maxBitrate) {
          command.push("-maxrate", options.maxBitrate);
        }
        if (options.bufferSize) {
          command.push("-bufsize", options.bufferSize);
        } else if (options.maxBitrate) {
          // Default buffer size = 2x maxrate
          command.push("-bufsize", options.maxBitrate);
        }
      }

      // Encoding preset (speed vs compression)
      if (options.preset && codec === "libx264") {
        command.push("-preset", options.preset);
      }
    }

    // Threads (limit to 1 for single-threaded WASM to prevent OOM / index out of bounds)
    command.push("-threads", "1");

    // Resolution/scaling
    if (options.resolution) {
      let scale: string;
      if (typeof options.resolution === "string") {
        const preset = RESOLUTION_PRESETS[options.resolution];
        // Preserve aspect ratio: scale to width, let height adjust automatically
        // Center the scaled video inside the target padded resolution safely.
        scale = `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2:color=black`;
      } else {
        // For custom resolution, preserve aspect ratio
        scale = `scale=${options.resolution.width}:${options.resolution.height}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${options.resolution.width}:${options.resolution.height}:(ow-iw)/2:(oh-ih)/2:color=black`;
      }
      // Add scaling filter
      if (format !== "gif") {
        command.push("-vf", scale);
      }
    } else {
      // For original resolution, ensure dimensions are divisible by 2 for video codecs
      if (format !== "gif") {
        command.push("-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2");
      }
    }

    // Frame rate
    if (options.fps) {
      command.push("-r", String(options.fps));
      command.push("-vsync", "cfr");
    }

    // Audio handling
    if (options.removeAudio || format === "gif") {
      command.push("-an");
    } else {
      // Copy audio stream by default (faster), or use AAC for MP4
      if (format === "mp4" || format === "mov" || format === "m4v") {
        command.push("-c:a", "aac", "-b:a", "128k");
      } else if (format === "webm") {
        command.push("-c:a", "libopus", "-b:a", "128k");
      } else {
        command.push("-c:a", "copy");
      }
    }

    // Output options
    command.push("-y", outputName);

    // Execute conversion
    const exitCode = await ffmpeg.exec(command);
    if (exitCode !== 0) {
      throw new Error(`FFmpeg video conversion failed with exit code ${exitCode}.`);
    }

    // Read output file
    const data = await ffmpeg.readFile(outputName);
    const arrayBuffer = convertFileDataToArrayBuffer(data);
    const blob = new Blob([arrayBuffer], { type: formatConfig.mimeType });

    // Cleanup
    await cleanupFiles(ffmpeg, [file.name, outputName]);

    return {
      blob,
      filename: getOutputFilename(file.name, format),
      originalSize: file.size,
      convertedSize: blob.size,
      compressionRatio: ((file.size - blob.size) / file.size) * 100,
      mimeType: formatConfig.mimeType,
    };
  } finally {
    cleanupProgressHandler(ffmpeg);
    await terminateFFmpeg();
  }
}

/**
 * Convert image file with quality and resize options
 */
export async function convertImage(
  file: File,
  outputFormat: string,
  options: ImageConversionOptions = {}
): Promise<ConversionResult> {
  const ffmpeg = await loadFFmpeg();
  const format = outputFormat.toLowerCase();
  const outputName = `output.${format}`;
  const formatConfig = IMAGE_FORMATS[format] || { mimeType: `image/${format}` };

  setupProgressHandler(ffmpeg, options.onProgress);

  try {
    // Write input file
    const fileData = await fetchFile(file);
    await ffmpeg.writeFile(file.name, fileData);

    // Build command
    const command: string[] = ["-i", file.name];

    // Resize if specified
    if (options.width || options.height) {
      const width = options.width || -1;
      const height = options.height || -1;
      
      if (options.maintainAspectRatio !== false) {
        // Maintain aspect ratio: use -1 for the dimension to be calculated
        if (options.width && !options.height) {
          command.push("-vf", `scale=${width}:-1`);
        } else if (options.height && !options.width) {
          command.push("-vf", `scale=-1:${height}`);
        } else {
          command.push("-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease`);
        }
      } else {
        command.push("-vf", `scale=${width}:${height}`);
      }
    }

    // Quality settings based on format
    if (options.quality !== undefined) {
      const quality = Math.max(0, Math.min(100, options.quality));
      
      if (format === "jpg" || format === "jpeg") {
        // JPEG: -q:v 2-31 (2 = best quality, 31 = worst)
        const qValue = Math.round(2 + ((100 - quality) / 100) * 29);
        command.push("-q:v", String(qValue));
      } else if (format === "png") {
        // PNG: -compression_level 0-9 (0 = no compression, 9 = max)
        const compressionLevel = Math.round((100 - quality) / 100 * 9);
        command.push("-compression_level", String(compressionLevel));
      } else if (format === "webp") {
        // WebP: -quality 0-100 (100 = best)
        command.push("-quality", String(quality));
      } else if (format === "tiff" || format === "tif") {
        // TIFF: -compression_algo lzw for lossless
        if (quality < 100) {
          command.push("-compression_algo", "lzw");
        }
      }
    }

    command.push("-y", outputName);

    // Execute conversion
    const exitCode = await ffmpeg.exec(command);
    if (exitCode !== 0) {
      throw new Error(`FFmpeg image conversion failed with exit code ${exitCode}.`);
    }

    // Read output file
    const data = await ffmpeg.readFile(outputName);
    const arrayBuffer = convertFileDataToArrayBuffer(data);
    const blob = new Blob([arrayBuffer], { type: formatConfig.mimeType });

    // Cleanup
    await cleanupFiles(ffmpeg, [file.name, outputName]);

    return {
      blob,
      filename: getOutputFilename(file.name, format),
      originalSize: file.size,
      convertedSize: blob.size,
      compressionRatio: ((file.size - blob.size) / file.size) * 100,
      mimeType: formatConfig.mimeType,
    };
  } finally {
    cleanupProgressHandler(ffmpeg);
    await terminateFFmpeg();
  }
}

/**
 * Convert audio file with bitrate and codec options
 */
export async function convertAudio(
  file: File,
  outputFormat: string,
  options: AudioConversionOptions = {}
): Promise<ConversionResult> {
  const ffmpeg = await loadFFmpeg();
  const format = outputFormat.toLowerCase();
  const outputName = `output.${format}`;
  const formatConfig = AUDIO_CODECS[format] || { codec: "aac", mimeType: `audio/${format}` };

  setupProgressHandler(ffmpeg, options.onProgress);

  try {
    // Write input file
    const fileData = await fetchFile(file);
    await ffmpeg.writeFile(file.name, fileData);

    // Build command
    const command: string[] = ["-i", file.name];

    // Extract audio from video (remove video stream)
    if (options.extractFromVideo) {
      command.push("-vn");
    }

    // Audio codec
    const codec = options.codec || formatConfig.codec;
    command.push("-c:a", codec);

    // Bitrate
    if (options.bitrate) {
      const bitrate = options.bitrate.includes("k") ? options.bitrate : `${options.bitrate}k`;
      command.push("-b:a", bitrate);
    } else {
      // Default bitrates per format
      const defaultBitrates: Record<string, string> = {
        mp3: "192k",
        aac: "192k",
        ogg: "192k",
        opus: "128k",
        flac: "0", // Lossless
        wav: "0", // Uncompressed
      };
      const defaultBitrate = defaultBitrates[format];
      if (defaultBitrate && defaultBitrate !== "0") {
        command.push("-b:a", defaultBitrate);
      }
    }

    // Sample rate
    if (options.sampleRate) {
      command.push("-ar", String(options.sampleRate));
    }

    // Channels
    if (options.channels) {
      command.push("-ac", String(options.channels));
    }

    // Threads (limit to 1 for single-threaded WASM to prevent hangs)
    command.push("-threads", "1");

    command.push("-y", outputName);

    // Execute conversion
    const exitCode = await ffmpeg.exec(command);
    if (exitCode !== 0) {
      throw new Error(`FFmpeg audio conversion failed with exit code ${exitCode}.`);
    }

    // Read output file
    const data = await ffmpeg.readFile(outputName);
    const arrayBuffer = convertFileDataToArrayBuffer(data);
    const blob = new Blob([arrayBuffer], { type: formatConfig.mimeType });

    // Cleanup
    await cleanupFiles(ffmpeg, [file.name, outputName]);

    return {
      blob,
      filename: getOutputFilename(file.name, format),
      originalSize: file.size,
      convertedSize: blob.size,
      compressionRatio: ((file.size - blob.size) / file.size) * 100,
      mimeType: formatConfig.mimeType,
    };
  } finally {
    cleanupProgressHandler(ffmpeg);
    await terminateFFmpeg();
  }
}

/**
 * Extract audio from video file
 */
export async function extractAudioFromVideo(
  file: File,
  outputFormat: string = "mp3",
  options: Omit<AudioConversionOptions, "extractFromVideo"> = {}
): Promise<ConversionResult> {
  return convertAudio(file, outputFormat, {
    ...options,
    extractFromVideo: true,
  });
}

/**
 * Detect media type from file
 */
export function detectMediaType(file: File): "video" | "image" | "audio" {
  const mimeType = file.type.toLowerCase();
  
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";

  // Fallback: detect from extension
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  
  if (Object.keys(VIDEO_CODECS).includes(ext)) return "video";
  if (Object.keys(IMAGE_FORMATS).includes(ext)) return "image";
  if (Object.keys(AUDIO_CODECS).includes(ext)) return "audio";

  // Additional common extensions
  const videoExts = ["mp4", "webm", "mov", "avi", "mkv", "mpeg", "flv", "wmv", "m4v", "3gp"];
  const imageExts = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "tif", "svg", "ico"];
  const audioExts = ["mp3", "wav", "aac", "ogg", "flac", "m4a", "wma", "opus", "aiff"];

  if (videoExts.includes(ext)) return "video";
  if (imageExts.includes(ext)) return "image";
  if (audioExts.includes(ext)) return "audio";

  return "video"; // Default fallback
}

/**
 * Universal convert function that auto-detects file type
 */
export async function convertFile(
  file: File,
  outputFormat: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const mediaType = detectMediaType(file);

  switch (mediaType) {
    case "video":
      return convertVideo(file, outputFormat, {
        quality: options.quality,
        crf: options.crf,
        bitrate: options.bitrate,
        maxBitrate: options.maxBitrate,
        bufferSize: options.bufferSize,
        resolution: options.resolution,
        fps: options.fps,
        startTime: options.startTime,
        duration: options.duration,
        endTime: options.endTime,
        removeAudio: options.removeAudio,
        codec: options.codec,
        preset: options.preset,
        onProgress: options.onProgress,
      });
    case "image":
      return convertImage(file, outputFormat, {
        quality: options.quality,
        width: options.width,
        height: options.height,
        maintainAspectRatio: options.maintainAspectRatio,
        onProgress: options.onProgress,
      });
    case "audio":
      return convertAudio(file, outputFormat, {
        bitrate: options.bitrate,
        sampleRate: options.sampleRate,
        channels: options.channels,
        extractFromVideo: options.extractFromVideo,
        codec: options.codec,
        onProgress: options.onProgress,
      });
  }
}

/**
 * Batch convert multiple files
 */
export async function convertFiles(
  files: File[],
  outputFormat: string,
  options: ConversionOptions & { 
    onFileProgress?: (fileIndex: number, progress: number) => void;
    onFileComplete?: (fileIndex: number, result: ConversionResult) => void;
  } = {}
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const result = await convertFile(file, outputFormat, {
      ...options,
      onProgress: (progress) => {
        options.onFileProgress?.(i, progress);
        options.onProgress?.(Math.round((i * 100 + progress) / files.length));
      },
    });

    results.push(result);
    options.onFileComplete?.(i, result);
  }

  return results;
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download conversion result
 */
export function downloadResult(result: ConversionResult): void {
  downloadBlob(result.blob, result.filename);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get supported output formats for a media type
 */
export function getSupportedFormats(mediaType: "video" | "image" | "audio"): string[] {
  switch (mediaType) {
    case "video":
      return Object.keys(VIDEO_CODECS);
    case "image":
      return Object.keys(IMAGE_FORMATS);
    case "audio":
      return Object.keys(AUDIO_CODECS);
  }
}

/**
 * Check if FFmpeg is loaded
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded && ffmpegInstance?.loaded === true;
}

/**
 * Preload FFmpeg (call on app init for faster first conversion)
 */
export async function preloadFFmpeg(): Promise<void> {
  await loadFFmpeg();
}
