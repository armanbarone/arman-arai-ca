/* The journal.
 *
 * Every post here is about getting married in Canada. The site this codebase
 * grew out of carried fifteen destination-wedding posts set in Medellín,
 * Cartagena and Dubai; those belong to armanarai.com, which is a different
 * business, and they were deleted rather than rewritten.
 *
 * Body shape matters: the post template (app/blog/[slug]/page.tsx) parses the
 * HTML into a lede plus one section per <h2>, and gives any section that has a
 * <figure> a 50/50 photograph row. So every <h2> should carry a figure, and the
 * first paragraph before the first <h2> is the front-page lede.
 */

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  date: string; // ISO
  dateDisplay: string;
  readTime: string;
  coverImage: string;
  coverAlt: string;
  excerpt: string;
  /** Kicker on the masthead, e.g. "Money". */
  topic: string;
  /** Market slug from lib/site.ts, or null for a post that is not city-specific. */
  city: "toronto" | "montreal" | "vancouver" | null;
  body: string; // HTML
}

const CDN = "https://cdn.armanarai.ca";

export const posts: BlogPost[] = [
  /* ────────────────────────────────────────────────────────────── TORONTO ── */
  {
    slug: "wedding-photography-cost-toronto",
    title: "What Wedding Photography Actually Costs in Toronto",
    subtitle:
      "The published range, what sits underneath each number, and why the cheapest quote in the GTA is almost never the cheapest outcome.",
    date: "2026-08-12",
    dateDisplay: "August 12, 2026",
    readTime: "8 min read",
    coverImage: `${CDN}/cities/toronto/niagara/floral-showhouse/01.webp`,
    coverAlt: "Bride and groom in the glasshouse of the Niagara Floral Showhouse",
    excerpt:
      "Toronto wedding photography runs from about $2,200 to $5,500 in published packages, with a median near $3,475. Here is what each band of that range actually buys, and where the money goes once it leaves your account.",
    topic: "Money",
    city: "toronto",
    body: `
<p><strong>The published range for a Toronto wedding photographer is roughly $2,200 to $5,500</strong>, and the median of the packages studios actually put on their websites sits near $3,475. That is a real number from a real sample, not an industry survey, and it is the number I would want if I were the one shopping.</p>
<p>What that range does not tell you is what changes between the bottom and the top, which is the only question that matters. So here is the inside of it: what a photographer's cost structure looks like in this city, what you are buying at each level, and the specific ways a cheap quote turns expensive.</p>

<h2>Where the GTA range comes from</h2>
<figure><img src="${CDN}/portfolio/documentary/reception-toast-raised-glass.webp" alt="A guest raising a glass mid-toast at a Toronto reception"><figcaption>Toronto is the densest wedding market in the country, which pushes both the ceiling and the floor.</figcaption></figure>
<p>Toronto is the largest and most competitive wedding market in Canada, and competition does two things at once. It pushes the ceiling up, because there is enough demand to support photographers charging $6,000 and more for a single day. It also pushes the floor down, because there is enough supply that someone will always take your date for $1,800.</p>
<p>The result is a range that looks wider than it is useful. A $2,200 package and a $5,500 package are frequently not the same product with different amounts of prestige attached. They are different amounts of time, different amounts of editing, and very often a different number of weddings that photographer is shooting that month.</p>
<p><strong>The honest midpoint for an eight-hour Saturday with an experienced solo photographer in the GTA is between $4,000 and $5,000.</strong> Below that you are usually buying either less time, less experience, or a business model that needs volume to work.</p>

<h2>What sits underneath the number</h2>
<figure><img src="${CDN}/portfolio/documentary/morning-window-vows-read.webp" alt="Bride reading at a window in the morning with her dress hanging behind her"><figcaption>The shooting day is a fraction of the hours a wedding actually takes.</figcaption></figure>
<p>Couples reasonably assume that an eight-hour wedding is eight hours of work. It is closer to thirty. The day itself is eight. Then there is the culling, which on a full wedding means looking at four to six thousand frames and choosing six hundred. Then the editing of those six hundred, which if it is being done properly rather than run through a preset is somewhere between eight and fourteen hours.</p>
<p>Around that sit the planning calls, the timeline work, the venue scouting, the engagement session and its own edit, the backup and archiving, the gallery build, insurance, gear depreciation, and the software subscriptions. <strong>On a $4,800 wedding, the photographer's actual pre-tax earnings after all of that and after the cost of being found by you are in the region of $2,800.</strong> Divided across the real hours, that is a professional wage and not a spectacular one.</p>
<p>I am telling you this because the arithmetic explains the market. A photographer charging $2,000 is not being generous. They are either newer than they say, shooting three weddings a weekend, or quietly cutting the part of the job you cannot see until the gallery arrives.</p>

<h2>The specific ways a cheap quote gets expensive</h2>
<figure><img src="${CDN}/portfolio/documentary/hotel-corridor-groom.webp" alt="Groom walking away down a hotel corridor"><figcaption>Coverage that ends before the dancing is the most common and most expensive economy.</figcaption></figure>
<p><strong>Coverage that ends too early.</strong> A six-hour package on a wedding that runs from 11am preparation to a 10pm exit means the photographer leaves before the speeches. Couples then buy hours on the day at whatever the overtime rate is, which is always higher than it would have been in the contract.</p>
<p><strong>A second photographer added late.</strong> If the two of you are getting ready in Mississauga and Scarborough, one photographer cannot be in both places. That is not a fact anyone can charm their way around. Booking a second at the start costs about $650; discovering the problem in the final month costs more and limits who is available.</p>
<p><strong>Travel that was never quoted.</strong> The GTA is enormous. A photographer whose base rate assumes a downtown venue and who then adds mileage for Burlington or Whitby has told you the truth late rather than early. Ask where the free radius ends before you sign, not after.</p>
<p><strong>An album that turns out to be an upsell.</strong> "Album included" and "album credit of $750" are very different sentences. The second one has a ceiling you can see.</p>

<h2>Multi-day and cultural weddings are a different calculation</h2>
<figure><img src="${CDN}/home/film-south-asian-couple-red-gold.webp" alt="South Asian couple in a cream sherwani and a red and gold lehenga, seated close"><figcaption>Three days across three venues is not one package with a bigger number on it.</figcaption></figure>
<p>A significant share of GTA weddings are not one day. A Sikh wedding can run from a 6am Anand Karaj to a reception that ends at midnight. A Pakistani celebration frequently spreads mehndi, nikah and walima across three days and three venues. Tamil, Persian, Ethiopian, Jewish and Chinese weddings each have their own order of events and their own single moment that matters more than any other.</p>
<p><strong>Quoting all of that as one flat package is how couples get hurt.</strong> Either they overpay for hours they did not need on the quietest day, or the coverage starts too late on the day that mattered, or the photographer arrives at a three-day wedding with the editing capacity for one and the gallery takes five months.</p>
<p>The right way to price this is by event: how many days, how many venues, how far apart, whether any two events share a day, how many people are in each room, and how much footage that produces to cull and edit. That takes one conversation and produces a number that survives the wedding.</p>

<h2>What I charge, and why it is on the website</h2>
<figure><img src="${CDN}/cities/toronto/muskoka.webp" alt="Couple on a dock in front of a float plane on a Muskoka lake"><figcaption>Muskoka, Niagara and Prince Edward County are all inside a reasonable Toronto radius.</figcaption></figure>
<p>My Toronto collections are $3,500 for six hours, $4,800 for eight, and $6,400 for ten with a second photographer for eight of them. Multi-day weddings are quoted individually and always will be. Every add-on has a published price: a second photographer is $650, an extra hour is $450, an album credit is $750.</p>
<p>Those numbers are on the pricing page because roughly three quarters of couples say price is the thing they most want to know before making contact, and most photographers make them ask for it anyway. Publishing it saves us both the two emails where we discover we were never in the same range.</p>
<p><strong>It also means I cannot quietly quote you differently from the next couple</strong>, which is a discipline worth having.</p>

<h2>How to compare two quotes properly</h2>
<figure><img src="${CDN}/portfolio/editorial/candlelit-head-table.webp" alt="Bride standing at a candlelit head table in a warm panelled room"><figcaption>Ask for a whole wedding, not a portfolio. The portfolio is the best twelve frames of a career.</figcaption></figure>
<p>Ask both photographers for one complete wedding gallery, start to finish. Not a portfolio. A portfolio is the twelve best frames of an entire career and tells you almost nothing about what your Tuesday-afternoon email will produce. A whole gallery shows you the boring middle, the badly lit reception room, the family formals, and whether the person can hold a full day at one standard.</p>
<p>Then ask three questions. What happens if it rains. What is your backup if a camera fails. What is the actual delivery date in writing. The answers separate a professional from a hobbyist faster than any price comparison.</p>
<p>And then, genuinely, pick the person you would be comfortable having in the room at 7am while you are anxious and undercaffeinated. You are hiring a presence for a day that will not repeat, and that part is not a spreadsheet decision.</p>
`,
  },

  /* ───────────────────────────────────────────────────────────── MONTRÉAL ── */
  {
    slug: "wedding-photography-cost-montreal",
    title: "What Wedding Photography Costs in Montréal",
    subtitle:
      "The widest price spread of any Canadian city, and how to read it. Ce que la photographie de mariage coûte vraiment à Montréal.",
    date: "2026-08-12",
    dateDisplay: "August 12, 2026",
    readTime: "7 min read",
    coverImage: `${CDN}/cities/montreal/places/mtl-oldmontreal-bluehour.png`,
    coverAlt: "Couple walking a cobbled Old Montréal street at blue hour",
    excerpt:
      "Montréal has the widest visible price dispersion in Canada: published packages run from about $1,550 to $5,000. Here is what separates the ends of that range, and what bilingual coverage actually changes on the day.",
    topic: "Money",
    city: "montreal",
    body: `
<p><strong>Montréal has the widest visible price spread of any Canadian wedding market.</strong> Published packages run from roughly $1,550 to $5,000, with a median near $3,000. No other city I work in has that much daylight between the bottom and the top.</p>
<p>That is partly a real difference in what is being sold and partly a difference in business model. Volume studios here advertise below $2,000 and can make it work by covering a great many weddings. Established photographers sit between $3,000 and $5,000 and cover far fewer. Both are legitimate businesses. They are not the same purchase.</p>

<h2>Why Montréal prices lower than Toronto</h2>
<figure><img src="${CDN}/cities/montreal/places/mtl-montroyal-dusk.png" alt="Couple embracing on Mont-Royal with the Montréal skyline behind them at dusk"><figcaption>Lower overhead and a smaller radius flow straight through to the price.</figcaption></figure>
<p>The work is the same. The cost of doing it is not. Montréal is geographically compact in a way the GTA is not, so travel between a Griffintown getting-ready and an Old Montréal ceremony is fifteen minutes rather than an hour on the 401. Studio and living costs are lower. Reaching couples costs less, because the market is less crowded with photographers bidding for the same search terms.</p>
<p><strong>That difference is real and I pass it on</strong>, which is why my Montréal collections start at $3,200 rather than the $3,500 I charge in Toronto. Charging Toronto prices for a Montréal wedding would just be arbitrage.</p>

<h2>Working in two languages is not a bonus feature</h2>
<figure><img src="${CDN}/portfolio/documentary/guests-laughing-champagne.webp" alt="Guests laughing together with champagne at the reception"><figcaption>Half the room francophone, half anglophone, and both need to be spoken to properly.</figcaption></figure>
<p>A great many Montréal weddings have a francophone family on one side and an anglophone family on the other. On the day this shows up constantly: calling family groups for formals, getting a grandmother to look up, telling a room to hold still for thirty seconds, working with a notaire, coordinating with a venue whose staff work in French.</p>
<p>A photographer who only operates in English will get through the day. They will also, quietly, be slightly slower at every one of those moments, and slightly further outside the conversations that are actually happening. <strong>I work in French and in English, and nothing gets translated after the fact.</strong> The planning guide, the emails, the day itself: whichever you prefer.</p>

<h2>What the low end of the range is really selling</h2>
<figure><img src="${CDN}/portfolio/film/dim-colonnade-embrace.webp" alt="Couple embracing in a dim colonnade with light coming from the far end"><figcaption>Below about $2,500 in Montréal, something is being economised. It is worth knowing what.</figcaption></figure>
<p>A $1,800 package in Montréal usually means one of three things, and none of them is a scandal as long as you know which one you are buying.</p>
<p><strong>It might be a genuinely new photographer</strong> building a portfolio, in which case you are trading certainty for price, and that is a real trade some couples should make. <strong>It might be a volume studio</strong> where the person who answers your email is not the person who shows up, and the editing is outsourced to a template. <strong>Or it might be a shorter day than you think</strong>, four or five hours, ending before the reception starts.</p>
<p>The question to ask is not "why is this cheap". It is "which of those three is this", and any honest photographer will tell you.</p>

<h2>The Laurentians and the Eastern Townships are a drive, not a destination</h2>
<figure><img src="${CDN}/cities/montreal/jacques-cartier.webp" alt="Couple kissing at the edge of a lake ringed with autumn forest"><figcaption>Mont-Tremblant, Sutton, Bromont and Knowlton are inside the working radius.</figcaption></figure>
<p>Some photographers quote a Mont-Tremblant or Eastern Townships wedding as a destination job with a travel package attached. It is ninety minutes up the autoroute. <strong>I include it, and I say so before you ask.</strong></p>
<p>Québec City is genuinely different: it is a travel day with an overnight, and it is quoted as one. The line I draw is whether the wedding requires a hotel, not whether it happens outside the island.</p>

<h2>A civil ceremony with a notaire is not too small</h2>
<figure><img src="${CDN}/cities/montreal/places/mtl-snow-lane.png" alt="Couple sharing an umbrella in falling snow on a Montréal street of exterior staircases"><figcaption>A six-hour day covers a notaire ceremony, portraits and a long dinner comfortably.</figcaption></figure>
<p>A large share of Québec couples marry in a civil ceremony conducted by a notaire, often with twenty people, often followed by a long dinner rather than a dance floor. Photographers sometimes treat this as a lesser booking. It is not, and it does not get a lesser version of the work.</p>
<p>Six hours covers it properly: the getting ready, the ceremony, an hour of portraits somewhere in Old Montréal or on the mountain, and the first part of dinner. That is my $3,200 collection and it is a complete record of a complete day.</p>

<h2>My Montréal numbers</h2>
<figure><img src="${CDN}/cities/montreal/bic.webp" alt="Couple walking a snowy rocky shoreline at sunset"><figcaption>Winter weddings here photograph better than couples expect, because the light is low all day.</figcaption></figure>
<p>Essential is $3,200 for six hours. Core is $4,200 for eight and includes an engagement session. Signature is $5,600 for ten with a second photographer for six of them. A second photographer on its own is $650, an extra hour is $450, an album credit is $750, and photo with video starts at $2,500 and is quoted from real crew cost.</p>
<p><strong>I am not trying to win the bottom of the Montréal range and I would rather say that plainly.</strong> Below the Essential tier the arithmetic stops working, and what it produces is a photographer who is rushing. If your budget is genuinely under $3,000, there are good newer photographers in this city and I would rather point you at one than sell you a thin version of my own work.</p>
`,
  },

  /* ──────────────────────────────────────────────────────────── VANCOUVER ── */
  {
    slug: "wedding-photography-cost-vancouver",
    title: "What Wedding Photography Costs in Vancouver",
    subtitle:
      "Two products in one city: a Lower Mainland wedding, and a Sea-to-Sky day where access and permits are half the planning.",
    date: "2026-08-12",
    dateDisplay: "August 12, 2026",
    readTime: "8 min read",
    coverImage: `${CDN}/cities/vancouver/lions-gate-bridge-lookout.png`,
    coverAlt: "Bride and groom at the Lions Gate Bridge lookout",
    excerpt:
      "Published Vancouver packages run from about $800 to $7,500, and all-inclusive Whistler days start near $8,500. The gap is not prestige, it is logistics. Here is how to tell which product you are buying.",
    topic: "Money",
    city: "vancouver",
    body: `
<p><strong>Vancouver has the widest published range in the country and the least useful one</strong>, because it is really two markets stacked on top of each other. Packages run from about $800 to $7,500, and Whistler all-inclusive days start near $8,500 once officiant, florals, hair and makeup, planning and travel are bundled in.</p>
<p>Comparing a $2,500 Lower Mainland package to an $8,500 mountain package is comparing a photographer to an event. Both numbers are honest. They are answers to different questions.</p>

<h2>Product one: a Lower Mainland wedding</h2>
<figure><img src="${CDN}/cities/vancouver/locations/deep-cove/01.webp" alt="A beach ceremony at Deep Cove with guests standing and a sailboat on the water"><figcaption>A city wedding here is priced like a city wedding anywhere. Rain is the local variable.</figcaption></figure>
<p>A wedding at a Vancouver hotel, a Burnaby venue, a UBC garden or a North Shore park is priced the way city weddings are priced everywhere: by hours, crew and editing volume. The honest midpoint for eight hours with an experienced solo photographer is between $4,000 and $5,200.</p>
<p>The genuine local difference is weather. Between October and April, a wet ceremony is not the exception here, it is the base case. <strong>Every timeline I build names a specific covered location that I have already looked at</strong>, and I carry the lighting to make an indoor room work when the sky does not cooperate. Rain days frequently produce the better gallery, but only when the backup was decided in advance rather than in a parking lot at 3pm.</p>

<h2>Product two: Sea-to-Sky, Squamish and Whistler</h2>
<figure><img src="${CDN}/cities/vancouver/cypress.webp" alt="Couple in the snow among the conifers on Cypress Mountain"><figcaption>Up the corridor, access and permits stop being details and become the plan.</figcaption></figure>
<p>The corridor is a different job. Travel time has to be counted properly rather than absorbed. Anything on Crown land or in a provincial park needs its permit arranged well before the date, and the process is not fast. Helicopter access, ground transport, and getting a wedding party up a mountain in dresses are all real logistics with real costs.</p>
<p>Some photographers fold all of that into one headline number. <strong>I price it as separate lines, because a number that hides what you are paying for is not a lower number, it is a less legible one.</strong> The photography is the same ladder as a city wedding. Travel, permits and access sit on top of it, itemised.</p>

<h2>Why the $800 packages exist</h2>
<figure><img src="${CDN}/portfolio/documentary/private-door-groom.webp" alt="A door marked PRIVATE with the groom waiting beyond it"><figcaption>The bottom of the Vancouver range is usually a two-hour elopement product, not a wedding day.</figcaption></figure>
<p>The very bottom of the published Vancouver range is almost always a short-form product: two hours, a courthouse or a park ceremony, twenty to fifty images. That is a genuine and useful thing to sell, and for a small ceremony it is the right purchase.</p>
<p>It is simply not comparable to eight hours of full wedding coverage, and it distorts every "average price" you will read about this city. When you see a range this wide, check what the bottom of it includes before you use it as a benchmark.</p>

<h2>What the $8,500 mountain packages include</h2>
<figure><img src="${CDN}/cities/vancouver/whytecliff.webp" alt="Couple seated on the rocks at Whytecliff Park with the islands beyond"><figcaption>All-inclusive means vendors and coordination, not just a better photographer.</figcaption></figure>
<p>An all-inclusive Whistler package that starts around $8,500 typically bundles photography with an officiant, florals, hair and makeup, planning and travel. The photography component of that is usually not $8,500 of photography. It is $4,000 to $5,000 of photography plus several thousand dollars of other people's work and the coordination to make them show up in the right order.</p>
<p>If that is the day you want, it is a reasonable way to buy it, and I will tell you honestly what it costs to build. <strong>If you want photography and you are handling your own vendors, do not pay a bundled price for a service you are performing yourself.</strong></p>

<h2>Fog, rain and the thing nobody tells you</h2>
<figure><img src="${CDN}/portfolio/analogue/rain-umbrella-night-cobbles.webp" alt="Couple under an umbrella on wet cobbles at night"><figcaption>The photographs people remember from BC weddings are disproportionately the wet ones.</figcaption></figure>
<p>Couples getting married here in the shoulder seasons spend months worrying about rain. Then it rains, and the resulting gallery is frequently better than the sunny version would have been. Overcast is the softest, most flattering light there is. Wet pavement doubles every streetlight. Fog on the North Shore does something no lighting setup can buy.</p>
<p><strong>What ruins a wet wedding is not the weather, it is a timeline with no plan in it.</strong> That is a planning failure and it is entirely preventable, which is why the weather backup is part of what you are buying rather than a favour on the day.</p>

<h2>My Vancouver numbers</h2>
<figure><img src="${CDN}/cities/vancouver/locations/lighthouse-park/01.webp" alt="Couple embracing on driftwood at Lighthouse Park with the lighthouse above them"><figcaption>Lighthouse Park, Whytecliff, Deep Cove and Cypress are all inside the normal radius.</figcaption></figure>
<p>Essential is $3,500 for six hours and includes a scouted weather backup. Core is $4,800 for eight, with an engagement session and a location plan. Signature is $6,500 for ten with a second photographer for eight, Sea-to-Sky planning and permits handled.</p>
<p>Travel up the corridor is quoted rather than absorbed. Permits are arranged before the date rather than hoped for. Helicopter access, transport and vendors are separate lines so you can see each one and decline any of them.</p>
`,
  },

  /* ────────────────────────────────────────────────────────── EVERYWHERE ── */
  {
    slug: "how-to-choose-a-wedding-photographer-canada",
    title: "How to Choose a Wedding Photographer in Canada",
    subtitle:
      "Nine questions that separate a professional from a portfolio, and the one request that tells you more than all of them.",
    date: "2026-08-12",
    dateDisplay: "August 12, 2026",
    readTime: "7 min read",
    coverImage: `${CDN}/portfolio/documentary/bridesmaids-hotel-bed.webp`,
    coverAlt: "Bridesmaids getting ready across a hotel bed strewn with clothes",
    excerpt:
      "Most advice about choosing a wedding photographer is about taste. Taste is the easy part. These are the questions that reveal whether someone can actually carry a whole day.",
    topic: "Choosing",
    city: null,
    body: `
<p><strong>Choosing a wedding photographer on taste alone is choosing on the easiest available signal.</strong> Everyone's portfolio looks good. A portfolio is, by construction, the best twelve frames of an entire career, arranged by someone with a strong interest in your booking.</p>
<p>What you actually need to know is whether this person can hold an entire day at one standard, including the badly lit reception room, the family formals nobody enjoys, and the twenty minutes when the schedule collapses. Here is how to find that out.</p>

<h2>Ask for one whole wedding, start to finish</h2>
<figure><img src="${CDN}/portfolio/documentary/hanging-dress-window-guests.webp" alt="The dress hanging in a window with guests toasting in the foreground"><figcaption>The boring middle of a gallery tells you more than any highlight reel.</figcaption></figure>
<p>This is the single most useful request you can make, and it is the one almost nobody makes. Ask to see one complete gallery from a wedding similar in scale to yours: every delivered image, in order, not a selection.</p>
<p>You are looking for consistency. Does the quality hold from 10am to 11pm, or is there a stretch after the ceremony where everything gets flat? Are the family formals competent or clearly rushed? Is the dark reception usable? <strong>A photographer who will not show you a complete gallery is telling you something, and it is worth hearing.</strong></p>

<h2>What happens if it rains</h2>
<figure><img src="${CDN}/portfolio/documentary/rainy-arcade-umbrella-bw.webp" alt="Black and white frame of a couple under an umbrella in a rainy arcade"><figcaption>The right answer names a specific place, not an attitude.</figcaption></figure>
<p>The wrong answer is "we'll make it work" or "rain is good luck". The right answer is a specific covered location at or near your venue that this person has already looked at, plus the lighting they carry to make an interior work.</p>
<p>In most of Canada this is not a hypothetical. In Vancouver between October and April it is close to a coin flip.</p>

<h2>What is your backup if a camera fails</h2>
<figure><img src="${CDN}/portfolio/editorial/mirrored-doors-party-bw.webp" alt="Black and white frame of the wedding party repeated in mirrored doors"><figcaption>Two bodies, dual card slots, and a second photographer who is not a favour.</figcaption></figure>
<p>The answer you want is: two camera bodies on the day, both writing to two memory cards simultaneously, and a plan for a photographer who breaks an ankle in the morning. Professionals have all three. The dual-card detail matters more than it sounds: it is the difference between a corrupted card being an inconvenience and being a catastrophe.</p>
<p>Ask also what happens to the files after the day. The answer should involve at least two physical copies and one off-site, held for a defined period.</p>

<h2>What is the delivery date, in writing</h2>
<figure><img src="${CDN}/portfolio/editorial/whisky-glass-warm-light.webp" alt="Bride holding a whisky glass in warm low light"><figcaption>A number in a contract, not a range in an email.</figcaption></figure>
<p>"Six to eight weeks" in a contract is a commitment. "Usually pretty quick" in an email is not. The single most common complaint about wedding photographers in this country is delivery time, and it is almost always a capacity problem that was visible at booking: someone shooting more weddings than they can edit.</p>
<p>Ask how many weddings they are covering in your month. If the number is more than eight for a solo photographer, ask who is doing the editing.</p>

<h2>Who is actually showing up</h2>
<figure><img src="${CDN}/portfolio/documentary/guests-hands-over-shoulder.webp" alt="Two guests holding hands framed over a shoulder in the crowd"><figcaption>At a studio, the person answering your email is often not the person at your wedding.</figcaption></figure>
<p>At a studio, the person who replies to your enquiry may not be the person at your wedding, and the portfolio you fell in love with may be the work of three different shooters. That is not automatically bad, but it should be explicit. <strong>Ask for the name of the photographer assigned to your date and to see that specific person's complete gallery.</strong></p>

<h2>What is not included</h2>
<figure><img src="${CDN}/portfolio/film/hands-ring-tulle-detail.webp" alt="Hands and a wedding ring resting on a tulle skirt"><figcaption>Travel, permits, albums and tax are the four things that surface late.</figcaption></figure>
<p>Four things routinely surface after signing: travel outside a home radius that was never defined, permits for parks and Crown land, albums that turned out to be an upsell rather than an inclusion, and sales tax on a quoted pre-tax number.</p>
<p>Get all four in the first conversation. A photographer who publishes their add-on prices has already done this for you.</p>

<h2>How do you handle our traditions</h2>
<figure><img src="${CDN}/home/film-south-asian-couple-red-gold.webp" alt="South Asian couple in a cream sherwani and a red and gold lehenga, seated close"><figcaption>Competence here is specific knowledge, not enthusiasm.</figcaption></figure>
<p>If your wedding has a cultural or religious structure, ask what this photographer knows about it specifically. Where do they stand during an Anand Karaj. Do they know that the nikah signing is the frame that matters. Have they photographed a hora, a tea ceremony, a krevati, a baraat arriving late.</p>
<p><strong>Enthusiasm is not competence.</strong> Someone who has never shot your kind of wedding can still do it well, but they should say so and ask you what not to miss, rather than nodding.</p>

<h2>Do you like this person</h2>
<figure><img src="${CDN}/home/grid-couple-laughing-goggles.webp" alt="Bride and groom laughing with their hands held up like goggles over their eyes"><figcaption>You are hiring a presence for a day that does not repeat.</figcaption></figure>
<p>After all of the above, this is the deciding factor and it is not soft. Your photographer will be closer to you than most of your guests, for longer, in the two or three moments of the day where you are most exposed. If you are performing for them, it shows in every frame.</p>
<p>Have the call. Notice whether you relax. That is the answer.</p>

<h2>The question you should not lead with</h2>
<figure><img src="${CDN}/portfolio/editorial/backlit-tender-close.webp" alt="Backlit close portrait of a couple with their foreheads together"><figcaption>Price matters, but it is a filter rather than a decision.</figcaption></figure>
<p>Price. Not because it does not matter, but because it should be public before you ask. If a photographer's range is on their website, you can skip that entire exchange and spend the conversation on the nine questions above.</p>
<p>Mine is on the pricing page for exactly that reason. Find out early whether we are in the same range, and if we are not, we have both saved a week.</p>
`,
  },

  {
    slug: "wedding-day-timeline-that-survives-the-day",
    title: "A Wedding Day Timeline That Survives the Day",
    subtitle:
      "Where the hours actually go, the four places every schedule breaks, and how to build in the slack that saves the light.",
    date: "2026-08-12",
    dateDisplay: "August 12, 2026",
    readTime: "8 min read",
    coverImage: `${CDN}/portfolio/film/golden-hour-bouquets-detail.webp`,
    coverAlt: "Bouquets and a boutonnière held close in golden hour light",
    excerpt:
      "Almost every wedding runs late, and almost always in the same four places. Here is a timeline built around that fact rather than in denial of it.",
    topic: "Planning",
    city: null,
    body: `
<p><strong>Nearly every wedding runs late, and it runs late in the same four places every time.</strong> Hair and makeup overruns. The couple is not ready when the car arrives. Family formals take twice as long as anyone budgeted. And the gap between ceremony and reception disappears into logistics.</p>
<p>A good timeline is not one that assumes none of that will happen. It is one built so that when all four happen, you still get the light.</p>

<h2>Work backwards from sunset, not forwards from breakfast</h2>
<figure><img src="${CDN}/portfolio/film/taper-candle-ceremony.webp" alt="Ceremony lit by a row of tall taper candles"><figcaption>Sunset is the only fixed point in the day. Everything else can move.</figcaption></figure>
<p>Every other item on your schedule is negotiable. Sunset is not. The half hour before it is the best light you will get, and in Canada its time moves by nearly six hours between June and December.</p>
<p><strong>Fix your portrait window first, then build the rest of the day around it.</strong> A June wedding in Vancouver has usable light until nearly ten in the evening, which means portraits can happen after dinner. A late-October wedding in Montréal is dark by six, which means portraits have to happen before the ceremony or not at all. Those are two completely different days and the ceremony time should reflect it.</p>

<h2>Hair and makeup: add ninety minutes</h2>
<figure><img src="${CDN}/portfolio/documentary/bridesmaids-hotel-bed.webp" alt="Bridesmaids getting ready across a hotel bed strewn with clothes"><figcaption>The most reliably underestimated block of the entire day.</figcaption></figure>
<p>Whatever your artist quotes, the real duration is longer. Someone arrives late. A trial that took forty minutes takes an hour on the day because there are six people in the room and a conversation happening. Someone changes their mind about the hair.</p>
<p>The specific fix: <strong>have the person who takes longest go first, and schedule yourself second to last rather than last.</strong> Being finished with twenty minutes spare is the difference between a calm getting-ready sequence and a set of photographs of people being rushed.</p>

<h2>Family formals: eight minutes per configuration, and a list</h2>
<figure><img src="${CDN}/portfolio/documentary/guests-laughing-champagne.webp" alt="Guests laughing together with champagne at the reception"><figcaption>Without a written list this becomes forty minutes of shouting names into a crowd.</figcaption></figure>
<p>This is where timelines die. Couples budget fifteen minutes for family photographs and then produce, on the day, a spontaneous list of twenty-two configurations including "just the cousins" and "everyone from Winnipeg".</p>
<p>The arithmetic is roughly eight minutes per group once you account for finding people, and the finding is the slow part. <strong>Write the list in advance, cap it at twelve groups, and give it to one loud relative from each side</strong> whose job is to produce the named people. Twelve groups with a caller is twenty-five minutes. Twenty-two groups without one is fifty, and it comes directly out of your portrait time.</p>

<h2>The cocktail hour is not an hour</h2>
<figure><img src="${CDN}/portfolio/editorial/candlelit-head-table.webp" alt="Bride standing at a candlelit head table in a warm panelled room"><figcaption>By the time you have been congratulated by everyone, twenty minutes are gone.</figcaption></figure>
<p>On paper the ceremony ends at four and the reception begins at five, giving a clean hour for portraits. In practice the ceremony ends at ten past four, you are then congratulated by a receiving line's worth of people whether or not you planned a receiving line, and the first genuinely free moment is twenty-five past.</p>
<p>Then there is travel, if the reception is elsewhere. <strong>Budget your couple portraits at twenty minutes, not sixty, and then take the extra time as a gift if it appears.</strong> Twenty focused minutes with a photographer who has already scouted where you are standing produces more than an unfocused hour.</p>

<h2>Build one buffer, in one place</h2>
<figure><img src="${CDN}/portfolio/documentary/car-back-seat-teal.webp" alt="Couple resting together in the back seat of a car in teal evening light"><figcaption>Fifteen minutes of nothing, deliberately scheduled, absorbs the whole day's drift.</figcaption></figure>
<p>Scattering five spare minutes across eight items does nothing, because each one gets absorbed silently. One deliberate block of fifteen to twenty minutes, placed immediately before the ceremony, absorbs the accumulated lateness of the entire morning.</p>
<p>It has a second function. It is very often the only quiet the two of you get all day, and couples describe it afterwards as the part they remember. Photographers like it because the frames from it are unlike everything else in the gallery.</p>

<h2>A first look buys you an hour, and costs you something real</h2>
<figure><img src="${CDN}/portfolio/film/doorway-veil-portrait.webp" alt="Bride standing in a doorway with the veil falling the length of the frame"><figcaption>A genuine trade, not an upgrade. Decide it on what you want, not on logistics.</figcaption></figure>
<p>Doing your portraits before the ceremony frees the entire post-ceremony window and is the single most effective schedule fix available. It is also, for some couples, the wrong choice, and I will not pretend otherwise.</p>
<p><strong>What you give up is the specific moment of seeing each other for the first time in front of everyone you love.</strong> What you gain is an hour, a calmer afternoon, and being present at your own cocktail hour. Both are legitimate. Decide it on what you actually want rather than on what is convenient for the schedule, and then let the schedule absorb the consequence.</p>

<h2>Tell your photographer the twenty minutes that matter</h2>
<figure><img src="${CDN}/portfolio/documentary/dark-chapel-candles-aisle.webp" alt="Bride walking a dark chapel aisle lined with candles"><figcaption>If one moment matters more than the rest, say so before the day.</figcaption></figure>
<p>Every wedding has a section that matters more than the others. Sometimes it is the ceremony. Often it is a grandmother who has flown in and is unlikely to be at another family wedding. Sometimes it is fifteen minutes of a dance nobody outside the family would recognise as important.</p>
<p>Say it in advance and say it specifically. A photographer who knows where the weight of the day sits will build the whole timeline to protect it. One who does not will distribute their attention evenly, which is the same as distributing it wrongly.</p>
`,
  },

  {
    slug: "how-far-in-advance-to-book-a-wedding-photographer",
    title: "How Far in Advance to Book a Wedding Photographer",
    subtitle:
      "Nine to eighteen months for a peak Saturday, far less than you think for everything else, and what to do when your date is six weeks away.",
    date: "2026-08-12",
    dateDisplay: "August 12, 2026",
    readTime: "6 min read",
    coverImage: `${CDN}/portfolio/editorial/graphic-marble-floor-bw.webp`,
    coverAlt: "Couple centred on a graphic black and white marble floor",
    excerpt:
      "The booking horizon and the sales cycle are two different clocks, and confusing them is why couples either panic early or lose a date late.",
    topic: "Planning",
    city: null,
    body: `
<p><strong>There are two different clocks here and couples routinely confuse them.</strong> The booking horizon is how far ahead of the wedding people secure a photographer: commonly nine to eighteen months for a peak-season Saturday. The sales cycle is how long it takes from first enquiry to signed contract: usually somewhere between a few hours and seven days.</p>
<p>Confusing the two produces both failure modes. Couples panic eighteen months out about a decision that takes a week, or assume the whole thing is slow and lose a date they had effectively already chosen.</p>

<h2>What actually gets booked out</h2>
<figure><img src="${CDN}/portfolio/film/candlelit-banquet-table.webp" alt="A long banquet table set and lit entirely by candles"><figcaption>Saturdays in June, September and early October are the entire competition.</figcaption></figure>
<p>Almost all the scarcity in Canadian wedding photography is concentrated in a very small number of dates: Saturdays in June, September and the first half of October, plus the long weekends. Those go first and they go early.</p>
<p><strong>A Friday in July, a Sunday in August, or anything between November and April is a completely different market.</strong> Photographers whose Saturdays vanished eighteen months out will often have those dates open eight weeks before. If your date is not a peak Saturday, the received wisdom about booking a year ahead simply does not apply to you.</p>

<h2>Book the venue first, then the photographer</h2>
<figure><img src="${CDN}/cities/toronto/prince-edward-county/cover/01.webp" alt="Couple laughing in a golden grass field in Prince Edward County"><figcaption>The venue sets the date. Everything else follows from it.</figcaption></figure>
<p>The sensible order is venue, then photographer, then everything else. The venue is what actually fixes your date, and a photographer cannot hold a date that does not exist yet. Photographers are usually the second or third vendor booked, roughly alongside the caterer if the venue does not include one.</p>
<p>The one exception is if there is a specific photographer whose work you want more than you want any particular venue. In that case ask them for their open dates and choose your venue from that list. Couples do this more often than you would think and it is not unreasonable.</p>

<h2>Why the decision itself should take about a week</h2>
<figure><img src="${CDN}/portfolio/editorial/panelled-library-gold-chair.webp" alt="Couple in a wood-panelled library with the groom in a gold armchair"><figcaption>Enquiry, reply, call, quote, hold, contract. Seven days is comfortable.</figcaption></figure>
<p>Couples typically contact several photographers in the same category at once, and the response speed of each one shapes the outcome heavily. The sequence that works is: enquire, get a reply the same day, have a twenty-minute call within two or three days, receive one recommended collection with the tiers either side of it, take a short hold on the date, and sign.</p>
<p><strong>Seven days is comfortable. Six weeks of deliberation does not produce a better decision</strong>, it just means the photographer books someone else in the meantime. If you have seen a full gallery, had the call, and liked the person, you already have the information the sixth week was going to give you.</p>

<h2>What a date hold is and is not</h2>
<figure><img src="${CDN}/portfolio/film/lit-interior-close.webp" alt="Couple close together in a warmly lit interior"><figcaption>A courtesy with an expiry, not a reservation.</figcaption></figure>
<p>Most photographers will hold a date informally for a short window while you decide. I hold for 48 hours, and I will tell you if someone else asks about it in the meantime rather than letting you find out afterwards.</p>
<p>A hold is a courtesy and not a booking. <strong>The date is only yours when both a signed contract and a retainer exist</strong>, usually thirty to fifty per cent. Anyone telling you a verbal agreement secures a Saturday in June is being kind rather than accurate.</p>

<h2>If your date is six weeks away</h2>
<figure><img src="${CDN}/portfolio/analogue/spin-blur-overhead-bw.webp" alt="Overhead black and white frame of a spinning dress dissolving into blur"><figcaption>Short-notice dates get filled constantly. Ask, rather than assuming.</figcaption></figure>
<p>Ask anyway. Photographers get cancellations, postponements and gaps, and a good photographer would rather fill an open Saturday than leave it empty. Late bookings are far more common than the planning literature implies.</p>
<p>What you should not expect is a discount for urgency. If anything the reverse is reasonable, because a rushed booking compresses the planning work into less time. But the date being close is not, by itself, a problem.</p>

<h2>What actually changes if you book early</h2>
<figure><img src="${CDN}/portfolio/film/golden-hour-bouquets-detail.webp" alt="Bouquets and a boutonnière held close in golden hour light"><figcaption>The planning, not the photographs, is what early booking buys.</figcaption></figure>
<p>Booking a year out does not make the photographs better on its own. What it buys is planning time: an engagement session with no urgency attached, a venue visit at the right hour of the right season, a timeline built slowly rather than in the final fortnight, and a photographer who has had months to think about your specific day rather than weeks.</p>
<p>That is a real benefit and it is worth having. It is just not the same as the panic the wedding industry sells about dates disappearing, which applies to roughly fifteen Saturdays a year.</p>
`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export const POST_SLUGS = posts.map((p) => p.slug);
