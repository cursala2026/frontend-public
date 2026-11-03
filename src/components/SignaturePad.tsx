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

  // Corrige el desfasaje escalando las coordenadas CSS al buffer interno del canvas
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    
    // Captura el puntero para que no se corte el trazo si salís rápido del área
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
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

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    setHasSignature(true);
    canvasRef.current?.toBlob((blob) => onChange(blob), "image/png");
  };

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
        width={600}
        height={200}
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        className="w-full touch-none rounded-lg border border-brand-tertiary bg-white"
      />
      <div className="mt-2 flex items-center">
        <button
          type="button"
          onClick={clear}
          className="text-sm text-red-600 underline cursor-pointer"
        >
          Limpiar firma
        </button>
        {hasSignature && (
          <span className="ml-3 text-xs text-green-600">firma capturada ✓</span>
        )}
      </div>
    </div>
  );
};