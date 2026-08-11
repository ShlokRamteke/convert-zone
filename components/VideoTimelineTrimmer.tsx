"use client";

import { useState, useEffect } from "react";
import { Scissors, RotateCcw, Play, Pause } from "lucide-react";

interface VideoTimelineTrimmerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number; // in seconds
  onTrimChange: (startTime: string, endTime: string) => void;
}

function formatTimeHHMMSS(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDisplayTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${ms}`;
}

export default function VideoTimelineTrimmer({
  videoRef,
  duration,
  onTrimChange,
}: VideoTimelineTrimmerProps) {
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(Math.min(duration, 30));
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const defaultEnd = Math.min(duration, 30);
    setStartSec(0);
    setEndSec(defaultEnd);
    onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(defaultEnd));
  }, [duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= endSec) {
        video.pause();
        video.currentTime = startSec;
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoRef, startSec, endSec]);

  const handleStartChange = (val: number) => {
    const clamped = Math.min(val, endSec - 1);
    setStartSec(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
    onTrimChange(formatTimeHHMMSS(clamped), formatTimeHHMMSS(endSec));
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.max(val, startSec + 1);
    setEndSec(clamped);
    onTrimChange(formatTimeHHMMSS(startSec), formatTimeHHMMSS(clamped));
  };

  const handlePreset = (seconds: number) => {
    const newEnd = Math.min(duration, seconds);
    setStartSec(0);
    setEndSec(newEnd);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(newEnd));
  };

  const handleReset = () => {
    setStartSec(0);
    setEndSec(duration);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(duration));
  };

  const togglePreview = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime < startSec || video.currentTime >= endSec) {
        video.currentTime = startSec;
      }
      video.play();
    }
  };

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startPercent = duration > 0 ? (startSec / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endSec / duration) * 100 : 100;

  return (
    <div className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Visual Video Timeline</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePreset(15)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition-colors"
          >
            15s
          </button>
          <button
            type="button"
            onClick={() => handlePreset(30)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition-colors"
          >
            30s
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Full
          </button>
        </div>
      </div>

      {/* Visual Bar Trimmer */}
      <div className="space-y-3">
        <div className="relative h-8 bg-gray-100 rounded border border-gray-200 overflow-hidden select-none">
          {/* Active Trimmed Region */}
          <div
            className="absolute top-0 bottom-0 bg-blue-100 border-l-2 border-r-2 border-blue-600 opacity-90"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          {/* Playhead Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 transition-all"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-2 h-2 bg-red-500 -ml-0.75 rotate-45 rounded-xs" />
          </div>
        </div>

        {/* Start Slider */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Trim Start</span>
            <span className="font-mono text-blue-600 font-semibold">
              {formatDisplayTime(startSec)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={startSec}
            onChange={(e) => handleStartChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* End Slider */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Trim End</span>
            <span className="font-mono text-blue-600 font-semibold">
              {formatDisplayTime(endSec)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={endSec}
            onChange={(e) => handleEndChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Control Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={togglePreview}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? "Pause Preview" : "Play Trim Segment"}
        </button>

        <div className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded">
          Selected Duration: {formatDisplayTime(Math.max(0, endSec - startSec))}
        </div>
      </div>
    </div>
  );
}
