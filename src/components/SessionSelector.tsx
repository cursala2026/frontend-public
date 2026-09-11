"use client";

import React from "react";
import Link from "next/link";

const CALLBACK = "/ser-profesor";

export const SessionSelector: React.FC = () => {
  return (
    <div className="max-w-md mx-auto rounded-lg bg-white p-6 shadow-2xl shadow-brand-primary-dark/40 text-center">
      <h2 className="mb-2 text-2xl font-bold text-brand-primary">Postulate como docente</h2>
      <p className="mb-6 text-sm text-brand-tertiary">Para continuar, ingresá a tu cuenta o creá una nueva.</p>
      <div className="flex flex-col gap-3">
        <Link href={`/login?redirect=${CALLBACK}`}
          className="rounded-full bg-brand-secondary text-brand-tertiary px-6 py-3 font-semibold hover:opacity-90">
          Ya tengo cuenta en Cursala
        </Link>
        <Link href={`/register?redirect=${CALLBACK}`}
          className="rounded-full border border-brand-primary text-brand-primary px-6 py-3 font-semibold hover:bg-brand-primary/5">
          Soy nuevo en Cursala
        </Link>
      </div>
    </div>
  );
};