"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Booking } from "@/lib/portal/types";
const KEY = "aa-wedding-preview-v4";
type Preview = {
  booking: Booking;
  email: string;
  setEmail: (email: string) => void;
  reset: () => void;
  update: (fn: (b: Booking) => void) => void;
};
const Context = createContext<Preview | null>(null);
export function WeddingPreviewProvider({
  initial,
  children,
}: {
  initial: Booking;
  children: React.ReactNode;
}) {
  const [booking, setBooking] = useState(initial),
    [email, setEmail] = useState(initial.clients[0].email),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved) {
          const b = JSON.parse(saved) as Booking;
          if (
            b.ref === initial.ref &&
            b.schema === 1 &&
            b.clients?.length === 2 &&
            b.wedding?.documents
          )
            setBooking(b);
        }
      } catch {
        /* A clean sample is always available. */
      }
    };
    load();
    setLoaded(true);
    const receive = (e: StorageEvent) => {
      if (e.key === KEY) load();
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [initial.ref]);
  useEffect(() => {
    if (loaded) {
      try {
        const value = JSON.stringify(booking);
        if (localStorage.getItem(KEY) !== value)
          localStorage.setItem(KEY, value);
      } catch {
        /* Keep this browser's preview usable if storage is full. */
      }
    }
  }, [booking, loaded]);
  const update = (fn: (b: Booking) => void) =>
    setBooking((old) => {
      const next = structuredClone(old);
      fn(next);
      next.updatedAt = new Date().toISOString();
      return next;
    });
  return (
    <Context.Provider
      value={{
        booking,
        email,
        setEmail,
        update,
        reset: () => {
          setBooking(structuredClone(initial));
          setEmail(initial.clients[0].email);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useWeddingPreview = () => useContext(Context);
export function useWeddingBooking(b: Booking, preview: boolean) {
  const context = useWeddingPreview();
  return preview && context ? context.booking : b;
}
