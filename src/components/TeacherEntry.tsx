"use client";

import React from "react";
import { TeacherApplicationForm } from "@/components/TeacherApplicationForm";
import { SessionSelector } from "@/components/SessionSelector";

// discriminador: segun la sesion muestra el form o las opciones de login/registro
export const TeacherEntry: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  return isAuthenticated ? <TeacherApplicationForm /> : <SessionSelector />;
};