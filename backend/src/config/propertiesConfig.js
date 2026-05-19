/**
 * Static property definitions — used when DB is empty or for calendar/booking fallback.
 */
import {
  AIRBNB_ICAL_AMBER_HOUSE,
  AIRBNB_ICAL_ROOFTOP_SERENITY,
} from "./calendarConfig.js";

export const STATIC_PROPERTIES = {
  "amber-house": {
    title: "Amber House",
    slug: "amber-house",
    calendarSlug: "property-1",
    airbnbIcalUrl: AIRBNB_ICAL_AMBER_HOUSE,
    description:
      "Your cozy city escape — warm interiors, fully equipped kitchen, and modern amenities minutes from the metro.",
    location: {
      city: "Delhi",
      country: "India",
      area: "Rohini Sector 15, New Delhi",
      address:
        "Rohini Sector 15 F Block 19/53, Rohini Pocket 19 House Number 53, Vaishno Dairy, Delhi, India",
    },
    images: [],
    amenities: ["WiFi", "Air conditioning", "Full kitchen", "Smart TV", "Projector"],
    minGuests: 1,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 2299,
    cleaningFee: 600,
    serviceFeePercent: 5,
    rules: ["Quiet hours from 11pm"],
    isActive: true,
  },
  "rooftop-serenity": {
    title: "Rooftop Serenity",
    slug: "rooftop-serenity",
    calendarSlug: "property-2",
    airbnbIcalUrl: AIRBNB_ICAL_ROOFTOP_SERENITY,
    description:
      "Peaceful 4th-floor stay with a movie hall, HD projector, and mini game room.",
    location: {
      city: "Delhi",
      country: "India",
      area: "Rohini Sector 15, New Delhi",
      address:
        "Rohini Sector 15 F Block 19/53, Rohini Pocket 19 House Number 53, Vaishno Dairy, Delhi, India",
    },
    images: [],
    amenities: ["WiFi", "Full kitchen", "HD projector", "Movie hall"],
    minGuests: 1,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 1999,
    cleaningFee: 800,
    serviceFeePercent: 5,
    rules: ["Quiet hours: 11pm–7am"],
    isActive: true,
  },
};

export function getStaticProperty(slug) {
  return STATIC_PROPERTIES[slug] || null;
}
