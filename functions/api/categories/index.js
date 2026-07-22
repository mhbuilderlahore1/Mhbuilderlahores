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

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM categories ORDER BY name ASC").all();
  const withUrls = results.map((c) => ({
    ...c,
    image_url: c.r2_key ? `${PUBLIC_SITE}/photos/${c.r2_key}` : null,
  }));
  return new Response(JSON.stringify({ categories: withUrls }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const name = (form.get("name") || "").toString();
  const content = (form.get("content") || "").toString();
  const metaDescription = (form.get("metaDescription") || "").toString();
  const picture = form.get("picture");

  if (!name) {
    return new Response(JSON.stringify({ error: "Category name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  let r2Key = null;
  if (picture && typeof picture !== "string") {
    const ext = picture.name.split(".").pop();
    r2Key = `category-${slug}-${Date.now()}.${ext}`;
    await env.PHOTOS_BUCKET.put(r2Key, picture.stream(), {
      httpMetadata: { contentType: picture.type },
    });
  }

  const imageUrl = r2Key ? `${PUBLIC_SITE}/photos/${r2Key}` : null;
  const schemaMarkup = buildSchema({ name, content, metaDescription, imageUrl });

  await env.DB.prepare(
    `INSERT INTO categories (slug, name, content, r2_key, meta_description, schema_markup, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       name = excluded.name,
       content = excluded.content,
       r2_key = COALESCE(excluded.r2_key, categories.r2_key),
       meta_description = excluded.meta_description,
       schema_markup = excluded.schema_markup,
       updated_at = datetime('now')`
  )
    .bind(slug, name, content, r2Key, metaDescription, schemaMarkup, env.ADMIN_USER)
    .run();

  return new Response(JSON.stringify({ ok: true, slug, image_url: imageUrl }), {
    headers: { "Content-Type": "application/json" },
  });
}
