const PUBLIC_SITE = "https://mhbuilderlahore.site";

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM owner_updates ORDER BY created_at DESC").all();
  const withUrls = results.map((u) => ({ ...u, image_url: u.r2_key ? `${PUBLIC_SITE}/photos/${u.r2_key}` : null }));
  return new Response(JSON.stringify({ updates: withUrls }), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const form = await request.formData();
  const content = (form.get("content") || "").toString();
  const picture = form.get("picture");

  if (!content) {
    return new Response(JSON.stringify({ error: "Content is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let r2Key = null;
  if (picture && typeof picture !== "string") {
    const ext = picture.name.split(".").pop();
    r2Key = `owner-${Date.now()}.${ext}`;
    await env.PHOTOS_BUCKET.put(r2Key, picture.stream(), { httpMetadata: { contentType: picture.type } });
  }

  const result = await env.DB.prepare(`INSERT INTO owner_updates (content, r2_key, uploaded_by) VALUES (?, ?, ?)`)
    .bind(content, r2Key, env.ADMIN_USER)
    .run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
    headers: { "Content-Type": "application/json" },
  });
    }
