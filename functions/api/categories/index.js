export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM categories ORDER BY name ASC").all();
  const withUrls = results.map((c) => ({
    ...c,
    image_url: c.r2_key ? `/photos/${c.r2_key}` : null,
  }));
  return new Response(JSON.stringify({ categories: withUrls }), {
    headers: { "Content-Type": "application/json" },
  });
}
