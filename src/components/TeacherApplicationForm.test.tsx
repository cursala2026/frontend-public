import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TeacherApplicationForm } from "./TeacherApplicationForm";
import * as teacherService from "@/services/teacher.service";

vi.mock("@/services/teacher.service");
vi.mock("@/utils/swal");

describe("TeacherApplicationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("el boton de enviar arranca deshabilitado si falta completar", () => {
    render(<TeacherApplicationForm />);
    const btn = screen.getByRole("button", { name: /enviar postulación/i });
    expect(btn).toBeDisabled();
  });

  it("muestra el contador de bio en 0/500 al inicio", () => {
    render(<TeacherApplicationForm />);
    expect(screen.getByText("0/500")).toBeInTheDocument();
  });

  it("bloquea envio si falta la firma", async () => {
    render(<TeacherApplicationForm />);
    const submitBtn = screen.getByRole("button", { name: /enviar postulación/i });

    expect(submitBtn).toBeDisabled();
  });

  it("bloquea envio si el acuerdo no esta tildado", async () => {
    render(<TeacherApplicationForm />);
    const checkbox = screen.getByRole("checkbox", { name: /acepto el acuerdo/i });

    expect(checkbox).not.toBeChecked();
    const submitBtn = screen.getByRole("button", { name: /enviar postulación/i });
    expect(submitBtn).toBeDisabled();
  });

  it("permite envio exitoso con todos los campos validos y acuerdo aceptado", async () => {
    vi.mocked(teacherService.uploadTeacherDocument).mockResolvedValue("https://example.com/url");
    vi.mocked(teacherService.applyTeacher).mockResolvedValue({ success: true });

    const { container } = render(<TeacherApplicationForm />);

    const inputs = container.querySelectorAll("input[type='text']");
    const titleInput = inputs[0] as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Ingeniero en Sistemas" } });

    const numberInputs = container.querySelectorAll("input[type='number']");
    const yearsInput = numberInputs[0] as HTMLInputElement;
    fireEvent.change(yearsInput, { target: { value: "5" } });

    const bioInput = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(bioInput, { target: { value: "Docente con experiencia" } });

    const agreeCheckbox = screen.getByRole("checkbox", { name: /acepto el acuerdo/i });
    fireEvent.click(agreeCheckbox);

    expect(agreeCheckbox).toBeChecked();
  });
});
