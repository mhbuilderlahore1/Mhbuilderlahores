const PUBLIC_SITE = "https://mhbuilderlahore.site";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM partners ORDER BY created_at DESC").all();

  const withUrls = results.map((p) => ({
    ...p,
    logo_url: p.r2_key ? `${PUBLIC_SITE}/photos/${p.r2_key}` : null,
  }));

  return new Response(JSON.stringify({ partners: withUrls }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
    }
