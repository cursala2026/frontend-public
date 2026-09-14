"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { uploadTeacherDocument, applyTeacher } from "@/services/teacher.service";
import { SignaturePad } from "@/components/SignaturePad";
import { showSuccess, showError } from "@/utils/swal";

interface ITeacherForm {
  title: string;
  yearsOfExperience: number;
  bio: string;
}

const BIO_MAX = 500;
const SIGNATURE_MAX_MB = 2;

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
  // firma: guardamos el archivo (del canvas o del input) y lo subimos al enviar
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  // acuerdo legal
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  // estados de subida
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setCvUrl(await uploadTeacherDocument(file, "cv"));
    } catch {
      showError("no se pudo subir el cv");
      setCvUrl(null);
    } finally {
      setUploadingCv(false);
    }
  };

  // firma dibujada en el canvas: la convertimos en archivo
  const onSignatureDraw = (blob: Blob | null) => {
    setSignatureFile(blob ? new File([blob], "firma.png", { type: "image/png" }) : null);
  };

  // firma subida como imagen (png/jpg/webp, max 2mb)
  const onSignatureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showError("la firma debe ser png, jpg o webp");
      e.target.value = "";
      return;
    }
    if (file.size > SIGNATURE_MAX_MB * 1024 * 1024) {
      showError(`la firma supera los ${SIGNATURE_MAX_MB} MB`);
      e.target.value = "";
      return;
    }
    setSignatureFile(file);
  };

  const onSubmit: SubmitHandler<ITeacherForm> = async (data) => {
    if (!photoUrl || !cvUrl || !signatureFile || !agreementAccepted) {
      showError("faltan datos: foto, cv, firma o aceptar el acuerdo");
      return;
    }
    setSubmitting(true);
    try {
      // subimos la firma antes del envio final
      const signatureUrl = await uploadTeacherDocument(signatureFile, "signature");
      await applyTeacher({
        title: data.title,
        yearsOfExperience: data.yearsOfExperience,
        bio: data.bio,
        photoUrl,
        cvUrl,
        signatureUrl,
        agreementAccepted: true,
      });
      showSuccess("Postulación enviada. Tu perfil está en proceso de evaluación por Cursala");
      reset();
      setPhotoUrl(null);
      setCvUrl(null);
      setSignatureFile(null);
      setAgreementAccepted(false);
    } catch {
      showError("error al enviar la postulacion");
    } finally {
      setSubmitting(false);
    }
  };

  // el boton se bloquea si falta cualquier cosa
  const disableSubmit =
    !isValid || !photoUrl || !cvUrl || !signatureFile || !agreementAccepted ||
    uploadingPhoto || uploadingCv || submitting;

  return (
    <div className="rounded-lg bg-white p-6 shadow-2xl shadow-brand-primary-dark/40 md:p-8 max-w-2xl mx-auto">
      <h2 className="mb-6 text-2xl font-bold text-brand-primary text-center">Postulación Docente</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* titulo */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Título *</label>
          <input type="text" {...register("title", { required: "Este campo es obligatorio" })}
            className="w-full rounded-lg border border-brand-tertiary bg-white px-4 py-2.5 text-brand-tertiary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* años de experiencia */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Años de experiencia *</label>
          <input type="number" {...register("yearsOfExperience", {
              required: "Este campo es obligatorio",
              valueAsNumber: true,
              min: { value: 0, message: "No puede ser negativo" },
              validate: (v) => Number.isInteger(v) || "Debe ser un número entero",
            })}
            className="w-full rounded-lg border border-brand-tertiary bg-white px-4 py-2.5 text-brand-tertiary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
          {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>}
        </div>

        {/* bio con contador */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Bio *</label>
          <textarea rows={4} maxLength={BIO_MAX} {...register("bio", { required: "Este campo es obligatorio" })}
            className="w-full rounded-lg border border-brand-tertiary bg-white px-4 py-2.5 text-brand-tertiary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
          <p className="mt-1 text-right text-xs text-brand-tertiary">{bioLength}/{BIO_MAX}</p>
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        {/* foto */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Fotografía *</label>
          <input type="file" accept="image/*" onChange={onPhotoChange}
            className="block w-full text-sm text-brand-tertiary file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-tertiary hover:file:opacity-90" />
          {uploadingPhoto && <p className="mt-1 text-xs text-brand-tertiary">subiendo foto...</p>}
          {photoUrl && <p className="mt-1 text-xs text-green-600">foto lista ✓</p>}
        </div>

        {/* cv */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">CV (PDF) *</label>
          <input type="file" accept="application/pdf" onChange={onCvChange}
            className="block w-full text-sm text-brand-tertiary file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-tertiary hover:file:opacity-90" />
          {uploadingCv && <p className="mt-1 text-xs text-brand-tertiary">subiendo cv...</p>}
          {cvUrl && <p className="mt-1 text-xs text-green-600">cv listo ✓</p>}
        </div>

        {/* firma con pestañas */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Firma *</label>
          <div className="mb-2 flex gap-2">
            <button type="button" onClick={() => setSignatureMode("draw")}
              className={`text-sm px-3 py-1 rounded-full border ${signatureMode === "draw" ? "bg-brand-secondary text-brand-tertiary" : "bg-white text-brand-tertiary"}`}>
              Dibujar firma
            </button>
            <button type="button" onClick={() => setSignatureMode("upload")}
              className={`text-sm px-3 py-1 rounded-full border ${signatureMode === "upload" ? "bg-brand-secondary text-brand-tertiary" : "bg-white text-brand-tertiary"}`}>
              Subir imagen
            </button>
          </div>
          {signatureMode === "draw"
            ? <SignaturePad onChange={onSignatureDraw} />
            : <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onSignatureFile}
                className="block w-full text-sm text-brand-tertiary file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-tertiary hover:file:opacity-90" />}
          {signatureFile && <p className="mt-1 text-xs text-green-600">firma lista ✓</p>}
        </div>

        {/* acuerdo legal */}
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-tertiary">Acuerdo de prestación de servicios</label>
          <div className="h-40 overflow-y-auto rounded-lg border border-brand-tertiary bg-gray-50 p-3 text-xs text-brand-tertiary">
            <p>Al postularte como docente en Cursala aceptás los términos del acuerdo de prestación de servicios. (Acá va el texto legal completo que provea el equipo.)</p>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-brand-tertiary">
            <input type="checkbox" checked={agreementAccepted} onChange={(e) => setAgreementAccepted(e.target.checked)} />
            Acepto el acuerdo de prestación de servicios
          </label>
        </div>

        {/* submit */}
        <button type="submit" disabled={disableSubmit}
          className="w-full cursor-pointer rounded-full bg-brand-secondary text-brand-tertiary px-6 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? "Enviando..." : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
};