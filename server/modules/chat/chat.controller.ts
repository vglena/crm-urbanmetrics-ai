import type { Request, Response } from "express";
import type { AgentClient } from "./chat.types.js";
import { parseChatRequestBody } from "./chat.validation.js";

interface ChatControllerDependencies {
  agentClient: AgentClient;
}

export function createChatController({ agentClient }: ChatControllerDependencies) {
  return async function postChatMessage(request: Request, response: Response) {
    try {
      const { message, sessionId, selectedExpedienteClave } = parseChatRequestBody(
        request.body
      );
      const agentResponse = await agentClient.sendMessage({
        chatInput: message,
        sessionId,
        selectedExpedienteClave
      });

      response.json(agentResponse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo procesar el chat.";

      response.status(400).json({ error: message });
    }
  };
}
