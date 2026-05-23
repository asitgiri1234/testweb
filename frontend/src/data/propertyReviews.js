/**
 * Featured Airbnb guest reviews (top 4 per property, synced from listing).
 * Source: Airbnb "most relevant" sort — update via scripts/scrape-airbnb-reviews.mjs
 */

const AIRBNB_REVIEWS_BASE = {
  "rooftop-serenity": "https://www.airbnb.co.uk/rooms/1666598775797444713/reviews",
  "amber-house": "https://www.airbnb.co.uk/rooms/1544236559464750907/reviews",
};

function reviewLink(listingSlug, reviewId) {
  const base = AIRBNB_REVIEWS_BASE[listingSlug];
  if (!base) return "#";
  if (!reviewId) return base;
  return `${base}?scroll_to_review=${reviewId}&review_page_entrypoint=show_more`;
}

function plainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatReviewDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

const RAW = {
  "rooftop-serenity": [
    {
      id: "1674557758524730464",
      guestName: "Bhoomi",
      rating: 5,
      dateLabel: "2026-04-29T10:47:20Z",
      text: "First of I have to mention how immaculate joels book collection was . I really loved reading them .\nthe place was bigger than it looked in the photos.\nhost was responsive and polite.\nreally loved the decore (stole some ideas as well)\nand the cleaning staff was also professional.\nthis place was exactly what I wanted after 16 hours flight. it was calm quite and comfortable. I'm looking forward to stay here again.",
    },
    {
      id: "1689782988777702208",
      guestName: "Himanshu",
      rating: 5,
      dateLabel: "2026-05-20T10:57:09Z",
      text: "Joel is a really good host, very friendly and helpful. The place was clean and well kept. The projector setup, game room and guitar gave it such a fun vibe. Would definitely come back.",
    },
    {
      id: "1688250589303318501",
      guestName: "Divyesh",
      rating: 5,
      dateLabel: "2026-05-18T08:12:33Z",
      text: "I had a wonderful stay at this flat. The space was cozy, comfortable, and well-equipped with all needed facilities. A special thanks to the host, who was incredibly polite and helpful—they even accommodated an early check-in, which I greatly appreciated. Highly recommended!",
    },
    {
      id: "1671593688603825067",
      guestName: "Jitin",
      rating: 5,
      dateLabel: "2026-04-25T08:38:16Z",
      text: "The place is really very amazing and Joel (the host) has maintained it so beautifully. It's neat and clean, amenities were exactly as mentioned, aesthetically decorated and beautiful classy furniture is there. Very much comfortable, calm and safe. The host is also very much cooperative, friendly and helpful. It's so compatible for friends group as well as couple night outs.\nThe only negative point for the property is that it's on the top floor, making it hot in summers, though the bedroom has an AC and Hall has a cooler too, to cope with it.",
    },
  ],
  "amber-house": [
    {
      id: "1691079520975870781",
      guestName: "Base Camp Munnar",
      rating: 5,
      dateLabel: "2026-05-22T05:53:08Z",
      text: "It was one of the finest Airbnbs I've stayed at. It felt beautifully maintained, and exactly as shown in the photographs.\nThe interior was thoughtfully arranged, and had such an aesthetic vibe. The location too was very convenient.\nWhat made the experience special was the fact that the host was responsive and helpful with everything. Would love to come back again and highly recommend it.",
    },
    {
      id: "1676706057806145827",
      guestName: "Rohit",
      rating: 5,
      dateLabel: "2026-05-02T09:55:37Z",
      text: "Our stay at this Airbnb was genuinely a great experience. The place was clean, well-maintained, and exactly as shown in the photos. The host was responsive and helpful, making check-in and communication smooth throughout our stay.\nThe location was convenient, with easy access to nearby shops and essential services. The space itself was comfortable and thoughtfully arranged, which made it feel like a home rather than just a rental.\nOverall, it was a pleasant and hassle-free stay. I would definitely recommend this place to anyone looking for a comfortable and reliable Airbnb experience.",
    },
    {
      id: "1589017309281200729",
      guestName: "Shambhavi",
      rating: 5,
      dateLabel: "2026-01-01T10:13:44Z",
      text: "Had a pretty wonderful stay at this place. The bnb was super clean and looked exactly as described in the listing.\nCheck in was easy and the location was pretty convenient too. The host was welcoming throughout my stay. And the little touches def added to the overall experience. It was such a cosy fit to celebrate. Would recommend it to everyone!",
    },
    {
      id: "1565035651117546124",
      guestName: "Wilhelmina",
      rating: 5,
      dateLabel: "2025-11-29T08:06:28Z",
      text: "Loved my stay here. The apartment is modern and very well kept. The beds were comfortable, lighting felt cozy, and the whole place smelled really fresh.\nWi-Fi worked smoothly for my work calls, and I really enjoyed spending time on the balcony.\nThe host was polite and responsive whenever I needed anything. Overall, great value for the location.",
    },
  ],
};

export const propertyReviewsBySlug = Object.fromEntries(
  Object.entries(RAW).map(([slug, reviews]) => [
    slug,
    {
      airbnbAllReviewsUrl: AIRBNB_REVIEWS_BASE[slug],
      reviews: reviews.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        rating: r.rating,
        date: formatReviewDate(r.dateLabel),
        text: plainText(r.text),
        airbnbUrl: reviewLink(slug, r.id),
      })),
    },
  ]),
);

export function getPropertyReviews(slug) {
  return propertyReviewsBySlug[slug] ?? null;
}
