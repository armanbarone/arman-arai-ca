/* The long-form content for each city hub.
 *
 * lib/site.ts holds the commercial facts (prices, regions, areas). This holds
 * the writing: the hero, the venues couples actually book, the season table and
 * the day's shape. Kept separate so a price change never means editing prose.
 *
 * Shape mirrors armanarai.com's service-place hubs, which is why the city pages
 * render with the same hub- classes.
 */

export type Venue = { name: string; where: string; note: string };
export type Season = { months: string; light: string; note: string };
export type Step = { time: string; title: string; body: string };

export type HubContent = {
  kicker: string;
  coord: string;
  tagline: string;
  lead: string[];
  stats: { k: string; v: string }[];
  /** The "what makes me different here" block: three claims with substance. */
  different: { title: string; body: string }[];
  venuesIntro: string;
  venues: Venue[];
  seasonIntro: string;
  seasons: Season[];
  dayIntro: string;
  day: Step[];
  colophon: string;
};

export const HUBS: Record<string, HubContent> = {
  montreal: {
    kicker: "Québec · Canada · Wedding Photographer",
    coord: "45.50°N · 73.57°W",
    tagline:
      "Home. Everything within 75 km included, no travel line on the quote, and a photographer who has already seen your venue's light.",
    lead: [
      "Montréal is the easiest city in the country to photograph a wedding in and the hardest to photograph well. Easy because it is compact: a Griffintown getting-ready, an Old Montréal ceremony and a Mile End reception are fifteen minutes apart, not an hour on a highway. Hard because the light changes character four times a year and the buildings that make the city beautiful are the same ones that put your ceremony in deep shade at four in the afternoon.",
      "I live here, which mostly means I have already made the mistakes. I know which side of Place d'Armes is lit at five in July and which at five in October, that the Plateau's exterior staircases photograph best in falling snow, and that a January wedding has better light all day than a July one because the sun never gets high enough to go harsh.",
    ],
    stats: [
      { k: "Best months", v: "May to Oct, and January" },
      { k: "Travel", v: "Included to Québec City" },
      { k: "Working language", v: "English" },
      { k: "Core collection", v: "C$4,000" },
    ],
    different: [
      {
        title: "I live here, which is the whole difference",
        body: "I have already made the mistakes at your venue. Which side of the courtyard is lit at five in July and which at five in October, which rooms lose the light an hour before anyone expects, and which street is worth the ten-minute walk in falling snow. A photographer flying in cannot have that, and it is why this is the only market with no travel charge.",
      },
      {
        title: "No travel line, ever, inside 75 km",
        body: "The island, Laval, the South Shore, out past Saint-Jérôme and Saint-Hyacinthe. Your quote is the collection price and nothing else. Photographers who add mileage to a Longueuil venue are telling you the truth late rather than early.",
      },
      {
        title: "Winter is not a compromise here",
        body: "A January wedding in Montréal has soft, low, sideways light from ten in the morning until it goes. Snow is a giant reflector. I will not talk you out of a winter date and I will bring the boots to shoot it properly.",
      },
    ],
    venuesIntro:
      "Rooms I have worked in or scouted, and what each one actually does to a photograph. This is not a vendor list; it is where the light is.",
    venues: [
      { name: "Vieux-Montréal", where: "Old Montréal", note: "Cobbles, stone and gas lamps. Best at blue hour, when the street lighting does more work than the sky." },
      { name: "Mont-Royal", where: "Plateau / Outremont", note: "The city skyline behind you at dusk. Twenty minutes from almost any downtown venue and the single most reliable portrait spot in the city." },
      { name: "The Plateau", where: "Plateau Mont-Royal", note: "Exterior staircases, brick, murals. It photographs best in weather, so it is the winter backup that is actually better than the plan." },
      { name: "Jean-Talon and Little Italy", where: "Rosemont", note: "Colour and crowds. For couples who want the day to look like the city rather than a set." },
      { name: "The Laurentians", where: "90 minutes north", note: "Lakes, chalets and hard autumn colour in late September. A drive and a night, and inside the Montréal price rather than beside it." },
      { name: "Eastern Townships", where: "Sutton, Bromont, Knowlton", note: "Vineyards and low hills. Same drive, same number, and a very different palette from the Laurentians." },
    ],
    seasonIntro: "When to get married here, judged only on what it does to the photographs.",
    seasons: [
      { months: "May to June", light: "Long, soft, green", note: "The most forgiving light of the year and the busiest Saturdays. Book eighteen months out." },
      { months: "July to August", light: "High and hard until 6pm", note: "Beautiful evenings, difficult afternoons. We move portraits late and plan shade for the ceremony." },
      { months: "September to October", light: "Low, gold, short", note: "My favourite. Colour in the Laurentians from the last week of September, and sunset early enough to fit portraits before dinner." },
      { months: "November to April", light: "Low all day", note: "Underrated. Snow reflects, the sun never climbs, and Old Montréal in falling snow is the best set the city has." },
    ],
    dayIntro:
      "A Core wedding, eight hours, in the shape it usually takes here. Yours will differ; the arithmetic will not.",
    day: [
      { time: "Hour 1–2", title: "Getting ready", body: "Two rooms if you are in two rooms, which is when a second photographer stops being optional. Details early, while the room is still tidy." },
      { time: "Hour 3", title: "First look, or not", body: "If you do one, it buys back the entire post-ceremony hour. If you do not, we take that hour out of the cocktail and I will say so in advance." },
      { time: "Hour 4", title: "Ceremony", body: "I do not interrupt it. Whatever happens, happens once, and a repositioned blessing is a worse blessing." },
      { time: "Hour 5", title: "Family, then the two of you", body: "Twelve groups, capped, from a written list, with one loud relative per side calling names. Twenty-five minutes instead of fifty." },
      { time: "Hour 6", title: "Portraits", body: "Twenty focused minutes somewhere I have already looked at, in the light we planned around." },
      { time: "Hour 7–8", title: "Dinner and the first dance", body: "Speeches, the room, the people who came. Coverage that ends before the dancing is the most expensive economy there is." },
    ],
    colophon:
      "Based in Montréal. Available anywhere in Canada, with the price for each place published rather than quoted after you commit.",
  },

  toronto: {
    kicker: "Ontario · Canada · Wedding Photographer",
    coord: "43.65°N · 79.38°W",
    tagline:
      "The densest wedding market in the country, and the one most often quoted badly. Multi-day celebrations are scoped event by event, not sold as one flat package.",
    lead: [
      "Toronto weddings are rarely a single afternoon. A Sikh wedding runs from an early Anand Karaj to a reception that ends near midnight. A Pakistani celebration spreads mehndi, nikah and walima across three days and often three venues. Tamil, Persian, Ethiopian, Jewish and Chinese weddings each carry their own order of events and their own single moment that matters more than all the others.",
      "Quoting that as one flat number is how couples get hurt: either they pay for hours they did not need on the quietest day, or coverage starts too late on the day that mattered, or a photographer arrives at a three-day wedding with the editing capacity for one and the gallery takes five months. I scope by event, and I come in the day before so I have seen your venue in daylight before the wedding.",
    ],
    stats: [
      { k: "Best months", v: "May to Oct" },
      { k: "Multi-day", v: "Quoted by event" },
      { k: "Second shooter", v: "Included on Signature" },
      { k: "Core collection", v: "C$4,000" },
    ],
    different: [
      {
        title: "Cultural competence, stated specifically",
        body: "I will tell you where I stand during an Anand Karaj, that the nikah signing is the frame that matters, and what I have and have not photographed before. Enthusiasm is not competence, and a photographer who nods at everything is a photographer who will miss something.",
      },
      {
        title: "Multi-day is quoted, not estimated",
        body: "Days, venues, distance between them, whether two events share a day, and how many people are in each room. That decides crew, travel and editing volume, which is where the cost actually lives. One quote, itemised, and an extra two-hour event is C$900.",
      },
      {
        title: "I arrive the day before",
        body: "Coming in from Montréal means a hotel night is already in the price, which means I am rested and I have walked your venue in daylight. Photographers who live twenty minutes away frequently do neither.",
      },
    ],
    venuesIntro:
      "The GTA is enormous and the good light is not where the tourists are. These are the places couples here actually get married, and what each does to a frame.",
    venues: [
      { name: "Distillery District", where: "Downtown east", note: "Brick, iron and string lights. Crowded until it is not; the last hour before it opens is the whole trick." },
      { name: "Evergreen Brick Works", where: "Don Valley", note: "Industrial frames and real green in the middle of the city. The best rain backup in Toronto." },
      { name: "The Aga Khan Museum", where: "Don Mills", note: "White stone and hard geometry. Extraordinary at midday, which is when almost nothing else works." },
      { name: "Casa Loma and Spadina House", where: "Midtown", note: "For the couples who want the day to look like a period film. Book the light, not the room." },
      { name: "Niagara-on-the-Lake", where: "90 minutes south", note: "Vineyards and the Floral Showhouse glasshouse. Inside the Toronto price, so a winery Saturday costs what a downtown one costs." },
      { name: "Muskoka and Prince Edward County", where: "2 to 3 hours out", note: "Docks, lakes, float planes and long grass. Same region, same number, and worth the drive." },
    ],
    seasonIntro: "Ontario gives you a long season and one genuinely difficult month.",
    seasons: [
      { months: "May to June", light: "Long and green", note: "Peak. Saturdays go eighteen months ahead and the good venues go further out than that." },
      { months: "July to August", light: "Hot and high", note: "Humidity is the real problem, not the sun. Indoor ceremonies and late portraits." },
      { months: "September to October", light: "Gold, and colour", note: "The best month in the province is the first two weeks of October, and everyone knows it." },
      { months: "November to April", light: "Short and grey", note: "Weekday and off-season rates open up everywhere. Grey is soft light, and I will show you what that looks like." },
    ],
    dayIntro:
      "A single-day Core wedding in the GTA. A multi-day celebration is built differently and quoted separately.",
    day: [
      { time: "Hour 1–2", title: "Getting ready, often two cities", body: "Mississauga and Scarborough are not one location. This is where a second photographer stops being a luxury." },
      { time: "Hour 3", title: "Travel, honestly costed", body: "The 401 on a June Saturday is a real number in the timeline, not an optimistic one." },
      { time: "Hour 4", title: "Ceremony", body: "Whatever the tradition, I have asked in advance which twenty minutes you would be heartbroken to lose, and I am standing where those happen." },
      { time: "Hour 5", title: "Family formals", body: "Capped at twelve groups from a written list. A large GTA family will produce twenty-two if nobody stops it." },
      { time: "Hour 6", title: "Portraits", body: "Twenty minutes, scouted in advance, in the light we built the day around." },
      { time: "Hour 7–8", title: "Reception", body: "Speeches, the dances that matter, the room. Off-camera flash once it goes dark, because a dark room is not an excuse." },
    ],
    colophon:
      "Toronto and the GTA, from Burlington to Whitby, plus Niagara, Muskoka and Prince Edward County. Travel is already in the number on this page.",
  },

  vancouver: {
    kicker: "British Columbia · Canada · Wedding Photographer",
    coord: "49.28°N · 123.12°W",
    tagline:
      "Three products in one region: a Lower Mainland wedding, a Sea-to-Sky or Whistler day, and Vancouver Island. They differ by access and weather, not by how the photographs are made.",
    lead: [
      "Vancouver gives you more visual range in an hour's drive than anywhere else in the country: a rainforest ten minutes from downtown, a driftwood beach with the North Shore mountains behind it, a gondola to a summit, and a city that photographs like a different continent in the rain.",
      "The local skill is not finding beauty, it is planning around weather. Between October and April a wet ceremony is the base case, not the exception. Every timeline I build names a specific covered location I have already looked at, and I carry the lighting to make an interior work. Rain days frequently produce the better gallery, but only when the backup was decided in advance rather than in a parking lot at three in the afternoon.",
    ],
    stats: [
      { k: "Best months", v: "Jun to Sep" },
      { k: "Rain plan", v: "Scouted, not improvised" },
      { k: "Island and Whistler", v: "Same price" },
      { k: "Core collection", v: "C$4,500" },
    ],
    different: [
      {
        title: "The rain plan is a place, not an attitude",
        body: "Not \"we'll make it work\" and not \"rain is good luck\". A named covered location at or near your venue that I have physically looked at, plus the lighting to make an indoor room work. In this city that is the difference between a gallery and an apology.",
      },
      {
        title: "Permits handled before the date",
        body: "A ceremony in a provincial park or on Crown land needs a permit and the process is slow. I arrange it rather than hoping nobody asks. Helicopter access, ground transport and vendors are quoted as their own lines so you can decline any of them.",
      },
      {
        title: "Whistler and the Island cost the same as Vancouver",
        body: "They are the same trip: the flight, the nights and the ground transport are already in the number. Tofino is the one exception I will flag honestly, because it wants an extra night and therefore the two-day collection.",
      },
    ],
    venuesIntro:
      "Where couples here actually get married, and what the place does to a photograph once the weather has had its say.",
    venues: [
      { name: "Stanley Park", where: "Downtown", note: "Old-growth rainforest ten minutes from a hotel lobby. Overcast is its best light, which is convenient." },
      { name: "Lighthouse Park", where: "West Vancouver", note: "Driftwood, granite and the lighthouse. A short scramble in a gown, so shoes matter." },
      { name: "Whytecliff Park", where: "West Vancouver", note: "Rock shelves and islands offshore. The most reliable sunset in the Lower Mainland." },
      { name: "Deep Cove", where: "North Vancouver", note: "A working cove with boats and mountains. Good for a real ceremony with guests standing on sand." },
      { name: "Sea-to-Sky and Whistler", where: "60 to 100 minutes north", note: "Gondolas, alpine and glacier light. Same price as Vancouver, and permits arranged in advance." },
      { name: "Vancouver Island and Tofino", where: "Ferry, then the highway", note: "Storm season on the west coast is a genuine reason to get married in November. Outside the published region, so quoted against your venue." },
    ],
    seasonIntro:
      "The one market in Canada where the season question is really a rain question.",
    seasons: [
      { months: "June to August", light: "Long, dry, bright", note: "The dry window, and the reason Vancouver Saturdays disappear first. Portraits go late; sunset is near ten in June." },
      { months: "September", light: "Gold and still dry", note: "The best single month in the region. Warm light, thin crowds, and the weather has not turned yet." },
      { months: "October to April", light: "Soft, grey, wet", note: "Expect rain and plan for it. Overcast is the most flattering light there is and wet pavement doubles every streetlight." },
      { months: "Whistler in winter", light: "Blue and short", note: "Snow, blue hour at four, and a completely different day. Worth it if you actually want winter rather than tolerate it." },
    ],
    dayIntro:
      "A Core wedding in the Lower Mainland. A Sea-to-Sky or Island day adds travel time and usually wants ten hours.",
    day: [
      { time: "Hour 1–2", title: "Getting ready", body: "Hotel or house. Details first, then people, then the room once it is calm." },
      { time: "Hour 3", title: "The weather call", body: "By now we know which plan we are on. Both were scouted, so neither is a scramble." },
      { time: "Hour 4", title: "Ceremony", body: "Permit in hand where the site needs one. Guests seated, and I stay out of the aisle." },
      { time: "Hour 5", title: "Family formals", body: "Under cover if it is wet, which is another reason the covered location gets chosen in advance." },
      { time: "Hour 6", title: "Portraits", body: "Twenty minutes at the water or in the trees, timed to the light rather than the schedule." },
      { time: "Hour 7–8", title: "Reception", body: "Dinner, speeches, dancing. Flash after dark, and the background drops to black on purpose." },
    ],
    colophon:
      "Vancouver, the North Shore, the Sea-to-Sky corridor, Whistler and Vancouver Island, all inside one published price.",
  },
};

export const hubBySlug = (slug: string) => HUBS[slug];
