export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM pages ORDER BY created_at DESC").all();
  const withUrls = results.map((p) => ({ ...p, image_url: p.r2_key ? `/photos/${p.r2_key}` : null }));
  return new Response(JSON.stringify({ pages: withUrls }), {
    headers: { "Content-Type": "application/json" },
  });
}
