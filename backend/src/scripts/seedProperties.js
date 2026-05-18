/**
 * Seed Amber House & Rooftop Serenity into MongoDB.
 * Run: node src/scripts/seedProperties.js
 */
import "dotenv/config";
import connectDB from "../config/db.js";
import Property from "../models/Property.js";
import {
  AIRBNB_ICAL_AMBER_HOUSE,
  AIRBNB_ICAL_ROOFTOP_SERENITY,
} from "../config/calendarConfig.js";

const properties = [
  {
    title: "Amber House",
    slug: "amber-house",
    calendarSlug: "property-1",
    airbnbIcalUrl: AIRBNB_ICAL_AMBER_HOUSE,
    description:
      "Your cozy city escape — warm interiors, fully equipped kitchen, and modern amenities minutes from the metro.",
    location: {
      city: "Delhi",
      country: "India",
      area: "Rohini",
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
  {
    title: "Rooftop Serenity",
    slug: "rooftop-serenity",
    calendarSlug: "property-2",
    airbnbIcalUrl: AIRBNB_ICAL_ROOFTOP_SERENITY,
    description:
      "Peaceful 4th-floor stay with a movie hall, HD projector, and mini game room.",
    location: {
      city: "Delhi",
      country: "India",
      area: "Rohini",
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
];

async function seed() {
  await connectDB();

  for (const data of properties) {
    await Property.findOneAndUpdate({ slug: data.slug }, data, {
      upsert: true,
      new: true,
    });
    console.log(`Seeded: ${data.title} (${data.calendarSlug || "no calendar"})`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
