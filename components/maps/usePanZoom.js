'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Pan (drag), zoom (wheel / pinch / buttons) for an SVG whose content lives in a <g transform>. */
export default function usePanZoom({ w, h, min = 0.8, max = 4 }) {
  const svgRef = useRef(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map());
  const last = useRef(null);
  const moved = useRef(false);

  const scaleInfo = () => {
    const r = svgRef.current.getBoundingClientRect();
    const s = Math.min(r.width / w, r.height / h);
    return { r, s, ox: (r.width - w * s) / 2, oy: (r.height - h * s) / 2 };
  };
  const clamp = (k) => Math.min(max, Math.max(min, k));

  const zoomAt = useCallback((factor, cx, cy) => {
    setView((v) => {
      const k = clamp(v.k * factor);
      const f = k / v.k;
      return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const { r, s, ox, oy } = scaleInfo();
      const cx = (e.clientX - r.left - ox) / s;
      const cy = (e.clientY - r.top - oy) / s;
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, cx, cy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]); // eslint-disable-line

  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId);
    const { r, s, ox, oy } = scaleInfo();
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d0 = Math.hypot(a.x - b.x, a.y - b.y);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a2, b2] = [...pointers.current.values()];
      const d1 = Math.hypot(a2.x - b2.x, a2.y - b2.y);
      if (d0 > 0) zoomAt(d1 / d0, ((a2.x + b2.x) / 2 - r.left - ox) / s, ((a2.y + b2.y) / 2 - r.top - oy) / s);
      moved.current = true;
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    if (Math.abs(e.clientX - last.current.x) + Math.abs(e.clientY - last.current.y) > 6) moved.current = true;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (moved.current) setView((v) => ({ ...v, x: v.x + dx / s, y: v.y + dy / s }));
  };
  const onPointerUp = (e) => { pointers.current.delete(e.pointerId); };

  const zoomBy = (f) => zoomAt(f, w / 2, h / 2);
  const reset = () => setView({ k: 1, x: 0, y: 0 });
  /** Centre the view on a bounding box (in map units). */
  const focusBox = useCallback((minX, minY, maxX, maxY, pad = 120) => {
    const bw = maxX - minX + pad * 2;
    const bh = maxY - minY + pad * 2;
    const k = clamp(Math.min(w / bw, h / bh));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setView({ k, x: w / 2 - cx * k, y: h / 2 - cy * k });
  }, [w, h]); // eslint-disable-line

  return {
    svgRef, view, transform: `translate(${view.x} ${view.y}) scale(${view.k})`,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    wasDrag: () => moved.current,
    zoomIn: () => zoomBy(1.3), zoomOut: () => zoomBy(1 / 1.3), reset, focusBox,
  };
}
