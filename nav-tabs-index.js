function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM nav_tabs ORDER BY sort_order ASC").all();
  return new Response(JSON.stringify({ tabs: results }), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const body = await request.json();
  const label = (body.label || "").toString();
  const url = (body.url || "").toString();
  const sort_order = parseInt(body.sort_order, 10) || 0;

  if (!label || !url) {
    return new Response(JSON.stringify({ error: "Tab name and link are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await env.DB.prepare(`INSERT INTO nav_tabs (label, url, sort_order) VALUES (?, ?, ?)`)
    .bind(label, url, sort_order)
    .run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
    headers: { "Content-Type": "application/json" },
  });
}
