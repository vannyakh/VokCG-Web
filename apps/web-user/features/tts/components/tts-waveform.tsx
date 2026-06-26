"use client";

import { useEffect, useRef } from "react";

type TtsWaveformProps = {
  progress?: number;
  seed?: string;
  className?: string;
};

export function TtsWaveform({
  progress = 0,
  seed = "default",
  className,
}: TtsWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(parent.clientWidth, 280);
      canvas.width = width * dpr;
      canvas.height = 52 * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = "52px";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, 52);

      const bars = 120;
      const barWidth = (width / bars) * 0.55;
      const gap = (width / bars) * 0.45;
      const playedRatio = Math.max(0, Math.min(1, progress));

      let hash = 0;
      for (let i = 0; i < seed.length; i += 1)
        hash = (hash + seed.charCodeAt(i) * (i + 3)) % 997;

      const playedColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-primary")
          .trim() || "#534AB7";
      const idleColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--border-default")
          .trim() || "#e8e7e4";

      for (let i = 0; i < bars; i += 1) {
        const x = i * (barWidth + gap);
        const wave =
          Math.sin(i * 0.31 + hash * 0.01) * 0.3 +
          Math.sin(i * 0.17 + hash * 0.02) * 0.25 +
          (((hash + i * 17) % 100) / 100) * 0.45 +
          0.1;
        const h = wave * 52 * 0.85;
        const y = (52 - h) / 2;
        const played = i / bars < playedRatio;

        ctx.fillStyle = played ? playedColor : idleColor;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barWidth, h, 2);
        } else {
          ctx.rect(x, y, barWidth, h);
        }
        ctx.fill();
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [progress, seed]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
