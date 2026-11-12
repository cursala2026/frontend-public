"use client";

import React, { useRef, useState } from "react";

interface SignaturePadProps {
  onChange: (blob: Blob | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Ref para guardar la coordenada anterior y calcular la curva de suavizado
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

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
    
    // 1. ELIMINAMOS el setPointerCapture. 
    // Ahora el canvas no secuestra el cursor si te salís de los bordes.

    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // 2. Configuración para trazo de tinta (más suave y prolijo)
    ctx.lineWidth = 2.5; 
    ctx.lineCap = "round";
    ctx.lineJoin = "round"; // Clave: evita que las uniones rápidas generen picos
    ctx.strokeStyle = "#1f2937";
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !lastPos.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const currentPos = getPos(e);
    
    // 3. Suavizado matemático: en lugar de líneas rectas, calculamos 
    // el punto medio y trazamos una curva cuadrática. Disimula los temblores del mouse.
    const midPoint = {
      x: lastPos.current.x + (currentPos.x - lastPos.current.x) / 2,
      y: lastPos.current.y + (currentPos.y - lastPos.current.y) / 2
    };

    ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, midPoint.x, midPoint.y);
    ctx.stroke();

    lastPos.current = currentPos;
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    
    setHasSignature(true);
    canvasRef.current?.toBlob((blob) => onChange(blob), "image/png");
  };

  const clear = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // Purga la memoria del trazo anterior
    }
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div>
      {/* Contenedor estricto con overflow-hidden para enmascarar cualquier pixel suelto */}
      <div className="w-full overflow-hidden rounded-lg border border-brand-tertiary bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          // 4. Agregamos onPointerLeave para cortar la firma dinámicamente si el usuario saca el cursor
          onPointerLeave={endDraw}
          onPointerOut={endDraw} 
          className="w-full touch-none cursor-crosshair"
        />
      </div>
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