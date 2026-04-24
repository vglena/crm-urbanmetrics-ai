import { FormEvent, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useCrmStore } from "./chat.store";
import type { ChatMessage } from "./chat.types";

const composerHeightStorageKey = "crm-tasaciones-composer-height";
const defaultComposerHeight = 48;
const minComposerHeight = 48;
const maxComposerHeight = 180;

interface ChatPanelProps {
  onDecreaseSize: () => void;
  onIncreaseSize: () => void;
  onResetSize: () => void;
}

export function ChatPanel({
  onDecreaseSize,
  onIncreaseSize,
  onResetSize
}: ChatPanelProps) {
  const [draftMessage, setDraftMessage] = useState("");
  const [composerHeight, setComposerHeight] = useState(() =>
    getStoredComposerHeight()
  );
  const messages = useCrmStore((state) => state.messages);
  const isSending = useCrmStore((state) => state.isSending);
  const sendMessage = useCrmStore((state) => state.sendMessage);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.localStorage.setItem(composerHeightStorageKey, String(composerHeight));
  }, [composerHeight]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draftMessage.trim();

    if (!message) {
      return;
    }

    setDraftMessage("");
    await sendMessage(message);
  }

  function handleComposerResize(event: PointerEvent<HTMLDivElement>) {
    startComposerResize({
      event,
      currentHeight: composerHeight,
      onResize: setComposerHeight
    });
  }

  function decreaseComposerHeight() {
    setComposerHeight((currentHeight) =>
      clamp(currentHeight - 24, minComposerHeight, maxComposerHeight)
    );
  }

  function increaseComposerHeight() {
    setComposerHeight((currentHeight) =>
      clamp(currentHeight + 24, minComposerHeight, maxComposerHeight)
    );
  }

  function resetComposerHeight() {
    setComposerHeight(defaultComposerHeight);
  }

  return (
    <section className="flex h-full min-h-0 flex-col border-b border-mutedLine bg-white lg:border-b-0 lg:border-r">
      <header className="flex items-center justify-between border-b border-mutedLine px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Agente n8n
          </p>
          <h1 className="text-lg font-semibold text-slate-950">Chat de tasaciones</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-md border border-mutedLine bg-slate-50 p-1 sm:flex">
            <ResizeButton label="Reducir chat" onClick={onDecreaseSize}>
              -
            </ResizeButton>
            <ResizeButton label="Restablecer chat" onClick={onResetSize}>
              ↔
            </ResizeButton>
            <ResizeButton label="Ampliar chat" onClick={onIncreaseSize}>
              +
            </ResizeButton>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Online
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isSending ? <LoadingBubble /> : null}
          <div ref={scrollAnchorRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-mutedLine bg-white px-4 py-3 sm:px-6"
      >
        <div
          role="separator"
          aria-label="Cambiar altura de la zona de escritura"
          aria-orientation="horizontal"
          title="Arrastra para cambiar la altura de escritura"
          onPointerDown={handleComposerResize}
          className="mx-auto mb-2 flex h-5 max-w-3xl cursor-row-resize touch-none select-none items-center justify-center rounded-md transition hover:bg-slate-100"
        >
          <span className="h-1 w-14 rounded-full bg-slate-300" />
        </div>
        <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-lg border border-mutedLine bg-slate-50 p-2 shadow-sm">
          <textarea
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="Ej: Crea expediente para Laura Perez..."
            style={{ height: composerHeight }}
            className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="hidden flex-col rounded-md border border-mutedLine bg-white p-1 sm:flex">
            <ResizeButton label="Reducir escritura" onClick={decreaseComposerHeight}>
              -
            </ResizeButton>
            <ResizeButton label="Restablecer escritura" onClick={resetComposerHeight}>
              ↕
            </ResizeButton>
            <ResizeButton label="Ampliar escritura" onClick={increaseComposerHeight}>
              +
            </ResizeButton>
          </div>
          <button
            type="submit"
            disabled={isSending || !draftMessage.trim()}
            className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Enviar
          </button>
        </div>
      </form>
    </section>
  );
}

function getStoredComposerHeight(): number {
  const storedHeight = window.localStorage.getItem(composerHeightStorageKey);
  const parsedHeight = storedHeight ? Number(storedHeight) : defaultComposerHeight;

  return Number.isFinite(parsedHeight)
    ? clamp(parsedHeight, minComposerHeight, maxComposerHeight)
    : defaultComposerHeight;
}

function startComposerResize({
  event,
  currentHeight,
  onResize
}: {
  event: PointerEvent<HTMLDivElement>;
  currentHeight: number;
  onResize: (nextHeight: number) => void;
}) {
  event.preventDefault();

  const startPointerY = event.clientY;
  const previousCursor = document.body.style.cursor;
  const previousUserSelect = document.body.style.userSelect;

  document.body.style.cursor = "row-resize";
  document.body.style.userSelect = "none";

  function handlePointerMove(pointerEvent: globalThis.PointerEvent) {
    pointerEvent.preventDefault();

    const verticalDelta = startPointerY - pointerEvent.clientY;
    const nextHeight = currentHeight + verticalDelta;

    onResize(clamp(nextHeight, minComposerHeight, maxComposerHeight));
  }

  function stopResize() {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopResize);
    window.removeEventListener("pointercancel", stopResize);
    document.body.style.cursor = previousCursor;
    document.body.style.userSelect = previousUserSelect;
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopResize, { once: true });
  window.addEventListener("pointercancel", stopResize, { once: true });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function ResizeButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
    >
      {children}
    </button>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUserMessage = message.role === "user";

  return (
    <article
      className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
      aria-label={isUserMessage ? "Mensaje del usuario" : "Mensaje del agente"}
    >
      <div
        className={`max-w-[86%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
          isUserMessage
            ? "bg-slate-950 text-white"
            : "border border-mutedLine bg-white text-slate-800"
        }`}
      >
        {message.content}
      </div>
    </article>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-lg border border-mutedLine bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
        Procesando con el agente
      </div>
    </div>
  );
}
