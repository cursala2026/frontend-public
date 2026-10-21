import { describe, it, expect } from 'vitest';
import {
  ASYNC_COURSE_COPY,
  getCourseModalityLabel,
  isAsyncCourse,
  normalizeCourseModality,
} from './course-modality';

describe('normalizeCourseModality', () => {
  it('devuelve ASYNC para el valor ASYNC', () => {
    expect(normalizeCourseModality('ASYNC')).toBe('ASYNC');
  });

  it('devuelve SYNC para el valor SYNC', () => {
    expect(normalizeCourseModality('SYNC')).toBe('SYNC');
  });

  it('usa SYNC como fallback cuando la modalidad es undefined o null', () => {
    expect(normalizeCourseModality(undefined)).toBe('SYNC');
    expect(normalizeCourseModality(null)).toBe('SYNC');
  });

  it('usa SYNC como fallback para valores no reconocidos', () => {
    expect(normalizeCourseModality('')).toBe('SYNC');
    expect(normalizeCourseModality('Presencial')).toBe('SYNC');
  });
});

describe('isAsyncCourse', () => {
  it('es true solo para ASYNC', () => {
    expect(isAsyncCourse('ASYNC')).toBe(true);
    expect(isAsyncCourse('SYNC')).toBe(false);
    expect(isAsyncCourse(undefined)).toBe(false);
  });
});

describe('getCourseModalityLabel', () => {
  it('muestra el formato SYNC como Sincrónico', () => {
    expect(getCourseModalityLabel('SYNC')).toBe('Sincrónico');
  });

  it('muestra el formato ASYNC como Asincrónico', () => {
    expect(getCourseModalityLabel('ASYNC')).toBe('Asincrónico');
  });

  it('usa Sincrónico cuando no hay modalidad', () => {
    expect(getCourseModalityLabel(undefined)).toBe('Sincrónico');
  });
});

describe('ASYNC_COURSE_COPY', () => {
  it('define los textos de acceso inmediato', () => {
    expect(ASYNC_COURSE_COPY.statusLabel).toBe('ACCESO INMEDIATO');
    expect(ASYNC_COURSE_COPY.scheduleLabel).toBe('A tu propio ritmo');
    expect(ASYNC_COURSE_COPY.availabilityLabel).toBe('Acceso inmediato');
    expect(ASYNC_COURSE_COPY.ctaLabel).toBe('Comenzar ahora');
  });
});
