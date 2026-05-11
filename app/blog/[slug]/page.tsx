import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "@/lib/blog";
import InquireButton from "@/components/InquireButton";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — StillVows`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = posts.filter(p => p.slug !== slug);

  return (
    <>
      {/* ── COVER ── */}
      <div className="relative w-full" style={{ height:"clamp(300px,55vw,640px)", marginTop:"0" }}>
        <div className="absolute inset-0 bg-ink/30 z-10" />
        <Image src={post.coverImage} alt={post.coverAlt} fill className="object-cover" sizes="100vw" priority />
        {/* Header overlaid on image */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end page-px pb-12 md:pb-16" style={{ paddingTop:"7rem" }}>
          <div className="page-w w-full">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/blog" className="text-[0.58rem] tracking-[0.22em] uppercase text-cream/60 hover:text-blush transition-colors">
                ← Journal
              </Link>
              <span className="text-cream/30 text-xs">·</span>
              <span className="text-[0.58rem] tracking-[0.2em] uppercase text-cream/60">{post.dateDisplay}</span>
              <span className="text-cream/30 text-xs">·</span>
              <span className="text-[0.58rem] tracking-[0.18em] uppercase text-cream/50">{post.readTime}</span>
            </div>
            <h1
              className="font-serif font-light text-cream leading-tight mb-3 max-w-3xl"
              style={{ fontSize:"clamp(2rem,4vw,3.8rem)" }}
            >
              {post.title}
            </h1>
            <p className="font-serif italic text-cream/70 max-w-2xl" style={{ fontSize:"clamp(1rem,1.6vw,1.2rem)" }}>
              {post.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── ARTICLE BODY ── */}
      <article className="bg-parchment py-16 md:py-20">
        <div className="page-w page-px">
          <div
            className="max-w-2xl mx-auto prose-arman"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)",
              lineHeight: "1.85",
              color: "#3D3028",
              fontWeight: 300,
            }}
            dangerouslySetInnerHTML={{ __html: post.body
              .replace(/<h2>/g, '<h2 style="font-family:var(--font-cormorant),serif;font-weight:300;font-size:clamp(1.5rem,2.5vw,2rem);color:#2C2420;margin-top:3rem;margin-bottom:1rem;line-height:1.2;">')
              .replace(/<p>/g, '<p style="margin-bottom:1.4em;">')
            }}
          />

          {/* Author sig */}
          <div className="max-w-2xl mx-auto mt-12 pt-8 border-t border-dust flex items-center gap-5">
            <div>
              <span className="font-script text-rose block" style={{ fontSize:"2rem" }}>Arman</span>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-slate">Destination Wedding Photographer</p>
              <p className="text-[0.6rem] tracking-[0.15em] uppercase text-blush/70 mt-0.5">Medellín · Vancouver · Worldwide</p>
            </div>
          </div>
        </div>
      </article>

      {/* ── MORE POSTS ── */}
      {others.length > 0 && (
        <section className="bg-parchment py-16 md:py-20">
          <div className="page-w page-px">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-10 text-center">More from the journal</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-parchment/30">
              {others.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="block group bg-parchment">
                  <div className="relative overflow-hidden" style={{ height:"240px" }}>
                    <Image src={p.coverImage} alt={p.coverAlt} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" sizes="(max-width:768px) 100vw, 50vw" />
                  </div>
                  <div className="px-8 py-8">
                    <p className="text-[0.56rem] tracking-[0.2em] uppercase text-blush mb-2">{p.dateDisplay}</p>
                    <h3 className="font-serif font-light text-cream group-hover:text-rose transition-colors mb-2" style={{ fontSize:"1.3rem" }}>{p.title}</h3>
                    <span className="text-[0.6rem] tracking-[0.18em] uppercase text-rose/70">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="bg-ink py-16 md:py-20 text-center">
        <div className="page-w page-px">
          <p className="font-serif italic text-cream/70 text-lg mb-6 leading-relaxed max-w-xl mx-auto">
            If something here resonated, I would love to hear about your wedding.
          </p>
          <InquireButton className="inline-block bg-rose text-cream text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark-dark transition-colors duration-300 cursor-pointer border-none">
            Inquire for Availability
          </InquireButton>
        </div>
      </section>
    </>
  );
}
