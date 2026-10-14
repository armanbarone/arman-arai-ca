import { VANCOUVER_WORK, type WorkPhoto } from "@/lib/ads/hub-work";
import { landingWorkPhotos } from "@/lib/ads/landing-work-selection";

// Keep displayed photographs 01–11 from the existing Vancouver landing album.
// Its displayed 12–16 stay out of this page; the original album is unchanged.
const previous = landingWorkPhotos("vancouver", VANCOUVER_WORK).slice(0, 11);
const folder = "https://cdn.armanarai.ca/Landing%20Page%20Pics/";

const added: WorkPhoto[] = [
  { src: `${folder}0009xc00.png`, alt: "A groom carrying his bride through a vineyard in glowing sunset light", width: 2048, height: 1536 },
  { src: `${folder}0009xc01.png`, alt: "A bride and groom close together beneath pink cherry blossoms in warm backlight", width: 2048, height: 1536 },
  { src: `${folder}0009xc02.png`, alt: "A couple standing together under golden autumn leaves in a garden", width: 2048, height: 1536 },
  { src: `${folder}0009xc03.png`, alt: "A bride in a white cheongsam framed by a circular garden doorway, her groom beside her", width: 2048, height: 1536 },
  { src: `${folder}0009xc04.png`, alt: "A laughing bride and groom together in the water, black and white", width: 2016, height: 1344 },
  { src: `${folder}0009xc05.jpg`, alt: "A bride and groom sharing a clear umbrella on the steps between stone columns", width: 1004, height: 671 },
];

export const VANCOUVER_SIMPLE_GALLERY: WorkPhoto[] = [...previous, ...added];
