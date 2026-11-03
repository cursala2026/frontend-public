"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/app/(public)/shared/Navbar";
import Footer from "@/app/(public)/shared/Footer";
import HeroSection from "@/app/(public)/sections/HeroSection";

const IWantToTrainPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <HeroSection
        title="Quiero Capacitar"
        subtitle="Unite a nuestro equipo de profesionales"
        description="Forma parte de una comunidad educativa que potencia el aprendizaje."
        buttonText="Postúlate ahora"
        buttonHref="/ser-profesor"
        backgroundImage="/images/sections/hero/quiero-capacitar.jpg"
      />

      <main className="grow bg-gray-50 ">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          
          {/* Content Section */}
          <div className="mb-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative h-64 overflow-hidden rounded-lg shadow-xl md:h-80 lg:h-full min-h-87.5">
              <Image
                src="/images/frontend/cursala-quiero-capacitar.jpg"
                alt="Únete como instructor"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                Súmate a Nuestro Equipo
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-700 md:text-lg text-justify">
                Si tienes vocación por enseñar y quieres formar parte de una comunidad que valora 
                la educación de calidad, este es el lugar ideal para ti.
              </p>
              <p className="text-base leading-relaxed text-gray-700 md:text-lg text-justify">
                Haz clic en el botón superior para postularte. Nuestro equipo analizará tu propuesta y nos pondremos en contacto 
                para coordinar una reunión y contarte cómo funciona Cursala.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IWantToTrainPage;