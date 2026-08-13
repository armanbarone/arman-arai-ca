import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AlbumView from "./AlbumView";
import { GALLERIES, galleryBySlug } from "@/lib/galleries";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return GALLERIES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = galleryBySlug(slug);
  if (!g) return {};
  const title = `${g.names} — ${g.location}`;
  const url = `${SITE.url}/case-studies/${g.slug}`;
  return {
    title,
    description: `${g.frameCount} frames from one wedding day: ${g.names} in ${g.location}, ${g.date}. A full album, start to finish, by Arman Arai.`,
    alternates: { canonical: `/case-studies/${g.slug}` },
    openGraph: {
      title: `${title} | Arman Arai`,
      description: g.story.slice(0, 180),
      url,
      type: "article",
      images: [{ url: g.hero.url, width: 1200, height: 630, alt: g.hero.alt }],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = galleryBySlug(slug);
  if (!g) notFound();

  const url = `${SITE.url}/case-studies/${g.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${g.names} — ${g.location}`,
    url,
    description: g.story,
    numberOfItems: g.frameCount,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    // Only the chapter frames: the hero and teasers are the same photographs at
    // other sizes, and repeating them inflates the count for no benefit.
    image: g.chapters.flatMap((c) =>
      c.images.map((i) => ({ "@type": "ImageObject", contentUrl: i.url, caption: i.alt })),
    ),
    isPartOf: { "@type": "CollectionPage", url: `${SITE.url}/case-studies` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AlbumView gallery={g} />
    </>
  );
}
