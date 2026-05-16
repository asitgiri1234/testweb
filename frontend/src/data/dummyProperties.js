/**
 * Property listings for Joseph's Retreat
 */
export const dummyProperties = [
  {
    id: "1",
    slug: "amber-house",
    title: "Amber House",
    location: "Delhi, India",
    description:
      "Bathed in golden afternoon light, Amber House is an embrace of warmth — linen-draped beds, a kitchen awaiting quiet breakfasts, and corners designed for long conversations. Ideal for couples and small families who cherish intimacy without sacrificing comfort.",
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
      "Elevated above the city's gentle hum, Rooftop Serenity offers open skies and unhurried calm. Sunlit interiors flow toward a private rooftop — a sanctuary for morning coffee, evening wine, and the rare pleasure of doing very little, beautifully.",
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

export function getPropertyBySlug(slug) {
  return dummyProperties.find((p) => p.slug === slug);
}
