# FFmpeg WASM Features for Robust Video & Image Converters

## 🎥 VIDEO CONVERTER FEATURES

### **1. Video Filters & Effects**

#### **Color & Exposure Adjustments**
- **Brightness/Contrast/Saturation**: `-vf eq=brightness=0.1:contrast=1.2:saturation=1.5`
- **Hue Rotation**: `-vf hue=h=30` (color shift)
- **Gamma Correction**: `-vf eq=gamma=1.2`
- **Color Balance**: `-vf colorbalance=rs=0.1:gs=0.1:bs=0.1`
- **Color Levels**: `-vf colorlevels=rimin=0.1:gimin=0.1:bimin=0.1`
- **Vibrance**: `-vf vibrance=intensity=1.5`
- **Curves**: `-vf curves=preset=lighter` (color grading)

#### **Blur & Sharpening**
- **Gaussian Blur**: `-vf gblur=sigma=2.0`
- **Box Blur**: `-vf boxblur=luma_radius=5`
- **Unsharp Mask**: `-vf unsharp=5:5:1.0:5:5:0.0` (sharpening)
- **Median Filter**: `-vf median=radius=3` (noise reduction)

#### **Geometric Transformations**
- **Rotation**: `-vf rotate=PI/4` (45 degrees)
- **Flip/Mirror**: `-vf hflip` or `-vf vflip`
- **Crop**: `-vf crop=w=640:h=480:x=100:y=100`
- **Pad**: `-vf pad=w=1920:h=1080:x=0:y=0:color=black`
- **Transpose**: `-vf transpose=1` (rotate 90° clockwise)
- **Perspective**: `-vf perspective=x0=0:y0=0:x1=640:y1=0:x2=0:y2=480:x3=640:y3=480`

#### **Video Stabilization**
- **Deshake**: `-vf deshake` (remove camera shake)
- **Vidstabdetect + Vidstabtransform**: Advanced stabilization

#### **Overlay & Composition**
- **Text Overlay**: `-vf drawtext=text='Hello':fontfile=font.ttf:x=10:y=10:fontsize=24:fontcolor=white`
- **Image Overlay**: `-vf overlay=x=10:y=10` (watermark)
- **Logo/Watermark**: `-i logo.png -filter_complex overlay=10:10`
- **Picture-in-Picture**: `-vf overlay=W-w-10:10`

#### **Time-based Effects**
- **Slow Motion**: `-vf setpts=2.0*PTS` (0.5x speed)
- **Fast Motion**: `-vf setpts=0.5*PTS` (2x speed)
- **Reverse**: `-vf reverse` (playback reverse)
- **Fade In/Out**: `-vf fade=t=in:st=0:d=2` or `fade=t=out:st=10:d=2`
- **Freeze Frame**: Extract and duplicate frames

#### **Noise & Artifact Reduction**
- **Denoise**: `-vf hqdn3d=4:3:6:4.5` (high quality denoise)
- **Deblocking**: `-vf deblock` (remove blocking artifacts)
- **Deringing**: `-vf dering` (remove ringing artifacts)

#### **Advanced Filters**
- **Edge Detection**: `-vf edgedetect`
- **Emboss**: `-vf convolution="0 -1 0 -1 5 -1 0 -1 0:0 -1 0 -1 5 -1 0 -1 0:0 -1 0 -1 5 -1 0 -1 0:0 -1 0 -1 5 -1 0 -1 0"`
- **Sepia**: `-vf colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`
- **Black & White**: `-vf hue=s=0`
- **Vignette**: `-vf vignette=PI/4`
- **Lens Correction**: `-vf lenscorrection=k1=-0.3:k2=-0.15`

### **2. Video Encoding Options**

#### **Codec Selection**
- **H.264 (libx264)**: Best compatibility
- **H.265/HEVC (libx265)**: Better compression
- **VP9 (libvpx-vp9)**: Web optimized
- **AV1 (libaom-av1)**: Next-gen compression
- **MPEG-4**: Legacy support
- **Theora**: Open source

#### **Encoding Profiles**
- **Profile**: `-profile:v baseline|main|high`
- **Level**: `-level 4.0|4.1|4.2` (H.264)
- **Tune**: `-tune film|animation|grain|stillimage|fastdecode|zerolatency`
- **GOP Size**: `-g 30` (group of pictures)
- **Keyframe Interval**: `-keyint_min 30`

#### **Rate Control**
- **2-Pass Encoding**: Better quality for target bitrate
- **Constant Quantizer**: `-q:v 23`
- **Average Bitrate**: `-b:v 2M`
- **Peak Bitrate**: `-maxrate 4M -bufsize 8M`
- **Variable Bitrate (VBR)**: Multiple passes

#### **Hardware Acceleration** (if available)
- **Video Toolbox** (macOS): `-c:v h264_videotoolbox`
- **NVENC** (NVIDIA): `-c:v h264_nvenc`
- **VAAPI** (Linux): `-c:v h264_vaapi`

### **3. Audio Processing in Video**

#### **Audio Filters**
- **Volume**: `-af volume=0.5` (50% volume)
- **Normalize**: `-af loudnorm=I=-16:TP=-1.5:LRA=11`
- **Fade In/Out**: `-af afade=t=in:ss=0:d=2`
- **High/Low Pass**: `-af highpass=f=200` or `lowpass=f=3000`
- **Echo**: `-af aecho=0.8:0.88:60:0.4`
- **Reverb**: `-af aresample=44100,aecho=0.8:0.88:60:0.4`
- **Tempo/Pitch**: `-af atempo=1.5` (speed without pitch change)
- **Noise Reduction**: `-af anlmdn=s=0.00001`

#### **Audio Mixing**
- **Multiple Audio Tracks**: `-map 0:v:0 -map 1:a:0`
- **Audio Delay**: `-itsoffset 0.5 -i input.mp4`
- **Audio Sync**: `-async 1`

### **4. Advanced Video Operations**

#### **Multiple Segment Operations**
- **Concatenate Videos**: `-filter_complex concat=n=2:v=1:a=1`
- **Split Video**: Extract multiple segments
- **Merge Videos**: Combine with transitions
- **Insert Clips**: Insert video at specific time

#### **Frame Operations**
- **Extract Frames**: `-vf select='eq(n\,0)' -vsync 0 frame%d.png`
- **Frame Rate Conversion**: `-vf fps=30` (smooth conversion)
- **Frame Interpolation**: `-vf minterpolate=fps=60` (motion interpolation)
- **Thumbnail Generation**: Extract keyframes

#### **Metadata & Subtitles**
- **Add Subtitles**: `-vf subtitles=subtitle.srt`
- **Burn Subtitles**: Hardcode into video
- **Metadata Editing**: `-metadata title="My Video"`
- **Chapter Marks**: Add chapter information

#### **Format-Specific Optimizations**
- **GIF Optimization**: Palette generation, dithering
- **WebM Optimization**: `-deadline good -cpu-used 2`
- **MP4 Fast Start**: `-movflags +faststart` (web streaming)
- **HLS/DASH**: Generate streaming formats

### **5. Video Analysis & Information**

#### **Video Inspection**
- **Probe Video**: Get codec, resolution, duration, bitrate
- **Frame Analysis**: Frame count, keyframes
- **Color Space Info**: YUV, RGB, etc.
- **Audio Stream Info**: Sample rate, channels, codec

---

## 🖼️ IMAGE CONVERTER FEATURES

### **1. Image Filters & Effects**

#### **Color Adjustments**
- **Brightness/Contrast**: `-vf eq=brightness=0.1:contrast=1.2`
- **Saturation**: `-vf eq=saturation=1.5`
- **Hue**: `-vf hue=h=30`
- **Color Balance**: `-vf colorbalance=rs=0.1:gs=0.1:bs=0.1`
- **Colorize**: `-vf colorize=hue=200:saturation=0.5`
- **Sepia**: `-vf colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`
- **Grayscale**: `-vf hue=s=0`
- **Invert Colors**: `-vf negate`
- **Posterize**: `-vf curves=preset=strong_contrast`

#### **Blur & Sharpening**
- **Gaussian Blur**: `-vf gblur=sigma=2.0`
- **Box Blur**: `-vf boxblur=luma_radius=5`
- **Unsharp Mask**: `-vf unsharp=5:5:1.0:5:5:0.0`
- **Smart Blur**: Selective blurring

#### **Geometric Transformations**
- **Resize Algorithms**:
  - `lanczos` (best quality, slower)
  - `bilinear` (fast, lower quality)
  - `bicubic` (balanced)
  - `neighbor` (fastest, pixelated)
  - `spline` (smooth)
- **Crop**: `-vf crop=w=640:h=480:x=100:y=100`
- **Crop Detection**: Auto-detect and crop borders
- **Rotation**: `-vf rotate=PI/4`
- **Flip**: `-vf hflip` or `-vf vflip`
- **Transpose**: `-vf transpose=1`
- **Perspective Correction**: `-vf perspective=...`
- **Lens Correction**: `-vf lenscorrection=k1=-0.3:k2=-0.15`

#### **Artistic Effects**
- **Oil Painting**: `-vf oilpainting`
- **Cartoon**: `-vf cartoon`
- **Edge Detection**: `-vf edgedetect`
- **Emboss**: `-vf convolution=...`
- **Vignette**: `-vf vignette=PI/4`
- **Grain**: `-vf noise=alls=20:allf=t+u`
- **Film Grain**: Add cinematic grain

#### **Enhancement Filters**
- **Denoise**: `-vf hqdn3d=4:3:6:4.5`
- **Deblur**: `-vf deconvolution`
- **Sharpen**: `-vf unsharp=5:5:1.0`
- **Enhance Details**: `-vf convolution=...`
- **Auto Levels**: `-vf normalize`
- **Auto Contrast**: `-vf eq=contrast=1.2`

### **2. Image Format-Specific Features**

#### **JPEG/JPG**
- **Quality**: `-q:v 2-31` (2 = best, 31 = worst)
- **Progressive**: `-probesize 32 -analyzeduration 0`
- **Optimization**: `-optimize` flag
- **Subsampling**: `-subq 6` (chroma subsampling)
- **DCT Method**: `-dct fastint|int|mmx|mlib|auto`

#### **PNG**
- **Compression Level**: `-compression_level 0-9`
- **Color Depth**: `-pix_fmt rgb24|rgba|gray`
- **Palette Optimization**: `-palettegen` + `-paletteuse`
- **Transparency**: Preserve alpha channel
- **Interlacing**: `-interlace plane`

#### **WebP**
- **Quality**: `-quality 0-100`
- **Lossless**: `-lossless 1`
- **Method**: `-compression_level 0-6`
- **Preset**: `-preset default|picture|photo|drawing|icon|text`

#### **GIF**
- **Palette Generation**: `-vf palettegen`
- **Dithering**: `-dither bayer|heckbert|floyd_steinberg|sierra2|sierra2_4a`
- **Optimization**: `-optimize` flag
- **Frame Rate**: `-r 10` (for animated GIFs)
- **Loop**: `-loop 0` (infinite) or `-loop N`

#### **TIFF**
- **Compression**: `-compression_algo none|lzw|jpeg|zip`
- **Color Depth**: `-pix_fmt rgb24|rgba|gray`
- **BigTIFF**: Support for large files

#### **BMP**
- **Color Depth**: `-pix_fmt bgr24|bgra|gray`
- **No Compression**: Native format

### **3. Advanced Image Operations**

#### **Batch Processing**
- **Sequence Processing**: Process numbered sequences
- **Pattern Matching**: Process files matching pattern
- **Parallel Processing**: Multiple images simultaneously

#### **Image Composition**
- **Overlay Images**: `-i overlay.png -filter_complex overlay=10:10`
- **Watermark**: Add text or image watermark
- **Border**: `-vf pad=w=iw+20:h=ih+20:x=10:y=10:color=white`
- **Frame**: Add decorative frame
- **Collage**: Combine multiple images

#### **Image Analysis**
- **Histogram**: Generate color histogram
- **Statistics**: `-vf signalstats` (brightness, saturation stats)
- **Crop Detection**: Auto-detect content area
- **Dominant Colors**: Extract palette

#### **Format Conversion Optimizations**
- **Smart Format Selection**: Choose best format based on content
- **Transparency Handling**: Preserve/remove alpha
- **Color Space Conversion**: RGB ↔ YUV, sRGB ↔ Adobe RGB
- **ICC Profile**: Preserve color profiles

### **4. Image Resize Options**

#### **Resize Modes**
- **Exact Size**: `scale=640:480`
- **Maintain Aspect Ratio**: `scale=640:-1` or `scale=-1:480`
- **Fit to Box**: `scale=640:480:force_original_aspect_ratio=decrease`
- **Fill/Crop**: `scale=640:480:force_original_aspect_ratio=increase`
- **Percentage**: `scale=iw*0.5:ih*0.5` (50% size)

#### **Resize Algorithms** (Quality vs Speed)
- **Lanczos**: Best quality, slower
- **Bicubic**: Good balance
- **Bilinear**: Faster, acceptable quality
- **Nearest Neighbor**: Fastest, pixelated

#### **Smart Cropping**
- **Face Detection**: Crop to faces (if face detection available)
- **Content-Aware**: Crop to important content
- **Auto-Crop**: Remove borders/whitespace

### **5. Image Metadata**

#### **EXIF Data**
- **Preserve EXIF**: Keep camera settings, GPS, etc.
- **Remove EXIF**: Strip metadata for privacy
- **Edit EXIF**: Modify date, location, camera info
- **Orientation**: Auto-rotate based on EXIF

#### **IPTC/XMP**
- **Preserve**: Keep IPTC/XMP metadata
- **Edit**: Modify copyright, keywords, description

---

## 🔧 ADVANCED FEATURES (Both Video & Image)

### **1. Performance Optimizations**
- **Multi-threading**: `-threads 0` (auto-detect cores)
- **Memory Management**: Optimize for large files
- **Progressive Loading**: Stream processing
- **Chunked Processing**: Process in chunks for large files

### **2. Quality Control**
- **SSIM/PSNR**: Quality metrics
- **Two-Pass Encoding**: Better quality for target size
- **Adaptive Bitrate**: Adjust based on content complexity
- **Quality Presets**: Pre-configured quality settings

### **3. Error Handling**
- **Format Validation**: Check input format compatibility
- **Codec Detection**: Auto-detect and suggest codecs
- **Error Recovery**: Handle corrupted files gracefully
- **Progress Persistence**: Resume interrupted conversions

### **4. User Experience**
- **Preview**: Real-time preview of effects
- **Before/After Comparison**: Side-by-side view
- **Preset Management**: Save/load custom presets
- **History**: Track conversion history
- **Undo/Redo**: Revert changes

### **5. Advanced Format Support**
- **RAW Image Formats**: CR2, NEF, ARW, etc.
- **ProRes Video**: Professional video formats
- **DNxHD**: Avid formats
- **Image Sequences**: Process frame sequences
- **Multi-page TIFF**: Handle multi-page images

---

## 📋 IMPLEMENTATION PRIORITY

### **High Priority (Core Features)**
1. ✅ Basic format conversion (DONE)
2. ✅ Quality/compression control (DONE)
3. ✅ Resize/crop (DONE)
4. ⚠️ Advanced video filters (brightness, contrast, saturation)
5. ⚠️ Image filters (blur, sharpen, effects)
6. ⚠️ Better GIF optimization
7. ⚠️ Video stabilization
8. ⚠️ Audio normalization

### **Medium Priority (Enhancement)**
1. Text/image watermark
2. Video concatenation
3. Frame extraction
4. Advanced color grading
5. Noise reduction
6. Smart cropping

### **Low Priority (Nice to Have)**
1. Artistic effects (cartoon, oil painting)
2. Advanced metadata editing
3. RAW format support
4. Professional codecs (ProRes, DNxHD)

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Video Filters UI**: Add brightness, contrast, saturation sliders
2. **Image Effects Panel**: Blur, sharpen, artistic effects
3. **Watermark System**: Text and image watermarking
4. **Video Stabilization**: One-click stabilization
5. **Advanced GIF**: Better palette and dithering options
6. **Batch Operations**: Process multiple files with same settings
7. **Preset System**: Save/load custom conversion presets

