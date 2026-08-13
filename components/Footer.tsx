import Link from "next/link";
import InquireButton from "./InquireButton";
import { MARKETS, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }} className="pt-20 pb-8">
      <div className="page-w page-px">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10 pb-14 border-b border-dust/50">
          <div className="md:col-span-2">
            <span className="font-script text-4xl text-cream block mb-5">Arman Arai</span>
            <p className="text-[0.82rem] text-blush leading-relaxed max-w-sm font-light mb-8">
              Wedding photography across Canada, coast to coast. Home markets in Toronto, Montréal
              and Vancouver, and a working radius that reaches the Eastern Townships, Niagara and
              the Sea-to-Sky corridor.
            </p>
            <InquireButton
              className="text-[0.62rem] tracking-[0.2em] uppercase px-8 py-3.5 transition-colors duration-300 cursor-pointer border-none bg-rose text-ivory hover:bg-rose-dark"
            >
              Check your date →
            </InquireButton>
          </div>

          <div>
            <h4 className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-6">Weddings in</h4>
            <ul className="space-y-3">
              {MARKETS.map((m) => (
                <li key={m.slug}>
                  <Link href={`/${m.slug}-wedding-photographer`} className="footer-link">
                    {m.city}
                  </Link>
                </li>
              ))}
              <li><Link href="/pricing" className="footer-link">Pricing</Link></li>
              <li><Link href="/reviews" className="footer-link">Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-6">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="footer-link">About</Link></li>
              <li><Link href="/portfolio" className="footer-link">Portfolio</Link></li>
              <li><Link href="/case-studies" className="footer-link">Case Studies</Link></li>
              <li><Link href="/blog" className="footer-link">Journal</Link></li>
              <li><Link href="/contact" className="footer-link">Contact</Link></li>
              <li>
                <a href={`mailto:${SITE.email}`} className="footer-link">{SITE.email}</a>
              </li>
              <li>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="footer-link">
                  Instagram {SITE.instagramHandle}
                </a>
              </li>
              <li>
                <a href={SITE.pinterest} target="_blank" rel="noopener noreferrer" className="footer-link">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[0.62rem] tracking-wider text-slate">
          <span>© {new Date().getFullYear()} Arman Arai. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-rose transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-rose transition-colors">Terms</Link>
          </div>
          <span>Toronto · Montréal · Vancouver · Canada coast to coast</span>
        </div>
      </div>
    </footer>
  );
}
