function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM faq ORDER BY created_at ASC").all();
  return new Response(JSON.stringify({ faq: results }), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const form = await request.formData();
  const question = (form.get("question") || "").toString();
  const answer = (form.get("answer") || "").toString();
  if (!question) {
    return new Response(JSON.stringify({ error: "Question is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const result = await env.DB.prepare(`INSERT INTO faq (question, answer, uploaded_by) VALUES (?, ?, ?)`)
    .bind(question, answer, env.ADMIN_USER)
    .run();
  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
    headers: { "Content-Type": "application/json" },
  });
}
