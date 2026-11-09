import { ChristmasCharacter } from "./ChristmasStorybook";

export function ChristmasSimpleIncludes() {
  return <section id="packages" className="xm-simple-includes xm-wrap" aria-labelledby="xm-includes-title">
    <div className="xm-simple-includes-title"><ChristmasCharacter character="elf" /><div><p className="xm-eyebrow">ONE FAMILY. ONE SESSION.</p><h2 id="xm-includes-title">Here’s what you get.</h2></div><ChristmasCharacter character="nutcracker" /></div>
    <ul>
      <li><strong>30 minutes with Santa</strong><span>A private session across three Christmas sets.</span></li>
      <li><strong>10 edited digital photos</strong><span>A private gallery, ready to download and print.</span></li>
      <li><strong>A few Christmas extras</strong><span>Cookies, warm milk, and a Santa letter mailed to the kids with a complimentary keepsake.</span></li>
    </ul>
  </section>;
}
