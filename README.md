# ConvertZone

**ConvertZone** is a powerful, privacy-first media conversion web application that processes videos, images, and audio files entirely in your browser. Built with Next.js and FFmpeg WASM, it ensures your files never leave your device.

## 🎯 What This Project Does

ConvertZone is a **client-side media converter** that allows you to:

- **Convert** media files between different formats (video, image, audio)
- **Compress** files to reduce size while maintaining quality
- **Process** files locally in your browser - no uploads, no server processing
- **Batch process** multiple files simultaneously
- **Extract** audio tracks from video files
- **Trim** video clips with a visual timeline
- **Customize** conversion settings with advanced options

## ✨ Key Features

### 🎥 Video Converter
- **Format Support**: MP4, WEBM, MOV, AVI, MKV, GIF, MPEG, FLV
- **Video Trimming**: Visual timeline with range slider for precise trimming
- **Quality Control**: Adjustable quality settings (0-100%)
- **Platform Presets**: Pre-configured settings for Twitter, WhatsApp, and more
- **Audio Control**: Toggle audio on/off
- **Resolution Options**: Multiple resolution presets (4K, 1080p, 720p, etc.)
- **Thumbnail Preview**: Visual timeline with video thumbnails

### 🖼️ Image Converter
- **Format Support**: JPG, PNG, WEBP, GIF, BMP, TIFF
- **Batch Processing**: Convert/compress multiple images at once
- **Operation Modes**: 
  - Convert only (change format)
  - Compress only (reduce file size)
  - Convert & Compress (both operations)
- **Compression Presets**: High Quality, Medium, Max Compression
- **Quality Slider**: Fine-tune compression level (1-100%)
- **Visual Results**: See before/after file sizes and compression percentages

### 🎵 Audio Converter
- **Format Support**: MP3, WAV, AAC, OGG, FLAC, M4A
- **Dual Mode**:
  - **Convert Audio**:** Change audio file formats
  - **Extract Audio**:** Extract audio tracks from video files
- **Bitrate Control**: Adjustable audio quality (96k, 128k, 192k, 256k, 320k)
- **Batch Processing**: Process multiple audio/video files simultaneously

### 🚀 Advanced Features

#### Quick Convert (Homepage)
- **Universal Converter**: Auto-detects file type and converts accordingly
- **Batch Mode**: Process multiple files of different types
- **Format Detection**: Automatically detects input format
- **Custom Presets**: Save and load custom conversion settings
- **Status Console**: Real-time conversion status and logs
- **Progress Tracking**: Individual progress for each file in batch mode

#### Privacy & Security
- ✅ **100% Client-Side Processing**: All conversions happen in your browser
- ✅ **No File Uploads**: Files never leave your device
- ✅ **No Server Required**: Zero backend infrastructure
- ✅ **No Data Collection**: Your files are never stored or transmitted

#### Technical Capabilities
- **FFmpeg WASM**: Powered by industry-standard FFmpeg running in WebAssembly
- **No File Size Limits**: Process files of any size (limited only by device memory)
- **Parallel Processing**: Convert multiple files simultaneously
- **Progress Tracking**: Real-time progress updates for all operations
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (React)
- **Media Processing**: FFmpeg WASM (@ffmpeg/ffmpeg)
- **UI Components**: Radix UI + Tailwind CSS
- **Styling**: Custom cyberpunk-themed design system
- **Type Safety**: TypeScript
- **File Handling**: react-dropzone

## 📁 Project Structure

```
convert-zone/
├── app/
│   ├── page.tsx          # Homepage with Quick Convert
│   ├── video/page.tsx     # Video converter page
│   ├── image/page.tsx    # Image converter page
│   ├── audio/page.tsx    # Audio converter page
│   └── layout.tsx        # Root layout
├── components/
│   ├── VideoConverter.tsx    # Video conversion component
│   ├── ImageConverter.tsx     # Image conversion component
│   ├── AudioConverter.tsx    # Audio conversion component
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── ffmpeg-utils.ts        # Core FFmpeg utilities
│   └── utils.ts               # General utilities
└── hooks/
    └── use-toast.ts           # Toast notification hook
```

## 🎨 Design Philosophy

ConvertZone features a **cyberpunk-inspired UI** with:
- Dark theme with neon green accents
- Terminal-style console for status messages
- Grid-based layout with clear visual hierarchy
- Monospace fonts for technical aesthetic
- Smooth animations and transitions

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to use the application.

## 📋 Usage

1. **Select a Converter**: Choose Video, Image, or Audio converter from the homepage
2. **Upload Files**: Drag and drop files or click to browse
3. **Configure Settings**: 
   - Select output format
   - Adjust quality/compression settings
   - Apply presets (if available)
4. **Convert**: Click the convert button and wait for processing
5. **Download**: Files are automatically downloaded when conversion completes

### Quick Convert (Homepage)
- Enable "Local Batch Processing" for multiple files
- Drop files of any type (video, image, or audio)
- Select output format
- All files will be converted to the selected format

## 🔮 Future Enhancements

Based on the feature documentation, planned enhancements include:

- **Video Filters**: Brightness, contrast, saturation, blur, sharpening
- **Image Effects**: Artistic filters, color adjustments, enhancement tools
- **Watermarking**: Text and image watermarks for videos and images
- **Video Stabilization**: One-click camera shake removal
- **Advanced Encoding**: Codec selection, bitrate control, two-pass encoding
- **Format-Specific Options**: Advanced settings for each format type

See `FEATURES_UI_IMPLEMENTATION.md` and `FFMPEG_FEATURES.md` for detailed feature plans.

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the project maintainer.

---

**ConvertZone** - Power User Local Conversion Hub  
*Your files. Your device. Your privacy.*
