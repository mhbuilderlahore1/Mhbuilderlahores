export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM owner_updates ORDER BY created_at DESC").all();
  const withUrls = results.map((u) => ({ ...u, image_url: u.r2_key ? `/photos/${u.r2_key}` : null }));
  return new Response(JSON.stringify({ updates: withUrls }), { headers: { "Content-Type": "application/json" } });
}
