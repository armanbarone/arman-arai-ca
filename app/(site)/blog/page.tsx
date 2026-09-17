import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { posts } from "@/lib/blog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Journal — Writing on Canadian Weddings",
  description:
    "What wedding photography costs in Toronto, Montréal and Vancouver, how to build a timeline that survives the day, and how to choose a photographer on something better than taste.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Journal | Arman Arai",
    description: "Writing on getting married in Canada: cost, timing, and choosing well.",
    url: `${SITE.url}/blog`,
  },
};

export default function Blog() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Wedding Gazette",
    url: `${SITE.url}/blog`,
    description: "Arman Arai's journal of Canadian weddings.",
    publisher: { "@id": `${SITE.url}/#business` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}/blog/${p.slug}`,
      datePublished: p.date,
      image: p.coverImage,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-40 pb-14 md:pb-20 bg-ivory">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">The journal</p>
          <h1 className="font-serif font-light text-cream leading-tight" style={{ fontSize: "clamp(2.8rem,5vw,5rem)" }}>
            Thoughts on light,
            <br />
            <em className="italic text-rose">time, and money.</em>
          </h1>
          <p className="text-slate text-sm mt-5 max-w-lg leading-relaxed">
            Writing about getting married in Canada. What it actually costs in each of the three
            cities I work in, where a timeline breaks, and how to judge a photographer on something
            better than their twelve best photographs.
          </p>
        </div>
      </section>

      {/* ── POST LIST ── */}
      <section className="bg-ivory pb-20 md:pb-28">
        <div className="page-w page-px">
          <div className="space-y-px">
            {posts.map((post, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <article className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-parchment">
                  <div
                    className={`relative overflow-hidden ${i % 2 !== 0 ? "lg:order-2" : ""}`}
                    style={{ height: "clamp(240px,35vw,420px)" }}
                  >
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      sizes="(max-width:1023px) 100vw, 50vw"
                      quality={80}
                      priority={i === 0}
                      loading={i === 0 ? undefined : "lazy"}
                    />
                  </div>

                  <div
                    className={`flex flex-col justify-center px-8 md:px-12 lg:px-14 py-10 md:py-14 ${
                      i % 2 !== 0 ? "lg:order-1" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[0.58rem] tracking-[0.22em] uppercase text-rose">{post.topic}</span>
                      <span className="text-dust text-xs">·</span>
                      <span className="text-[0.58rem] tracking-[0.22em] uppercase text-blush">{post.dateDisplay}</span>
                      <span className="text-dust text-xs">·</span>
                      <span className="text-[0.58rem] tracking-[0.18em] uppercase text-slate/60">{post.readTime}</span>
                    </div>
                    <h2
                      className="font-serif font-light text-cream mb-3 group-hover:text-rose transition-colors duration-300"
                      style={{ fontSize: "clamp(1.5rem,2.5vw,2.2rem)" }}
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
            More writing as the season unfolds.
          </p>
          <span className="font-script text-rose" style={{ fontSize: "2rem" }}>Arman</span>
        </div>
      </section>
    </>
  );
}
