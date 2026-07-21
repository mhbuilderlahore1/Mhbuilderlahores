export async function onRequestGet(context) {
  const { params, env } = context;

  const key = params.filename;

  const object = await env.PHOTOS_BUCKET.get(key);

  if (!object) {
    return new Response("Image not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers,
  });
}
