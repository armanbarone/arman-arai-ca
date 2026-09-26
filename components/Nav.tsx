"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import InquireButton from "./InquireButton";

/* Same shape as the nav on armanarai.com: one plain link, a Portfolio
   disclosure, a two-column mega menu for places, Pricing, and About/Reviews
   tucked under FAQ so the top row stays short. Only the contents differ,
   because this site sells weddings in Canada rather than elopements. */

const linksBefore = [{ href: "/experience", label: "Experience" }];
const portfolioLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/galleries", label: "Galleries" },
];
const linksAfter = [{ href: "/pricing", label: "Pricing" }];
const faqLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
];

/* Column one is the province, column two is the places in it that have a page
   of their own. Every entry is a distinct destination: the old menu listed ten
   towns per province and pointed all ten at the same city hub. */
type MenuPlace = { name: string; href: string; note: string };
type MenuGroup = { name: string; slug: string; href: string; places: MenuPlace[] };

const hub = (slug: string) => `/${slug}-wedding-photographer`;

const menuGroups: MenuGroup[] = [
  {
    name: "Québec",
    slug: "quebec",
    href: hub("montreal"),
    places: [
      { name: "Montréal", href: hub("montreal"), note: "From C$3,000, with travel kept separate" },
    ],
  },
  {
    name: "Ontario",
    slug: "ontario",
    href: hub("toronto"),
    places: [
      { name: "Toronto", href: hub("toronto"), note: "From C$3,000, the same as everywhere. Niagara and the 1000 Islands too" },
    ],
  },
  {
    name: "British Columbia",
    slug: "bc",
    href: hub("vancouver"),
    places: [
      { name: "Vancouver", href: hub("vancouver"), note: "From C$3,000, the North Shore and Squamish included" },
      { name: "Whistler", href: hub("whistler"), note: "The Sea-to-Sky, at the same price as everywhere else" },
      { name: "Tofino", href: hub("tofino"), note: "Vancouver Island and the open Pacific, quoted" },
    ],
  },
  {
    name: "Alberta",
    slug: "alberta",
    href: hub("banff"),
    places: [
      { name: "Banff", href: hub("banff"), note: "Lake Louise, Moraine Lake and Canmore" },
      { name: "Jasper", href: hub("jasper"), note: "The quieter Rockies, under a dark-sky preserve" },
    ],
  },
  /* Not a province. It sits in the same menu because a couple looking for
     where he works looks here, and the destination page is otherwise reachable
     only from the footer. */
  {
    name: "Beyond Canada",
    slug: "destination",
    href: "/destination-wedding-photographer",
    places: [
      {
        name: "Destination weddings",
        href: "/destination-wedding-photographer",
        note: "Anywhere in the world except the United States, at the same collection price",
      },
    ],
  },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [mobGroup, setMobGroup] = useState<string | null>(null);

  const portfolioActive = portfolioLinks.some((l) => pathname.startsWith(l.href));
  const faqActive = faqLinks.some((l) => pathname.startsWith(l.href));
  const placesActive = /-wedding-photographer$/.test(pathname);

  const shownGroup = menuGroups.find((g) => g.slug === hoverGroup) ?? menuGroups[0];

  const PANEL: React.CSSProperties = {
    background: "rgba(8,7,4,0.98)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "0.5px solid #2A2520",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  };

  function closeMobile() {
    setMobileOpen(false);
    setMobGroup(null);
  }

  /* The sheet is a full-height drawer, so the page behind it must not scroll,
     and a tap on a link that lands on the page you are already on has to close
     it anyway: Next fires no navigation for a same-route href. */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setMobGroup(null);
  }, [pathname]);

  return (
    <>
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

        <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
          {linksBefore.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
                {label}
              </Link>
            </li>
          ))}

          {/* Portfolio dropdown (Portfolio, Galleries) */}
          <li
            className="relative"
            onMouseEnter={() => setPortfolioOpen(true)}
            onMouseLeave={() => setPortfolioOpen(false)}
          >
            <button
              className={`nav-link ${portfolioActive ? "active" : ""}`}
              onClick={() => setPortfolioOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={portfolioOpen}
            >
              Portfolio
            </button>
            {portfolioOpen && (
              <div className="absolute left-0 top-full pt-3">
                <div style={{ ...PANEL, minWidth: 170, padding: "6px 0" }}>
                  {portfolioLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setPortfolioOpen(false)}
                      className="block px-5 py-2.5 nav-link"
                      style={{ letterSpacing: "0.14em" }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>

          {/* Weddings mega-dropdown: markets on the left, their places on the right */}
          <li
            className="relative"
            onMouseEnter={() => setPlacesOpen(true)}
            onMouseLeave={() => {
              setPlacesOpen(false);
              setHoverGroup(null);
            }}
          >
            <button
              className={`nav-link ${placesActive ? "active" : ""}`}
              onClick={() => setPlacesOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={placesOpen}
            >
              Weddings
            </button>
            {placesOpen && (
              <div className="absolute left-0 top-full pt-3">
                <div style={{ ...PANEL, display: "flex" }}>
                  <div style={{ minWidth: 210, padding: "6px 0", borderRight: "0.5px solid #2A2520" }}>
                    {menuGroups.map((g) => {
                      const on = shownGroup.slug === g.slug;
                      return (
                        <Link
                          key={g.slug}
                          href={g.href ?? "/pricing"}
                          onMouseEnter={() => setHoverGroup(g.slug)}
                          onClick={() => setPlacesOpen(false)}
                          className="flex items-center justify-between px-5 py-2.5"
                          style={{ background: on ? "rgba(184,149,106,0.10)" : "transparent" }}
                        >
                          <span className="nav-link" style={on ? { color: "#B8956A" } : undefined}>
                            {g.name}
                          </span>
                          <span aria-hidden style={{ fontSize: "0.6em", color: on ? "#B8956A" : "#5A5148" }}>
                            ▸
                          </span>
                        </Link>
                      );
                    })}
                    <div style={{ height: "0.5px", background: "#2A2520", margin: "4px 0" }} />
                    <Link href="/pricing" onClick={() => setPlacesOpen(false)} className="block px-5 py-2.5 nav-link">
                      All prices
                    </Link>
                  </div>

                  <div style={{ minWidth: 240, padding: "10px 0" }}>
                    <p className="px-5 pb-2 text-[0.52rem] tracking-[0.28em] uppercase text-slate">
                      {shownGroup.name}
                    </p>
                    {shownGroup.places.map((c) => (
                      <Link
                        key={c.name}
                        href={c.href}
                        onClick={() => setPlacesOpen(false)}
                        className="block px-5 py-2.5"
                      >
                        <span className="nav-link block" style={{ letterSpacing: "0.12em" }}>
                          {c.name}
                        </span>
                        <span className="block text-slate text-[0.62rem] leading-snug mt-1">
                          {c.note}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </li>

          {linksAfter.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
                {label}
              </Link>
            </li>
          ))}

          <li>
            <Link href="/blog" className={`nav-link ${pathname.startsWith("/blog") ? "active" : ""}`}>
              Journal
            </Link>
          </li>

          {/* FAQ dropdown carries About and Reviews, as on the .com */}
          <li className="relative" onMouseEnter={() => setFaqOpen(true)} onMouseLeave={() => setFaqOpen(false)}>
            <button
              className={`nav-link ${faqActive ? "active" : ""}`}
              onClick={() => setFaqOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={faqOpen}
            >
              FAQ
            </button>
            {faqOpen && (
              <div className="absolute right-0 top-full pt-3">
                <div style={{ ...PANEL, minWidth: 160, padding: "6px 0" }}>
                  {faqLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setFaqOpen(false)}
                      className="block px-5 py-2.5 nav-link"
                      style={{ letterSpacing: "0.14em" }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        </ul>

        <InquireButton className="hidden lg:inline-block text-[0.62rem] tracking-[0.2em] uppercase text-rose border border-rose/40 px-5 py-2.5 transition-all duration-300 hover:bg-rose hover:text-ivory cursor-pointer shrink-0 bg-transparent">
          Inquire
        </InquireButton>

        {/* The bars fold into a cross while the sheet is open, so the control
            that opened it is visibly the one that closes it. */}
        <button
          className="lg:hidden relative w-10 h-10 -mr-2 shrink-0"
          aria-label={mobileOpen ? "Close menu" : "Menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-px bg-cream block"
              style={{
                width: mobileOpen ? 20 : i === 2 ? 12 : 20,
                transition: "transform 0.25s ease, opacity 0.2s ease, width 0.25s ease",
                transform: mobileOpen
                  ? `translate(-50%,-50%) rotate(${i === 0 ? 45 : -45}deg)`
                  : `translate(-50%, calc(-50% + ${(i - 1) * 6}px))`,
                opacity: mobileOpen && i === 2 ? 0 : 1,
                marginLeft: mobileOpen ? 0 : i === 2 ? -4 : 0,
              }}
            />
          ))}
        </button>
      </nav>
    </header>

      {/* Outside the <header> on purpose: backdrop-filter on an ancestor makes
          it the containing block for position:fixed, which flattens this sheet
          to the header's own 4rem. */}
      {mobileOpen && (
        <div id="mobile-menu" className="mnav-sheet lg:hidden">
          <div className="mnav-scroll page-px">
            <div className="mnav-group">
              <p className="mnav-eyebrow">The work</p>
              {[...linksBefore, ...portfolioLinks, { href: "/blog", label: "Journal" }].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className={`mnav-link ${pathname.startsWith(href) ? "active" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Places, as an accordion rather than a hover menu */}
            <div className="mnav-group">
              <p className="mnav-eyebrow">Where he shoots</p>
              {menuGroups.map((g) => {
                const open = mobGroup === g.slug;
                return (
                  <div key={g.slug}>
                    <button
                      className="mnav-link"
                      onClick={() => setMobGroup((s) => (s === g.slug ? null : g.slug))}
                      aria-expanded={open}
                      aria-controls={`mnav-${g.slug}`}
                    >
                      <span>{g.name}</span>
                      <span aria-hidden className="mnav-toggle">
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    {open && (
                      <div id={`mnav-${g.slug}`} className="mnav-children">
                        {g.places.map((c) => (
                          <Link key={c.name} href={c.href} onClick={closeMobile} className="mnav-sublink">
                            <span className="mnav-sublink-name">{c.name}</span>
                            <span className="mnav-sublink-note">{c.note}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pricing keeps the full weight of a primary row; the rest of this
                group is what a couple reads after they have decided to ask. */}
            <div className="mnav-group">
              <p className="mnav-eyebrow">Practical</p>
              {linksAfter.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className={`mnav-link ${pathname.startsWith(href) ? "active" : ""}`}
                >
                  {label}
                </Link>
              ))}
              {[...faqLinks, { href: "/contact", label: "Contact" }].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className={`mnav-link mnav-minor ${pathname.startsWith(href) ? "active" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mnav-foot page-px">
            <InquireButton className="mnav-cta">Inquire</InquireButton>
          </div>
        </div>
      )}
    </>
  );
}
