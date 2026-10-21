import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard, type Course } from './course-card';

const PAST = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
const FUTURE = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

const buildCourse = (overrides: Partial<Course> = {}): Course =>
  ({
    _id: '1',
    name: 'Curso de prueba',
    description: '',
    longDescription: '',
    days: ['Lunes'],
    time: '18:00 a 20:00',
    startDate: FUTURE,
    registrationOpenDate: PAST,
    modality: 'SYNC',
    price: 0,
    teacherName: '',
    maxInstallments: 0,
    interestFree: false,
    imageUrl: '',
    programUrl: '',
    teacherCvUrl: '',
    mainTeacherInfo: { _id: '1', teacherName: '' },
    ...overrides,
  }) as Course;

const renderCard = (course: Course) =>
  render(<CourseCard course={course} onClick={vi.fn()} />);

describe('CourseCard modalidad', () => {
  it('SYNC muestra el estado de inscripción y el horario del curso', () => {
    renderCard(buildCourse({ modality: 'SYNC' }));

    expect(screen.getByText('INSCRIPCIÓN ABIERTA')).toBeInTheDocument();
    expect(screen.getByText('18:00 a 20:00')).toBeInTheDocument();
    expect(screen.queryByText('A tu propio ritmo')).not.toBeInTheDocument();
  });

  it('ASYNC muestra el badge de acceso inmediato y no muestra fechas ni horarios', () => {
    const { container } = renderCard(buildCourse({ modality: 'ASYNC' }));

    expect(screen.getByText('ACCESO INMEDIATO')).toBeInTheDocument();
    expect(screen.getByText('A tu propio ritmo')).toBeInTheDocument();
    expect(screen.queryByText('18:00 a 20:00')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('INSCRIPCIÓN');
    expect(container.querySelector('time')).toBeNull();
  });

  it('usa SYNC como fallback cuando la modalidad es undefined', () => {
    renderCard(buildCourse({ modality: undefined as unknown as string }));

    expect(screen.getByText('INSCRIPCIÓN ABIERTA')).toBeInTheDocument();
    expect(screen.getByText('18:00 a 20:00')).toBeInTheDocument();
    expect(screen.queryByText('ACCESO INMEDIATO')).not.toBeInTheDocument();
  });
});
