import Link from "next/link";
import InquireButton from "./InquireButton";
import { SITE } from "@/lib/site";

/* Structurally identical to the footer on armanarai.com: a two-column closing
   zone with the wordmark, one sentence and a single CTA on the left, Connect on
   the right, then the legal bar. Only the sentence and the last line differ,
   because this site is the Canadian wedding half. */

export default function Footer() {
  return (
    <footer style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }} className="pt-20 pb-8">
      <div className="page-w page-px">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-14 border-b border-dust/50">
          <div>
            <span className="font-script text-4xl text-cream block mb-5">Arman Arai</span>
            <p className="text-[0.82rem] text-blush leading-relaxed max-w-sm font-normal mb-8">
              Wedding photographer. Documentary and editorial coverage, based in Montréal and
               working across Canada, with travel priced openly rather than hidden in a package.
            </p>
            <InquireButton
              className="text-[0.62rem] tracking-[0.2em] uppercase px-8 py-3.5 transition-colors duration-300 cursor-pointer border-none"
              style={{ background: "#B8956A", color: "#080704" }}
            >
              Begin the journey →
            </InquireButton>
          </div>

          <div className="md:text-right">
            <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-6">Connect</p>
            <ul className="space-y-3">
              <li><Link href="/contact" className="footer-link">Contact</Link></li>
              <li><a href={`mailto:${SITE.email}`} className="footer-link">{SITE.email}</a></li>
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
          <span>Based in Montréal · Available across Canada</span>
        </div>
      </div>
    </footer>
  );
}
