import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeacherEntry } from "./TeacherEntry";

// mockeamos next/link para que renderice un <a> simple en los tests
vi.mock("next/link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe("TeacherEntry (discriminador de sesion)", () => {
  it("muestra las opciones de login/registro cuando no hay sesion", () => {
    render(<TeacherEntry isAuthenticated={false} />);
    expect(screen.getByText("Ya tengo cuenta en Cursala")).toBeInTheDocument();
    expect(screen.getByText("Soy nuevo en Cursala")).toBeInTheDocument();
  });

  it("muestra el formulario de postulacion cuando hay sesion", () => {
    render(<TeacherEntry isAuthenticated={true} />);
    expect(screen.getByText("Postulación Docente")).toBeInTheDocument();
  });
});