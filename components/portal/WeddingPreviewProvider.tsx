"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Booking } from "@/lib/portal/types";
const KEY = "aa-wedding-preview-v5";
function persist(bookings: Booking[], selectedRef: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ bookings, selectedRef }));
  } catch {}
}
type Preview = {
  booking: Booking;
  bookings: Booking[];
  selectBooking: (ref: string) => void;
  addBooking: (booking: Booking) => void;
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
  const [bookings, setBookings] = useState([initial]),
    [selectedRef, setSelectedRef] = useState(initial.ref),
    [email, setEmail] = useState(initial.clients[0].email),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved) {
          const value = JSON.parse(saved) as {
            bookings: Booking[];
            selectedRef: string;
          };
          if (
            value.bookings?.length &&
            value.bookings.every(
              (b) =>
                b.schema === 1 &&
                b.clients?.length === 2 &&
                b.wedding?.documents,
            )
          ) {
            setBookings(value.bookings);
            setSelectedRef(
              value.bookings.some((b) => b.ref === value.selectedRef)
                ? value.selectedRef
                : value.bookings[0].ref,
            );
          }
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
        const value = JSON.stringify({ bookings, selectedRef });
        if (localStorage.getItem(KEY) !== value)
          localStorage.setItem(KEY, value);
      } catch {
        /* Keep this browser's preview usable if storage is full. */
      }
    }
  }, [bookings, selectedRef, loaded]);
  const booking = bookings.find((b) => b.ref === selectedRef) || bookings[0];
  const update = (fn: (b: Booking) => void) =>
    setBookings((old) => {
      const nextBookings = old.map((b) => {
        if (b.ref !== selectedRef) return b;
        const next = structuredClone(b);
        fn(next);
        next.updatedAt = new Date().toISOString();
        return next;
      });
      persist(nextBookings, selectedRef);
      return nextBookings;
    });
  return (
    <Context.Provider
      value={{
        booking,
        bookings,
        selectBooking: (ref) => {
          persist(bookings, ref);
          setSelectedRef(ref);
          const b = bookings.find((x) => x.ref === ref);
          if (b) setEmail(b.clients[0].email);
        },
        addBooking: (b) => {
          persist([...bookings, b], b.ref);
          setBookings((old) => [...old, b]);
          setSelectedRef(b.ref);
          setEmail(b.clients[0].email);
        },
        email: booking.clients.some((c) => c.email === email)
          ? email
          : booking.clients[0].email,
        setEmail,
        update,
        reset: () => {
          persist([structuredClone(initial)], initial.ref);
          setBookings([structuredClone(initial)]);
          setSelectedRef(initial.ref);
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
