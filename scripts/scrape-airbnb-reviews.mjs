/**
 * Scrape Airbnb reviews via network interception (StaysPdpReviewsQuery).
 */
import { chromium } from "playwright";
import fs from "fs";

const LISTINGS = [
  {
    slug: "rooftop-serenity",
    listingId: "1666598775797444713",
    allReviewsUrl:
      "https://www.airbnb.co.uk/rooms/1666598775797444713/reviews",
  },
  {
    slug: "amber-house",
    listingId: "1544236559464750907",
    allReviewsUrl:
      "https://www.airbnb.co.uk/rooms/1544236559464750907/reviews",
  },
];

function parseReviewNode(node) {
  if (!node || typeof node !== "object") return null;

  const comments =
    node.comments ||
    node.comment ||
    node.publicComment ||
    node.localizedReview?.comments ||
    node.translation?.comments ||
    node.reviewBody;

  if (!comments || typeof comments !== "string" || comments.length < 20) return null;

  const reviewer = node.reviewer || node.author || {};
  const guestName =
    reviewer.firstName ||
    reviewer.localizedDescription ||
    reviewer.name ||
    "Guest";

  const rating =
    node.rating ??
    node.displayRating ??
    node.overallRating ??
    5;

  const id = node.id || node.reviewId || null;

  const createdAt =
    node.createdAt ||
    node.localizedDate ||
    node.subtitle ||
    null;

  return {
    id: id ? String(id) : null,
    guestName: String(guestName).trim(),
    rating: Number(rating) || 5,
    dateLabel: createdAt ? String(createdAt) : "",
    text: comments.trim(),
  };
}

function collectReviewsFromJson(json) {
  const found = [];
  const walk = (obj) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    const parsed = parseReviewNode(obj);
    if (parsed) found.push(parsed);
    Object.values(obj).forEach(walk);
  };
  walk(json);
  const seen = new Set();
  return found.filter((r) => {
    const key = r.text.slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function scrapeListing(page, listing) {
  const captured = [];

  page.on("response", async (response) => {
    const url = response.url();
    if (
      !url.includes("/api/v3/") ||
      (!url.includes("Review") && !url.includes("review"))
    ) {
      return;
    }
    try {
      const json = await response.json();
      captured.push(...collectReviewsFromJson(json));
    } catch {
      /* not json */
    }
  });

  await page.goto(listing.allReviewsUrl, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  await page.waitForTimeout(3000);

  for (const label of ["Accept", "OK", "Got it"]) {
    const btn = page.getByRole("button", { name: label }).first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await btn.click().catch(() => {});
    }
  }

  // Scroll to load more reviews
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1200);
  }

  const unique = [];
  const seen = new Set();
  for (const r of captured) {
    const key = r.text.slice(0, 80);
    if (seen.has(key) || r.text.length < 25) continue;
    seen.add(key);
    unique.push({
      ...r,
      airbnbUrl: r.id
        ? `${listing.allReviewsUrl}?scroll_to_review=${r.id}&review_page_entrypoint=show_more`
        : listing.allReviewsUrl,
    });
  }

  return unique.slice(0, 4);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "en-GB",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  const output = {};

  for (const listing of LISTINGS) {
    console.log("Scraping", listing.slug, "...");
    try {
      const reviews = await scrapeListing(page, listing);
      output[listing.slug] = reviews;
      console.log(`  ${reviews.length} reviews`);
      reviews.forEach((r, i) =>
        console.log(`  ${i + 1}. ${r.guestName} (${r.rating}★) — ${r.text.slice(0, 70)}...`),
      );
    } catch (err) {
      console.error("  failed:", err.message);
      output[listing.slug] = [];
    }
  }

  await browser.close();
  fs.writeFileSync(
    "frontend/src/data/scraped-reviews.json",
    JSON.stringify(output, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
