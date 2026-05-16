/**
 * Property listings for Joseph's Retreat (Phase 1 UI).
 * Replace image URLs with your real links; later phases will load from MongoDB API.
 */
export const dummyProperties = [
  {
    id: "1",
    slug: "amber-house",
    title: "Amber House",
    location: "Delhi, India",
    description:
      "A warm, inviting retreat with thoughtful touches throughout. Perfect for couples or small families seeking a calm, comfortable stay at Joseph's Retreat.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        caption: "Living area",
      },
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        caption: "Bedroom",
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        caption: "Kitchen",
      },
    ],
    amenities: ["WiFi", "Air conditioning", "Full kitchen", "Self check-in", "Workspace"],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 4500,
    cleaningFee: 600,
    rules: ["No smoking", "No parties", "Quiet hours after 10 PM"],
  },
  {
    id: "2",
    slug: "rooftop-serenity",
    title: "Rooftop Serenity",
    location: "Delhi, India",
    description:
      "Elevated calm with rooftop views and open, airy spaces. Ideal for guests who want a peaceful escape with modern comforts at Joseph's Retreat.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        caption: "Living room",
      },
      {
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        caption: "Rooftop lounge",
      },
      {
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        caption: "Exterior",
      },
    ],
    amenities: ["WiFi", "Rooftop access", "Full kitchen", "Washer", "Balcony", "TV"],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    pricePerNight: 5800,
    cleaningFee: 800,
    rules: ["No smoking indoors", "Guests only on rooftop", "Check-out by 11 AM"],
  },
];

/** Find one property by URL slug */
export function getPropertyBySlug(slug) {
  return dummyProperties.find((p) => p.slug === slug);
}
