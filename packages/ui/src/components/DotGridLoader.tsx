"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function computeIntensity(
  col: number,
  row: number,
  cols: number,
  rows: number,
  t: number,
) {
  const nx = col / cols;
  const ny = row / rows;
  const cx = 0.5;
  const cy = 0.5;
  const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
  const p1 = Math.sin(nx * 6 + t * 0.05) * Math.cos(ny * 4 - t * 0.04);
  const p2 = Math.sin(dist * 8 - t * 0.07);
  const p3 = Math.cos(nx * 3 + ny * 5 + t * 0.03);
  return ((p1 + p2 + p3) / 3) * 0.45 + 0.55;
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.trim().replace("#", "");
  if (clean.length === 3) {
    const c0 = clean.charAt(0);
    const c1 = clean.charAt(1);
    const c2 = clean.charAt(2);
    const r = parseInt(c0 + c0, 16);
    const g = parseInt(c1 + c1, 16);
    const b = parseInt(c2 + c2, 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  return [59, 130, 246]; // fallback #3b82f6
}

function getDotColor(
  v: number,
  pr: number,
  pg: number,
  pb: number,
): [number, number, number, number] {
  if (v > 0.9) return [255, 255, 255, 1.0];
  if (v > 0.7) {
    const l = (v - 0.7) / 0.2;
    return [
      Math.round(pr + (255 - pr) * l),
      Math.round(pg + (255 - pg) * l),
      Math.round(pb + (255 - pb) * l),
      0.5 + l * 0.5,
    ];
  }
  if (v > 0.4) {
    const l = (v - 0.4) / 0.3;
    const mr = Math.round(pr * 0.48);
    const mg = Math.round(pg * 0.48);
    const mb = Math.round(pb * 0.48);
    return [
      Math.round(mr + (pr - mr) * l),
      Math.round(mg + (pg - mg) * l),
      Math.round(mb + (pb - mb) * l),
      0.12 + l * 0.38,
    ];
  }
  const l = v / 0.4;
  const mr = Math.round(pr * 0.2);
  const mg = Math.round(pg * 0.2);
  const mb = Math.round(pb * 0.2);
  return [mr, mg, mb, 0.03 + l * 0.09];
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: {
      top: 8,
      left: 8,
      borderWidth: "1.5px 0 0 1.5px",
      borderRadius: "4px 0 0 0",
    },
    tr: {
      top: 8,
      right: 8,
      borderWidth: "1.5px 1.5px 0 0",
      borderRadius: "0 4px 0 0",
    },
    bl: {
      bottom: 8,
      left: 8,
      borderWidth: "0 0 1.5px 1.5px",
      borderRadius: "0 0 0 4px",
    },
    br: {
      bottom: 8,
      right: 8,
      borderWidth: "0 1.5px 1.5px 0",
      borderRadius: "0 0 4px 0",
    },
  } as const;
  return (
    <div
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        borderStyle: "solid",
        borderColor: "var(--border-default)",
        opacity: 0.8,
        ...map[pos],
      }}
    />
  );
}

function PulseDot() {
  return (
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--color-primary)",
        animation: "dotPulse 2s ease-in-out infinite",
      }}
    />
  );
}

export type DotGridLoaderStatus = {
  title: string;
  sub: string;
  stage: string;
  index: number;
  total: number;
};

type DotGridLoaderProps = {
  fill?: boolean;
  compact?: boolean;
  hideHud?: boolean;
  width?: number;
  height?: number;
  progress?: number;
  jobId?: string;
  status?: DotGridLoaderStatus;
};

export function DotGridLoader({
  fill = false,
  compact = false,
  hideHud = false,
  width = 420,
  height = 420,
  progress = 0,
  jobId = "gen_001",
  status,
}: DotGridLoaderProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef(0);
  const gridRef = useRef({ cols: 28, rows: 24 });
  const primaryColorRef = useRef<[number, number, number]>([59, 130, 246]);

  const [observedSize, setObservedSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const boxSize = fill
    ? (observedSize ?? { width, height })
    : { width, height };
  const displayProgress = useMemo(
    () => Math.max(0, Math.min(100, Math.round(progress))),
    [progress],
  );

  const title = status?.title ?? "Processing";
  const isFullBleed = fill && !compact;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const style = getComputedStyle(document.documentElement);
    const colorStr = style.getPropertyValue("--color-primary");
    if (colorStr) {
      primaryColorRef.current = parseHex(colorStr);
    }
  }, []);

  useEffect(() => {
    if (!fill) return;
    const el = shellRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setObservedSize({
        width: Math.max(compact ? 80 : 280, Math.floor(rect.width)),
        height: Math.max(compact ? 45 : 320, Math.floor(rect.height)),
      });
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [fill, compact, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || boxSize.width <= 0 || boxSize.height <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = boxSize.width;
    canvas.height = boxSize.height;
    const cols = Math.max(18, Math.floor(boxSize.width / 12));
    const rows = Math.max(14, Math.floor(boxSize.height / 12));
    gridRef.current = { cols, rows };

    function render() {
      const { cols, rows } = gridRef.current;
      const gx = canvas!.width / cols;
      const gy = canvas!.height / rows;

      // Clear instead of drawing static solid backgrounds to support dark/light theme
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const [pr, pg, pb] = primaryColorRef.current;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = computeIntensity(c, r, cols, rows, tickRef.current);
          const [cr, cg, cb, a] = getDotColor(v, pr, pg, pb);
          const rad = 1.6 * (0.75 + v * 0.5);
          ctx!.beginPath();
          ctx!.arc(gx * (c + 0.5), gy * (r + 0.5), rad, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${cr},${cg},${cb},${a.toFixed(2)})`;
          ctx!.fill();
        }
      }
      tickRef.current++;
      rafRef.current = requestAnimationFrame(render);
    }

    render();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [boxSize.width, boxSize.height]);

  return (
    <>
      <style>{`@keyframes dotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}`}</style>
      <div
        ref={shellRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Geist Mono','IBM Plex Mono',monospace",
          ...(fill ? { width: "100%", height: "100%", minHeight: 0 } : {}),
        }}
      >
        <div
          style={{
            background: "var(--bg-canvas)",
            borderRadius: fill ? 0 : 20,
            border: fill ? "none" : "1px solid var(--border-default)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            boxShadow: fill ? "none" : "var(--shadow-md)",
            ...(fill
              ? { width: "100%", height: "100%", flex: 1 }
              : { width: boxSize.width, height: boxSize.height }),
          }}
        >
          {!compact && !isFullBleed && (
            <>
              <Corner pos="tl" />
              <Corner pos="tr" />
              <Corner pos="bl" />
              <Corner pos="br" />
            </>
          )}
          <div style={{ position: "absolute", inset: 0, opacity: 0.95 }}>
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "100%" }}
            />
          </div>
          {!hideHud && (
            <div
              style={
                compact
                  ? {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      padding: "5px 7px",
                      minHeight: 24,
                      background:
                        "linear-gradient(180deg, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 45%, transparent) 70%, transparent 100%)",
                      pointerEvents: "none",
                    }
                  : {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "12px 14px",
                      background:
                        "linear-gradient(180deg, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 72%, transparent) 55%, transparent 100%)",
                      pointerEvents: "none",
                    }
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  minWidth: 0,
                }}
              >
                <span
                  style={
                    compact
                      ? {
                          fontSize: 8,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 72,
                        }
                      : {
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }
                  }
                >
                  {title}
                </span>
                {!compact && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    VokCGStudio · {jobId}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <PulseDot />
                <span
                  style={
                    compact
                      ? {
                          fontSize: 8,
                          fontWeight: 700,
                          color: "var(--color-primary)",
                          letterSpacing: "0.04em",
                          fontVariantNumeric: "tabular-nums",
                        }
                      : {
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-primary)",
                          letterSpacing: "0.04em",
                          fontVariantNumeric: "tabular-nums",
                        }
                  }
                >
                  {displayProgress}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
