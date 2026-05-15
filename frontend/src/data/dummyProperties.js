/**
 * Temporary property data for Phase 1 UI.
 * Replace image URLs with your real links; later phases will load from MongoDB API.
 */
export const dummyProperties = [
  {
    id: "1",
    slug: "cozy-studio-downtown",
    title: "Cozy Studio — Downtown",
    location: "Mumbai, India",
    description:
      "A bright studio perfect for solo travelers or couples. Walk to cafes, metro, and nightlife. Self check-in with smart lock.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        caption: "Living area",
      },
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        caption: "Bedroom nook",
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        caption: "Kitchenette",
      },
    ],
    amenities: ["WiFi", "Air conditioning", "Kitchenette", "Self check-in", "Workspace"],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 3500,
    cleaningFee: 500,
    rules: ["No smoking", "No parties", "Quiet hours after 10 PM"],
  },
  {
    id: "2",
    slug: "family-apartment-suburbs",
    title: "Family Apartment — Suburbs",
    location: "Pune, India",
    description:
      "Spacious 2-bedroom apartment with full kitchen and parking. Ideal for families or small groups visiting for a longer stay.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        caption: "Living room",
      },
      {
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        caption: "Dining area",
      },
      {
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        caption: "Exterior",
      },
    ],
    amenities: ["WiFi", "Free parking", "Full kitchen", "Washer", "Balcony", "TV"],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    pricePerNight: 5200,
    cleaningFee: 800,
    rules: ["No smoking indoors", "Pets on request", "Check-out by 11 AM"],
  },
];

/** Find one property by URL slug */
export function getPropertyBySlug(slug) {
  return dummyProperties.find((p) => p.slug === slug);
}
