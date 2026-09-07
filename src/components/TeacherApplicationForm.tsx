"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { uploadTeacherDocument } from "@/services/teacher.service";
import { showSuccess, showError } from "@/utils/swal";

interface ITeacherForm {
  title: string;
  yearsOfExperience: number;
  bio: string;
}

const BIO_MAX = 500;

export const TeacherApplicationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ITeacherForm>({ mode: "onChange" });

  // urls de los archivos ya subidos
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  // estados de subida
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // largo actual de la bio para el contador en vivo
  const bioLength = watch("bio")?.length ?? 0;

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadTeacherDocument(file, "photo");
      setPhotoUrl(url);
    } catch {
      showError("no se pudo subir la foto");
      setPhotoUrl(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showError("el cv debe ser un pdf");
      e.target.value = "";
      return;
    }
    setUploadingCv(true);
    try {
      const url = await uploadTeacherDocument(file, "cv");
      setCvUrl(url);
    } catch {
      showError("no se pudo subir el cv");
      setCvUrl(null);
    } finally {
      setUploadingCv(false);
    }
  };

  const onSubmit: SubmitHandler<ITeacherForm> = async (data) => {
    if (!photoUrl || !cvUrl) {
      showError("falta subir la foto o el cv");
      return;
    }
    setSubmitting(true);
    try {
      // aca iria el envio final del perfil al backend
      console.log("perfil docente", { ...data, photoUrl, cvUrl });
      showSuccess("perfil enviado correctamente");
      reset();
      setPhotoUrl(null);
      setCvUrl(null);
    } catch {
      showError("error al enviar el perfil");
    } finally {
      setSubmitting(false);
    }
  };

  // se bloquea si el form es invalido, faltan urls, o algo esta subiendo
  const disableSubmit =
    !isValid || !photoUrl || !cvUrl || uploadingPhoto || uploadingCv || submitting;

  return (
    <div className="rounded-lg bg-white p-6 shadow-2xl shadow-brand-primary-dark/40 md:p-8 max-w-2xl mx-auto">
      <h2 className="mb-6 text-2xl font-bold text-brand-primary text-center">Perfil Docente</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* titulo */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Título *</label>
          <input
            type="text"
            {...register("title", { required: "Este campo es obligatorio" })}
            className="w-full rounded-lg border border-brand-tertiary bg-white px-4 py-2.5 text-brand-tertiary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* años de experiencia */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Años de experiencia *</label>
          <input
            type="number"
            {...register("yearsOfExperience", {
              required: "Este campo es obligatorio",
              valueAsNumber: true,
              min: { value: 0, message: "No puede ser negativo" },
              validate: (v) => Number.isInteger(v) || "Debe ser un número entero",
            })}
            className="w-full rounded-lg border border-brand-tertiary bg-white px-4 py-2.5 text-brand-tertiary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
          {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>}
        </div>

        {/* bio con contador */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Bio *</label>
          <textarea
            rows={4}
            maxLength={BIO_MAX}
            {...register("bio", { required: "Este campo es obligatorio" })}
            className="w-full rounded-lg border border-brand-tertiary bg-white px-4 py-2.5 text-brand-tertiary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
          <p className="mt-1 text-right text-xs text-brand-tertiary">{bioLength}/{BIO_MAX}</p>
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        {/* foto */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Fotografía *</label>
          <input type="file" accept="image/*" onChange={onPhotoChange} />
          {uploadingPhoto && <p className="mt-1 text-xs text-brand-tertiary">subiendo foto...</p>}
          {photoUrl && <p className="mt-1 text-xs text-green-600">foto lista ✓</p>}
        </div>

        {/* cv */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">CV (PDF) *</label>
          <input type="file" accept="application/pdf" onChange={onCvChange} />
          {uploadingCv && <p className="mt-1 text-xs text-brand-tertiary">subiendo cv...</p>}
          {cvUrl && <p className="mt-1 text-xs text-green-600">cv listo ✓</p>}
        </div>

        {/* submit */}
        <button
          type="submit"
          disabled={disableSubmit}
          className="w-full cursor-pointer rounded-full bg-brand-secondary text-brand-tertiary px-6 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar perfil"}
        </button>
      </form>
    </div>
  );
};