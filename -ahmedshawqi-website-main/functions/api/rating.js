// Cloudflare Pages Function
// Route: /api/rating
// Requires a KV namespace bound as "RATINGS" in Cloudflare dashboard.
// GET -> { average, count }
// POST body { stars: 1-5 } -> updates running average, returns { average, count }

const KEY = 'site_rating_v1';

export async function onRequestGet(context) {
  try {
    const raw = await context.env.RATINGS.get(KEY);
    const data = raw ? JSON.parse(raw) : { total: 0, count: 0 };
    const average = data.count > 0 ? (data.total / data.count) : 0;
    return new Response(JSON.stringify({ average: Math.round(average * 10) / 10, count: data.count }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ average: 0, count: 0, error: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const stars = parseInt(body.stars, 10);
    if (!stars || stars < 1 || stars > 5) {
      return new Response(JSON.stringify({ error: true, message: 'invalid stars value' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    const raw = await context.env.RATINGS.get(KEY);
    const data = raw ? JSON.parse(raw) : { total: 0, count: 0 };
    data.total += stars;
    data.count += 1;
    await context.env.RATINGS.put(KEY, JSON.stringify(data));
    const average = data.total / data.count;
    return new Response(JSON.stringify({ average: Math.round(average * 10) / 10, count: data.count }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: true, message: 'submit failed' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }
}
