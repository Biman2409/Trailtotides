"use client";

import { useEffect, useRef } from "react";

// Paints a word's textured fill on a canvas laid exactly over the real (transparent) text.
// The hero words used to be CSS backgrounds clipped to text, but dark-mode extensions such
// as Midnight Lizard rewrite page backgrounds, which blanked them out. Canvas pixels are out
// of their reach, so the textures and their motion survive. The DOM text stays underneath
// for layout, selection, search engines and screen readers.

export type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, imgs: HTMLImageElement[]) => void;

const PAD = 0.2; // em of room around the line box, since glyphs overhang tight line-heights

export default function CanvasText({
  targetRef,
  paint,
  images = [],
  animate = false,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  paint: Painter;
  images?: string[];
  /** Repaint every frame while on screen */
  animate?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef(paint);
  paintRef.current = paint;
  const imagesKey = images.join("|");

  useEffect(() => {
    const el = targetRef.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;

    const imgs = imagesKey ? imagesKey.split("|").map((src) => { const i = new Image(); i.src = src; return i; }) : [];
    let layout = { w: 0, h: 0, pad: 0, x: 0, base: 0, text: "", font: "", spacing: "0px", dpr: 1 };
    let raf = 0, visible = true;
    const start = performance.now();

    const measure = () => {
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const pad = size * PAD;
      const w = el.offsetWidth, h = el.offsetHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      // The canvas lives inside the word (which must be positioned), overhanging by `pad`
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      canvas.style.width = `${w + pad * 2}px`;
      canvas.style.height = `${h + pad * 2}px`;
      canvas.width = Math.round((w + pad * 2) * dpr);
      canvas.height = Math.round((h + pad * 2) * dpr);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      ctx.font = font;
      const m = ctx.measureText("Hg");
      const asc = m.fontBoundingBoxAscent ?? size * 0.9, desc = m.fontBoundingBoxDescent ?? size * 0.25;
      const lh = cs.lineHeight === "normal" ? asc + desc : parseFloat(cs.lineHeight);
      const raw = (el.textContent ?? "").trim();
      const text = cs.textTransform === "uppercase" ? raw.toUpperCase() : raw;
      layout = {
        w: w + pad * 2, h: h + pad * 2, pad, dpr, font, text, spacing: cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing,
        x: pad + parseFloat(cs.paddingLeft),
        base: pad + parseFloat(cs.paddingTop) + (lh - (asc + desc)) / 2 + asc,
      };
    };

    const draw = (now: number) => {
      const L = layout;
      if (!L.w) return;
      ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, L.w, L.h);
      ctx.font = L.font;
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = L.spacing;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#000";
      ctx.fillText(L.text, L.x, L.base);
      // Everything painted from here lands only inside the letters
      ctx.globalCompositeOperation = "source-atop";
      paintRef.current(ctx, L.w, L.h, (now - start) / 1000, imgs);
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      draw(now);
      raf = animate && visible ? requestAnimationFrame(loop) : 0;
    };
    const redraw = () => { measure(); if (!raf) raf = requestAnimationFrame(loop); };

    // Dark-mode extensions also put colour filters on canvases (invert, hue-rotate). An inline
    // !important declaration outranks theirs; re-assert it if they rewrite the style.
    const unfilter = () => {
      if (canvas.style.getPropertyValue("filter") !== "none" || canvas.style.getPropertyPriority("filter") !== "important") {
        canvas.style.setProperty("filter", "none", "important");
      }
    };
    unfilter();
    const mo = new MutationObserver(unfilter);
    mo.observe(canvas, { attributes: true, attributeFilter: ["style"] });

    redraw();
    document.fonts?.ready.then(redraw);
    imgs.forEach((i) => i.addEventListener("load", redraw));
    const ro = new ResizeObserver(redraw);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); };
  }, [targetRef, imagesKey, animate]);

  return <canvas ref={canvasRef} aria-hidden className="absolute pointer-events-none" />;
}
