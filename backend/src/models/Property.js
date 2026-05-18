/**
 * Property model — stores listing data shown on the website.
 * Image URLs will be real links you provide later.
 */
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    /** ICS export slug for Airbnb sync, e.g. property-1 */
    calendarSlug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    airbnbIcalUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      city: String,
      country: { type: String, default: "India" },
      address: String,
    },
    // Replace placeholder URLs with your real image links in a later phase
    images: [
      {
        url: { type: String, required: true },
        caption: String,
      },
    ],
    amenities: [String],
    minGuests: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    cleaningFee: { type: Number, default: 0 },
    serviceFeePercent: { type: Number, default: 5 },
    rules: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
