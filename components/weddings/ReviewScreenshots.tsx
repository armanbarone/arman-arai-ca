import Image from "next/image";
import styles from "./review-screenshots.module.css";

// The same nine original screenshots published on /2728-weddings.
const reviews = [
  { n: 1, width: 1896, height: 2485 },
  { n: 5, width: 1896, height: 1555 },
  { n: 3, width: 750, height: 851 },
  { n: 9, width: 750, height: 1623 },
  { n: 4, width: 750, height: 657 },
  { n: 7, width: 375, height: 797 },
  { n: 6, width: 422, height: 474 },
  { n: 2, width: 1082, height: 451 },
  { n: 8, width: 428, height: 301 },
];

export default function ReviewScreenshots() {
  return (
    <div className={styles.proof}>
      <p className={styles.intro}>The original messages. Tap a review to read it at full size.</p>
      <div className={styles.grid}>
        {reviews.map(({ n, width, height }, index) => {
          const src = `https://cdn.armanarai.ca/reviews/proof-${String(n).padStart(2, "0")}.png`;
          return (
            <a key={n} className={styles.card} href={src} target="_blank" rel="noopener noreferrer" aria-label={`Read review ${index + 1} at full size (opens in a new tab)`}>
              <Image src={src} width={width} height={height} quality={80} loading="lazy" fetchPriority="low"
                sizes="(max-width: 390px) 88vw, 340px"
                alt={`Original message from a photography client, review ${index + 1}`} />
              <span className={styles.caption}>Open full review <span aria-hidden="true">↗</span></span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
