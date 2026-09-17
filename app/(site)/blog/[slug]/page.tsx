import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { posts, getPost } from "@/lib/blog";
import { parseGazetteBody, ORDINALS } from "@/lib/gazette-parse";
import GazetteMotion from "@/components/GazetteMotion";
import { marketBySlug, SITE } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${SITE.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [SITE.name],
      images: [{ url: post.coverImage, alt: post.coverAlt }],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { introParas: lede, sections } = parseGazetteBody(post.body);
  const market = post.city ? marketBySlug(post.city) : undefined;
  const placeName = market?.city ?? "Canada";
  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
  const titleWords = post.title.split(" ");
  const url = `${SITE.url}/blog/${post.slug}`;

  // The volume number is derived from the slug so it is stable across builds
  // rather than changing every deploy.
  const volNo = (Array.from(post.slug).reduce((a, c) => a + c.charCodeAt(0), 0) % 90) + 10;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    publisher: { "@id": `${SITE.url}/#business` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(market ? { about: { "@type": "Place", name: market.city } } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="gz-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <GazetteMotion />

      <div className="gz-page">
        <div className="gz-sheet">
          <div className="gz-vignette" />

          {/* utility bar */}
          <div className="gz-util" data-gz-reveal data-gz-order="0">
            <Link href="/blog">&larr; All dispatches · armanarai.ca</Link>
            <span className="gz-util-r">
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/pricing" className="gz-inq">Pricing</Link>
            </span>
          </div>
          <div className="gz-doublerule" />

          {/* masthead */}
          <div className="gz-masthead">
            <div className="gz-ear" data-gz-reveal data-gz-order="2">
              <div className="gz-ear-label">The Weather</div>
              <div className="gz-ear-note">Overcast, with a chance of the best light all day.</div>
            </div>
            <div className="gz-nameplate-wrap" data-gz-reveal data-gz-order="0">
              <div className="gz-nameplate">The Wedding Gazette</div>
              <div className="gz-nameplate-sub">
                Arman Arai&rsquo;s journal of Canadian weddings · Est. MMXXVI
              </div>
            </div>
            <div className="gz-ear gz-ear--r" data-gz-reveal data-gz-order="2">
              <div className="gz-ear-label">Price: one exposure</div>
              <div className="gz-ear-note">Printed nightly in the darkroom. Delivered at dusk, by post or by inbox.</div>
            </div>
          </div>

          {/* dateline */}
          <div className="gz-dateline" data-gz-reveal data-gz-order="3">
            <span>Vol. I · No. {volNo}</span><span className="gz-star">✦</span>
            <span>{placeName}</span><span className="gz-star">✦</span>
            <span>{post.dateDisplay}</span><span className="gz-star">✦</span>
            <span className="gz-move">The photographs in this edition may move</span>
          </div>

          {/* headline block */}
          <div className="gz-headblock">
            <div className="gz-kicker" data-gz-reveal data-gz-order="4">
              {post.topic} · {placeName}
            </div>
            <h1 className="gz-h1">
              <span className="gz-line">
                {titleWords.map((word, wi) => (
                  <Fragment key={wi}>
                    <span className="gz-word">
                      {Array.from(word).map((ch, ci) => (
                        <span className="gz-ch" key={ci}>{ch}</span>
                      ))}
                    </span>
                    {wi < titleWords.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </span>
            </h1>
            {post.subtitle && (
              <p className="gz-dek" data-gz-reveal data-gz-order="6">{post.subtitle}</p>
            )}
            <div className="gz-byline" data-gz-reveal data-gz-order="7">
              <span>By <span className="gz-by-ink">Arman Arai</span>, Staff Photographer &amp; Publisher</span>
              <span className="gz-bar">|</span>
              <span>{post.readTime}</span>
            </div>
          </div>
          <div data-gz-reveal data-gz-fx="line" style={{ borderTop: "1px solid var(--gz-rule)" }} />

          {/* front page */}
          <div className="gz-fp">
            <div className="gz-fp-left" data-gz-reveal data-gz-order="8">
              {lede.map((p, i) => (
                <p key={i} className={`gz-p${i === 0 ? " gz-dropcap" : ""}`} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
              {sections.length > 0 && <p className="gz-continued">(Continued on Page 2, Col. 1)</p>}
            </div>

            <div className="gz-fp-mid" data-gz-reveal data-gz-order="9">
              <div className="gz-frame" data-gz-depth>
                <div className="gz-frame-inner">
                  <div className="gz-well" style={{ aspectRatio: "4/5" }}>
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      sizes="(max-width:900px) 100vw, 560px"
                      quality={82}
                      priority
                      fetchPriority="high"
                    />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: "0.9rem" }}>
                <div className="gz-cap">{post.coverAlt}</div>
                <div className="gz-cap-joke">Photograph by Arman Arai.</div>
              </div>
            </div>

            <div className="gz-fp-right" data-gz-reveal data-gz-order="10">
              {sections.length > 0 && (
                <div className="gz-index">
                  <div className="gz-index-head">In this edition</div>
                  <div className="gz-index-rows">
                    {sections.map((s, i) => (
                      <a key={i} href={`#gz-sec-${i}`} className="gz-index-row">
                        <span>{s.heading}</span><span className="gz-leader" /><span className="gz-pg">p.{i + 2}</span>
                      </a>
                    ))}
                    <a href="#gz-classifieds" className="gz-index-row">
                      <span>Classified dispatches</span><span className="gz-leader" />
                      <span className="gz-pg">p.{sections.length + 2}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* body pages: every section with a photograph earns the 50/50 row */}
          {sections.map((s, i) => {
            const imgRight = i % 2 === 1;
            const paras = s.paras.map((p, pi) => (
              <p key={pi} className={`gz-p${pi === 0 ? " gz-dropcap" : ""}`} dangerouslySetInnerHTML={{ __html: p }} />
            ));

            const imgCol = s.img && (
              <div className="gz-imgcol" data-gz-reveal data-gz-order={imgRight ? "2" : "1"}>
                <div className="gz-well gz-well--fill">
                  <Image src={s.img.src} alt={s.img.alt} fill sizes="(max-width:900px) 100vw, 620px" quality={80} loading="lazy" />
                </div>
                {s.img.caption && <div className="gz-cap gz-cap--dim">{s.img.caption}</div>}
              </div>
            );

            let layout;
            if (s.img) {
              const textCol = (
                <div className="gz-secbody" data-gz-reveal data-gz-order={imgRight ? "1" : "2"}>{paras}</div>
              );
              layout = (
                <div className={`gz-page-grid ${imgRight ? "gz-grid-b" : "gz-grid-a"}`}>
                  {imgRight ? <>{textCol}{imgCol}</> : <>{imgCol}{textCol}</>}
                </div>
              );
            } else if (s.paras.length === 0) {
              layout = null;
            } else {
              layout = <div className="gz-secbody gz-secbody--solo" data-gz-reveal data-gz-order="1">{paras}</div>;
            }

            return (
              <div key={i}>
                {i > 0 && <div className="gz-glyph" data-gz-reveal>⁂</div>}
                <section id={`gz-sec-${i}`} className={i === 0 ? "gz-section" : "gz-section--tight"}>
                  <div className="gz-pagetag-wrap" data-gz-reveal>
                    <span className="gz-pagetag">Page {ORDINALS[i + 1]}</span>
                  </div>
                  <h2 className="gz-h2" data-gz-reveal data-gz-order="0">{s.heading}</h2>
                  {layout}
                  {s.tables.map((t, ti) => (
                    <div key={ti} className="gz-table-wrap" data-gz-reveal dangerouslySetInnerHTML={{ __html: t }} />
                  ))}
                </section>
              </div>
            );
          })}

          {/* up-link to the city page this post belongs to */}
          {market && (
            <div
              className="gz-section--tight"
              data-gz-reveal
              style={{
                border: "1px solid var(--gz-rule)",
                padding: "1.4rem 1.6rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "0.6rem",
                justifyContent: "space-between",
              }}
            >
              <span className="gz-p" style={{ margin: 0 }}>
                Getting married in {market.region}? Prices, coverage and travel are all published.
              </span>
              <Link href={`/${market.slug}-wedding-photographer`} className="gz-inq" style={{ whiteSpace: "nowrap" }}>
                The {market.city} page &rarr;
              </Link>
            </div>
          )}

          {/* classifieds */}
          <section id="gz-classifieds" className="gz-section">
            <div data-gz-reveal style={{ borderTop: "3px double var(--gz-rule2)", paddingTop: "1.6rem", textAlign: "center" }}>
              <div className="gz-pagetag" style={{ border: "none" }}>
                Page {ORDINALS[sections.length + 1] ?? sections.length + 2} · Classified dispatches
              </div>
            </div>
            <div className="gz-classifieds">
              {related.map((r, i) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="gz-card" data-gz-reveal data-gz-order={i + 1}>
                  <div className="gz-card-photo">
                    <Image src={r.coverImage} alt={r.coverAlt} fill sizes="(max-width:767px) 100vw, 320px" quality={76} loading="lazy" />
                  </div>
                  <div className="gz-card-kicker">{r.topic}</div>
                  <div className="gz-card-name">{r.title}</div>
                  <div className="gz-card-foot">Read →</div>
                </Link>
              ))}
              <Link href="/contact" className="gz-card gz-card--cta" data-gz-reveal data-gz-order={related.length + 1}>
                <div className="gz-card-kicker">Wanted: couples of quiet ambition</div>
                <p className="gz-card-blurb">Enquiries to the publisher, armanarai.ca. Answered inside two business hours.</p>
                <div className="gz-card-foot">Reward: the last hour of light.</div>
              </Link>
            </div>
          </section>

          <footer className="gz-folio" data-gz-reveal>
            <span>© MMXXVI The Wedding Gazette · Printed nightly in the darkroom of Arman Arai</span>
            <span><Link href="/blog">armanarai.ca/blog</Link> · Set in Cormorant &amp; Jost</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
