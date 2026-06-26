"use client";

import { useEffect, useRef } from "react";

type TaskVideoPosterProps = {
  src: string;
  objectFit?: "cover" | "contain";
};

export function TaskVideoPoster({
  src,
  objectFit = "cover",
}: TaskVideoPosterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const showFrame = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(0.5, video.duration * 0.05);
      }
      video.pause();
    };
    video.addEventListener("loadeddata", showFrame);
    video.load();
    return () => video.removeEventListener("loadeddata", showFrame);
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full"
      style={{ objectFit, display: "block", pointerEvents: "none" }}
    />
  );
}
