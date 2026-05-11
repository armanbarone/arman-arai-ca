"use client";

import { useInquiry } from "./InquiryContext";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function InquireButton({ children, className, ...props }: Props) {
  const { open } = useInquiry();
  return (
    <button {...props} onClick={open} className={className}>
      {children}
    </button>
  );
}
