"use client";

import { useEffect, useState } from "react";

// hook simple de sesion para el frontend publico
// chequea si existe la cookie/token de sesion compartida
// acepta un override opcional para forzar el estado (util para tests o demos)
export function useAuthSession(override?: boolean) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    override ?? null
  );

  useEffect(() => {
    if (override !== undefined) {
      setIsAuthenticated(override);
      return;
    }
    const logueado = document.cookie.split("; ").some((c) => c.startsWith("token="));
    setIsAuthenticated(logueado);
  }, [override]);

  return { isAuthenticated };
}