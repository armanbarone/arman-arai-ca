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
  whistler: {
    kicker: "British Columbia · Canada · Wedding Photographer",
    coord: "50.12°N · 122.95°W",
    tagline:
      "Ninety minutes north of Vancouver and inside the same published price. Mountain scale without a separate invoice for reaching it.",
    lead: [
      "Whistler gives you altitude, which is the one thing the Lower Mainland cannot. Glacier light on the peaks at seven in the evening, alpine meadows above the tree line, and a valley that holds snow when Vancouver is green. It is the most vertical wedding landscape in the country that you can still reach by road.",
      "The catch is that the mountain runs the day rather than the other way around. Lifts hold for wind without warning, cloud sits on the peaks for days at a stretch, and a wedding party moves up a gondola far more slowly than anybody plans for. Everything I do here is built around that rather than in denial of it.",
    ],
    stats: [
      { k: "Best months", v: "Jun to Sep, and February" },
      { k: "Price", v: "Same as Vancouver" },
      { k: "Lift risk", v: "Planned for, not hoped about" },
      { k: "Core collection", v: "C$4,500" },
    ],
    different: [
      {
        title: "The same number as a Vancouver Saturday",
        body: "Whistler, Squamish and Pemberton are inside the published Vancouver region. Core is C$4,500 here exactly as it is in Kitsilano, and the drive up the corridor is already inside it. Photographers who add a Sea-to-Sky surcharge are charging you for their own commute.",
      },
      {
        title: "A valley plan, named before the date",
        body: "Every corridor timeline I build carries a second ceremony site at valley level, chosen and looked at in advance, in case the lift is held. It costs nothing to have and it is the difference between a wedding and ninety minutes in a lift queue.",
      },
      {
        title: "Winter is a real option here",
        body: "February gives you genuine snow, blue hour at four in the afternoon, and a completely different set of photographs from the July version. It works if you actively want winter rather than tolerating it, and if everybody owns boots.",
      },
    ],
    venuesIntro:
      "Where couples up here actually get married, and what each place asks of the schedule.",
    venues: [
      { name: "Fairmont Chateau Whistler", where: "Upper Village", note: "The largest room in the corridor, at the foot of Blackcomb. Everything walkable, and a wet-weather plan that is the room next door." },
      { name: "Nita Lake Lodge", where: "Creekside", note: "Lakeside, quieter, and small enough that the whole day stays in one place. The dock at the end of the evening is the frame people remember." },
      { name: "Audain Art Museum", where: "Whistler village", note: "Concrete, glass and rainforest through the windows. The most architectural room in the mountains, and it photographs beautifully in flat light." },
      { name: "Sea to Sky Gondola", where: "Squamish, 40 minutes south", note: "A suspension bridge above the sound, ten minutes of ascent, and half the drive of Whistler. Underrated for exactly that reason." },
      { name: "Green Lake and Lost Lake", where: "Whistler valley", note: "Road-accessible water with the peaks behind. Where the ceremony goes when the alpine is socked in." },
      { name: "The alpine, above the lift", where: "Whistler and Blackcomb", note: "Spectacular, and entirely at the mercy of the mountain. Worth it, with the valley site named in advance." },
    ],
    seasonIntro: "The corridor has two seasons worth having and two worth avoiding.",
    seasons: [
      { months: "June to August", light: "Long, dry, alpine", note: "The dry window. Sunset near ten in June, wildflowers above the tree line in late July, and the busiest lodging of the year." },
      { months: "September", light: "Gold and thin", note: "The best single month. Warm light, crowds gone, and the first colour on the slopes without any snow to complicate access." },
      { months: "December to March", light: "Blue and short", note: "Real winter. Blue hour at four, snow on everything, and a village that is fully awake. Choose it deliberately or not at all." },
      { months: "May and November", light: "Grey and between", note: "The two months I would talk you out of. The alpine is neither snow nor open, and the odds of a textureless day are the highest of the year." },
    ],
    dayIntro:
      "A Core wedding in the corridor. The mountain gets a vote, so the schedule carries slack where it matters.",
    day: [
      { time: "Hour 1–2", title: "Getting ready", body: "Usually the hotel, which is the whole argument for a village venue. No transfers, no weather exposure, and the light through those windows is good until noon." },
      { time: "Hour 3", title: "The mountain call", body: "By now we know whether the lift is running and whether the peak is in cloud. Both plans were scouted, so this is a decision rather than a scramble." },
      { time: "Hour 4", title: "Ceremony", body: "Alpine or valley, whichever the morning gave us. Permits sorted well in advance where the site needs one." },
      { time: "Hour 5", title: "Family, then the two of you", body: "Twelve groups from a written list. Altitude and wind make this faster than anyone expects, because nobody wants to linger." },
      { time: "Hour 6", title: "Portraits", body: "Twenty minutes at a lake or above the tree line, timed to the light rather than to the schedule." },
      { time: "Hour 7–8", title: "Dinner and the room", body: "Speeches and the dances that matter. Nobody is driving home, so the night runs later here than almost anywhere else I work." },
    ],
    colophon:
      "Whistler, Squamish and Pemberton, inside the published Vancouver price. The corridor drive is already in the number.",
  },

  tofino: {
    kicker: "British Columbia · Canada · Wedding Photographer",
    coord: "49.15°N · 125.91°W",
    tagline:
      "The open Pacific, old-growth rainforest, and a journey long enough that it becomes part of the wedding rather than a detail before it.",
    lead: [
      "Tofino is the far edge of the country and it feels like it. Beaches that run for kilometres, surf that does not stop, and rainforest that comes down to the sand. The light out there is soft almost all the time, because there is usually something between you and the sun, and that is exactly why the photographs look the way they do.",
      "It is also a long way. A ferry, a drive, and then three hours of mountain highway across the middle of Vancouver Island. That distance is not an inconvenience to be minimised, it is the thing that decides your guest list, your Friday, and which collection is honest for your day.",
    ],
    stats: [
      { k: "Best months", v: "Jun to Sep, and November" },
      { k: "From Vancouver", v: "Seven hours, door to door" },
      { k: "Price", v: "Quoted, not published" },
      { k: "Best collection", v: "Story Weekend" },
    ],
    different: [
      {
        title: "The travel gets planned first",
        body: "Ferry sailings fill in summer and a missed one is a two-hour problem, not a twenty-minute one. I come over the day before as a rule, and your guests should too. Every timeline out here starts from the crossing rather than from the ceremony.",
      },
      {
        title: "Quoted against your venue, not averaged",
        body: "Victoria is a ferry and a short drive. Tofino is that plus three hours of highway and another night. One published number would be wrong for both, so I price your actual wedding instead of publishing an average that flatters neither.",
      },
      {
        title: "Storm season is a real recommendation",
        body: "November on the west coast is the best value date in British Columbia. Low cloud, spray, wet sand mirroring everything, and nobody else on the beach. You will be cold and the gallery will not look like anyone else's.",
      },
    ],
    venuesIntro:
      "Four different islands, depending which part of it you choose. Here is what each gives a photograph.",
    venues: [
      { name: "Wickaninnish Inn", where: "Chesterman Beach, Tofino", note: "On the rock at the end of the beach, with the Pacific on three sides. The definitive west coast room, and the one the weather is most visible from." },
      { name: "Long Beach Lodge", where: "Cox Bay, Tofino", note: "Surf out of every window and a great room built around a fire. Better in a storm than in sunshine, which is the correct way round out here." },
      { name: "Chesterman and Long Beach", where: "Tofino", note: "Kilometres of hard sand at low tide. Check the tide table before setting the ceremony time, not after." },
      { name: "Hatley Castle", where: "Colwood, near Victoria", note: "Edwardian stone, formal gardens and Italianate terraces. The most composed set on the island, and an hour from the ferry." },
      { name: "The Cowichan Valley", where: "An hour north of Victoria", note: "Farmland, wineries and warm light. The gentlest version of an island wedding, and the easiest for guests." },
      { name: "The Gulf Islands", where: "A second ferry", note: "Genuinely private, and capped by what the island can sleep. A small guest list is not a compromise here, it is the format." },
    ],
    seasonIntro: "The west coast has a dry season and a dramatic one, and both are worth booking.",
    seasons: [
      { months: "June to September", light: "Soft, long, marine", note: "The dry window, and the only one guests will thank you for. Sunset late, water warm enough to stand in, and every bed on the coast spoken for." },
      { months: "October", light: "Low and gold", note: "The overlap. Summer light with autumn quiet, and the first swells starting to arrive. My pick if you can only choose once." },
      { months: "November to February", light: "Grey, wet, enormous", note: "Storm season. Genuinely spectacular and genuinely uncomfortable, and the reason people build hotels facing that water." },
      { months: "March to May", light: "Variable", note: "Rain without the drama of a real storm. The one stretch I would steer you away from." },
    ],
    dayIntro:
      "A Story Weekend on the west coast, which is what I recommend here almost every time.",
    day: [
      { time: "Friday", title: "Everyone arrives", body: "Two hours of welcome coverage. People have driven a long way and the first evening is frequently the warmest part of the whole weekend." },
      { time: "Hour 1–2", title: "Saturday morning", body: "Slow, and usually indoors with the weather doing something worth photographing through the glass." },
      { time: "Hour 3", title: "The tide call", body: "Low tide decides where the ceremony and the portraits can physically happen. This was checked months ago and confirmed that morning." },
      { time: "Hour 4", title: "Ceremony", body: "On the sand if the tide and the wind allow, under cover if they do not. Both sites named in advance." },
      { time: "Hour 5–6", title: "The beach", body: "Twenty minutes at the water with the wind doing most of the work. Shoes come off and stay off." },
      { time: "Hour 7–10", title: "The long evening", body: "Dinner by a fire, and nobody driving anywhere. West coast receptions run late because there is nowhere else to be." },
    ],
    colophon:
      "Tofino, Ucluelet, Victoria, the Cowichan Valley and the Gulf Islands, quoted against your venue and your date.",
  },

  banff: {
    kicker: "Alberta · Canada · Wedding Photographer",
    coord: "51.18°N · 115.57°W",
    tagline:
      "The most photographed mountains in the country. What decides your day is permits, shuttle access and how early you are willing to get up.",
    lead: [
      "Banff compresses more landscape into forty minutes of driving than anywhere else in Canada. Moraine Lake, Lake Louise, the Vermilion Lakes, Two Jack, Emerald Lake over in Yoho, and the Bow Valley Parkway connecting most of it. Glacial rock flour turns that water a colour no editing produces, and the mountains sit close enough to fill the frame behind two people standing still.",
      "It is also the busiest national park in the country, and that is the real planning problem. Moraine Lake is shuttle access only. Lake Louise has a good hour before the coaches and a difficult six after. A ceremony on Parks Canada land needs a permit that is slow, seasonal and capped by site. None of that is a reason to go elsewhere; all of it is a reason to plan properly.",
    ],
    stats: [
      { k: "Best months", v: "Jun to Sep, late Sep for larches" },
      { k: "Permits", v: "Parks Canada, arranged early" },
      { k: "Moraine Lake", v: "Shuttle access only" },
      { k: "Price", v: "Quoted, not published" },
    ],
    different: [
      {
        title: "The permit is handled, not hoped about",
        body: "A ceremony on Parks Canada land needs a site-specific permit, and the process is slow and capped. It is the single most common reason a Rockies plan collapses in the final month. I need your site months out and I do the paperwork rather than leaving it in your inbox.",
      },
      {
        title: "I plan around the shuttle, not against it",
        body: "Moraine Lake cannot be reached by private vehicle. For two people that is a sunrise trip worth making. For a wedding party of twelve it is a fight. I will tell you which of those you are before you build a day around a photograph you saw online.",
      },
      {
        title: "The good hour is early, and I will say so",
        body: "Lake Louise before the coaches is a different lake from Lake Louise at eleven. If the frame you want is the empty one, the answer is a sunrise session the morning after the wedding, not a mid-afternoon slot squeezed between family photos.",
      },
    ],
    venuesIntro:
      "Rooms and shorelines that actually host weddings here, and what each one demands.",
    venues: [
      { name: "Fairmont Banff Springs", where: "Banff townsite", note: "The castle in the valley. Carries its own permissions, has interiors for any weather, and photographs like nowhere else in the country after dark." },
      { name: "Fairmont Chateau Lake Louise", where: "Lake Louise", note: "That water, from the lawn. The most recognisable view in Canada and the busiest, so the ceremony hour matters more than the room does." },
      { name: "The Rimrock Resort", where: "Sulphur Mountain", note: "Above the town, looking down the valley. The best sunset terrace in Banff and a genuinely dark room for the reception." },
      { name: "Buffalo Mountain Lodge", where: "Tunnel Mountain", note: "Timber, stone and fireplaces. Smaller, warmer, and the one I recommend for a wedding under sixty people." },
      { name: "Emerald Lake Lodge", where: "Yoho, 40 minutes west", note: "Over the BC line and worth the drive. An island lodge on green water with no through traffic at all." },
      { name: "Moraine Lake and the Vermilion Lakes", where: "Banff National Park", note: "Portrait ground rather than venues. Moraine is shuttle only; the Vermilion Lakes are five minutes from town and criminally underused." },
    ],
    seasonIntro: "A short alpine season, one spectacular fortnight, and a winter worth considering.",
    seasons: [
      { months: "June to August", light: "Long and high", note: "The full season. Everything is open, everything is busy, and hotel rates north of C$450 a night are normal in July." },
      { months: "Late September", light: "Gold and low", note: "Larch season, and about two weeks of it. The alpine turns gold, the crowds thin, and the light is usable all afternoon. The best fortnight in the Rockies." },
      { months: "October to April", light: "Blue and short", note: "Snow, frozen lakes and a completely different park. Access narrows, some roads close, and the photographs are extraordinary." },
      { months: "May", light: "Brown and between", note: "The one month I would talk you out of. The snow has gone, the green has not arrived, and the lakes are still thawing." },
    ],
    dayIntro:
      "A mountain wedding day, built around the light and the access rather than a venue clock.",
    day: [
      { time: "Hour 1–2", title: "Getting ready", body: "Usually in the hotel, and usually with a mountain through the window doing half the work for free." },
      { time: "Hour 3", title: "First look, or the drive", body: "If the ceremony is out at a lake, this hour is transport. Counted honestly, including the parking situation." },
      { time: "Hour 4", title: "Ceremony", body: "Permit in hand where the site needs one. Guests seated, and the mountains doing what mountains do." },
      { time: "Hour 5", title: "Family formals", body: "Capped at twelve groups. Altitude, wind and cold make this quick if it is organised and miserable if it is not." },
      { time: "Hour 6", title: "Portraits", body: "Twenty minutes at water we chose for that hour, not for its reputation." },
      { time: "Hour 7–8", title: "Dinner and the night", body: "Speeches and dancing. If the sky is clear I will steal you for four minutes after dark, because the stars here are worth it." },
    ],
    colophon:
      "Banff, Lake Louise, Moraine Lake, Canmore, Kananaskis and Yoho. Quoted against your venue and your date.",
  },

  jasper: {
    kicker: "Alberta · Canada · Wedding Photographer",
    coord: "52.87°N · 118.08°W",
    tagline:
      "The quieter half of the Rockies, three hours north of Banff, under a designated dark-sky preserve.",
    lead: [
      "Jasper is what Banff was before everyone found it. The same glacial water, the same scale, and a fraction of the traffic. Maligne Lake on a weekday morning is genuinely quiet, which is a sentence that has not been true of Lake Louise in a decade. The park is also larger and emptier, so the landscape arrives without a queue in front of it.",
      "What it costs is distance. Everything up here is further apart than the map suggests, the Icefields Parkway between the two parks is three hours with no shortcuts, and for long stretches there is no signal at all. Guests need telling that plainly before they book flights, because a Jasper wedding is a commitment rather than a weekend away.",
    ],
    stats: [
      { k: "Best months", v: "Jun to Sep" },
      { k: "From Banff", v: "Three hours, no shortcut" },
      { k: "Overhead", v: "Dark-sky preserve" },
      { k: "Price", v: "Quoted, not published" },
    ],
    different: [
      {
        title: "Quiet is the actual product",
        body: "You are not paying the extra drive for different mountains. You are paying it for mountains with nobody in front of them. If a photograph of the two of you alone at a glacial lake matters more than convenience, this is where it happens.",
      },
      {
        title: "The dark sky is real and I plan for it",
        body: "Jasper is a designated dark-sky preserve. On a clear moonless night the Milky Way is visible to the naked eye from the lakeshore. I check the moon phase against your date months ahead and tell you honestly in the final week whether it is on.",
      },
      {
        title: "The distances get counted, not glossed",
        body: "Maligne Lake is fifty minutes from the townsite on a road with wildlife on it. Athabasca Falls is thirty the other way. A timeline that treats those as fifteen-minute hops falls apart by mid-afternoon, so mine does not.",
      },
    ],
    venuesIntro:
      "Fewer rooms than Banff, and more shoreline. What each one is actually for.",
    venues: [
      { name: "Fairmont Jasper Park Lodge", where: "Lac Beauvert", note: "Cabins around a lake rather than a tower. The main lodge handles a full wedding and the shoreline handles everything else." },
      { name: "Pyramid Lake Lodge", where: "10 minutes from town", note: "Pyramid Island is reached by a footbridge and is the single best ceremony site in the park. Small, and it books early." },
      { name: "Maligne Lake", where: "50 minutes east", note: "The postcard, and a genuine drive. Best treated as a morning-after session rather than squeezed into the wedding day." },
      { name: "Athabasca Falls", where: "30 minutes south", note: "Loud, fast water in a limestone gorge. Dramatic, crowded at midday, and empty by seven in the evening." },
      { name: "The Icefields Parkway", where: "South toward Banff", note: "Ninety minutes of the best road in Canada. Worth an hour of portraits if your schedule can carry it." },
      { name: "Lac Beauvert and the townsite", where: "Jasper", note: "Where a wedding actually runs. Everything walkable, which matters more here than it does anywhere else." },
    ],
    seasonIntro: "A short season, and a genuine reason to consider the shoulder.",
    seasons: [
      { months: "June to August", light: "Long and open", note: "The full season, with sunset near ten in June. Even at peak, quieter than Banff in May." },
      { months: "September", light: "Gold, sharp, cold at night", note: "The best month. Colour on the slopes, the elk rut, and skies that clear properly once the summer haze goes." },
      { months: "October to April", light: "Blue and very short", note: "Deep winter. Frozen lakes, ice caves and almost nobody. A serious undertaking for guests, and unforgettable if they come." },
      { months: "May", light: "Between seasons", note: "Thaw. Brown ground, high water, and the least photogenic fortnight of the year." },
    ],
    dayIntro:
      "A Jasper day, with the driving counted honestly and the sky as a scheduled event.",
    day: [
      { time: "Hour 1–2", title: "Getting ready", body: "Cabins or lodge rooms, and usually a lake fifty metres away doing the work of a backdrop." },
      { time: "Hour 3", title: "Travel, honestly costed", body: "Whichever lake you chose, the drive is real and there is wildlife on the road. This hour exists in the plan rather than being absorbed." },
      { time: "Hour 4", title: "Ceremony", body: "Pyramid Island, the lodge lawn or a permitted site. Paperwork done well in advance." },
      { time: "Hour 5", title: "Family, then the two of you", body: "Twelve groups, capped, then twenty minutes at the water while the light is still low." },
      { time: "Hour 7–8", title: "Dinner", body: "Speeches and the room. Nobody is driving anywhere, so the evening runs long." },
      { time: "After dark", title: "The sky, if it is clear", body: "Forty minutes at the lakeshore under the Milky Way. Weather-dependent, never promised, and worth staying up for." },
    ],
    colophon:
      "Jasper, Maligne Lake, Pyramid Lake, Athabasca Falls and the Icefields Parkway. Quoted against your venue and your date.",
  },
};

export const hubBySlug = (slug: string) => HUBS[slug];
