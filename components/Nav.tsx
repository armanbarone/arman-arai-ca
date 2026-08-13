"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import InquireButton from "./InquireButton";
import { MARKETS } from "@/lib/site";

const links = [
  { href: "/about",        label: "About" },
  { href: "/portfolio",    label: "Portfolio" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing",      label: "Pricing" },
  { href: "/blog",         label: "Journal" },
  { href: "/contact",      label: "Contact" },
];

const cities = MARKETS.map((m) => ({
  href: `/${m.slug}-wedding-photographer`,
  label: m.city,
}));

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet whenever the route changes, otherwise it stays open
  // over the page you just navigated to.
  useEffect(() => setOpen(false), [pathname]);

  const cityActive = cities.some((c) => pathname === c.href);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(8,7,4,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "0.5px solid #2A2520",
      }}
    >
      <nav className="page-w page-px h-16 flex items-center justify-between">
        <Link href="/" className="font-script text-3xl text-cream leading-none shrink-0">
          Arman Arai
        </Link>

        <ul className="hidden lg:flex items-center gap-5 xl:gap-7">
          {links.slice(0, 2).map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
                {label}
              </Link>
            </li>
          ))}

          {/* Cities. CSS-only disclosure so the nav costs no JavaScript to open. */}
          <li className="nav-drop">
            <span className={`nav-link nav-drop-trigger ${cityActive ? "active" : ""}`} tabIndex={0}>
              Cities
              <svg width="7" height="4" viewBox="0 0 7 4" aria-hidden className="nav-caret">
                <path d="M0 0l3.5 4L7 0z" fill="currentColor" />
              </svg>
            </span>
            <ul className="nav-drop-menu">
              {cities.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={`nav-drop-item ${pathname === href ? "active" : ""}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {links.slice(2).map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <InquireButton className="hidden lg:inline-block text-[0.62rem] tracking-[0.2em] uppercase text-rose border border-rose/40 px-5 py-2.5 transition-all duration-300 hover:bg-rose hover:text-ivory cursor-pointer shrink-0 bg-transparent">
          Inquire
        </InquireButton>

        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="w-5 h-px bg-cream block" />
          <span className="w-5 h-px bg-cream block" />
          <span className="w-3 h-px bg-cream block" />
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-dust" style={{ background: "rgba(8,7,4,0.97)" }}>
          <ul className="page-px py-4 flex flex-col gap-4">
            {[...links.slice(0, 2), ...cities, ...links.slice(2)].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-blush hover:text-rose transition-colors block py-1"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <InquireButton className="text-[0.62rem] tracking-[0.2em] uppercase text-rose border border-rose/40 px-4 py-2 hover:bg-rose hover:text-ivory transition-all cursor-pointer bg-transparent mt-1">
                Inquire
              </InquireButton>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
