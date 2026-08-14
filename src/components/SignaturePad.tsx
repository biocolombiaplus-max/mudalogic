"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";

type Props = {
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  height?: number;
};

export default function SignaturePad({ onChange, disabled, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0a1128";
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    drawing.current = true;
    last.current = getPos(e);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled || !drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const pos = getPos(e);
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    last.current = pos;
    if (empty) setEmpty(false);
  }

  function end() {
    drawing.current = false;
    last.current = null;
    if (!empty && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <div
        className={`relative rounded-xl border-2 border-dashed ${
          disabled ? "border-neutral-200 bg-neutral-50" : "border-brand/30 bg-white"
        }`}
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ cursor: disabled ? "default" : "crosshair" }}
        />
        {empty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300 pointer-events-none gap-1.5">
            <PenLine size={22} />
            <span className="text-xs">Firma aquí con el dedo o el mouse</span>
          </div>
        )}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={clear}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-red-500"
        >
          <Eraser size={14} /> Borrar firma
        </button>
      )}
    </div>
  );
}
