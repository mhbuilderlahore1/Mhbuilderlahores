const PUBLIC_SITE = "https://mhbuilderlahore.site";

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
  const withUrls = results.map((r) => ({ ...r, photo_url: r.r2_key ? `${PUBLIC_SITE}/photos/${r.r2_key}` : null }));
  return new Response(JSON.stringify({ reviews: withUrls }), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const form = await request.formData();
  const customerName = (form.get("customerName") || "").toString();
  const rating = parseInt(form.get("rating") || "5", 10);
  const content = (form.get("content") || "").toString();
  const photo = form.get("photo");

  if (!customerName) {
    return new Response(JSON.stringify({ error: "Customer name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let r2Key = null;
  if (photo && typeof photo !== "string") {
    const ext = photo.name.split(".").pop();
    r2Key = `review-${Date.now()}.${ext}`;
    await env.PHOTOS_BUCKET.put(r2Key, photo.stream(), { httpMetadata: { contentType: photo.type } });
  }

  const result = await env.DB.prepare(
    `INSERT INTO reviews (customer_name, rating, content, r2_key, uploaded_by) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(customerName, rating, content, r2Key, env.ADMIN_USER)
    .run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
    headers: { "Content-Type": "application/json" },
  });
}
