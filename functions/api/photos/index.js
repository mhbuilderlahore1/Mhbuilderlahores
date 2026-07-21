const PUBLIC_SITE = "https://mhbuilderlahore.site";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  let query = "SELECT * FROM photos";
  const binds = [];
  if (category) {
    query += " WHERE category = ?";
    binds.push(category);
  }
  query += " ORDER BY created_at DESC";

  const { results } = await env.DB.prepare(query).bind(...binds).all();

  const withUrls = results.map((p) => ({
    ...p,
    image_url: `${PUBLIC_SITE}/photos/${p.r2_key}`,
  }));

  return new Response(JSON.stringify({ photos: withUrls }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
