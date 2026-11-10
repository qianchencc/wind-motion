"use client";

import { memo, useEffect, useRef } from "react";
import { drawLightEffect } from "./effects/light-effects";
import { drawGraphicEffect } from "./effects/graphic-effects";

type Props = {
  effect: string;
  animate?: boolean;
  time?: number;
  amount?: number;
  detail?: number;
  text?: string;
  className?: string;
  label?: string;
  exportRef?: React.MutableRefObject<HTMLCanvasElement | null>;
};

const lightEffects = new Set(["hero", "border-beam", "crest-sweep", "faceted-rim", "horizon"]);

export const EffectCanvas = memo(function EffectCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = useRef(props);
  const redraw = useRef<() => void>(() => {});
  current.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (current.current.exportRef) current.current.exportRef.current = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let width = 0, height = 0, elapsed = current.current.time ?? 2.8, visible = true, frame = 0;
    let last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paint = () => {
      if (!width || !height) return;
      const p = current.current;
      const options = { effect: p.effect, amount: p.amount ?? .7, detail: p.detail ?? .5, text: p.text };
      ctx.save();
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (lightEffects.has(p.effect)) drawLightEffect(ctx, width, height, p.time ?? elapsed, options);
      else drawGraphicEffect(ctx, width, height, p.time ?? elapsed, options);
      ctx.restore();
    };
    redraw.current = paint;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = box.width; height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      paint();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; });
    intersection.observe(canvas);
    let fontActive = true;
    document.fonts.load('700 32px "Archive Display"').then(() => { if (fontActive) paint(); });
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now;
      if (current.current.animate && visible && !document.hidden && !reduced.matches) {
        elapsed += dt;
        paint();
      }
      frame = requestAnimationFrame(loop);
    };
    resize();
    frame = requestAnimationFrame(loop);
    return () => {
      fontActive = false;
      observer.disconnect(); intersection.disconnect(); cancelAnimationFrame(frame);
      if (current.current.exportRef) current.current.exportRef.current = null;
    };
  }, []);

  useEffect(() => { redraw.current(); }, [props.effect, props.time, props.amount, props.detail, props.text]);
  return <canvas ref={canvasRef} className={props.className || "effect-canvas"} role="img" aria-label={props.label || `${props.effect} 动态实验`} />;
});
