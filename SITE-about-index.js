const PUBLIC_SITE = "https://mhbuilderlahore.site";

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT * FROM about WHERE id = 1").first();
  const withUrl = row ? { ...row, image_url: row.r2_key ? `${PUBLIC_SITE}/photos/${row.r2_key}` : null } : {};
  return new Response(JSON.stringify({ about: withUrl }), { headers: { "Content-Type": "application/json" } });
}
