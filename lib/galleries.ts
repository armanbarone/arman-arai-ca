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
    "slug": "anastasia-daniil",
    "names": "Anastasia & Daniil",
    "location": "A House by the Sea",
    "date": "October 2024",
    "stock": "Tri-X 400",
    "frameCount": 54,
    "story": "A small white wedding built inside a coast neither of their families had seen. Remote property, weather, stone and sand, and a sky big enough to disappear into. No church, no garden, nothing performing anything. Shot the same way: present, unhurried, looking for what was real rather than what was composed.",
    "cover": {
      "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
      "alt": "Anastasia and Daniil's coastal wedding: the opening frame",
      "w": 640,
      "h": 965,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
      "alt": "Anastasia and Daniil's coastal wedding: the opening frame",
      "w": 640,
      "h": 965,
      "orientation": "p"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d545e05851175c7318a1.png",
        "alt": "",
        "w": 644,
        "h": 963,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d542b3e0c02fe7eb9eff.png",
        "alt": "",
        "w": 637,
        "h": 959,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53fe05851175c7317f7.png",
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
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 1",
            "w": 640,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d547fe2210f89e6fe981.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 2",
            "w": 170,
            "h": 230,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5473c3aed7c63b46bb2.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 3",
            "w": 642,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d547b3e0c02fe7eb9f9d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 4",
            "w": 643,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5476cc0eead5ccf837d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 5",
            "w": 641,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5476cc0eead5ccf837c.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 6",
            "w": 636,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d547e05851175c7318cf.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 7",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5476cc0eead5ccf835e.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 8",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d546e05851175c7318b7.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 9",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d546b3e0c02fe7eb9f75.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 10",
            "w": 635,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5463c3aed7c63b46b98.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 11",
            "w": 636,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5466cc0eead5ccf835b.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 12",
            "w": 635,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5466cc0eead5ccf835a.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 13",
            "w": 637,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d546e05851175c7318b5.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 14",
            "w": 639,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d545e05851175c7318ab.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 15",
            "w": 633,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d545fe2210f89e6fe947.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 16",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d545e05851175c7318a1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 17",
            "w": 644,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5453c3aed7c63b46b7c.png",
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
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d545fe2210f89e6fe945.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 19",
            "w": 642,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d545fe2210f89e6fe943.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 20",
            "w": 636,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d544fe2210f89e6fe935.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 21",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d544e05851175c731893.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 22",
            "w": 633,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d544b3e0c02fe7eb9f25.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 23",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d544b3e0c02fe7eb9f1f.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 24",
            "w": 642,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d544fe2210f89e6fe927.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 25",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5436cc0eead5ccf82dc.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 26",
            "w": 639,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5433c3aed7c63b46b34.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 27",
            "w": 635,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d543e05851175c73186a.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 28",
            "w": 642,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5436cc0eead5ccf82d2.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 29",
            "w": 640,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d543e05851175c731869.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 30",
            "w": 644,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d543b3e0c02fe7eb9f11.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 31",
            "w": 640,
            "h": 957,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5423c3aed7c63b46b0d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 32",
            "w": 636,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d542b3e0c02fe7eb9eff.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 33",
            "w": 637,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d542e05851175c731857.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 34",
            "w": 637,
            "h": 956,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5423c3aed7c63b46b06.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 35",
            "w": 634,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d542fe2210f89e6fe8f1.png",
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
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5423c3aed7c63b46b04.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 37",
            "w": 639,
            "h": 957,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d541b3e0c02fe7eb9ed1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 38",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5413c3aed7c63b46aee.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 39",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5416cc0eead5ccf829a.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 40",
            "w": 643,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d541b3e0c02fe7eb9ecf.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 41",
            "w": 637,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d541fe2210f89e6fe8d3.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 42",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d540e05851175c731812.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 43",
            "w": 638,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5403c3aed7c63b46ad1.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 44",
            "w": 636,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d540b3e0c02fe7eb9eaf.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 45",
            "w": 639,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d5403c3aed7c63b46ad0.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 46",
            "w": 639,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d540fe2210f89e6fe8ad.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 47",
            "w": 639,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d540e05851175c731810.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 48",
            "w": 639,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53fe05851175c7317f7.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 49",
            "w": 640,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53fb3e0c02fe7eb9e8d.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 50",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53f3c3aed7c63b46aba.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 51",
            "w": 638,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53f6cc0eead5ccf8250.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 52",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53ffe2210f89e6fe883.png",
            "alt": "Anastasia and Daniil's coastal wedding, frame 53",
            "w": 639,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/anastasia-daniil/6a13d53ffe2210f89e6fe884.png",
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
      "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a07d2747625ad8abcc7.png",
      "alt": "Sofia and Lucas's garden wedding: the opening frame",
      "w": 639,
      "h": 963,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a07d2747625ad8abcc7.png",
      "alt": "Sofia and Lucas's garden wedding: the opening frame",
      "w": 639,
      "h": 963,
      "orientation": "p"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0660ad4b061938487f.png",
        "alt": "",
        "w": 641,
        "h": 966,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a03d2747625ad8abc1e.png",
        "alt": "",
        "w": 637,
        "h": 962,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0154d7dff212d2a20d.png",
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
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a07d2747625ad8abcc7.png",
            "alt": "Sofia and Lucas's garden wedding, frame 1",
            "w": 639,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0754d7dff212d2a300.png",
            "alt": "Sofia and Lucas's garden wedding, frame 2",
            "w": 643,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0754d7dff212d2a2fc.png",
            "alt": "Sofia and Lucas's garden wedding, frame 3",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a07d2747625ad8abcb4.png",
            "alt": "Sofia and Lucas's garden wedding, frame 4",
            "w": 641,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a07e05851175c87e273.png",
            "alt": "Sofia and Lucas's garden wedding, frame 5",
            "w": 640,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0754d7dff212d2a2f1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 6",
            "w": 641,
            "h": 966,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a07e05851175c87e269.png",
            "alt": "Sofia and Lucas's garden wedding, frame 7",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0654d7dff212d2a2cd.png",
            "alt": "Sofia and Lucas's garden wedding, frame 8",
            "w": 642,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a06d2747625ad8abca6.png",
            "alt": "Sofia and Lucas's garden wedding, frame 9",
            "w": 641,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a06e05851175c87e253.png",
            "alt": "Sofia and Lucas's garden wedding, frame 10",
            "w": 641,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a06d2747625ad8abca4.png",
            "alt": "Sofia and Lucas's garden wedding, frame 11",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a06e05851175c87e251.png",
            "alt": "Sofia and Lucas's garden wedding, frame 12",
            "w": 640,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0660ad4b061938487f.png",
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
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a05d2747625ad8abc88.png",
            "alt": "Sofia and Lucas's garden wedding, frame 14",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a05e05851175c87e225.png",
            "alt": "Sofia and Lucas's garden wedding, frame 15",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a05d2747625ad8abc7d.png",
            "alt": "Sofia and Lucas's garden wedding, frame 16",
            "w": 639,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a05e05851175c87e222.png",
            "alt": "Sofia and Lucas's garden wedding, frame 17",
            "w": 638,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0560ad4b0619384867.png",
            "alt": "Sofia and Lucas's garden wedding, frame 18",
            "w": 640,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0554d7dff212d2a2af.png",
            "alt": "Sofia and Lucas's garden wedding, frame 19",
            "w": 640,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a040397b3655e6c625f.png",
            "alt": "Sofia and Lucas's garden wedding, frame 20",
            "w": 636,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a040397b3655e6c625c.png",
            "alt": "Sofia and Lucas's garden wedding, frame 21",
            "w": 640,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a040397b3655e6c625d.png",
            "alt": "Sofia and Lucas's garden wedding, frame 22",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a04e05851175c87e1fb.png",
            "alt": "Sofia and Lucas's garden wedding, frame 23",
            "w": 640,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a04e05851175c87e1f1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 24",
            "w": 638,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a03d2747625ad8abc1e.png",
            "alt": "Sofia and Lucas's garden wedding, frame 25",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a030397b3655e6c6248.png",
            "alt": "Sofia and Lucas's garden wedding, frame 26",
            "w": 636,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0360ad4b0619384845.png",
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
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a030397b3655e6c6249.png",
            "alt": "Sofia and Lucas's garden wedding, frame 28",
            "w": 635,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0360ad4b0619384843.png",
            "alt": "Sofia and Lucas's garden wedding, frame 29",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a020397b3655e6c6206.png",
            "alt": "Sofia and Lucas's garden wedding, frame 30",
            "w": 641,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a02d2747625ad8abbe3.png",
            "alt": "Sofia and Lucas's garden wedding, frame 31",
            "w": 641,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a02e05851175c87e1b1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 32",
            "w": 639,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a02d2747625ad8abbe2.png",
            "alt": "Sofia and Lucas's garden wedding, frame 33",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0260ad4b0619384808.png",
            "alt": "Sofia and Lucas's garden wedding, frame 34",
            "w": 642,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0260ad4b0619384807.png",
            "alt": "Sofia and Lucas's garden wedding, frame 35",
            "w": 638,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a01e05851175c87e1a1.png",
            "alt": "Sofia and Lucas's garden wedding, frame 36",
            "w": 639,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0154d7dff212d2a20d.png",
            "alt": "Sofia and Lucas's garden wedding, frame 37",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a01d2747625ad8abbae.png",
            "alt": "Sofia and Lucas's garden wedding, frame 38",
            "w": 634,
            "h": 953,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a01d2747625ad8abbaf.png",
            "alt": "Sofia and Lucas's garden wedding, frame 39",
            "w": 636,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a0160ad4b06193847ed.png",
            "alt": "Sofia and Lucas's garden wedding, frame 40",
            "w": 637,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/sofia-lucas/6a151a01e05851175c87e1a2.png",
            "alt": "Sofia and Lucas's garden wedding, frame 41",
            "w": 637,
            "h": 959,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "margaux-antoine",
    "names": "Margaux & Antoine",
    "location": "Château de Vaillac, Lot, France",
    "date": "September 2025",
    "stock": "Portra 400",
    "frameCount": 48,
    "story": "A house in the Lot that has watched a hundred late summers come and go. The morning inside the stone walls, the ceremony in the courtyard, the walk through the vineyard three weeks from harvest, and a dinner that went long into the night. Documentary, with an editorial eye: unposed, but not accidental.",
    "cover": {
      "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15235154d7dff212d34482.png",
      "alt": "Margaux and Antoine's château wedding: the opening frame",
      "w": 641,
      "h": 962,
      "orientation": "p"
    },
    "hero": {
      "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15235154d7dff212d34482.png",
      "alt": "Margaux and Antoine's château wedding: the opening frame",
      "w": 641,
      "h": 962,
      "orientation": "p"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234d0397b3655e6d05e6.png",
        "alt": "",
        "w": 635,
        "h": 960,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234b0397b3655e6d05a0.png",
        "alt": "",
        "w": 640,
        "h": 963,
        "orientation": "p"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234854d7dff212d34348.png",
        "alt": "",
        "w": 641,
        "h": 964,
        "orientation": "p"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Beginning",
        "range": "Frames 01 — 16",
        "images": [
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15235154d7dff212d34482.png",
            "alt": "Margaux and Antoine's château wedding, frame 1",
            "w": 641,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a1523510397b3655e6d065b.png",
            "alt": "Margaux and Antoine's château wedding, frame 2",
            "w": 641,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a1523500397b3655e6d0652.png",
            "alt": "Margaux and Antoine's château wedding, frame 3",
            "w": 642,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234fd2747625ad8b5fd0.png",
            "alt": "Margaux and Antoine's château wedding, frame 4",
            "w": 642,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152350d2747625ad8b6004.png",
            "alt": "Margaux and Antoine's château wedding, frame 5",
            "w": 639,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152350e05851175c888916.png",
            "alt": "Margaux and Antoine's château wedding, frame 6",
            "w": 643,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234fd2747625ad8b5fb9.png",
            "alt": "Margaux and Antoine's château wedding, frame 7",
            "w": 639,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234fd2747625ad8b5fcb.png",
            "alt": "Margaux and Antoine's château wedding, frame 8",
            "w": 640,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234e54d7dff212d34448.png",
            "alt": "Margaux and Antoine's château wedding, frame 9",
            "w": 633,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234f54d7dff212d34458.png",
            "alt": "Margaux and Antoine's château wedding, frame 10",
            "w": 639,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234e54d7dff212d3443a.png",
            "alt": "Margaux and Antoine's château wedding, frame 11",
            "w": 635,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234e54d7dff212d34431.png",
            "alt": "Margaux and Antoine's château wedding, frame 12",
            "w": 637,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234ed2747625ad8b5f7a.png",
            "alt": "Margaux and Antoine's château wedding, frame 13",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234de05851175c8888bc.png",
            "alt": "Margaux and Antoine's château wedding, frame 14",
            "w": 639,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234d0397b3655e6d05e6.png",
            "alt": "Margaux and Antoine's château wedding, frame 15",
            "w": 635,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234dd2747625ad8b5f63.png",
            "alt": "Margaux and Antoine's château wedding, frame 16",
            "w": 636,
            "h": 961,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "Middle",
        "range": "Frames 17 — 32",
        "images": [
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234d0397b3655e6d05e2.png",
            "alt": "Margaux and Antoine's château wedding, frame 17",
            "w": 641,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234d60ad4b061938eb88.png",
            "alt": "Margaux and Antoine's château wedding, frame 18",
            "w": 638,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234d0397b3655e6d05c4.png",
            "alt": "Margaux and Antoine's château wedding, frame 19",
            "w": 641,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234c60ad4b061938eb7a.png",
            "alt": "Margaux and Antoine's château wedding, frame 20",
            "w": 637,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234c54d7dff212d343de.png",
            "alt": "Margaux and Antoine's château wedding, frame 21",
            "w": 638,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234cd2747625ad8b5f2f.png",
            "alt": "Margaux and Antoine's château wedding, frame 22",
            "w": 637,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234c0397b3655e6d05ae.png",
            "alt": "Margaux and Antoine's château wedding, frame 23",
            "w": 638,
            "h": 960,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234c54d7dff212d343cc.png",
            "alt": "Margaux and Antoine's château wedding, frame 24",
            "w": 638,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234c54d7dff212d343ce.png",
            "alt": "Margaux and Antoine's château wedding, frame 25",
            "w": 641,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234b54d7dff212d343ca.png",
            "alt": "Margaux and Antoine's château wedding, frame 26",
            "w": 634,
            "h": 955,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234b54d7dff212d343c8.png",
            "alt": "Margaux and Antoine's château wedding, frame 27",
            "w": 633,
            "h": 957,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234b60ad4b061938eb66.png",
            "alt": "Margaux and Antoine's château wedding, frame 28",
            "w": 638,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234b0397b3655e6d05a0.png",
            "alt": "Margaux and Antoine's château wedding, frame 29",
            "w": 640,
            "h": 963,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234a0397b3655e6d056b.png",
            "alt": "Margaux and Antoine's château wedding, frame 30",
            "w": 641,
            "h": 965,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234b60ad4b061938eb60.png",
            "alt": "Margaux and Antoine's château wedding, frame 31",
            "w": 639,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234ae05851175c888840.png",
            "alt": "Margaux and Antoine's château wedding, frame 32",
            "w": 636,
            "h": 961,
            "orientation": "p"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "Ending",
        "range": "Frames 33 — 48",
        "images": [
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234ad2747625ad8b5eeb.png",
            "alt": "Margaux and Antoine's château wedding, frame 33",
            "w": 639,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234ad2747625ad8b5ee1.png",
            "alt": "Margaux and Antoine's château wedding, frame 34",
            "w": 640,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234a60ad4b061938eb5a.png",
            "alt": "Margaux and Antoine's château wedding, frame 35",
            "w": 640,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234a54d7dff212d34388.png",
            "alt": "Margaux and Antoine's château wedding, frame 36",
            "w": 638,
            "h": 966,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234960ad4b061938eb42.png",
            "alt": "Margaux and Antoine's château wedding, frame 37",
            "w": 636,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a1523490397b3655e6d053a.png",
            "alt": "Margaux and Antoine's château wedding, frame 38",
            "w": 640,
            "h": 962,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234960ad4b061938eb43.png",
            "alt": "Margaux and Antoine's château wedding, frame 39",
            "w": 636,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234954d7dff212d34371.png",
            "alt": "Margaux and Antoine's château wedding, frame 40",
            "w": 641,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234954d7dff212d34370.png",
            "alt": "Margaux and Antoine's château wedding, frame 41",
            "w": 639,
            "h": 954,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152349d2747625ad8b5eb8.png",
            "alt": "Margaux and Antoine's château wedding, frame 42",
            "w": 641,
            "h": 959,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a15234854d7dff212d34348.png",
            "alt": "Margaux and Antoine's château wedding, frame 43",
            "w": 641,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a1523480397b3655e6d0522.png",
            "alt": "Margaux and Antoine's château wedding, frame 44",
            "w": 638,
            "h": 964,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152348d2747625ad8b5e8d.png",
            "alt": "Margaux and Antoine's château wedding, frame 45",
            "w": 636,
            "h": 961,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152348e05851175c8887fc.png",
            "alt": "Margaux and Antoine's château wedding, frame 46",
            "w": 639,
            "h": 958,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152348d2747625ad8b5e91.png",
            "alt": "Margaux and Antoine's château wedding, frame 47",
            "w": 639,
            "h": 966,
            "orientation": "p"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/margaux-antoine/6a152348d2747625ad8b5e8e.png",
            "alt": "Margaux and Antoine's château wedding, frame 48",
            "w": 642,
            "h": 967,
            "orientation": "p"
          }
        ]
      }
    ]
  },
  {
    "slug": "eleanor-james",
    "names": "Eleanor & James",
    "location": "Ocean Edge Resort, Brewster, Cape Cod",
    "date": "October 2024",
    "stock": "Portra 800",
    "frameCount": 48,
    "story": "Cape Cod in October: the off-season, the quiet, and light that comes in low and white from the northeast. Shot on 35mm film, grain and warmth and the slight compression of memory that comes from shooting analogue somewhere that already looks like the past.",
    "cover": {
      "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bfab53822e7e01ca89.png",
      "alt": "Eleanor and James's Cape Cod wedding: the opening frame",
      "w": 968,
      "h": 593,
      "orientation": "l"
    },
    "hero": {
      "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bfab53822e7e01ca89.png",
      "alt": "Eleanor and James's Cape Cod wedding: the opening frame",
      "w": 968,
      "h": 593,
      "orientation": "l"
    },
    "teasers": [
      {
        "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bd449f78709ee35818.png",
        "alt": "",
        "w": 955,
        "h": 590,
        "orientation": "l"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bbd2af304d12119eb4.png",
        "alt": "",
        "w": 955,
        "h": 590,
        "orientation": "l"
      },
      {
        "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9449f78709ee35773.png",
        "alt": "",
        "w": 955,
        "h": 585,
        "orientation": "l"
      }
    ],
    "chapters": [
      {
        "numeral": "I",
        "title": "Beginning",
        "range": "Frames 01 — 16",
        "images": [
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bfab53822e7e01ca89.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 1",
            "w": 968,
            "h": 593,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bf449f78709ee35876.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 2",
            "w": 952,
            "h": 577,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bfd2af304d12119f0c.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 3",
            "w": 957,
            "h": 585,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bf449f78709ee35874.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 4",
            "w": 947,
            "h": 575,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bf449f78709ee35862.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 5",
            "w": 949,
            "h": 587,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678be449f78709ee35854.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 6",
            "w": 945,
            "h": 577,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bfecd67a415b99a028.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 7",
            "w": 971,
            "h": 590,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678be449f78709ee35852.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 8",
            "w": 947,
            "h": 581,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bed2af304d12119efe.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 9",
            "w": 947,
            "h": 584,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678be449f78709ee3584c.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 10",
            "w": 953,
            "h": 580,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678beab53822e7e01ca65.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 11",
            "w": 961,
            "h": 593,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678beebdb915d9a718985.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 12",
            "w": 963,
            "h": 595,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678be449f78709ee35836.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 13",
            "w": 945,
            "h": 588,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bd449f78709ee3582e.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 14",
            "w": 946,
            "h": 586,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bd449f78709ee35818.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 15",
            "w": 955,
            "h": 590,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bdd2af304d12119ee8.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 16",
            "w": 955,
            "h": 588,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "II",
        "title": "Middle",
        "range": "Frames 17 — 32",
        "images": [
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bd449f78709ee3580b.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 17",
            "w": 960,
            "h": 596,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bdd2af304d12119ee2.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 18",
            "w": 957,
            "h": 585,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bc449f78709ee357f8.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 19",
            "w": 948,
            "h": 587,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bcab53822e7e01ca47.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 20",
            "w": 965,
            "h": 599,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bcd2af304d12119ec4.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 21",
            "w": 949,
            "h": 589,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bcd2af304d12119ec2.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 22",
            "w": 946,
            "h": 582,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bcecd67a415b999fbb.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 23",
            "w": 954,
            "h": 589,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bc449f78709ee357ea.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 24",
            "w": 950,
            "h": 575,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bcab53822e7e01ca39.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 25",
            "w": 943,
            "h": 578,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bbecd67a415b999fb0.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 26",
            "w": 944,
            "h": 586,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bb449f78709ee357b0.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 27",
            "w": 941,
            "h": 583,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bbebdb915d9a71890b.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 28",
            "w": 963,
            "h": 595,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bbd2af304d12119eb4.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 29",
            "w": 955,
            "h": 590,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bb449f78709ee357ae.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 30",
            "w": 959,
            "h": 588,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bbab53822e7e01ca13.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 31",
            "w": 947,
            "h": 577,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678baecd67a415b999f88.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 32",
            "w": 945,
            "h": 578,
            "orientation": "l"
          }
        ]
      },
      {
        "numeral": "III",
        "title": "Ending",
        "range": "Frames 33 — 48",
        "images": [
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678baecd67a415b999f89.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 33",
            "w": 970,
            "h": 586,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678baecd67a415b999f8f.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 34",
            "w": 947,
            "h": 586,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678baebdb915d9a7188d7.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 35",
            "w": 948,
            "h": 590,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678baab53822e7e01ca01.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 36",
            "w": 953,
            "h": 585,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678bad2af304d12119e98.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 37",
            "w": 952,
            "h": 591,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9ecd67a415b999f67.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 38",
            "w": 946,
            "h": 587,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9ebdb915d9a7188ac.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 39",
            "w": 968,
            "h": 596,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9ab53822e7e01c9f7.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 40",
            "w": 952,
            "h": 590,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9ebdb915d9a7188ab.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 41",
            "w": 962,
            "h": 595,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9ab53822e7e01c9f5.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 42",
            "w": 947,
            "h": 580,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b9449f78709ee35773.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 43",
            "w": 955,
            "h": 585,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b7ecd67a415b999f4d.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 44",
            "w": 946,
            "h": 580,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b7d2af304d12119e68.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 45",
            "w": 945,
            "h": 584,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b7d2af304d12119e67.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 46",
            "w": 950,
            "h": 582,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b7ecd67a415b999f4c.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 47",
            "w": 949,
            "h": 580,
            "orientation": "l"
          },
          {
            "url": "https://cdn.armanarai.com/ca/galleries/eleanor-james/6a1678b7d2af304d12119e66.png",
            "alt": "Eleanor and James's Cape Cod wedding, frame 48",
            "w": 944,
            "h": 581,
            "orientation": "l"
          }
        ]
      }
    ]
  }
];

export function galleryBySlug(slug: string): Gallery | undefined {
  return GALLERIES.find((g) => g.slug === slug);
}

export const GALLERY_SLUGS = GALLERIES.map((g) => g.slug);
