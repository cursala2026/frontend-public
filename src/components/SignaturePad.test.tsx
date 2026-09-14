import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignaturePad } from "./SignaturePad";

describe("SignaturePad", () => {
  it("el boton limpiar resetea la firma a null", () => {
    const onChange = vi.fn();
    render(<SignaturePad onChange={onChange} />);
    fireEvent.click(screen.getByText("Limpiar firma"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("renderiza el canvas y el boton limpiar", () => {
    const onChange = vi.fn();
    render(<SignaturePad onChange={onChange} />);

    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(screen.getByText("Limpiar firma")).toBeInTheDocument();
  });

  it("el boton limpiar tiene el texto correcto", () => {
    const onChange = vi.fn();
    render(<SignaturePad onChange={onChange} />);

    const btn = screen.getByText("Limpiar firma");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("mt-2");
  });
});