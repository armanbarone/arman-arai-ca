import Image from "next/image";
import styles from "./review-screenshots.module.css";
import { proofByN, proofSrc } from "@/lib/reviews";

// The same nine original screenshots published on /2728-weddings, in the order
// they read best on a phone. Dimensions and alt text come from lib/reviews.ts,
// shared with /reviews so the two never describe the same picture differently.
const ORDER = [1, 5, 3, 9, 4, 7, 6, 2, 8];

export default function ReviewScreenshots() {
  return (
    <div className={styles.proof}>
      <p className={styles.intro}>The original messages. Tap a review to read it at full size.</p>
      <div className={styles.grid}>
        {ORDER.map((n) => {
          const { w, h, alt } = proofByN(n);
          const src = proofSrc(n);
          return (
            <a key={n} className={styles.card} href={src} target="_blank" rel="noopener noreferrer" aria-label={`${alt} Opens the full screenshot in a new tab.`}>
              <Image src={src} width={w} height={h} quality={80} loading="lazy" fetchPriority="low"
                sizes="(max-width: 390px) 88vw, 340px"
                alt={alt} />
              <span className={styles.caption}>Open full review <span aria-hidden="true">↗</span></span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
