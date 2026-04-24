import { create } from "zustand";
import { sendChatMessage } from "./chat.api";
import type { ChatMessage } from "./chat.types";
import { getOrCreateSessionId } from "./session";
import type { Expediente, ExpedientePatch } from "../expedientes/expediente.types";
import { parseAgentExpedienteResponse } from "../expedientes/expediente.parser";

interface CrmState {
  sessionId: string;
  messages: ChatMessage[];
  expedientes: Expediente[];
  selectedExpedienteClave?: string;
  isSending: boolean;
  error?: string;
  sendMessage: (message: string) => Promise<void>;
  selectExpediente: (clave: string) => void;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  createdAt: new Date().toISOString(),
  content:
    "Hola. Puedo ayudarte a crear, buscar o actualizar expedientes de tasacion. Escribe la solicitud y la envio al agente."
};

export const useCrmStore = create<CrmState>((set, get) => ({
  sessionId: getOrCreateSessionId(),
  messages: [welcomeMessage],
  expedientes: [],
  selectedExpedienteClave: undefined,
  isSending: false,
  error: undefined,
  sendMessage: async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || get().isSending) {
      return;
    }

    const userMessage = createChatMessage("user", trimmedMessage);

    set((state) => ({
      messages: [...state.messages, userMessage],
      isSending: true,
      error: undefined
    }));

    try {
      const responseText = await sendChatMessage({
        message: trimmedMessage,
        sessionId: get().sessionId,
        selectedExpedienteClave: get().selectedExpedienteClave
      });
      const assistantMessage = createChatMessage("assistant", responseText);
      const parsedResponse = parseAgentExpedienteResponse(responseText);

      set((state) => {
        const updatedExpedientes = parsedResponse.expediente
          ? upsertExpediente(state.expedientes, parsedResponse.expediente)
          : state.expedientes;

        return {
          messages: [...state.messages, assistantMessage],
          expedientes: updatedExpedientes,
          selectedExpedienteClave:
            parsedResponse.expediente?.clave ?? state.selectedExpedienteClave,
          isSending: false
        };
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar el mensaje.";

      set((state) => ({
        messages: [
          ...state.messages,
          createChatMessage("assistant", `No pude completar la solicitud: ${message}`)
        ],
        isSending: false,
        error: message
      }));
    }
  },
  selectExpediente: (clave: string) => {
    set({ selectedExpedienteClave: clave });
  }
}));

function createChatMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function upsertExpediente(expedientes: Expediente[], patch: ExpedientePatch): Expediente[] {
  const existingExpediente = expedientes.find(
    (expediente) => expediente.clave === patch.clave
  );

  if (!existingExpediente) {
    return [patch, ...expedientes];
  }

  return expedientes.map((expediente) =>
    expediente.clave === patch.clave ? { ...expediente, ...patch } : expediente
  );
}
