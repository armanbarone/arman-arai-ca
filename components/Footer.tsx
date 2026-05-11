import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }} className="pt-16 pb-8">
      <div className="page-w page-px">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 pb-12 border-b border-dust/50">
          <div>
            <span className="font-script text-4xl text-cream block mb-4">StillVows</span>
            <p className="text-[0.78rem] text-blush leading-relaxed max-w-xs font-light">
              Editorial and film-inspired wedding photography for couples who see their day as something sacred. Medellín-based, world-available.
            </p>
          </div>
          <div>
            <h4 className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-6">Explore</h4>
            <ul className="space-y-3">
              {[
                { href: "/about",       label: "About" },
                { href: "/portfolio",   label: "Portfolio" },
                { href: "/destination", label: "Destination Weddings" },
                { href: "/blog",        label: "Journal" },
                { href: "/contact",     label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}><Link href={href} className="footer-link">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-6">Connect</h4>
            <ul className="space-y-3">
              <li><a href="https://instagram.com/iArmanArai" target="_blank" rel="noopener noreferrer" className="footer-link">@iArmanArai</a></li>
              <li><a href="https://instagram.com/StillVows" target="_blank" rel="noopener noreferrer" className="footer-link">@StillVows</a></li>
              <li><a href="mailto:i@armanarai.com" className="footer-link">i@armanarai.com</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[0.62rem] tracking-wider text-slate">
          <span>© {new Date().getFullYear()} StillVows. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="https://instagram.com/iArmanArai" target="_blank" rel="noopener noreferrer" className="hover:text-rose transition-colors">@iArmanArai</a>
            <a href="https://instagram.com/StillVows"  target="_blank" rel="noopener noreferrer" className="hover:text-rose transition-colors">@StillVows</a>
          </div>
          <span>Medellín · Vancouver · Worldwide</span>
        </div>
      </div>
    </footer>
  );
}
