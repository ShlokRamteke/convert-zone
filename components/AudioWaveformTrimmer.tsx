"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Scissors } from "lucide-react";

interface AudioWaveformTrimmerProps {
  file: File;
  onTrimChange: (startTime: string, endTime: string, durationSec: number) => void;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${ms}`;
}

function formatTimeHHMMSS(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioWaveformTrimmer({
  file,
  onTrimChange,
}: AudioWaveformTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const regionRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !file) return;

    let isMounted = true;
    let wsInstance: any = null;
    const objectUrl = URL.createObjectURL(file);

    const initWaveSurfer = async () => {
      try {
        const WaveSurfer = (await import("wavesurfer.js")).default;
        const RegionsPlugin = (await import("wavesurfer.js/dist/plugins/regions.js")).default;

        if (!isMounted || !containerRef.current) return;

        // Clean up previous instance
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }

        const ws = WaveSurfer.create({
          container: containerRef.current,
          waveColor: "#93c5fd",
          progressColor: "#2563eb",
          cursorColor: "#1d4ed8",
          barWidth: 2,
          barGap: 2,
          height: 96,
          url: objectUrl,
        });

        const wsRegions = ws.registerPlugin(RegionsPlugin.create());
        wsInstance = ws;
        wavesurferRef.current = ws;

        ws.on("ready", () => {
          if (!isMounted) return;
          const duration = ws.getDuration();
          setTotalDuration(duration);
          setIsLoaded(true);

          const initialEnd = Math.min(duration, duration > 30 ? 30 : duration);
          setStartSec(0);
          setEndSec(initialEnd);

          // Add draggable trim region
          const region = wsRegions.addRegion({
            start: 0,
            end: initialEnd,
            color: "rgba(37, 99, 235, 0.25)",
            drag: true,
            resize: true,
          });

          regionRef.current = region;
          onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(initialEnd), initialEnd);

          region.on("update-end", () => {
            if (!isMounted) return;
            setStartSec(region.start);
            setEndSec(region.end);
            onTrimChange(
              formatTimeHHMMSS(region.start),
              formatTimeHHMMSS(region.end),
              region.end - region.start
            );
          });
        });

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));
        ws.on("finish", () => setIsPlaying(false));
      } catch (err) {
        console.error("Failed to load WaveSurfer:", err);
      }
    };

    initWaveSurfer();

    return () => {
      isMounted = false;
      URL.revokeObjectURL(objectUrl);
      if (wsInstance) {
        try {
          wsInstance.destroy();
        } catch {}
      }
    };
  }, [file]);

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;
    if (regionRef.current) {
      regionRef.current.play();
    } else {
      wavesurferRef.current.playPause();
    }
  };

  const handlePreset = (seconds: number) => {
    if (!regionRef.current || !totalDuration) return;
    const newEnd = Math.min(totalDuration, seconds);
    regionRef.current.setOptions({
      start: 0,
      end: newEnd,
    });
    setStartSec(0);
    setEndSec(newEnd);
    onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(newEnd), newEnd);
  };

  const handleReset = () => {
    if (!regionRef.current || !totalDuration) return;
    regionRef.current.setOptions({
      start: 0,
      end: totalDuration,
    });
    setStartSec(0);
    setEndSec(totalDuration);
    onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(totalDuration), totalDuration);
  };

  return (
    <div className="bg-white rounded-lg border border-blue-100 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Audio Timeline Trimmer</h3>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePreset(15)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded transition-colors"
          >
            First 15s
          </button>
          <button
            type="button"
            onClick={() => handlePreset(30)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded transition-colors"
          >
            First 30s
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Waveform Container */}
      <div className="relative bg-gray-50 border border-gray-200 rounded-md p-3">
        {!isLoaded && (
          <div className="h-24 flex items-center justify-center text-sm text-gray-400">
            Loading audio waveform...
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Play Controls & Time Metadata */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={togglePlayPause}
          disabled={!isLoaded}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause Preview
            </>
          ) : (
            <>
              <Play className="w-4 h-4 ml-0.5" />
              Play Trimmed Region
            </>
          )}
        </button>

        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-md border border-gray-200 font-mono text-gray-700">
          <div>
            <span className="text-gray-400">Start: </span>
            <span className="font-semibold text-blue-600">{formatTime(startSec)}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-gray-400">End: </span>
            <span className="font-semibold text-blue-600">{formatTime(endSec)}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-gray-400">Duration: </span>
            <span className="font-semibold text-emerald-600">
              {formatTime(Math.max(0, endSec - startSec))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
