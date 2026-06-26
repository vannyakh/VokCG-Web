"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Spin } from "antd";
import { Download, Pause, Play, RefreshCw, Scissors } from "lucide-react";
import { TtsWaveform } from "./tts-waveform";
import { formatDuration } from "../lib/tts-utils";

type TtsPreviewCardProps = {
  src: string | null;
  status: "idle" | "generating" | "ready" | "error";
  error?: string;
  onRegenerate: () => void;
  onDownload: () => void;
  t: (key: string) => string;
};

export function TtsPreviewCard({
  src,
  status,
  error,
  onRegenerate,
  onDownload,
  t,
}: TtsPreviewCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    if (src && audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  const progress = duration > 0 ? current / duration : 0;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    audio.currentTime = pct * duration;
    setCurrent(audio.currentTime);
  };

  const statusLabel =
    status === "ready"
      ? t("ttsStudio.previewReady")
      : status === "generating"
        ? t("ttsStudio.previewGenerating")
        : status === "error"
          ? t("ttsStudio.previewError")
          : t("ttsStudio.previewIdle");

  const statusClass =
    status === "ready"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : status === "error"
        ? "bg-red-500/10 text-red-600"
        : "bg-subtle text-muted";

  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface">
      <div className="flex items-center gap-2 border-b border-default px-3.5 py-2.5">
        <span className="text-xs font-medium text-secondary">
          {t("ttsStudio.preview")}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>
        {duration > 0 && (
          <span className="ml-auto text-xs text-muted">
            {formatDuration(duration)} · MP3
          </span>
        )}
      </div>

      <div className="px-3.5 pt-3">
        <TtsWaveform progress={progress} seed={src ?? "idle"} />
      </div>

      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}

      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <button
          type="button"
          disabled={!src || status === "generating"}
          onClick={togglePlay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40"
        >
          {status === "generating" ? (
            <Spin size="small" />
          ) : playing ? (
            <Pause size={14} fill="white" />
          ) : (
            <Play size={14} fill="white" style={{ marginLeft: 2 }} />
          )}
        </button>

        <span className="min-w-[42px] text-xs font-medium text-accent">
          {formatDuration(current)}
        </span>

        <div
          role="slider"
          aria-label="Seek"
          onClick={seek}
          className="h-[3px] flex-1 cursor-pointer rounded bg-subtle"
        >
          <div
            className="h-full rounded bg-accent transition-[width]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <span className="min-w-[42px] text-right text-xs text-muted">
          {formatDuration(duration)}
        </span>

        <div className="ml-auto flex gap-1.5">
          <Button
            size="small"
            disabled
            icon={<Scissors size={13} />}
            className="text-xs"
          >
            {t("ttsStudio.trim")}
          </Button>
          <Button
            size="small"
            icon={<RefreshCw size={13} />}
            onClick={onRegenerate}
            loading={status === "generating"}
            className="text-xs"
          >
            {t("ttsStudio.regenerate")}
          </Button>
          {src && (
            <Button
              size="small"
              icon={<Download size={13} />}
              onClick={onDownload}
              className="text-xs"
            >
              {t("ttsStudio.download")}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="px-3.5 pb-3 text-xs font-medium text-error">{error}</p>
      )}
    </div>
  );
}
