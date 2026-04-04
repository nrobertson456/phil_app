/**
 * Inspiration routes: Broadway-themed image gallery + search.
 *
 * Uses free Wikipedia APIs (Wikimedia) to fetch real images and extracts.
 * This backend acts as a proxy to avoid browser CORS/security issues.
 */
import express from 'express';

const router = express.Router();

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

const FETCH_TIMEOUT_MS = 8000;

// Very small in-memory cache to reduce repeated API hits.
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

function getCached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key, value) {
  cache.set(key, { ts: Date.now(), value });
}

function buildWikiImageSearchUrl(search, limit) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',

    generator: 'search',
    gsrnamespace: '0',
    gsrsearch: search,
    gsrlimit: String(limit),

    // Pull a thumbnail + a short intro extract for "information" in the UI.
    prop: 'pageimages|extracts',
    exintro: '1',
    explaintext: '1',
    exlimit: '1',

    piprop: 'thumbnail',
    pithumbsize: '240',
    pilicense: 'any',

    // Make sure we get thumbnails where possible.
    // pageimages/piprop are enough, but we keep the request explicit.
  });

  return `${WIKIPEDIA_API}?${params.toString()}`;
}

function pageToItem(page) {
  if (!page) return null;
  const title = page.title;
  const pageId = page.pageid;
  const thumb = page.thumbnail || {};

  // Different Wikipedia responses expose thumbnail URLs slightly differently.
  const imageUrl = thumb.source || page.image?.source || null;
  if (!imageUrl) return null;

  const description = page.extract || '';
  const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title).replace(/%2F/g, '/')}`;

  return {
    id: String(pageId),
    title,
    description,
    imageUrl,
    pageUrl,
  };
}

async function wikiSearchImages(search, limit = 10) {
  const cacheKey = `search:${search}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = buildWikiImageSearchUrl(search, limit);

  try {
    if (typeof fetch !== 'function') return [];

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Wikipedia / Wikimedia are happier when you send a UA with a contact.
        'User-Agent': 'phil-app inspiration-gallery (contact: support@phil-app.local)',
        Accept: 'application/json',
      },
    }).finally(() => clearTimeout(t));

    if (!res || !res.ok) return [];

    const data = await res.json().catch(() => null);
    if (!data) return [];

    const pages = Object.values(data?.query?.pages || {});
    const items = pages.map(pageToItem).filter(Boolean);

    setCached(cacheKey, items);
    return items;
  } catch {
    // Never fail the server due to a third-party API.
    return [];
  }
}

router.get('/gallery', async (req, res) => {
  try {
    const queries = [
      'Broadway musical',
      'Broadway actor',
      'Tony Award',
      'playbill',
      'musical theatre',
      'Broadway theatre',
      'Hamilton',
      'The Phantom of the Opera',
    ];

    // Shuffle queries each request for variety.
    const shuffled = queries
      .map((q) => ({ q, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((x) => x.q);

    const limitPerQuery = 6;
    const maxItems = 14;

    const all = [];
    for (const q of shuffled.slice(0, 4)) {
      // eslint-disable-next-line no-await-in-loop
      const items = await wikiSearchImages(q, limitPerQuery);
      all.push(...items);
      if (all.length >= maxItems) break;
    }

    // De-dupe by id.
    const seen = new Set();
    const uniq = [];
    for (const it of all) {
      if (seen.has(it.id)) continue;
      uniq.push(it);
      seen.add(it.id);
      if (uniq.length >= maxItems) break;
    }

    // Always return 200 so the sidebar never triggers an "Internal Server Error".
    res.json({ items: uniq, warning: uniq.length ? undefined : 'No inspiration images available right now.' });
  } catch (err) {
    res.json({ items: [], warning: err?.message || 'Failed to load inspiration gallery.' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const term = String(req.query.term || '').trim();
    if (term.length < 2) return res.json({ items: [] });

    // Pull a bit more then filter duplicates client-side for a nicer set.
    const items = await wikiSearchImages(term, 12);
    res.json({ items });
  } catch (err) {
    res.json({ items: [], warning: err?.message || 'Failed to search inspiration.' });
  }
});

export default router;

