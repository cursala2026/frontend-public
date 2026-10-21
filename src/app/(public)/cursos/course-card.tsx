import React from "react";
import Image from "next/image";
import { ASYNC_COURSE_COPY, isAsyncCourse } from "@/lib/models/course-modality";

export interface Course {
 _id: string;
 name: string;
 description: string;
 longDescription: string;
 days: string[];
 time: string;
 startDate: string;
 registrationOpenDate?: string;
 endDate?: string;
 modality: string;
 price: number;
 teacherName: string;
 maxInstallments: number;
 interestFree: boolean;
 imageUrl: string;
 programUrl: string;
 teacherCvUrl: string;
 classCount?: number;
 coverUrl?: string;
 loading?: boolean;
 mainTeacherInfo: {
 _id: string;
 teacherName: string;
 professionalDescription?: string | null;
 profilePhotoUrl?: string | null;
 };
 hasPromotionalCode?: boolean;
}

// PromotionsMap removed: `hasPromotionalCode` now viene en la respuesta del API

const getCourseStatus = (course: Course) => {
 // Verificar si tenemos fechas válidas
 if (!course.startDate) {
 return {
 label: "PRÓXIMAMENTE",
 className: "bg-brand-tertiary text-white",
 };
 }

 const currentDate = new Date();
 currentDate.setUTCHours(0, 0, 0, 0);

 const courseStartDate = new Date(course.startDate);
 if (isNaN(courseStartDate.getTime())) {
 return {
 label: "PRÓXIMAMENTE",
 className: "bg-brand-tertiary text-white",
 };
 }
 courseStartDate.setUTCHours(0, 0, 0, 0);

 // Determinar fecha de apertura de inscripciones
 const registrationOpenDate = course.registrationOpenDate 
 ? new Date(course.registrationOpenDate)
 : new Date(courseStartDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días antes por defecto
 
 if (isNaN(registrationOpenDate.getTime())) {
 return {
 label: "PRÓXIMAMENTE",
 className: "bg-brand-tertiary text-white",
 };
 }
 registrationOpenDate.setUTCHours(0, 0, 0, 0);

 // Verificar fecha de finalización
 const courseEndDate = course.endDate ? new Date(course.endDate) : null;
 if (courseEndDate && !isNaN(courseEndDate.getTime())) {
 courseEndDate.setUTCHours(23, 59, 59, 999);
 if (currentDate > courseEndDate) {
 return {
 label: "FINALIZADO",
 className: "bg-brand-tertiary text-white",
 };
 }
 }

 // Verificar estado según fechas
 if (currentDate < registrationOpenDate) {
 const month = registrationOpenDate
 .toLocaleString("es-ES", { month: "long" })
 .toUpperCase();
 return {
 label: `INSCRIPCIÓN ${month}`,
 className: "bg-brand-secondary text-brand-tertiary",
 };
 }

    if (currentDate >= courseStartDate) {
        return {
            label: "EN CURSO",
            className: "bg-black text-white border border-white",
        };
    }

 // Entre fecha de inscripción y fecha de inicio
 return {
 label: "INSCRIPCIÓN ABIERTA",
 className: "bg-brand-secondary text-brand-tertiary",
 };
};

export const CourseCard: React.FC<{
    course: Course;
    onClick: () => void;
}> = ({ course, onClick }) => {
 const isAsync = isAsyncCourse(course.modality);
 const statusInfo = isAsync
   ? { label: ASYNC_COURSE_COPY.statusLabel, className: ASYNC_COURSE_COPY.statusClassName }
   : getCourseStatus(course);
 
 // Construir URL de la imagen (mismo patrón que en Home / CoursesSection)
 const imageUrl = course.imageUrl?.startsWith("http") 
     ? course.imageUrl 
     : course.imageUrl 
         ? `https://cursala.b-cdn.net/course-images/${course.imageUrl}`
         : "/images/placeholder.couse.png";

 return (
 <div
 className="group flex transform cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl "
 onClick={onClick}
 >
 <div
        className="relative h-48 w-full overflow-hidden"
    >
        {course.hasPromotionalCode && (
            <div className="absolute top-0 left-0 z-10 overflow-visible">
                <svg viewBox="0 0 120 120" className="h-20 w-20 text-yellow-400" aria-hidden>
                    <polygon points="0,0 120,0 0,120" className="fill-current" />
                    <g transform="rotate(-45 44 44)">
                        <text x="44" y="36" fill="#000" fontWeight="800" fontSize="16" textAnchor="middle" style={{letterSpacing:0.2}}>
                            <tspan x="44" dy="0">CÓDIGO</tspan>
                            <tspan x="44" dy="16">PROMOCIONAL</tspan>
                        </text>
                    </g>
                </svg>
            </div>
        )}
        <Image
            src={imageUrl}
            alt={course.name}
            fill
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={60}
        />
 <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
 <span className={`inline-block -ml-3 px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
 {statusInfo.label}
 </span>
 </div>
 </div>
 <div className="flex grow flex-col justify-between p-4">
                <h2 className="mb-2 line-clamp-2 leading-snug text-lg font-bold text-brand-tertiary transition-colors group-hover:text-brand-primary :text-blue-400">
                    {course.name}
                </h2>
 {/* lo ocultaría para obligar a saber más del curso dentro del detalle */}
 {/* <p className="mb-3 line-clamp-2 grow text-sm text-gray-600 ">
 {course.description}
 </p> */}
 <div className="flex items-center justify-between border-t border-gray-100 pt-3 ">
 <div className="flex items-center space-x-2 text-sm text-gray-500 ">
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span>{isAsync ? ASYNC_COURSE_COPY.scheduleLabel : course.time || "N/D"}</span>
 </div>
 {course.price > 0 ? (
 <span className="text-lg font-bold">${course.price.toLocaleString()}</span>
 ) : (
 <span className="text-lg font-bold text-green-600">GRATIS</span>
 )}
 </div>
 </div>
 </div>
 );
};
