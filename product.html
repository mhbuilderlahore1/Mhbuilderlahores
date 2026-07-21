<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title id="pageTitle">MHBuilder Lahore</title>
<meta name="description" id="pageMeta" content="">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,'Segoe UI',Roboto,sans-serif; background:#1a1a1a; color:#e8e8e8; min-height:100vh; }
  .topbar { background:#202124; padding:14px 18px; border-bottom:1px solid #3c3c3c; display:flex; align-items:center; gap:12px; }
  .topbar a { color:#8ab4f8; text-decoration:none; font-size:14px; }
  .wrap { max-width:720px; margin:0 auto; padding:20px 16px 60px; }
  .hero { width:100%; max-height:320px; object-fit:cover; border-radius:12px; display:block; margin-bottom:20px; }
  h1 { font-size:22px; font-weight:700; margin-bottom:6px; }
  .price { font-size:16px; color:#8ab4f8; font-weight:700; margin-bottom:4px; }
  .category { font-size:12px; color:#9aa0a6; margin-bottom:16px; }
  .content { font-size:15px; line-height:1.8; color:#bdc1c6; white-space:pre-line; }
  .link-btn { display:inline-block; margin-top:20px; background:#8ab4f8; color:#202124; padding:11px 20px; border-radius:20px; font-size:14px; font-weight:700; text-decoration:none; }
  .whatsapp-btn { display:inline-block; margin-top:20px; margin-left:10px; background:#25d366; color:#202124; padding:11px 20px; border-radius:20px; font-size:14px; font-weight:700; text-decoration:none; }
  .loading, .error { padding:40px 0; text-align:center; color:#9aa0a6; font-size:14px; }
  .share-row { display:flex; gap:8px; margin-top:16px; flex-wrap:wrap; }
  .share-btn { background:#2a2b2f; border:1px solid #3c3c3c; color:#e8eaed; font-size:12px; padding:9px 14px; border-radius:18px; text-decoration:none; cursor:pointer; }
</style>
</head>
<body>
<div class="topbar"><a href="index.html">‹ Back to Home</a></div>
<div class="wrap" id="content">
  <div class="loading">Loading...</div>
</div>

<script>
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  async function loadProduct() {
    const el = document.getElementById("content");
    if (!slug) { el.innerHTML = '<div class="error">Product not specified.</div>'; return; }
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      const product = (data.products || []).find((p) => p.slug === slug);
      if (!product) { el.innerHTML = '<div class="error">Product not found.</div>'; return; }

      document.title = product.name + " — MHBuilder Lahore";
      document.getElementById("pageTitle").textContent = product.name + " — MHBuilder Lahore";
      document.getElementById("pageMeta").setAttribute("content", product.meta_description || "");

      let html = "";
      if (product.image_url) html += `<img class="hero" src="${product.image_url}" alt="${product.name}">`;
      html += `<h1>${product.name}</h1>`;
      if (product.price) html += `<div class="price">${product.price}</div>`;
      if (product.category) html += `<div class="category">📁 ${product.category}</div>`;
      html += `<div class="content">${product.description || ""}</div>`;
      if (product.link) html += `<a class="link-btn" href="${product.link}" target="_blank">View / Order ›</a>`;
      html += `<a class="whatsapp-btn" href="https://wa.me/923019492494?text=${encodeURIComponent("I'm interested in: " + product.name)}" target="_blank">WhatsApp Us</a>`;
      html += shareRowHtml(product.name, window.location.href);
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = '<div class="error">Could not load this product.</div>';
    }
  }

  function shareRowHtml(title, url) {
    const enc = encodeURIComponent(url);
    const encTitle = encodeURIComponent(title);
    return `<div class="share-row">
      <button class="share-btn" onclick="nativeShare('${title.replace(/'/g, "\\'")}', '${url}')">🔗 Share</button>
      <a class="share-btn" href="https://wa.me/?text=${encTitle}%20${enc}" target="_blank">WhatsApp</a>
      <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${enc}" target="_blank">Facebook</a>
    </div>`;
  }
  function nativeShare(title, url) {
    if (navigator.share) { navigator.share({ title, url }); }
    else { navigator.clipboard.writeText(url); alert("Link copied!"); }
  }
  loadProduct();
</script>
</body>
</html>
