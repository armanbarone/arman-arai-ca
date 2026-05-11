"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import InquireButton from "./InquireButton";

const links = [
  { href: "/about",       label: "About" },
  { href: "/portfolio",   label: "Portfolio" },
  { href: "/destination", label: "Destination" },
  { href: "/blog",        label: "Journal" },
  { href: "/contact",     label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();

  function toggleMobile() {
    const menu = document.getElementById("mobile-menu");
    if (menu) menu.classList.toggle("hidden");
  }

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
          StillVows
        </Link>

        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <InquireButton className="hidden md:inline-block text-[0.62rem] tracking-[0.2em] uppercase text-rose border border-rose/40 px-5 py-2.5 transition-all duration-300 hover:bg-rose hover:text-ivory cursor-pointer shrink-0 bg-transparent">
          Inquire
        </InquireButton>

        <button className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu" onClick={toggleMobile}>
          <span className="w-5 h-px bg-cream block" />
          <span className="w-5 h-px bg-cream block" />
          <span className="w-3 h-px bg-cream block" />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className="hidden md:hidden border-t border-dust"
        style={{ background: "rgba(8,7,4,0.97)" }}
      >
        <ul className="page-px py-4 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-[0.65rem] tracking-[0.22em] uppercase text-blush hover:text-rose transition-colors block py-1"
                onClick={toggleMobile}
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
    </header>
  );
}
