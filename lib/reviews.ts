/* The original client messages published as screenshots, and what each one says.
 *
 * Both /reviews and the 2728 landing pages render these same files. Each used
 * to carry one generic alt string repeated on every image ("A message from a
 * couple after their gallery was delivered", "Original message from a
 * photography client, review 3"), which told a screen reader nothing and told
 * twelve different couples apart not at all.
 *
 * The alt text is transcribed from the message in the picture. First names
 * only: the surnames are visible in the screenshots themselves, and there is no
 * reason to put them into machine-readable text as well.
 *
 * `w` and `h` are the real pixel dimensions. They run from 0.46 to 2.42 in
 * aspect ratio, and without them next/image cannot reserve space.
 */

export type Proof = { n: number; w: number; h: number; alt: string };

export const PROOF: Proof[] = [
  { n: 1, w: 1896, h: 2485, alt: "Text messages from Justine after her preview gallery arrived: “Arman We are losing our mind over these previews” and “Literally crying”." },
  { n: 2, w: 1082, h: 451, alt: "A message about a preview gallery from Jennifer: “We just went through the preview gallery and we are OBSESSED! You even took Mr. Nickels picture when aunt Beatrice picked him up.”" },
  { n: 3, w: 750, h: 851, alt: "Megan on her wedding album: “I did not expect to get emotional over the album but here we are.” Arman replies that the printed album looks ten times better than the online gallery." },
  { n: 4, w: 750, h: 657, alt: "Rachel relaying her mother’s reaction: “My mom keeps texting about the photos. She said she never saw wedding photos this good all her life!”" },
  { n: 5, w: 1896, h: 1555, alt: "Brianna on her finished gallery: “I cannot stop staring at the gallery” and “It’s everything I ever wanted and more.”" },
  { n: 6, w: 422, h: 474, alt: "Stephanie on the announcement video: “I reposted the announcement video and now everyone is asking who our videographer was.” She passes Arman’s number to a friend looking for a photographer." },
  { n: 7, w: 375, h: 797, alt: "Lexi after the gallery was delivered: “I am at loss for words. These pictures are unreal”, then “I sent a sneak peak of the album to my mom and she can’t stop talking about it.”" },
  { n: 8, w: 428, h: 301, alt: "A five-star Google review from Samantha: she spoke to several photographers and concluded “only one person understood our vision the way we were imagining it”, and the photos still bring tears to her eyes six months later." },
  { n: 9, w: 750, h: 1623, alt: "Glen after receiving the gallery: “Amy seems to be in love with our portraits and already forwarded the pictures to the family chat… Couldn’t be happier”, then asking when the album will arrive." },
  { n: 10, w: 437, h: 293, alt: "A five-star Google review from Brian: “Arman captured our wedding beautifully. Every photo felt emotional and natural and full of life. He somehow caught all the little moments we didn’t even notice.”" },
  { n: 11, w: 422, h: 231, alt: "Andrew, the morning after the wedding: “Hey just wanted to reach out and thank you for an unforgettable night. Looking forward to the images.”" },
  { n: 12, w: 373, h: 154, alt: "A short message from Taylor: “Your work is pure art.”" },
];

export const proofSrc = (n: number) =>
  `https://cdn.armanarai.ca/reviews/proof-${String(n).padStart(2, "0")}.png`;

export const proofByN = (n: number) => PROOF.find((p) => p.n === n)!;
