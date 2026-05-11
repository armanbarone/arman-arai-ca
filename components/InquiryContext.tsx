"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface InquiryContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const InquiryContext = createContext<InquiryContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <InquiryContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  return useContext(InquiryContext);
}
