/**
 * Seed Amber House & Rooftop Serenity into MongoDB.
 * Run: node src/scripts/seedProperties.js
 */
import "dotenv/config";
import connectDB from "../config/db.js";
import Property from "../models/Property.js";
import { AIRBNB_ICAL_AMBER_HOUSE } from "../config/calendarConfig.js";

const properties = [
  {
    title: "Amber House",
    slug: "amber-house",
    calendarSlug: "property-1",
    airbnbIcalUrl: AIRBNB_ICAL_AMBER_HOUSE,
    description:
      "Your cozy city escape — warm interiors, fully equipped kitchen, and modern amenities minutes from the metro.",
    location: { city: "Delhi", country: "India" },
    images: [],
    amenities: ["WiFi", "Air conditioning", "Full kitchen", "Smart TV", "Projector"],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 4500,
    cleaningFee: 600,
    serviceFeePercent: 5,
    rules: ["Quiet hours from 11pm"],
    isActive: true,
  },
  {
    title: "Rooftop Serenity",
    slug: "rooftop-serenity",
    calendarSlug: "property-2",
    airbnbIcalUrl: "",
    description:
      "Peaceful 4th-floor stay with a movie hall, HD projector, and mini game room.",
    location: { city: "Delhi", country: "India" },
    images: [],
    amenities: ["WiFi", "Full kitchen", "HD projector", "Movie hall"],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    pricePerNight: 5800,
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
