import type { ChatRequestBody } from "./chat.types.js";

export function parseChatRequestBody(body: unknown): ChatRequestBody {
  if (!isRecord(body)) {
    throw new Error("El body debe ser un objeto JSON.");
  }

  const message = getTrimmedString(body.message);
  const sessionId = getTrimmedString(body.sessionId);
  const selectedExpedienteClave = getTrimmedString(body.selectedExpedienteClave);

  if (!message) {
    throw new Error("El campo message es obligatorio.");
  }

  if (!sessionId) {
    throw new Error("El campo sessionId es obligatorio.");
  }

  return {
    message,
    sessionId,
    ...(selectedExpedienteClave ? { selectedExpedienteClave } : {})
  };
}

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
