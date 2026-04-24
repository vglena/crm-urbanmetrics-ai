import { describe, expect, it } from "vitest";
import { parseChatRequestBody } from "./chat.validation";

describe("parseChatRequestBody", () => {
  it("valida y normaliza el body del chat", () => {
    expect(
      parseChatRequestBody({
        message: "  Busca EXP-0101  ",
        sessionId: " session-1 "
      })
    ).toEqual({
      message: "Busca EXP-0101",
      sessionId: "session-1"
    });
  });

  it("acepta clave de expediente seleccionado como contexto opcional", () => {
    expect(
      parseChatRequestBody({
        message: "Cambia el telefono",
        sessionId: "session-1",
        selectedExpedienteClave: " EXP-0112 "
      })
    ).toEqual({
      message: "Cambia el telefono",
      sessionId: "session-1",
      selectedExpedienteClave: "EXP-0112"
    });
  });

  it("rechaza mensajes vacios", () => {
    expect(() =>
      parseChatRequestBody({
        message: " ",
        sessionId: "session-1"
      })
    ).toThrow("message");
  });
});
