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
      const safeSeek = Math.max(0, Math.min(seekSeconds, video.durationSeconds || 7200));
      setCurrentSeek(safeSeek);
    }
  }, [seekSeconds, video.durationSeconds]);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?start=${currentSeek}&autoplay=1&enablejsapi=1&rel=0`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 16:9 Video Player Container */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-border bg-black shadow-xl">
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
      <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-3xl border border-border bg-surface shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary leading-snug">{video.title}</h3>
            <p className="text-xs text-text-secondary mt-1">
              Channel: <strong className="text-text-primary">{video.channelTitle}</strong> • Total Duration: {video.durationFormatted}
            </p>
          </div>

          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-secondary hover:text-focus flex items-center gap-1 p-2 rounded-xl bg-paper hover:bg-border/60 border border-border transition-colors flex-shrink-0"
            title="Open on YouTube"
          >
            <ArrowSquareOut className="w-4 h-4" />
          </a>
        </div>

        {/* AI Pruning Filter Badge */}
        {video.pruningReason && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-focus/5 border border-focus/20 text-xs text-text-secondary">
            <Sparkle className="w-4 h-4 text-focus flex-shrink-0 mt-0.5" weight="fill" />
            <p className="text-xs leading-relaxed">
              <strong className="text-focus font-bold">AI Pruned Focus: </strong>
              {video.pruningReason}
            </p>
          </div>
        )}

        {/* Quick Chapter Timestamp Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
          <span className="text-[11px] text-text-secondary flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-text-secondary" />
            Key Chapters:
          </span>
          <button
            type="button"
            onClick={() => onSeekRequested?.(video.relevantStartSeconds || 0)}
            className="px-3 py-1.5 rounded-xl bg-paper hover:bg-surface border border-border hover:border-focus/40 text-text-primary text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <FastForward className="w-3.5 h-3.5 text-focus" />
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
              className="px-3 py-1.5 rounded-xl bg-paper hover:bg-surface border border-border hover:border-focus/40 text-text-primary text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <FastForward className="w-3.5 h-3.5 text-focus" />
              Advanced Lab ({Math.floor((video.relevantEndSeconds ?? 7200) / 60)}m)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
