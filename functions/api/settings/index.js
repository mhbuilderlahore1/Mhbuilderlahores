export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT * FROM settings WHERE id = 1").first();
  return new Response(JSON.stringify({ settings: row || {} }), {
    headers: { "Content-Type": "application/json" },
  });
}
