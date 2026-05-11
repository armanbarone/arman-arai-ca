import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal — StillVows",
  description: "Thoughts on destination wedding photography, the cities worth marrying in, and what it means to make images that last.",
};

export default function Blog() {
  return (
    <>
      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-40 pb-14 md:pb-20 bg-ivory">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">The journal</p>
          <h1 className="font-serif font-light text-cream leading-tight" style={{ fontSize:"clamp(2.8rem,5vw,5rem)" }}>
            Thoughts on light,<br />
            <em className="italic text-rose">love, and place.</em>
          </h1>
          <p className="text-slate text-sm mt-5 max-w-lg leading-relaxed">
            Writing on destination wedding photography, the cities worth getting married in, and what separates images that last from images that fade.
          </p>
        </div>
      </section>

      {/* ── POST LIST ── */}
      <section className="bg-ivory pb-20 md:pb-28">
        <div className="page-w page-px">
          <div className="space-y-px">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <article className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${i % 2 === 0 ? "bg-parchment" : "bg-parchment"}`}>
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${i % 2 !== 0 ? "lg:order-2" : ""}`}
                    style={{ height:"clamp(240px,35vw,420px)" }}
                  >
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      sizes="(max-width:1023px) 100vw, 50vw"
                    />
                  </div>

                  {/* Copy */}
                  <div className={`flex flex-col justify-center px-8 md:px-12 lg:px-14 py-10 md:py-14 ${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[0.58rem] tracking-[0.22em] uppercase text-blush">{post.dateDisplay}</span>
                      <span className="text-dust text-xs">·</span>
                      <span className="text-[0.58rem] tracking-[0.18em] uppercase text-slate/60">{post.readTime}</span>
                    </div>
                    <h2
                      className="font-serif font-light text-cream mb-3 group-hover:text-rose transition-colors duration-300"
                      style={{ fontSize:"clamp(1.5rem,2.5vw,2.2rem)" }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-slate text-sm leading-relaxed mb-6 max-w-md">{post.excerpt}</p>
                    <span className="text-[0.62rem] tracking-[0.2em] uppercase text-rose flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                      Read the piece →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGN OFF ── */}
      <section className="bg-parchment py-16 md:py-20 text-center">
        <div className="page-w page-px">
          <p className="font-serif italic text-blush/60 text-lg mb-2 leading-relaxed">
            More writing coming as the season unfolds.
          </p>
          <span className="font-script text-rose" style={{ fontSize:"2rem" }}>Arman</span>
        </div>
      </section>
    </>
  );
}
