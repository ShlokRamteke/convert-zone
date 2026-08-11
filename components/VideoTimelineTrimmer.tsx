"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Scissors, RotateCcw, Play, Pause, Bookmark, Flag } from "lucide-react";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(Math.min(duration, 30));
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [draggingHandle, setDraggingHandle] = useState<"start" | "end" | "playhead" | null>(null);

  useEffect(() => {
    const defaultEnd = Math.min(duration, 30);
    setStartSec(0);
    setEndSec(defaultEnd);
    onTrimChange(formatTimeHHMMSS(0), formatTimeHHMMSS(defaultEnd));
  }, [duration]);

  // Sync video timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= endSec && !video.paused) {
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

  // Convert mouse X to time in seconds
  const getTimeFromMouse = useCallback(
    (clientX: number): number => {
      if (!trackRef.current || duration <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return pct * duration;
    },
    [duration]
  );

  // Mouse Drag Logic
  useEffect(() => {
    if (!draggingHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseSec = getTimeFromMouse(e.clientX);

      if (draggingHandle === "start") {
        const clamped = Math.max(0, Math.min(mouseSec, endSec - 0.5));
        setStartSec(clamped);
        if (videoRef.current) {
          videoRef.current.currentTime = clamped;
        }
        onTrimChange(formatTimeHHMMSS(clamped), formatTimeHHMMSS(endSec));
      } else if (draggingHandle === "end") {
        const clamped = Math.min(duration, Math.max(mouseSec, startSec + 0.5));
        setEndSec(clamped);
        if (videoRef.current) {
          videoRef.current.currentTime = clamped;
        }
        onTrimChange(formatTimeHHMMSS(startSec), formatTimeHHMMSS(clamped));
      } else if (draggingHandle === "playhead") {
        const clamped = Math.max(0, Math.min(duration, mouseSec));
        setCurrentTime(clamped);
        if (videoRef.current) {
          videoRef.current.currentTime = clamped;
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingHandle(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingHandle, endSec, startSec, duration, getTimeFromMouse, onTrimChange, videoRef]);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (draggingHandle) return;
    const clickSec = getTimeFromMouse(e.clientX);
    setCurrentTime(clickSec);
    if (videoRef.current) {
      videoRef.current.currentTime = clickSec;
    }
  };

  const setInPointToPlayhead = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const clamped = Math.max(0, Math.min(cur, endSec - 0.5));
    setStartSec(clamped);
    onTrimChange(formatTimeHHMMSS(clamped), formatTimeHHMMSS(endSec));
  };

  const setOutPointToPlayhead = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const clamped = Math.min(duration, Math.max(cur, startSec + 0.5));
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

  const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startPct = duration > 0 ? (startSec / duration) * 100 : 0;
  const endPct = duration > 0 ? (endSec / duration) * 100 : 100;

  // Generate tick marks across timeline
  const tickCount = 10;
  const ticks = Array.from({ length: tickCount + 1 }).map((_, i) => (i / tickCount) * duration);

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100 space-y-4 select-none">
      {/* Top Bar: Title & In/Out Quick Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Video Timeline Trimmer</h3>
        </div>

        {/* Shortcuts: Set In [ & Out ] */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={setInPointToPlayhead}
            title="Set In Point (Start) at Playhead"
            className="flex items-center gap-1 bg-gray-100 hover:bg-blue-50 text-xs font-medium text-gray-700 hover:text-blue-600 px-2.5 py-1.5 rounded transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Set Start [
          </button>
          <button
            type="button"
            onClick={setOutPointToPlayhead}
            title="Set Out Point (End) at Playhead"
            className="flex items-center gap-1 bg-gray-100 hover:bg-blue-50 text-xs font-medium text-gray-700 hover:text-blue-600 px-2.5 py-1.5 rounded transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Set End ]
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1" />
          <button
            type="button"
            onClick={() => handlePreset(15)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1.5 rounded transition-colors"
          >
            First 15s
          </button>
          <button
            type="button"
            onClick={() => handlePreset(30)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1.5 rounded transition-colors"
          >
            First 30s
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1.5 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Time Ruler Bar */}
      <div className="relative h-4 w-full flex justify-between px-1 text-[10px] font-mono text-gray-500">
        {ticks.map((t, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="leading-none">{formatDisplayTime(t)}</span>
            <div className="w-px h-1.5 bg-gray-300 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Main Interactive Timeline Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-16 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer shadow-inner"
      >
        {/* Track Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:12px_100%]" />

        {/* Unselected Dimmed Overlay Left */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gray-900/40 pointer-events-none"
          style={{ width: `${startPct}%` }}
        />

        {/* Selected Clip Highlight Box */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500/20 border-t-2 border-b-2 border-blue-600"
          style={{
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
          }}
        />

        {/* Unselected Dimmed Overlay Right */}
        <div
          className="absolute top-0 bottom-0 right-0 bg-gray-900/40 pointer-events-none"
          style={{ width: `${100 - endPct}%` }}
        />

        {/* LEFT TRIM HANDLE (Blue Drag Bar) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingHandle("start");
          }}
          className="absolute top-0 bottom-0 w-4 bg-blue-600 hover:bg-blue-700 cursor-ew-resize flex items-center justify-center rounded-l shadow-md z-20 transition-colors group"
          style={{ left: `calc(${startPct}% - 4px)` }}
        >
          {/* Handle Grip Line */}
          <div className="w-0.5 h-4 bg-white/90 rounded-full" />
          {/* Tooltip */}
          <div className="absolute -top-7 bg-blue-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {formatDisplayTime(startSec)}
          </div>
        </div>

        {/* RIGHT TRIM HANDLE (Blue Drag Bar) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingHandle("end");
          }}
          className="absolute top-0 bottom-0 w-4 bg-blue-600 hover:bg-blue-700 cursor-ew-resize flex items-center justify-center rounded-r shadow-md z-20 transition-colors group"
          style={{ left: `calc(${endPct}% - 12px)` }}
        >
          {/* Handle Grip Line */}
          <div className="w-0.5 h-4 bg-white/90 rounded-full" />
          {/* Tooltip */}
          <div className="absolute -top-7 bg-blue-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {formatDisplayTime(endSec)}
          </div>
        </div>

        {/* PLAYHEAD SCRUBBER (Red Line with Top Marker) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingHandle("playhead");
          }}
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 cursor-ew-resize group"
          style={{ left: `${playheadPct}%` }}
        >
          {/* Red Playhead Marker */}
          <div className="w-3 h-3 bg-red-500 -ml-1.25 -mt-1 rotate-45 rounded-xs shadow border border-white" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={togglePreview}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          {isPlaying ? "Pause Preview" : "Play Trimmed Segment"}
        </button>

        {/* Metadata Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 text-gray-700">
            <span className="text-gray-400">Start: </span>
            <span className="text-blue-600 font-semibold">{formatDisplayTime(startSec)}</span>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 text-gray-700">
            <span className="text-gray-400">End: </span>
            <span className="text-blue-600 font-semibold">{formatDisplayTime(endSec)}</span>
          </div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-700 font-semibold">
            <span>Duration: </span>
            <span>{formatDisplayTime(Math.max(0, endSec - startSec))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
