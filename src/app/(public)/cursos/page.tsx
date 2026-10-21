"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import Navbar from "@/app/(public)/shared/Navbar";
import Footer from "@/app/(public)/shared/Footer";
import HeroSection from "@/app/(public)/sections/HeroSection";
import { getPublishedCourses } from "@/services/course.service";
import { getImages } from "@/services/multimedia.service";
import { createBusinessTraining, IBusinessTraining } from "@/services/formPublicServices";
import { generateCourseSlug } from "@/utils/slugify";
import { triggerNotification, showSuccess, showError } from "@/utils/swal";
import { CourseCard, type Course } from "./course-card";

// SEO Metadata - Se exporta desde un archivo metadata separado
// Ver: src/app/(public)/cursos/metadata.ts

// Interfaz para el formulario de solicitud de curso
interface ICourseRequestForm {
 name: string;
 email: string;
 phoneNumber: string;
 countryCode: string;
 message: string;
}

const CoursesPage: React.FC = () => {
 const router = useRouter();
 const [courses, setCourses] = useState<Course[]>([]);
 // eliminada variable promotionsMap; el flag promocional viene con cada curso
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
 const [formLoading, setFormLoading] = useState(false);

 const objectUrls = useRef<string[]>([]);

  // Implementación de debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
 // observerRef y efectos de scroll eliminados porque ahora usamos carga directa por URL

 // Formulario de solicitud de curso
 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 } = useForm<ICourseRequestForm>();

 const updateCourseProperty = useCallback(
 (courseId: string, props: Partial<Course>) => {
 setCourses((prev) =>
 prev.map((c) => (c._id === courseId ? { ...c, ...props } : c)),
 );
 },
 [],
 );

 // Manejo del envío del formulario
    const onSubmitCourseRequest: SubmitHandler<ICourseRequestForm> = async (data) => {
        setFormLoading(true);

        const normalizedCountry = data.countryCode?.startsWith('+')
            ? data.countryCode
            : `+${data.countryCode.replace(/\D/g, '')}`;
        const normalizedPhone = data.phoneNumber.replace(/\D/g, '');

        const businessTrainingData: IBusinessTraining = {
            name: data.name.trim(),
            email: data.email.trim(),
            message: data.message.trim(),
            phoneNumber: `${normalizedCountry}${normalizedPhone}`,
        };

 try {
 await createBusinessTraining(businessTrainingData);
 showSuccess("¡Solicitud enviada correctamente! Nos comunicaremos contigo pronto.");
 reset();
 } catch (error) {
 const errorMessage =
 (error as any)?.response?.data?.message ||
 "Error al enviar la solicitud. Por favor, intenta nuevamente.";
 showError(errorMessage);
 } finally {
 setFormLoading(false);
 }
 };

 useEffect(() => {
 let isMounted = true;
 setLoading(true);

 async function fetchCourses() {
 try {
 const response = await getPublishedCourses();
 
 // La respuesta puede venir en varios formatos:
 // 1. { success: true, data: items, total, message }  (API interna)
 // 2. { status, message, data: { items, total } }     (Si lo devolviera otro servicio)
 // 3. [...] (Array directo)
 
 let coursesData: any[] = [];
 if (Array.isArray(response)) {
     coursesData = response;
 } else if (response && typeof response === 'object') {
     const resp = response as any;
     coursesData = resp.data?.items || resp.data || resp.items || [];
 }
 
 const coursesWithoutImages = coursesData.map((course: any) => ({
 ...course,
 _id: course._id || course.id, // Normalizar ID
 name: course.name || "Curso sin nombre",
 longDescription: course.longDescription || "",
 days: course.days || [],
 time: course.time || "",
 startDate: course.startDate || "",
 registrationOpenDate: course.registrationOpenDate || "",
 endDate: course.endDate || "",
 modality: course.modality || "",
 price: typeof course.price === 'number' ? course.price : 0,
 teacherName: course.teacherName || "",
 maxInstallments: course.maxInstallments || 0,
 interestFree: course.interestFree || false,
 classCount: course.classCount || 0,
 loading: false,
 coverUrl: undefined,
 hasPromotionalCode: course.hasPromotionalCode ?? false,
 }));

 if (isMounted) {
     setCourses(coursesWithoutImages);
     setError(null);
     setLoading(false);
 }
 } catch (error) {
 if (isMounted) {
 // Error cargando cursos
 setError(
 "No se pudieron cargar los cursos. Por favor, intenta de nuevo.",
 );
 setLoading(false);
 }
 }
 }

 fetchCourses();
 return () => {
 isMounted = false;
 };
 }, []);

 useEffect(() => {
 return () => {
 objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
 objectUrls.current = [];
 };
 }, []);

  const filteredCourses = React.useMemo(() => {
    return courses
      .filter((course) =>
        course.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      )
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
  }, [courses, debouncedSearchQuery, sortOrder]);

 if (loading) {
 return (
 <div className="flex min-h-screen flex-col">
 <Navbar />
 <main className="grow bg-gray-50 ">
 
 {/* Hero Section */}
 <HeroSection
 title="Domina las habilidades más demandadas con nuestros cursos expertos"
 subtitle="Todo lo que necesitas saber para el área Industrial lo encuentras aquí."
 description="Encuentra el curso ideal para tu desarrollo profesional."
 buttonText="Comienza ahora"
 buttonHref="#cursos-lista"
 backgroundImage="/images/sections/hero/cursos.jpg"
 />

 <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
 <div
 key={`skeleton-${index}`}
 className="overflow-hidden rounded-lg bg-white shadow-md "
 >
 <div className="h-48 w-full animate-pulse bg-gray-200 "></div>
 <div className="p-4">
 <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 "></div>
 <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200 "></div>
 <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 "></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </main>
 <Footer />
 </div>
 );
 }

 return (
 <div className="flex min-h-screen flex-col">
 <Navbar />

 {/* Hero Section */}
 <HeroSection
 title="Domina las habilidades más demandadas con nuestros cursos expertos"
 subtitle="Todo lo que necesitas saber para el área Industrial lo encuentras aquí"
 description="Encuentra el curso ideal para tu desarrollo profesional."
 buttonText="Comienza ahora"
 buttonHref="#cursos-lista"
 backgroundImage="/images/sections/hero/cursos.jpg"
 />

 

 <main className="grow bg-gray-50 ">
 <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
 
 {error && (
 <div className="mb-6 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700 ">
 <div className="flex items-center">
 <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
 clipRule="evenodd"
 />
 </svg>
 {error}
 </div>
 </div>
 )}

 {/* Filtros y búsqueda */}
 <div id="cursos-lista" className="mb-8 rounded-lg bg-white border-t border-brand-tertiary-lighten/20 p-4 shadow-md ">
 <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
 <div className="flex items-center space-x-2">
 <svg className="h-5 w-5 text-brand-primary " fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
 </svg>
 <span className="text-lg font-semibold text-gray-700 ">
 {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}
 </span>
 </div>
 
 <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
 <div className="relative flex-1 sm:w-80 md:w-180">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <svg className="h-5 w-5 text-brand-tertiary " fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>
 <input
 type="text"
 placeholder="Buscar cursos..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary :border-blue-400 :ring-brand-primary"
 />
 </div>
 <button
 onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
 className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg border border-brand-tertiary bg-white px-4 py-2 font-medium text-brand-tertiary transition-colors hover:bg-brand-tertiary-lighten/20 :bg-gray-600"
 >
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
 </svg>
 <span>{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
 </button>
 </div>
 </div>
 </div>

 {/* Grid de cursos */}
 {filteredCourses.length === 0 ? (
 <div className="rounded-lg bg-white py-20 text-center shadow-md ">
 <svg className="mx-auto h-16 w-16 text-brand-primary " fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <h3 className="mt-4 text-xl font-semibold text-brand-tertiary ">
 No se han encontrado cursos con esos términos.
 </h3>
 <p className="mt-2 text-brand-tertiary ">
 Intenta ajustando tu búsqueda o explora nuestras categorías.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        onClick={() => {
                                            // Redirigir a la página de detalle público del curso usando slug
                                            const slug = generateCourseSlug(course.name, course._id);
                                            router.push(`/detalle-curso/${slug}`);
                                        }}
                                    />
                                ))}
 </div>
 )}
 </div>
 </main>

 {/* Sección de solicitud de curso personalizado */}
 <section id="request-course-section" className="bg-linear-to-b from-brand-primary/10 to-brand-primary/40 py-12 md:py-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-3xl">
 {/* Encabezado */}
 <div className="mb-8 text-center">
 <h2 className="mb-3 text-4xl font-bold text-brand-primary ">
 ¿No encontraste el curso que buscabas?
 </h2>
 <p className="text-lg text-brand-tertiary ">
 Contanos sobre qué tema te gustaría recibir capacitación. ¡Podemos armarlo para vos!
 </p>
 </div>

 {/* Formulario */}
 <div className="rounded-lg bg-white p-6 shadow-2xl shadow-brand-primary-dark/40 md:p-8">
 <form onSubmit={handleSubmit(onSubmitCourseRequest)} className="space-y-5">
 {/* Nombre */}
 <div>
 <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 ">
 Nombre Completo *
 </label>
 <input
 type="text"
 id="name"
 {...register("name", {
 required: "Este campo es obligatorio",
 })}
 placeholder="Tu nombre completo"
 className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary :border-blue-400"
 disabled={formLoading}
 />
 {errors.name && (
 <p className="mt-1 text-sm text-red-600 ">{errors.name.message}</p>
 )}
 </div>

 {/* Email */}
 <div>
 <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 ">
 Correo Electrónico *
 </label>
 <input
 type="email"
 id="email"
 {...register("email", {
 required: "Este campo es obligatorio",
 pattern: {
 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
 message: "Correo electrónico inválido",
 },
 })}
 placeholder="tu@email.com"
 className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary :border-blue-400"
 disabled={formLoading}
 />
 {errors.email && (
 <p className="mt-1 text-sm text-red-600 ">{errors.email.message}</p>
 )}
 </div>

 {/* Teléfono */}
 <div>
 <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700 ">
 Teléfono
 </label>
 <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="+54"
                                                    inputMode="numeric"
                                                    pattern="\+?[0-9]*"
                                                    {...register("countryCode", {
                                                        required: "Requerido",
                                                        pattern: {
                                                            value: /^\+?[0-9]{1,4}$/,
                                                            message: "Código inválido",
                                                        },
                                                    })}
                                                    className="w-20 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-gray-900 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary :border-blue-400"
                                                    disabled={formLoading}
                                                    onInput={(e) => {
                                                        const v = e.currentTarget.value;
                                                        if (v.startsWith('+')) {
                                                            e.currentTarget.value = '+' + v.slice(1).replace(/\D/g, '');
                                                        } else {
                                                            e.currentTarget.value = v.replace(/\D/g, '');
                                                        }
                                                    }}
                                                />
                                                <input
                                                    type="tel"
                                                    id="phoneNumber"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    placeholder="11 2345 6789"
                                                    {...register("phoneNumber", {
                                                        required: "El teléfono es obligatorio",
                                                        validate: (v) => v.replace(/\D/g, '').length >= 10 || "Mínimo 10 dígitos",
                                                    })}
                                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary :border-blue-400"
                                                    disabled={formLoading}
                                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ''); }}
                                                />
 </div>
 {errors.countryCode && (
 <p className="mt-1 text-sm text-red-600 ">{errors.countryCode.message}</p>
 )}
 {errors.phoneNumber && (
 <p className="mt-1 text-sm text-red-600 ">{errors.phoneNumber.message}</p>
 )}
 </div>

 {/* Mensaje */}
 <div>
 <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700 ">
 Describe el curso que te gustaría tomar *
 </label>
 <textarea
 id="message"
 {...register("message", {
 required: "Por favor describe el curso que buscas",
 minLength: {
 value: 20,
 message: "La descripción debe tener al menos 20 caracteres",
 },
 })}
 rows={5}
 placeholder="Contanos qué curso te gustaría tomar: temática, objetivos, modalidad preferida, duración aproximada..."
 className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary :border-blue-400"
 disabled={formLoading}
 />
 {errors.message && (
 <p className="mt-1 text-sm text-red-600 ">{errors.message.message}</p>
 )}
 </div>

 {/* Botón de envío */}
 <button
 type="submit"
 disabled={formLoading}
 className="w-full cursor-pointer rounded-full bg-brand-secondary text-brand-tertiary px-6 py-3 font-semibold shadow-brand-tertiary/10 transition-all duration-300 hover:shadow-brand-tertiary/20 disabled:cursor-not-allowed disabled:opacity-50 hover:ring-[3px] hover:ring-[#dcab07] hover:bg-brand-secondary active:bg-brand-tertiary active:text-white"
 >
 {formLoading ? (
 <span className="flex items-center justify-center">
 <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 Enviando...
 </span>
 ) : (
 "Solicitar Curso"
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 </section>

 <Footer />
 </div>
 );
};

export default CoursesPage;
