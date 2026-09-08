import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeacherApplicationForm } from "./TeacherApplicationForm";

// mockeamos el service para no pegar a la red en los tests
vi.mock("@/services/teacher.service", () => ({
  uploadTeacherDocument: vi.fn(),
  applyTeacher: vi.fn(),
}));

describe("TeacherApplicationForm", () => {
  it("el boton de enviar arranca deshabilitado si falta completar", () => {
    render(<TeacherApplicationForm />);
    const btn = screen.getByRole("button", { name: /enviar postulación/i });
    expect(btn).toBeDisabled();
  });

  it("muestra el contador de bio en 0/500 al inicio", () => {
    render(<TeacherApplicationForm />);
    expect(screen.getByText("0/500")).toBeInTheDocument();
  });
});
