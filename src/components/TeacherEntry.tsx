"use client";

import React from "react";
import { TeacherApplicationForm } from "@/components/TeacherApplicationForm";
import { SessionSelector } from "@/components/SessionSelector";

export const TeacherEntry: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const handleLogout = () => {
    // 1. Limpiamos el frontend público
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/;";
    
    // 2. Redirigimos a Angular forzando la limpieza de su lado (requiere que el auth guard de Angular entienda el parámetro)
    // Si Angular no tiene ruta /logout, le pasamos un parámetro para que el login sepa que tiene que matar la sesión previa.
    window.location.href = "http://localhost:4200/login?forceLogout=true&callbackUrl=http://localhost:3002/ser-profesor";
  };

  if (!isAuthenticated) {
    return <SessionSelector />;
  }

  return (
    <div>
      <div className="max-w-xl mx-auto mb-3 flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 underline hover:text-red-800 cursor-pointer"
        >
          Cerrar sesión / Cambiar de cuenta
        </button>
      </div>
      <TeacherApplicationForm />
    </div>
  );
};