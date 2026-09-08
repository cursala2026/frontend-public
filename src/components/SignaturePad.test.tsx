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
});