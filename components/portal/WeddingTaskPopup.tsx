"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonCls, ghostButtonCls } from "./Shell";

type Task = { title: string; detail: string; href: string; kind: string; due?: string };

/* What is waiting on this person, put in front of them when they sign in.
 *
 * It opens once per sign-in rather than on every page: a dialog that reappears
 * each time they click something is a dialog they learn to dismiss without
 * reading. The key carries the tasks themselves, so a new document to sign
 * opens it again, and finishing one does not.
 *
 * sessionStorage can throw outright in a private window or with site data
 * blocked, so every access is guarded and the popup simply shows in that case.
 */
export default function WeddingTaskPopup({
  tasks,
  names,
}: {
  tasks: Task[];
  names: string;
}) {
  const [open, setOpen] = useState(false);
  const key = `aa-tasks:${names}:${tasks.map((t) => t.title).join("|")}`;

  useEffect(() => {
    if (!tasks.length) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(key) === "1";
    } catch {
      seen = false;
    }
    if (!seen) setOpen(true);
  }, [key, tasks.length]);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* Dismissing still works for this view; it just will not be remembered. */
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open || !tasks.length) return null;

  return (
    <div
      className="wp-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="wp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wp-tasks-title"
      >
        <p className="wp-modal-eyebrow">
          {tasks.length === 1 ? "One thing to do" : `${tasks.length} things to do`}
        </p>
        <h2 id="wp-tasks-title">Welcome back, {names}.</h2>
        <p className="wp-modal-lead">
          {tasks.length === 1
            ? "This is waiting on you."
            : "These are waiting on you, in the order they happen."}
        </p>
        <ol className="wp-modal-tasks">
          {tasks.map((t, i) => (
            <li key={t.title}>
              <span className="wp-modal-step">{i + 1}</span>
              <div>
                <Link href={t.href} onClick={close}>
                  {t.title}
                </Link>
                <p>{t.detail}</p>
                {t.due && <small>Due {t.due}</small>}
              </div>
            </li>
          ))}
        </ol>
        <div className="wp-modal-actions">
          <Link className={buttonCls} href={tasks[0].href} onClick={close}>
            {tasks.length === 1 ? "Get started" : `Start with the first`}
          </Link>
          <button type="button" className={ghostButtonCls} onClick={close}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
