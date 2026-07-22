const PUBLIC_SITE = "https://mhbuilderlahore.site";

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(":");
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

function buildSchema({ name, content, metaDescription, imageUrl }) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: name || "",
      description: metaDescription || content || "",
      image: imageUrl || undefined,
    },
    null,
    2
  );
}

export async function onRequestDelete({ params, request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = params.id;
  const row = await env.DB.prepare("SELECT r2_key FROM categories WHERE id = ?").bind(id).first();
  if (!row) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (row.r2_key) {
    await env.PHOTOS_BUCKET.delete(row.r2_key);
  }
  await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

// Update an existing category's details, and optionally replace its picture
export async function onRequestPut({ params, request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = params.id;
  const existing = await env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
  if (!existing) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const name = (form.get("name") || existing.name).toString();
  const content = (form.get("content") || existing.content || "").toString();
  const metaDescription = (form.get("metaDescription") || existing.meta_description || "").toString();
  const picture = form.get("picture");

  let r2Key = existing.r2_key;
  if (picture && typeof picture !== "string") {
    if (existing.r2_key) await env.PHOTOS_BUCKET.delete(existing.r2_key);
    const ext = picture.name.split(".").pop();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    r2Key = `category-${slug}-${Date.now()}.${ext}`;
    await env.PHOTOS_BUCKET.put(r2Key, picture.stream(), { httpMetadata: { contentType: picture.type } });
  }

  const imageUrl = r2Key ? `${PUBLIC_SITE}/photos/${r2Key}` : null;
  const schemaMarkup = buildSchema({ name, content, metaDescription, imageUrl });

  await env.DB.prepare(
    `UPDATE categories SET name = ?, content = ?, meta_description = ?, schema_markup = ?, r2_key = ?, updated_at = datetime('now') WHERE id = ?`
  )
    .bind(name, content, metaDescription, schemaMarkup, r2Key, id)
    .run();

  return new Response(JSON.stringify({ ok: true, id, image_url: imageUrl }), {
    headers: { "Content-Type": "application/json" },
  });
}
