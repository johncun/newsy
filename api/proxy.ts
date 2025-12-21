export default async function handler(req: any, res: any) {
  const { url } = req.query;

  if (!url) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(decodeURIComponent(url));
    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    res.setHeader("Access-Control-Allow-Origin", "*"); // The Magic Line
    res.setHeader("Content-Type", contentType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache on CDN for 1 day

    return res.send(Buffer.from(buffer));
  } catch (e) {
    return res.status(500).send("Proxy error");
  }
}
