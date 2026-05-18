/**
 * Property listings for Joseph's Retreat
 */
import { amberHouseImages } from "./amberHouseImages.js";
import { rooftopSerenityImages } from "./rooftopSerenityImages.js";
import {
  PROPERTY_ADDRESS,
  PROPERTY_AREA_LABEL,
  getGoogleMapsUrl,
} from "../config/propertyLocation.js";

const sharedLocation = {
  area: PROPERTY_AREA_LABEL,
  address: PROPERTY_ADDRESS,
  mapsUrl: getGoogleMapsUrl(),
};

export const dummyProperties = [
  {
    id: "1",
    slug: "amber-house",
    calendarSlug: "property-1",
    title: "Amber House",
    location: PROPERTY_AREA_LABEL,
    ...sharedLocation,
    description:
      "Your cozy city escape — warm interiors, fully equipped kitchen, and modern amenities minutes from the metro.",
    descriptionSections: [
      {
        heading: "About this space",
        paragraphs: [
          "Amber House — your cozy city escape.",
          "Enjoy a first-floor stay with warm interiors, fast Wi-Fi, a fully equipped kitchen, and all modern amenities. Just 5 minutes from the metro and market for ultimate convenience.",
          "Features 1 master bedroom perfect for couples, families, and working travellers seeking comfort and quality time.",
        ],
        warnings: ["⚠️ Quiet hours — from 11pm"],
      },
      {
        heading: "The space",
        paragraphs: [
          "Cozy 1.5 BHK with a warm, inviting living room, Smart TV (all OTT platforms), and a peaceful atmosphere surrounded by indoor plants. Features a master bedroom, another movie room with a projector for movie nights, warm ambient lighting, a study lamp for WFH, high-speed Wi-Fi, and a fully equipped kitchen. Comfortable for up to 5 adults.",
        ],
      },
    ],
    images: amberHouseImages,
    amenities: ["WiFi", "Air conditioning", "Full kitchen", "Self check-in", "Workspace", "Smart TV", "Projector"],
    minGuests: 3,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 2399,
    cleaningFee: 600,
    rules: ["No smoking", "No parties", "Quiet hours from 11pm"],
  },
  {
    id: "2",
    slug: "rooftop-serenity",
    calendarSlug: "property-2",
    title: "Rooftop Serenity",
    location: PROPERTY_AREA_LABEL,
    ...sharedLocation,
    description:
      "Peaceful 4th-floor stay with a movie hall, HD projector, speaker system, and a mini game room for couples.",
    descriptionSections: [
      {
        heading: "About this space",
        paragraphs: [
          "Rooftop Serenity: a peaceful stay at 4th floor — with a movie hall, a HD projector and speaker system.",
          "Stream your fav shows on Netflix, Prime and Hotstar for a seamless entertainment experience.",
          "Has a mini game room for couples to play games, read, and spend quality time together.",
          "Relax and unwind in a beautifully designed master bedroom, an aesthetic showcase of posters and a statement mirror.",
        ],
        warnings: [
          "⚠️ Quiet hours: 11pm–7am",
          "⚠️ Property doesn't have any lift",
          "⚠️ Fine ₹500 if electricity is left on",
        ],
      },
      {
        heading: "Guest access",
        paragraphs: ["Whole flat"],
      },
    ],
    images: rooftopSerenityImages,
    amenities: ["WiFi", "Full kitchen", "HD projector", "Speaker system", "Movie hall", "Game room", "TV"],
    minGuests: 3,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 1999,
    cleaningFee: 800,
    rules: [
      "Quiet hours: 11pm–7am",
      "No lift in building — 4th floor walk-up",
      "Fine ₹500 if electricity is left on",
    ],
  },
];

export function getPropertyBySlug(slug) {
  return dummyProperties.find((p) => p.slug === slug);
}
