"use client";

import { useEffect } from "react";

export default function ImageProtect() {
  useEffect(() => {
    // Block right-click on images
    const blockContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "IMG" ||
        target.closest(".hero-grid-photo") ||
        target.closest(".grid-cell") ||
        target.closest(".album-left-page") ||
        target.closest(".flip-face") ||
        target.closest(".film-frame") ||
        target.closest("[data-protected]")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Block drag-start on images
    const blockDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };

    // Block keyboard shortcuts for saving (Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12)
    const blockKeyboard = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        e.key === "F12"
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("dragstart", blockDragStart);
    document.addEventListener("keydown", blockKeyboard);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("dragstart", blockDragStart);
      document.removeEventListener("keydown", blockKeyboard);
    };
  }, []);

  return null;
}
