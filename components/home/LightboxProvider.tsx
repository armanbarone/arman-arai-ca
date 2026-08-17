"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Lightbox from "@/components/Lightbox";

type LightboxState = { images: string[]; index: number } | null;
type Ctx = { open: (images: string[], index: number) => void };

const LightboxContext = createContext<Ctx | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used within LightboxProvider");
  return ctx;
}

/**
 * Client island that owns the lightbox state and modal, so the rest of the
 * homepage can stay a server component. Its children are server-rendered and
 * passed through untouched, which keeps the hero (and its LCP image) out of the
 * hydration path.
 */
export default function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState>(null);
  const open = useCallback((images: string[], index: number) => setState({ images, index }), []);
  const close = useCallback(() => setState(null), []);
  const prev = useCallback(() => setState(s => (s ? { ...s, index: Math.max(0, s.index - 1) } : s)), []);
  const next = useCallback(() => setState(s => (s ? { ...s, index: Math.min(s.images.length - 1, s.index + 1) } : s)), []);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {state && (
        <Lightbox
          images={state.images}
          current={state.index}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </LightboxContext.Provider>
  );
}
