"use client";

import { useCallback, useState } from "react";
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
import { Upload, FileType, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ffmpeg = new FFmpeg();

// Updated image formats (removed SVG and AVIF)
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff"];

export default function ImageConverter() {
  const [loaded, setLoaded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState("");
  const [quality, setQuality] = useState(80);
  const { toast } = useToast();

  const load = async () => {
    if (!loaded) {
      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setFiles(acceptedFiles);
      setProgress(new Array(acceptedFiles.length).fill(0));
      setTargetFormat("jpg");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": IMAGE_FORMATS.map((format) => `.${format}`),
    },
    maxFiles: 10, // Increase max files if needed
  });

  const convert = async () => {
    if (!files.length || !targetFormat) return;

    try {
      await load();
      setConverting(true);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const outputName = `output_${i}.${targetFormat}`;

        ffmpeg.on("progress", ({ progress }) => {
          setProgress((prev) => {
            const newProgress = [...prev];
            newProgress[i] = Math.round(progress * 100);
            return newProgress;
          });
        });

        const fileData = await fetchFile(file);
        ffmpeg.writeFile(file.name, fileData);

        await ffmpeg.exec([
          "-i",
          file.name,
          "-quality",
          String(quality),
          outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: `image/${targetFormat}` });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = outputName;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Success!",
        description: "Your images have been converted successfully.",
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
      setProgress(new Array(files.length).fill(0));
    }
  };

  return (
    <Card className="p-8 bg-gray-800/50 border-gray-700">
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
            ? "Drop your images here..."
            : "Drag & drop your images here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: {IMAGE_FORMATS.join(", ")}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-8 space-y-6">
          {files.map((file, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-4">
                <FileType className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="font-medium text-gray-200">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full rounded-lg"
              />

              {converting && (
                <div className="space-y-2">
                  <Progress value={progress[index]} />
                  <p className="text-sm text-center text-gray-400">
                    Converting... {progress[index]}%
                  </p>
                </div>
              )}
            </div>
          ))}

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
                  {IMAGE_FORMATS.map((format) => (
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
              />
            </div>
          </div>

          <Button
            onClick={convert}
            className="w-full"
            disabled={!targetFormat || converting}
          >
            <Settings className="mr-2 h-4 w-4" />
            Convert All
          </Button>
        </div>
      )}
    </Card>
  );
}
