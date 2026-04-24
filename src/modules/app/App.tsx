import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { ChatPanel } from "../chat/ChatPanel";
import { ExpedienteDetail } from "../expedientes/ExpedienteDetail";
import { ExpedienteSidebar } from "../expedientes/ExpedienteSidebar";

const chatWidthStorageKey = "crm-tasaciones-chat-width";
const chatHeightStorageKey = "crm-tasaciones-chat-height";
const defaultChatWidth = 58;
const defaultChatHeight = 62;
const minChatWidth = 42;
const maxChatWidth = 74;
const minChatHeight = 38;
const maxChatHeight = 72;
const resizeHandleSize = "16px";
const chatResizeStep = 6;

export function App() {
  const [chatWidth, setChatWidth] = useStoredPanelSize(
    chatWidthStorageKey,
    defaultChatWidth
  );
  const [chatHeight, setChatHeight] = useStoredPanelSize(
    chatHeightStorageKey,
    defaultChatHeight
  );

  const desktopGridTemplateColumns = useMemo(
    () => `${chatWidth}% ${resizeHandleSize} minmax(320px, 1fr)`,
    [chatWidth]
  );
  const mobileGridTemplateRows = useMemo(
    () => `${chatHeight}% ${resizeHandleSize} minmax(280px, 1fr)`,
    [chatHeight]
  );

  function handleDesktopResize(event: PointerEvent<HTMLDivElement>) {
    startPanelResize({
      event,
      axis: "x",
      min: minChatWidth,
      max: maxChatWidth,
      onResize: setChatWidth
    });
  }

  function handleMobileResize(event: PointerEvent<HTMLDivElement>) {
    startPanelResize({
      event,
      axis: "y",
      min: minChatHeight,
      max: maxChatHeight,
      onResize: setChatHeight
    });
  }

  function decreaseChatSize() {
    setChatWidth((currentWidth) =>
      clamp(currentWidth - chatResizeStep, minChatWidth, maxChatWidth)
    );
    setChatHeight((currentHeight) =>
      clamp(currentHeight - chatResizeStep, minChatHeight, maxChatHeight)
    );
  }

  function increaseChatSize() {
    setChatWidth((currentWidth) =>
      clamp(currentWidth + chatResizeStep, minChatWidth, maxChatWidth)
    );
    setChatHeight((currentHeight) =>
      clamp(currentHeight + chatResizeStep, minChatHeight, maxChatHeight)
    );
  }

  function resetChatSize() {
    setChatWidth(defaultChatWidth);
    setChatHeight(defaultChatHeight);
  }

  return (
    <main className="min-h-screen bg-paper text-slateInk">
      <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
        <ExpedienteSidebar />
        <section
          className="grid min-h-0 flex-1 grid-rows-[var(--mobile-grid-rows)] lg:grid-cols-[var(--desktop-grid-columns)] lg:grid-rows-1"
          style={
            {
              "--mobile-grid-rows": mobileGridTemplateRows,
              "--desktop-grid-columns": desktopGridTemplateColumns
            } as CSSProperties
          }
        >
          <div className="min-h-0">
            <ChatPanel
              onDecreaseSize={decreaseChatSize}
              onIncreaseSize={increaseChatSize}
              onResetSize={resetChatSize}
            />
          </div>
          <PanelResizeHandle
            label="Cambiar altura del chat"
            orientation="horizontal"
            onPointerDown={handleMobileResize}
          />
          <PanelResizeHandle
            label="Cambiar anchura del chat"
            orientation="vertical"
            onPointerDown={handleDesktopResize}
          />
          <div className="min-h-0">
            <ExpedienteDetail />
          </div>
        </section>
      </div>
    </main>
  );
}

function PanelResizeHandle({
  label,
  orientation,
  onPointerDown
}: {
  label: string;
  orientation: "horizontal" | "vertical";
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      title={label}
      className={`group relative z-20 touch-none select-none bg-slate-100 transition hover:bg-slate-200 ${
        isVertical
          ? "hidden cursor-col-resize lg:block"
          : "block cursor-row-resize lg:hidden"
      }`}
    >
      <span
        className={`absolute rounded-full bg-slate-300 transition group-hover:bg-slate-500 ${
          isVertical
            ? "left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2"
            : "left-1/2 top-1/2 h-1 w-12 -translate-x-1/2 -translate-y-1/2"
        }`}
      />
    </div>
  );
}

function useStoredPanelSize(
  storageKey: string,
  defaultValue: number
): [number, Dispatch<SetStateAction<number>>] {
  const [size, setSize] = useState(() => {
    const savedSize = window.localStorage.getItem(storageKey);
    const parsedSize = savedSize ? Number(savedSize) : defaultValue;

    return Number.isFinite(parsedSize) ? parsedSize : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(size));
  }, [size, storageKey]);

  return [size, setSize];
}

function startPanelResize({
  event,
  axis,
  min,
  max,
  onResize
}: {
  event: PointerEvent<HTMLDivElement>;
  axis: "x" | "y";
  min: number;
  max: number;
  onResize: (nextValue: number) => void;
}) {
  const workspace = event.currentTarget.parentElement;

  if (!workspace) {
    return;
  }

  event.preventDefault();

  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Some browsers can reject pointer capture during rapid pointer transitions.
  }

  const workspaceRect = workspace.getBoundingClientRect();
  const previousCursor = document.body.style.cursor;
  const previousUserSelect = document.body.style.userSelect;

  document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
  document.body.style.userSelect = "none";

  function handlePointerMove(pointerEvent: globalThis.PointerEvent) {
    pointerEvent.preventDefault();

    const nextSize =
      axis === "x"
        ? ((pointerEvent.clientX - workspaceRect.left) / workspaceRect.width) * 100
        : ((pointerEvent.clientY - workspaceRect.top) / workspaceRect.height) * 100;

    onResize(clamp(nextSize, min, max));
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
  handlePointerMove(event.nativeEvent);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
