"use client";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

// Lightweight toasts to replace alert(): useToast()("Saved", "ok" | "error" | "info").
type Kind = "ok" | "error" | "info";
type Toast = { id: number; text: string; kind: Kind };
const Ctx = createContext<(text: string, kind?: Kind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const next = useRef(1);
  const push = useCallback((text: string, kind: Kind = "info") => {
    const id = next.current++;
    setItems((xs) => [...xs.slice(-2), { id, text, kind }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`} onClick={() => setItems((xs) => xs.filter((x) => x.id !== t.id))}>
            <span aria-hidden>{t.kind === "ok" ? "✓" : t.kind === "error" ? "!" : "i"}</span>{t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
