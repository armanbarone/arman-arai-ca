import { ChristmasCharacter } from "./ChristmasStorybook";

export function ChristmasSimpleIncludes() {
  return <section id="packages" className="xm-simple-includes xm-wrap" aria-labelledby="xm-includes-title">
    <div className="xm-simple-includes-title"><ChristmasCharacter character="elf" /><div><p className="xm-eyebrow">ONE FAMILY. ONE SESSION.</p><h2 id="xm-includes-title">Here’s what you get.</h2></div><ChristmasCharacter character="nutcracker" /></div>
    <ul>
      <li><strong>30 minutes with Santa</strong><span>A private session across three Christmas sets.</span></li>
      <li><strong>10 edited digital photos</strong><span>A private gallery, ready to download and print.</span></li>
      <li><strong>A few Christmas extras</strong><span>Cookies, warm milk, and a Santa letter mailed to the kids with a complimentary keepsake.</span></li>
    </ul>
    <p className="xm-simple-family-note">For families with children · One household, up to five people · Parents welcome in the photos</p>
  </section>;
}

export function ChristmasSimpleFaq({ policy }: { policy: string }) {
  const questions = [
    ["Where do we come?", "583 E Kings Rd, North Vancouver, BC V7N 1J2. Plenty of street parking. Arrive dressed and ready for your session. Please ask about access requirements before booking."],
    ["What should we wear?", "Cream, burgundy, olive, and simple knitwear work well with the sets. Coordinate your outfits and arrive ready; there is no need to bring outfit changes. Shy children can stay close to a parent—there is no pressure to sit on Santa’s lap."],
    ["When do we get our photos?", "Your edited photos arrive in a private download gallery within five days. Sessions from December 18 onward have a 48-hour turnaround. Album buyers receive 20 edited digital photos. Letter postage within BC is included; postal arrival before Christmas is not guaranteed."],
    ["How do the optional albums work?", "Each printed album has 10 pages and 20 photos. Your first is $67, your second is $55, and your third is $45. Plus tax. Hand delivery across Greater Vancouver through Surrey is included, after your photo selections. Delivery before Christmas is not guaranteed."],
    ["Can we cancel or reschedule?", policy],
  ];
  return <section id="faq" className="xm-faq xm-wrap xm-simple-faq"><div><p className="xm-eyebrow">THE PRACTICAL DETAILS</p><h2>Before you book.</h2><p><a href="mailto:i@armanarai.com">Ask Arman a question ↗</a></p></div><div className="xm-faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>;
}
