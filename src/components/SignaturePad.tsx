"use client";

import React, { useRef, useState } from "react";

interface SignaturePadProps {
  onChange: (blob: Blob | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  // posicion del puntero relativa al canvas
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.stroke();
  };

  // al soltar, exportamos el trazo a blob y avisamos al padre
  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setHasSignature(true);
    canvasRef.current?.toBlob((blob) => onChange(blob), "image/png");
  };

  // limpia el canvas y resetea la firma a null
  const clear = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={160}
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
        className="w-full touch-none rounded-lg border border-brand-tertiary bg-white"
      />
      <button type="button" onClick={clear} className="mt-2 text-sm text-red-600 underline cursor-pointer">
        Limpiar firma
      </button>
      {hasSignature && <span className="ml-3 text-xs text-green-600">firma capturada ✓</span>}
    </div>
  );
};
