"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import InstagramButton from "@/components/ui/icons/IconButton/instagram.icon";
import LinkedInButton from "@/components/ui/icons/IconButton/linkedin.icon";
import YouTubeButton from "@/components/ui/icons/IconButton/youtube.icon";
import FacebookButton from "@/components/ui/icons/IconButton/facebook.icon";
import { conf } from "@/config/env";

/**
 * Navbar público - Navegación principal para usuarios no autenticados
 * Incluye menú responsive con hamburguesa en móvil
 */
const Navbar: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const socialLinks = {
    instagram: "https://www.instagram.com/cursala.online?igsh=MXhmOGF4MnprODUxNA==",
    linkedin: "https://www.linkedin.com/company/cursala/?viewAsMember=true",
    youtube: "https://www.youtube.com/@cursalaenvivo",
    facebook: "https://www.facebook.com/Cursala.online",
  };

  const Navigation = ({ isMobile = false }: { isMobile?: boolean }) => {
    const mobileNavItems = [
      { href: "/cursos", label: "Cursos" },
      { href: "/capacitaciones-empresas", label: "Capacitaciones Empresas" },
      { href: "/ser-profesor", label: "Enseñar en Cursala" },
      { href: "/preguntas", label: "Preguntas" },
    ];

    const desktopNavItems = [
      { href: "/cursos", label: "Cursos" },
      { href: "/capacitaciones-empresas", label: "Capacitaciones Empresas" }, 
      { href: "/ser-profesor", label: "Enseñar en Cursala" },
      { href: "/preguntas", label: "Preguntas" },
    ];

    const navItems = isMobile ? mobileNavItems : desktopNavItems;



    return (
      <nav className={isMobile ? "w-full" : "flex-1"}>
        <ul
          className={`flex ${isMobile
              ? "flex-col space-y-1"
              : "flex-row items-center justify-center gap-1 "
            }`}
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleNavigation(item.href)}
                className={
                  isMobile
                    ? "block w-full rounded-full cursor-pointer px-4 py-3 text-left text-base font-semibold text-brand-tertiary transition-colors hover:bg-brand-tertiary-lighten/20 hover:text-brand-primary :bg-white/10 :text-brand-primary active:text-brand-secondary"
                    : "text-sm font-semibold px-4 py-2 cursor-pointer text-brand-tertiary transition-colors hover:text-primary :text-primary lg:text-base active:text-brand-secondary"
                }
                aria-label={item.label}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  // Refs para detectar clic fuera del menú móvil y el botón toggle
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      // si el click/touch viene del botón toggle, no cerrar aquí (evita racy toggle)
      if (toggleButtonRef.current && toggleButtonRef.current.contains(target)) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Desactivar scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="shrink-0">
            {/* Logo para modo claro */}
            <div style={{ position: 'relative', width: '160px', height: '32px' }}>
              <Image
                src="/logo/cursala.svg"
                alt="Logo Cursala"
                fill
                loading="eager"
                unoptimized
              />
            </div>
            {/* Logo para modo oscuro */}
              <div style={{ position: 'relative', width: '160px', height: '32px' }} className="hidden">
                <Image
                  src="/logo/cursala-negativo.svg"
                  alt="Logo Cursala"
                  fill
                  unoptimized
                />
              </div>
            </Link>
          <button
            ref={toggleButtonRef}
            onClick={toggleMobileMenu}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={
              `rounded-lg cursor-pointer p-2 transition-colors hover:bg-brand-tertiary-lighten/20 :bg-gray-800 z-50 ${
                mobileMenuOpen ? "text-brand-primary" : "text-brand-tertiary"
              }`
            }
            aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="relative z-40 border-t border-gray-200 bg-white ">
            <div className="px-2 py-3">
              <Navigation isMobile={true} />
            </div>
            <div className="border-t border-gray-200 px-4 py-4 ">
              <div className="flex justify-center items-center gap-3 mb-5">
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramButton as="div" />
                </a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <LinkedInButton as="div" />
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <YouTubeButton as="div" />
                </a>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookButton as="div" />
                </a>
              </div>
              <Link
                href="/register"
                className="relative block text-center px-4 py-3 text-md mb-3 font-semibold text-brand-tertiary rounded-full transition duration-500 bg-brand-secondary hover:ring-[3px] hover:ring-[#dcab07] hover:bg-brand-secondary active:bg-brand-tertiary active:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrarse
              </Link>
              <Link
                href="/login"
                className="relative block text-center px-4 py-3 text-md font-semibold text-brand-primary rounded-full transition duration-500 bg-transparent border border-solid border-brand-primary hover: hover:bg-brand-primary/10 hover:ring-2 active:bg-brand-secondary active:text-brand-tertiary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ingresar
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 hidden border-b border-gray-200 bg-white shadow-xs md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <Link href="/" className="shrink-0">
              {/* Logo para modo claro */}
              <div style={{ position: 'relative', width: '160px', height: '32px' }}>
                <Image
                  src="/logo/cursala.svg"
                  alt="Logo Cursala"
                  fill
                  loading="eager"
                  unoptimized
                />
              </div>
              {/* Logo para modo oscuro */}
              <div style={{ position: 'relative', width: '200px', height: '40px' }} className="hidden">
                <Image
                  src="/logo/cursala-negativo.svg"
                  alt="Logo Cursala"
                  fill
                  unoptimized
                />
              </div>
            </Link>
            <div className="flex justify-start ml-12 w-full gap-4">
              <Navigation />
              <div className="flex items-center gap-2">
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramButton as="div" />
                </a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <LinkedInButton as="div" />
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <YouTubeButton as="div" />
                </a>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookButton as="div" />
                </a>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Link
                  href="/register"
                  className="relative inline-block px-4 py-2 text-sm font-semibold text-brand-tertiary rounded-full transition duration-500 bg-brand-secondary hover:ring-[3px] hover:ring-[#dcab07] hover:bg-brand-secondary active:bg-brand-tertiary active:text-white "
                >
                  Registrarse
                </Link>
                <Link
                  href="/login"
                  className="relative inline-block px-4 py-2 text-sm font-semibold text-brand-primary-dark rounded-full transition duration-500 bg-transparent border border-solid border-brand-primary hover:bg-brand-primary hover:text-white hover:ring-[3px] active:bg-brand-tertiary active:text-white active:ring-brand-secondary "
                >
                  Ingresar
                </Link>
              </div>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
