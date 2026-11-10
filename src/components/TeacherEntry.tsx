"use client";

import React from "react";
import { TeacherApplicationForm } from "@/components/TeacherApplicationForm";
import { SessionSelector } from "@/components/SessionSelector";

export const TeacherEntry: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/ser-profesor";
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