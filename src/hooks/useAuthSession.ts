"use client";

import { useEffect, useState } from "react";

function isTokenValid(token: string | null | undefined): boolean {
  if (!token || token === "undefined" || token === "null") return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(window.atob(padded));

    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function clearAllAuthData() {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  document.cookie = "token=; Max-Age=0; path=/;";
  document.cookie = "token=; Max-Age=0; path=/ser-profesor;";
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
}

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

    // 1. Revisar si viene un token nuevo por URL (?token=...)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      if (isTokenValid(tokenFromUrl)) {
        localStorage.setItem("token", tokenFromUrl);
        document.cookie = `token=${tokenFromUrl}; path=/; SameSite=Lax`;

        params.delete("token");
        const newQuery = params.toString();
        const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
        window.history.replaceState({}, "", newUrl);

        setIsAuthenticated(true);
        return;
      } else {
        clearAllAuthData();
        setIsAuthenticated(false);
        return;
      }
    }

    // 2. Revisar token guardado en localStorage o cookie
    const lsToken = localStorage.getItem("token");
    const lsAccessToken = localStorage.getItem("access_token");
    const cookieToken = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.substring(6);

    const candidateToken = lsToken || lsAccessToken || cookieToken || null;

    if (isTokenValid(candidateToken)) {
      setIsAuthenticated(true);
    } else {
      clearAllAuthData();
      setIsAuthenticated(false);
    }
  }, [override]);

  return { isAuthenticated };
}