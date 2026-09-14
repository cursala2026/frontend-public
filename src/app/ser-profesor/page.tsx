"use client";

import React from "react";
import { TeacherEntry } from "@/components/TeacherEntry";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function SerProfesorPage() {
  const { isAuthenticated } = useAuthSession();

  // mientras chequea la sesion no mostramos nada
  if (isAuthenticated === null) return null;

  return (
    <main className="min-h-screen py-12 px-4">
      <TeacherEntry isAuthenticated={isAuthenticated} />
    </main>
  );
}