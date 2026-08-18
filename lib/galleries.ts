/* The wedding albums, ported from the armanarai.com archive.
 *
 * These are full days rather than a highlight reel: every album opens on a hero
 * frame and then runs in chapters, in the order the day happened. The images
 * live in the R2 bucket `canadian-wedding` under galleries/<slug>/ and are sized
 * by the custom next/image loader, so no width is baked into a URL here.
 */

export type GalleryImage = {
  url: string;
  alt: string;
  w: number;
  h: number;
  orientation: "l" | "p";
};

export type Chapter = {
  numeral: string;
  title: string;
  range: string;
  images: GalleryImage[];
};

export type Gallery = {
  slug: string;
  names: string;
  location: string;
  date: string;
  /** The film stock the day was graded to emulate; shown as an edge marking. */
  stock: string;
  frameCount: number;
  story: string;
  cover: GalleryImage;
  hero: GalleryImage;
  teasers: GalleryImage[];
  chapters: Chapter[];
};

export const GALLERIES: Gallery[] = [
  {
    "slug": "elisha-michael",
    "names": "Elisha & Michael",
    "location": "A stone chapel in the Niagara hills",
    "date": "October 2025",
    "stock": "Portra 800",
    "frameCount": 40,
    "story": "October at its absolute peak: a stone chapel on a hillside, a harpist under the trees, and a sailcloth tent pitched over the vineyard rows with the valley going gold behind it. Rust, burgundy and dried bloom everywhere, and a groom who wore the season rather than fighting it.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/elisha-michael/014.webp",
      "alt": "Elisha walking to the chapel with her father, the hillside gold behind them",
      "w": 1024,
      "h": 1536,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/elisha-michael/001.webp",
      "alt": "Elisha and Michael leading their wedding party through the autumn trees",
      "w": 1536,
      "h": 1024,
      "orientation": "l"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/elisha-michael/015.webp",
        "alt": "The stone chapel from above, guests seated along the path",
        "w": 1024,
        "h": 1536,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/elisha-michael/021.webp",
        "alt": "The sailcloth tent lit over the vineyard rows at dusk",
        "w": 1536,
        "h": 1024,
        "orientation": "l"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/elisha-michael/012.webp",
        "alt": "A harpist playing under the autumn canopy",
        "w": 1024,
        "h": 1536,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/elisha-michael/034.webp",
        "alt": "The couple walking the vineyard rows at sunset",
        "w": 1536,
        "h": 1024,
        "orientation": "l"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Morning",
        "range": "Getting ready",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/002.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/003.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/004.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/005.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/006.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/007.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/008.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/032.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: morning, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "The chapel",
        "range": "The ceremony",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/011.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/013.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/014.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/015.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/016.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/017.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 6",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/010.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/012.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the chapel, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "Their people",
        "range": "The party",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/001.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 1",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/009.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 2",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/018.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 3",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/029.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 4",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/030.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 5",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/037.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 6",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/038.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: their people, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "IV",
        "title": "The tent",
        "range": "Dinner",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/019.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/020.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/021.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 3",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/022.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 4",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/023.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/024.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/025.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/026.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 8",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/027.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 9",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/028.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the tent, frame 10",
            "w": 1535,
            "h": 1024,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "V",
        "title": "The two of them",
        "range": "Portraits and the night",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/031.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/033.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 2",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/034.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 3",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/035.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/036.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/039.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/elisha-michael/040.webp",
            "alt": "Elisha & Michael, A stone chapel in the Niagara hills: the two of them, frame 7",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          }
        ]
      }
    ]
  },
  {
    "slug": "eathon-jessica",
    "names": "Eathon & Jessica",
    "location": "A glass pavilion in Prince Edward County",
    "date": "July 2026",
    "stock": "Portra 400",
    "frameCount": 48,
    "story": "A summer wedding in a timber and glass pavilion with the fields running right up to the windows. Emerald, peach and a great deal of dahlia. A champagne tower, a golden retriever in the family photographs, and a shower at exactly the wrong moment that turned into the best twenty minutes of the day.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/013.webp",
      "alt": "Jessica in the field at golden hour, her cape lifting behind her",
      "w": 1023,
      "h": 1537,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/028.webp",
      "alt": "Eathon and Jessica walking through the pavilion between the lit tables",
      "w": 1537,
      "h": 1023,
      "orientation": "l"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/013.webp",
        "alt": "Jessica in the open field at golden hour",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/021.webp",
        "alt": "The first kiss under the floral arch as the guests rise",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/026.webp",
        "alt": "The champagne tower being poured",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/043.webp",
        "alt": "The couple under a clear umbrella in a summer shower",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Before",
        "range": "Getting ready",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/003.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/004.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/005.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/006.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/007.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/039.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/040.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 7",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/047.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: before, frame 8",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "First look",
        "range": "The two of them",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/001.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 1",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/002.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 2",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/008.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 3",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/009.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 4",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/010.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 5",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/012.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/013.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 7",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/014.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 8",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/015.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 9",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/016.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: first look, frame 10",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "The vows",
        "range": "The ceremony",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/011.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 1",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/018.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/019.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 3",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/020.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 4",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/021.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 5",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/022.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/045.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 7",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/046.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the vows, frame 8",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "IV",
        "title": "The room",
        "range": "Dinner",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/023.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 1",
            "w": 1025,
            "h": 1535,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/024.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 2",
            "w": 1025,
            "h": 1535,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/025.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/028.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 4",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/029.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/030.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/031.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 7",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/032.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/033.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 9",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/034.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 10",
            "w": 1025,
            "h": 1535,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/041.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 11",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/048.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the room, frame 12",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "V",
        "title": "The night",
        "range": "After dark",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/017.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 1",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/026.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 2",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/027.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 3",
            "w": 1024,
            "h": 1535,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/035.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 4",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/036.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 5",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/037.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/038.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 7",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/042.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 8",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/043.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 9",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/eathon-jessica/044.webp",
            "alt": "Eathon & Jessica, A glass pavilion in Prince Edward County: the night, frame 10",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "luca-lauren",
    "names": "Luca & Lauren",
    "location": "Old Montréal and the Old Port",
    "date": "June 2025",
    "stock": "Portra 400",
    "frameCount": 54,
    "story": "A city wedding that used all of Montréal: a basilica for the ceremony, neoclassical stone for the portraits, and a glass room high over the water for dinner, hung with coral blossom. Two registers in one day, the grave and the bright, and the whole point was not letting either one flatten the other.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/luca-lauren/011.webp",
      "alt": "Luca and Lauren's Montréal wedding: the bride on a spiral staircase, her train spread down the steps",
      "w": 1535,
      "h": 1024,
      "orientation": "l"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/luca-lauren/001.webp",
      "alt": "Luca and Lauren on a terrace above the Old Port, the city behind them",
      "w": 1831,
      "h": 859,
      "orientation": "l"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/luca-lauren/011.webp",
        "alt": "The bride on a spiral staircase, her train falling down the stone steps in black and white",
        "w": 1535,
        "h": 1024,
        "orientation": "l"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/luca-lauren/018.webp",
        "alt": "The ceremony room set with coral blossom and the river beyond the glass",
        "w": 1536,
        "h": 1024,
        "orientation": "l"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/luca-lauren/039.webp",
        "alt": "The basilica interior in blue and gold as the bride's train follows her up the aisle",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/luca-lauren/030.webp",
        "alt": "Luca and Lauren close together with the Montréal skyline behind them",
        "w": 1536,
        "h": 1024,
        "orientation": "l"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "The morning",
        "range": "Getting ready",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/005.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/006.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 2",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/007.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/045.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 4",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/046.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 5",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/009.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/008.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/028.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 8",
            "w": 1535,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/029.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the morning, frame 9",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "The basilica",
        "range": "The ceremony",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/038.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the basilica, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/039.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the basilica, frame 2",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/040.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the basilica, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "Stone and stair",
        "range": "Portraits",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/010.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/011.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 2",
            "w": 1535,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/012.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/013.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 4",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/014.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 5",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/015.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/016.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/037.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/047.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 9",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/049.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 10",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/035.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 11",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/036.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 12",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/052.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: stone and stair, frame 13",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "IV",
        "title": "The room",
        "range": "Reception",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/018.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 1",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/019.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 2",
            "w": 1535,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/020.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 3",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/021.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 4",
            "w": 1535,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/022.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/023.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/024.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 7",
            "w": 1025,
            "h": 1534,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/025.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 8",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/031.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the room, frame 9",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "V",
        "title": "The two of them",
        "range": "Through the day",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/001.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 1",
            "w": 1831,
            "h": 859,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/002.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/003.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/004.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/017.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/026.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 6",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/027.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 7",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/030.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 8",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/032.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 9",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/033.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 10",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/034.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 11",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/041.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 12",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/042.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 13",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/043.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 14",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/044.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 15",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/048.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 16",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/050.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 17",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/051.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 18",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/053.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 19",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/luca-lauren/054.webp",
            "alt": "Luca & Lauren, Old Montréal and the Old Port: the two of them, frame 20",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "nicole-js",
    "names": "Nicole & JS",
    "location": "A vineyard in the Eastern Townships",
    "date": "September 2025",
    "stock": "Portra 800",
    "frameCount": 54,
    "story": "It rained, and the day was better for it. Low cloud sitting on the vineyard, wet stone, a chapel appearing and disappearing in the mist, and a stone hall lit entirely by candles once everyone came in out of the weather. Nobody moved the ceremony and nobody apologised for the sky.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/nicole-js/001.webp",
      "alt": "Nicole and JS in the vineyard rows, the hills behind them under low cloud",
      "w": 1024,
      "h": 1536,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/nicole-js/053.webp",
      "alt": "Nicole and JS walking a wet path, her veil lifting across the frame",
      "w": 1536,
      "h": 1024,
      "orientation": "l"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/nicole-js/001.webp",
        "alt": "The couple in the vineyard rows under low cloud",
        "w": 1024,
        "h": 1536,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/nicole-js/054.webp",
        "alt": "The couple under a clear umbrella on a rainy vineyard road",
        "w": 1003,
        "h": 1568,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/nicole-js/022.webp",
        "alt": "A coral and cream arrangement being finished by the florist's hands",
        "w": 1024,
        "h": 1536,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/nicole-js/049.webp",
        "alt": "The stone reception hall lit entirely by candles",
        "w": 1536,
        "h": 1024,
        "orientation": "l"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Weather",
        "range": "The vineyard in rain",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/001.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/002.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/003.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/004.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/005.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/006.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/053.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 7",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/054.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: weather, frame 8",
            "w": 1003,
            "h": 1568,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "Her people",
        "range": "The bridal party",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/007.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 1",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/008.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 2",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/009.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 3",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/010.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 4",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/011.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/012.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/013.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/014.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/015.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: her people, frame 9",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "The house",
        "range": "Stone and mist",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/016.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/017.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/018.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/051.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 4",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/052.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 5",
            "w": 1122,
            "h": 1402,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/049.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 6",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/050.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: the house, frame 7",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "IV",
        "title": "Flowers",
        "range": "Detail",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/019.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/020.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 2",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/021.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/022.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/023.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/024.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/027.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/028.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/029.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 9",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/030.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: flowers, frame 10",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "V",
        "title": "Candles",
        "range": "Dinner",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/025.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/026.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 2",
            "w": 1122,
            "h": 1402,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/031.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 3",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/032.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 4",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/033.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 5",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/034.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 6",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/035.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 7",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/036.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/037.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 9",
            "w": 1122,
            "h": 1402,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/038.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 10",
            "w": 1122,
            "h": 1402,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/039.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 11",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/040.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 12",
            "w": 1122,
            "h": 1402,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/041.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 13",
            "w": 1122,
            "h": 1402,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/042.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 14",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/043.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 15",
            "w": 1254,
            "h": 1254,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/044.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 16",
            "w": 1254,
            "h": 1254,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/045.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 17",
            "w": 1254,
            "h": 1254,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/046.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 18",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/047.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 19",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/nicole-js/048.webp",
            "alt": "Nicole & JS, A vineyard in the Eastern Townships: candles, frame 20",
            "w": 887,
            "h": 1774,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "parsa-marjan",
    "names": "Parsa & Marjan",
    "location": "A hilltop estate in the Townships",
    "date": "August 2024",
    "stock": "Ektar 100",
    "frameCount": 39,
    "story": "A Persian wedding on a hill, with the sofreh laid inside a manor of red rooms and the guests gathered in a ring on the lawn outside. Green to the horizon, a lake at the bottom of the property, and an aghd carried out properly while everybody leaned in to watch.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/004.webp",
      "alt": "Marjan and Parsa at sunset, her veil lifted across the frame, the manor behind",
      "w": 1023,
      "h": 1537,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/005.webp",
      "alt": "The couple on the lawn below the manor, the veil carried out full length",
      "w": 1536,
      "h": 1024,
      "orientation": "l"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/004.webp",
        "alt": "The couple at sunset with the veil lifted, the manor behind them",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/022.webp",
        "alt": "The whole party gathered in a ring on the lawn, seen from above",
        "w": 1537,
        "h": 1023,
        "orientation": "l"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/037.webp",
        "alt": "The sofreh laid with mirror, candles and blossom",
        "w": 1023,
        "h": 1537,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/031.webp",
        "alt": "The lake at the bottom of the property at dusk",
        "w": 1537,
        "h": 1023,
        "orientation": "l"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "The ground",
        "range": "The estate",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/001.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 1",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/007.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 2",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/008.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 3",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/009.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 4",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/022.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 5",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/031.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 6",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/032.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the ground, frame 7",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "Before",
        "range": "Getting ready",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/010.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 1",
            "w": 864,
            "h": 1821,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/011.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 2",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/016.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 3",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/017.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 4",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/018.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 5",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/019.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/020.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 7",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/021.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 8",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/024.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 9",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/033.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: before, frame 10",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "The aghd",
        "range": "The ceremony",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/026.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the aghd, frame 1",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/035.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the aghd, frame 2",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/036.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the aghd, frame 3",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/037.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the aghd, frame 4",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "IV",
        "title": "The hill",
        "range": "Portraits",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/002.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 1",
            "w": 1024,
            "h": 1536,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/003.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 2",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/004.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 3",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/005.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 4",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/006.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 5",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/012.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 6",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/013.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 7",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/014.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 8",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/015.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 9",
            "w": 1537,
            "h": 1023,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/023.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 10",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/027.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 11",
            "w": 1536,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/028.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 12",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/029.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 13",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/030.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 14",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/034.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: the hill, frame 15",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "V",
        "title": "After",
        "range": "The night",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/025.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: after, frame 1",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/038.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: after, frame 2",
            "w": 1535,
            "h": 1024,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/parsa-marjan/039.webp",
            "alt": "Parsa & Marjan, A hilltop estate in the Townships: after, frame 3",
            "w": 1023,
            "h": 1537,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "anastasia-daniil",
    "names": "Anastasia & Daniil",
    "location": "A House by the Sea",
    "date": "October 2024",
    "stock": "Tri-X 400",
    "frameCount": 54,
    "story": "A small white wedding built inside a coast neither of their families had seen. Remote property, weather, stone and sand, and a sky big enough to disappear into. No church, no garden, nothing performing anything. Shot the same way: present, unhurried, looking for what was real rather than what was composed.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
      "alt": "Anastasia and Daniil's coastal wedding: the opening frame",
      "w": 640,
      "h": 965,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
      "alt": "Anastasia and Daniil's coastal wedding: the opening frame",
      "w": 640,
      "h": 965,
      "orientation": "p"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d545e05851175c7318a1.png",
        "alt": "",
        "w": 644,
        "h": 963,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d542b3e0c02fe7eb9eff.png",
        "alt": "",
        "w": 637,
        "h": 959,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53fe05851175c7317f7.png",
        "alt": "",
        "w": 640,
        "h": 958,
        "orientation": "p"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Beginning",
        "range": "Frames 01 — 18",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 1",
            "w": 640,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d547fe2210f89e6fe981.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 2",
            "w": 170,
            "h": 230,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5473c3aed7c63b46bb2.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 3",
            "w": 642,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d547b3e0c02fe7eb9f9d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 4",
            "w": 643,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5476cc0eead5ccf837d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 5",
            "w": 641,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5476cc0eead5ccf837c.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 6",
            "w": 636,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d547e05851175c7318cf.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 7",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5476cc0eead5ccf835e.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 8",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d546e05851175c7318b7.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 9",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d546b3e0c02fe7eb9f75.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 10",
            "w": 635,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5463c3aed7c63b46b98.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 11",
            "w": 636,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5466cc0eead5ccf835b.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 12",
            "w": 635,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5466cc0eead5ccf835a.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 13",
            "w": 637,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d546e05851175c7318b5.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 14",
            "w": 639,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d545e05851175c7318ab.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 15",
            "w": 633,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d545fe2210f89e6fe947.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 16",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d545e05851175c7318a1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 17",
            "w": 644,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5453c3aed7c63b46b7c.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 18",
            "w": 638,
            "h": 963,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "Middle",
        "range": "Frames 19 — 36",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d545fe2210f89e6fe945.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 19",
            "w": 642,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d545fe2210f89e6fe943.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 20",
            "w": 636,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d544fe2210f89e6fe935.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 21",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d544e05851175c731893.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 22",
            "w": 633,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d544b3e0c02fe7eb9f25.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 23",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d544b3e0c02fe7eb9f1f.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 24",
            "w": 642,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d544fe2210f89e6fe927.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 25",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5436cc0eead5ccf82dc.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 26",
            "w": 639,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5433c3aed7c63b46b34.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 27",
            "w": 635,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d543e05851175c73186a.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 28",
            "w": 642,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5436cc0eead5ccf82d2.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 29",
            "w": 640,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d543e05851175c731869.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 30",
            "w": 644,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d543b3e0c02fe7eb9f11.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 31",
            "w": 640,
            "h": 957,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5423c3aed7c63b46b0d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 32",
            "w": 636,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d542b3e0c02fe7eb9eff.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 33",
            "w": 637,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d542e05851175c731857.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 34",
            "w": 637,
            "h": 956,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5423c3aed7c63b46b06.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 35",
            "w": 634,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d542fe2210f89e6fe8f1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 36",
            "w": 638,
            "h": 960,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "Ending",
        "range": "Frames 37 — 54",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5423c3aed7c63b46b04.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 37",
            "w": 639,
            "h": 957,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d541b3e0c02fe7eb9ed1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 38",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5413c3aed7c63b46aee.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 39",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5416cc0eead5ccf829a.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 40",
            "w": 643,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d541b3e0c02fe7eb9ecf.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 41",
            "w": 637,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d541fe2210f89e6fe8d3.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 42",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d540e05851175c731812.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 43",
            "w": 638,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5403c3aed7c63b46ad1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 44",
            "w": 636,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d540b3e0c02fe7eb9eaf.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 45",
            "w": 639,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d5403c3aed7c63b46ad0.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 46",
            "w": 639,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d540fe2210f89e6fe8ad.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 47",
            "w": 639,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d540e05851175c731810.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 48",
            "w": 639,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53fe05851175c7317f7.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 49",
            "w": 640,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53fb3e0c02fe7eb9e8d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 50",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53f3c3aed7c63b46aba.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 51",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53f6cc0eead5ccf8250.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 52",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53ffe2210f89e6fe883.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 53",
            "w": 639,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/anastasia-daniil/6a13d53ffe2210f89e6fe884.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 54",
            "w": 640,
            "h": 962,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "sofia-lucas",
    "names": "Sofia & Lucas",
    "location": "A Quiet Garden, Late Spring",
    "date": "June 2025",
    "stock": "Fuji 400H",
    "frameCount": 41,
    "story": "Linen and soft light, a handful of people who really knew them, and a garden at the edge of a small town. Blush, almond, pale rose, the kind of colour you only notice once you are looking for it. Fine-art stillness in the portraits, quiet attendance everywhere else.",
    "cover": {
      "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a07d2747625ad8abcc7.png",
      "alt": "Sofia and Lucas's garden wedding: the opening frame",
      "w": 639,
      "h": 963,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a07d2747625ad8abcc7.png",
      "alt": "Sofia and Lucas's garden wedding: the opening frame",
      "w": 639,
      "h": 963,
      "orientation": "p"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0660ad4b061938487f.png",
        "alt": "",
        "w": 641,
        "h": 966,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a03d2747625ad8abc1e.png",
        "alt": "",
        "w": 637,
        "h": 962,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0154d7dff212d2a20d.png",
        "alt": "",
        "w": 639,
        "h": 962,
        "orientation": "p"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Beginning",
        "range": "Frames 01 — 13",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a07d2747625ad8abcc7.png",
            "alt": "Sofia and Lucas's garden wedding, frame 1",
            "w": 639,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0754d7dff212d2a300.png",
            "alt": "Sofia and Lucas's garden wedding, frame 2",
            "w": 643,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0754d7dff212d2a2fc.png",
            "alt": "Sofia and Lucas's garden wedding, frame 3",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a07d2747625ad8abcb4.png",
            "alt": "Sofia and Lucas's garden wedding, frame 4",
            "w": 641,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a07e05851175c87e273.png",
            "alt": "Sofia and Lucas's garden wedding, frame 5",
            "w": 640,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0754d7dff212d2a2f1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 6",
            "w": 641,
            "h": 966,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a07e05851175c87e269.png",
            "alt": "Sofia and Lucas's garden wedding, frame 7",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0654d7dff212d2a2cd.png",
            "alt": "Sofia and Lucas's garden wedding, frame 8",
            "w": 642,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a06d2747625ad8abca6.png",
            "alt": "Sofia and Lucas's garden wedding, frame 9",
            "w": 641,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a06e05851175c87e253.png",
            "alt": "Sofia and Lucas's garden wedding, frame 10",
            "w": 641,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a06d2747625ad8abca4.png",
            "alt": "Sofia and Lucas's garden wedding, frame 11",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a06e05851175c87e251.png",
            "alt": "Sofia and Lucas's garden wedding, frame 12",
            "w": 640,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0660ad4b061938487f.png",
            "alt": "Sofia and Lucas's garden wedding, frame 13",
            "w": 641,
            "h": 966,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "Middle",
        "range": "Frames 14 — 27",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a05d2747625ad8abc88.png",
            "alt": "Sofia and Lucas's garden wedding, frame 14",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a05e05851175c87e225.png",
            "alt": "Sofia and Lucas's garden wedding, frame 15",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a05d2747625ad8abc7d.png",
            "alt": "Sofia and Lucas's garden wedding, frame 16",
            "w": 639,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a05e05851175c87e222.png",
            "alt": "Sofia and Lucas's garden wedding, frame 17",
            "w": 638,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0560ad4b0619384867.png",
            "alt": "Sofia and Lucas's garden wedding, frame 18",
            "w": 640,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0554d7dff212d2a2af.png",
            "alt": "Sofia and Lucas's garden wedding, frame 19",
            "w": 640,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a040397b3655e6c625f.png",
            "alt": "Sofia and Lucas's garden wedding, frame 20",
            "w": 636,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a040397b3655e6c625c.png",
            "alt": "Sofia and Lucas's garden wedding, frame 21",
            "w": 640,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a040397b3655e6c625d.png",
            "alt": "Sofia and Lucas's garden wedding, frame 22",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a04e05851175c87e1fb.png",
            "alt": "Sofia and Lucas's garden wedding, frame 23",
            "w": 640,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a04e05851175c87e1f1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 24",
            "w": 638,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a03d2747625ad8abc1e.png",
            "alt": "Sofia and Lucas's garden wedding, frame 25",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a030397b3655e6c6248.png",
            "alt": "Sofia and Lucas's garden wedding, frame 26",
            "w": 636,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0360ad4b0619384845.png",
            "alt": "Sofia and Lucas's garden wedding, frame 27",
            "w": 636,
            "h": 959,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "Ending",
        "range": "Frames 28 — 41",
        "images": [
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a030397b3655e6c6249.png",
            "alt": "Sofia and Lucas's garden wedding, frame 28",
            "w": 635,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0360ad4b0619384843.png",
            "alt": "Sofia and Lucas's garden wedding, frame 29",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a020397b3655e6c6206.png",
            "alt": "Sofia and Lucas's garden wedding, frame 30",
            "w": 641,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a02d2747625ad8abbe3.png",
            "alt": "Sofia and Lucas's garden wedding, frame 31",
            "w": 641,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a02e05851175c87e1b1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 32",
            "w": 639,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a02d2747625ad8abbe2.png",
            "alt": "Sofia and Lucas's garden wedding, frame 33",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0260ad4b0619384808.png",
            "alt": "Sofia and Lucas's garden wedding, frame 34",
            "w": 642,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0260ad4b0619384807.png",
            "alt": "Sofia and Lucas's garden wedding, frame 35",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a01e05851175c87e1a1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 36",
            "w": 639,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0154d7dff212d2a20d.png",
            "alt": "Sofia and Lucas's garden wedding, frame 37",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a01d2747625ad8abbae.png",
            "alt": "Sofia and Lucas's garden wedding, frame 38",
            "w": 634,
            "h": 953,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a01d2747625ad8abbaf.png",
            "alt": "Sofia and Lucas's garden wedding, frame 39",
            "w": 636,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a0160ad4b06193847ed.png",
            "alt": "Sofia and Lucas's garden wedding, frame 40",
            "w": 637,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.ca/galleries/sofia-lucas/6a151a01e05851175c87e1a2.png",
            "alt": "Sofia and Lucas's garden wedding, frame 41",
            "w": 637,
            "h": 959,
            "orientation": "p"
          }
        ]
      }
    ]
  },
];

export function galleryBySlug(slug: string): Gallery | undefined {
  return GALLERIES.find((g) => g.slug === slug);
}

export const GALLERY_SLUGS = GALLERIES.map((g) => g.slug);
