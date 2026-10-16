import type { Metadata } from "next";
import { CATEGORY_LABELS, CATEGORY_NOTES, VENDOR_CITIES, vendorCount } from "@/lib/vendors";
import { WEDDING_CALENDAR } from "@/lib/wedding-booking";
import { SITE } from "@/lib/site";
import styles from "./vendors.module.css";

/* The preferred vendor list, item four in the first email every couple gets.
 *
 * noindex, like /wedding-guide: this is a funnel asset for couples who have
 * already written to Arman, not a page that should rank for "best Toronto
 * florist" or read as a paid directory. It is out of sitemap.ts for the same
 * reason, so do not add it there and do not submit it to IndexNow.
 *
 * The list itself lives in lib/vendors.ts, which carries the rule about not
 * adding a business whose website you have not actually opened. */

export const metadata: Metadata = {
  title: "My preferred vendors — Arman Arai",
  description: "The planners, florists, hair and makeup artists, DJs and officiants Arman Arai recommends, by city.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PreferredVendorsPage() {
  const total = vendorCount();
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Arman Arai · Wedding photography</p>
          <h1 className={styles.title}>
            The people I&rsquo;d put on <em>your day.</em>
          </h1>
          <div className={styles.leadGrid}>
            <p className={styles.lead}>
              {total} teams across five regions: planners, florists, hair and makeup, music and
              officiants. These are the names I give couples when they ask me who else to call, and
              I&rsquo;d be glad to see any of them on your vendor list.
            </p>
            <p className={styles.lead}>
              <strong>Nobody here paid to be on this page.</strong> There are no kickbacks and no
              referral fees, in either direction. A wedding runs better when the people working it
              are good at their jobs, and that is the whole of my interest in it.
            </p>
          </div>
          <nav aria-label="Jump to a city">
            <ul className={styles.cities}>
              {VENDOR_CITIES.map((city) => (
                <li key={city.slug}>
                  <a className={styles.cityLink} href={`#${city.slug}`}>{city.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className={styles.wrap}>
        {VENDOR_CITIES.map((city) => (
          <section key={city.slug} id={city.slug} className={styles.city} aria-labelledby={`${city.slug}-name`}>
            <h2 id={`${city.slug}-name`} className={styles.cityName}>{city.name}</h2>
            <p className={styles.cityArea}>{city.area}</p>

            {city.groups.map((group) => (
              <div key={group.category} className={styles.group}>
                <div className={styles.groupHead}>
                  <h3 className={styles.groupName}>{CATEGORY_LABELS[group.category]}</h3>
                  <p className={styles.groupNote}>{CATEGORY_NOTES[group.category]}</p>
                </div>
                <ul className={styles.vendors}>
                  {group.vendors.map((vendor) => (
                    <li key={vendor.site + vendor.name} className={styles.vendor}>
                      <a
                        className={styles.vendorName}
                        href={`https://${vendor.site}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {vendor.name}<span>{vendor.site} ↗</span>
                      </a>
                      <p className={styles.vendorNote}>{vendor.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}

        <section className={styles.outro} aria-labelledby="outro-title">
          <h2 id="outro-title">Want me to make the introduction?</h2>
          <p>
            Tell me your date and which of these you still need, and I&rsquo;ll email the ones who
            are worth your time first, with your date in the subject line. It saves you writing the
            same message nine times and it usually gets a faster answer than a cold form.
          </p>
          <p>
            Cake, stationery, rentals, transport and the dress are not on this page yet. Ask me and
            I&rsquo;ll point you at someone for your city.
          </p>
          <a className={styles.button} href={WEDDING_CALENDAR} target="_blank" rel="noopener noreferrer">
            Book a free 30-minute call
          </a>
          <a className={styles.secondary} href={`mailto:${SITE.email}`}>Or just reply to my email</a>
        </section>

        <p className={styles.footer}>
          Every link here was checked against the business&rsquo;s own website. Availability,
          pricing and the team on your date are theirs to confirm, not mine, so book nothing on my
          say-so alone. If a link is broken or a business has closed, tell me and I&rsquo;ll fix it.
          <br />
          Arman Arai · Wedding photography · {SITE.domain} · {SITE.phone}
        </p>
      </main>
    </div>
  );
}
