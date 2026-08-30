"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, FastForward, Clock, Sparkle, ArrowSquareOut } from "@phosphor-icons/react";
import { VideoResource } from "@/types";

interface VideoPlayerWithControlsProps {
  video: VideoResource;
  seekSeconds: number | null;
  onSeekRequested?: (seconds: number) => void;
}

export function VideoPlayerWithControls({
  video,
  seekSeconds,
  onSeekRequested,
}: VideoPlayerWithControlsProps) {
  const [currentSeek, setCurrentSeek] = useState<number>(video.relevantStartSeconds || 0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (seekSeconds !== null && seekSeconds !== undefined) {
      // Bound-check safe timestamp rule
      const safeSeek = Math.max(0, Math.min(seekSeconds, video.durationSeconds || 7200));
      setCurrentSeek(safeSeek);
    }
  }, [seekSeconds, video.durationSeconds]);

  // Construct embed URL with safe start time
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?start=${currentSeek}&autoplay=1&enablejsapi=1&rel=0`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 16:9 Video Player Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
        <iframe
          ref={iframeRef}
          key={`${video.youtubeId}-${currentSeek}`}
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      {/* Video Metadata & AI Pruning Header */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 leading-snug">{video.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Channel: <strong className="text-zinc-300">{video.channelTitle}</strong> * Total Duration: {video.durationFormatted}
            </p>
          </div>

          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-focus flex items-center gap-1 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors flex-shrink-0"
            title="Open on YouTube"
          >
            <ArrowSquareOut className="w-4 h-4" />
          </a>
        </div>

        {/* AI Pruning Filter Badge */}
        {video.pruningReason && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/20 border border-focus/20 text-xs text-zinc-300">
            <Sparkle className="w-4 h-4 text-focus flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-focus">AI Pruned Focus: </strong>
              {video.pruningReason}
            </p>
          </div>
        )}

        {/* Quick Chapter Timestamp Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60 text-xs">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Key Chapters:
          </span>
          <button
            type="button"
            onClick={() => onSeekRequested?.(video.relevantStartSeconds || 0)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FastForward className="w-3 h-3 text-focus" />
            Core Focus ({Math.floor((video.relevantStartSeconds || 0) / 60)}m)
          </button>
          {video.relevantEndSeconds !== undefined && (
            <button
              type="button"
              onClick={() => {
                const end = video.relevantEndSeconds ?? 7200;
                const start = video.relevantStartSeconds ?? 0;
                onSeekRequested?.(Math.floor((start + end) / 2));
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FastForward className="w-3 h-3 text-cyan-400" />
              Advanced Lab ({Math.floor((((video.relevantStartSeconds || 0) + (video.relevantEndSeconds ?? 0)) / 2) / 60)}m)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
