"use client";

import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";

// The landing pages live outside the (site) route group, so they never get the
// nav, the footer or that layout's InquiryProvider. Each one mounts its own,
// so the same inquiry modal the rest of armanarai.ca uses still opens here.
export default function PopupProvider({ children }: { children: React.ReactNode }) {
  return (
    <InquiryProvider>
      {children}
      <InquiryModal />
    </InquiryProvider>
  );
}
