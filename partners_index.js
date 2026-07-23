const PUBLIC_SITE = "https://mhbuilderlahore.site";

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

// GET /api/partners — list all partners (used by website.html footer + admin panel list)
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM partners ORDER BY created_at DESC"
  ).all();

  const withUrls = results.map((p) => ({
    ...p,
    logo_url: p.r2_key ? `${PUBLIC_SITE}/photos/${p.r2_key}` : null,
  }));

  return new Response(JSON.stringify({ partners: withUrls }), {
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/partners — create a new partner (used by admin panel "Save" when adding a new logo)
export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const name = (form.get("name") || "").toString().trim();
  const link = (form.get("link") || "").toString();
  const logo = form.get("logo");

  if (!name) {
    return new Response(JSON.stringify({ error: "Company name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let r2Key = null;
  if (logo && typeof logo !== "string") {
    const ext = logo.name.split(".").pop();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    r2Key = `partner-${slug}-${Date.now()}.${ext}`;
    await env.PHOTOS_BUCKET.put(r2Key, logo.stream(), { httpMetadata: { contentType: logo.type } });
  }

  const result = await env.DB.prepare(
    `INSERT INTO partners (name, link, r2_key, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(name, link, r2Key)
    .run();

  return new Response(
    JSON.stringify({ ok: true, id: result.meta.last_row_id }),
    { headers: { "Content-Type": "application/json" } }
  );
}
