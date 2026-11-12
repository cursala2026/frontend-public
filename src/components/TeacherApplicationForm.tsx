"use client";
interface ITeacherForm {
  title: string;
  yearsOfExperience: number;
  bio: string;
  agreementAccepted: boolean; // <--- ESTA ES LA LÍNEA CLAVE QUE TE FALTA
}
import React, { use, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { uploadTeacherDocument, applyTeacher } from "@/services/teacher.service";
import { SignaturePad } from "@/components/SignaturePad";
import { showSuccess, showError } from "@/utils/swal";

interface ITeacherForm {
  title: string;
  yearsOfExperience: number;
  bio: string;
  agreementAccepted: boolean;
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
  const [showTerms, setShowTerms] = useState(false);
  // firma: guardamos el archivo (del canvas o del input) y lo subimos al enviar
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  // acuerdo legal
  const agreementAccepted = watch("agreementAccepted");
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
        <div className="flex items-start gap-3 mt-6 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
  <input 
    type="checkbox" 
    id="terms" 
    {...register('agreementAccepted', { required: true })} 
    className="w-5 h-5 mt-0.5 cursor-pointer accent-yellow-500" 
  />
  <label htmlFor="terms" className="text-sm text-gray-700">
    He leído y acepto el{' '}
    <button 
      type="button" 
      onClick={() => setShowTerms(true)} 
      className="text-blue-600 underline font-semibold hover:text-blue-800 focus:outline-none"
    >
      Acuerdo de Prestación de Servicios
    </button>
  </label>
</div>

        {/* submit */}
        <button type="submit" disabled={disableSubmit}
          className="w-full cursor-pointer rounded-full bg-brand-secondary text-brand-tertiary px-6 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? "Enviando..." : "Enviar postulación"}
        </button>
      </form>

      {/* MODAL FLOTANTE DEL ACUERDO LEGAL */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col relative overflow-hidden">
            
            <div className="p-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Acuerdo de Prestación de Servicios</h3>
              <button 
                type="button" 
                onClick={() => setShowTerms(false)} 
                className="text-gray-500 hover:text-black font-bold text-2xl leading-none px-2"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-sm text-gray-700 text-justify bg-white space-y-6 max-h-[70vh]">
  <div className="border-b border-gray-200 pb-4 mb-4">
    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
      Plataforma Cursala (cursala.com.ar) — INDEVRA CONSULTING S.A.S.
    </p>
    <p className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-yellow-800 rounded-r text-sm">
      Al marcar la casilla de aceptación y remitir la postulación, el PROFESIONAL adhiere de forma plena y vinculante al presente acuerdo con INDEVRA CONSULTING S.A.S. (en adelante, "CURSALA"), conforme a las siguientes cláusulas:
    </p>
  </div>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">1. OBJETO</h4>
    <p className="leading-relaxed">
      El Profesional aportará y/o dictará contenidos de capacitación (Cursos Asincrónicos o Sincrónicos) y Cursala los alojará, promocionará y comercializará a través de la Plataforma. La incorporación de nuevos cursos se gestionará directamente a través del panel docente de la plataforma. Cursala no garantiza un nivel mínimo de ventas ni de inscripciones.
    </p>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">2. LICENCIA DE USO Y PROPIEDAD INTELECTUAL</h4>
    <ul className="space-y-2 leading-relaxed">
      <li><strong>2.1.</strong> Conforme a la Ley 11.723, el Profesional conserva la titularidad y derechos morales sobre los contenidos y materiales aportados.</li>
      <li><strong>2.2.</strong> El Profesional otorga a Cursala una licencia no exclusiva para alojar, reproducir, comunicar al público, transmitir por streaming y comercializar el contenido en la Plataforma.</li>
      <li><strong>2.3.</strong> Cursala conserva la titularidad exclusiva sobre su marca, software, identidad visual y bases de datos de usuarios.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">3. OBLIGACIONES DEL PROFESIONAL</h4>
    <ul className="list-disc pl-5 space-y-2 leading-relaxed">
      <li>Proveer contenidos actualizados, veraces y de calidad técnica razonable de audio y video.</li>
      <li>En cursos sincrónicos, cumplir con las fechas y horarios acordados para el dictado de clases en vivo, notificando con antelación cualquier eventualidad.</li>
      <li>Mantener actualizada su situación fiscal y emitir la facturación correspondiente para la percepción de honorarios.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">4. OBLIGACIONES DE CURSALA</h4>
    <ul className="list-disc pl-5 space-y-2 leading-relaxed">
      <li>Mantener operativa la Plataforma y alojar el contenido con diligencia razonable.</li>
      <li>Gestionar la pasarela de pagos, inscripciones, soporte a usuarios y emisión de certificados.</li>
      <li>Informar periódicamente las ventas registradas y liquidar las retribuciones devengadas.</li>
      <li>Mencionar la autoría del Profesional en la ficha del curso.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">5. RETRIBUCIÓN Y LIQUIDACIONES</h4>
    <ul className="space-y-2 leading-relaxed">
      <li><strong>5.1.</strong> Cursos Asincrónicos: El Profesional percibirá el porcentaje acordado sobre los Ingresos Netos de cada venta efectivamente cobrada.</li>
      <li><strong>5.2.</strong> Se entiende por Ingreso Neto el valor final abonado por el alumno deduciendo el IVA aplicable, los costos de procesamiento de pasarelas de pago y cargos de infraestructura de streaming.</li>
      <li><strong>5.3.</strong> Cursos Sincrónicos: Se liquidarán según el esquema de honorarios por dictado o porcentaje acordado previamente para la comisión.</li>
      <li><strong>5.4.</strong> Los pagos se liquidarán a mes vencido contra presentación de la factura fiscal correspondiente.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">6. DECLARACIONES JURADAS</h4>
    <p className="mb-2">El Profesional declara y garantiza bajo juramento que:</p>
    <ul className="list-disc pl-5 space-y-2 leading-relaxed">
      <li>Es autor y titular del material aportado o cuenta con las licencias correspondientes.</li>
      <li>El contenido no infringe secretos industriales, derechos de propiedad intelectual ni acuerdos de confidencialidad vigentes con terceros o exempleadores.</li>
      <li>Cuenta con la idoneidad y habilitación necesaria para el dictado de la materia.</li>
      <li>Mantendrá indemne a Cursala ante reclamos de terceros derivados del contenido suministrado.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">7. PROTECCIÓN DE DATOS Y CONFIDENCIALIDAD</h4>
    <ul className="space-y-2 leading-relaxed">
      <li><strong>7.1.</strong> Conforme a la Ley 25.326, los datos de los alumnos son administrados por Cursala.</li>
      <li><strong>7.2.</strong> En cumplimiento de las políticas de minimización de datos, el Profesional únicamente accederá a los datos estrictamente pedagógicos de los inscriptos (Nombre, Apellido y Trayectoria/Estudios), comprometiéndose a no extraer ni solicitar información de contacto personal por fuera del sistema.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">8. NATURALEZA DEL VÍNCULO</h4>
    <p className="leading-relaxed">
      El presente acuerdo constituye una colaboración comercial independiente. No genera relación laboral, vínculo de dependencia, sociedad ni representación societaria. El Profesional organiza autónomamente sus medios y es responsable de sus obligaciones impositivas y previsionales.
    </p>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">9. VIGENCIA Y RESCISIÓN</h4>
    <ul className="space-y-2 leading-relaxed">
      <li><strong>9.1.</strong> El acuerdo rige desde la aprobación del perfil docente. Cualquiera de las partes podrá solicitar la baja del servicio con un preaviso formal de treinta (30) días.</li>
      <li><strong>9.2.</strong> En caso de retiro de un curso asincrónico, los alumnos que ya hayan adquirido el acceso mantendrán su disponibilidad técnica durante el plazo de vigencia del curso, liquidándose al Profesional los honorarios devengados.</li>
      <li><strong>9.3.</strong> Cursala podrá dar de baja inmediata cualquier contenido que vulnere derechos de terceros o incumpla normas de calidad y seguridad.</li>
    </ul>
  </section>

  <section>
    <h4 className="font-bold text-gray-900 mb-2">10. JURISDICCIÓN Y LEY APLICABLE</h4>
    <p className="leading-relaxed">
      El acuerdo se rige por las leyes de la República Argentina, sometiéndose las partes a los Tribunales Ordinarios de la Provincia de Mendoza.
    </p>
  </section>
</div>

            <div className="p-4 border-t border-gray-200 bg-gray-100 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowTerms(false)} 
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors"
              >
                Entendido, volver al formulario
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
};