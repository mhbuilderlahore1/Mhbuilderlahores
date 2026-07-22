function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

export async function onRequestPut({ request, env, params }) {
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

  await env.DB.prepare(`UPDATE nav_tabs SET label = ?, url = ?, sort_order = ? WHERE id = ?`)
    .bind(label, url, sort_order, params.id)
    .run();

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestDelete({ request, env, params }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  await env.DB.prepare(`DELETE FROM nav_tabs WHERE id = ?`).bind(params.id).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
