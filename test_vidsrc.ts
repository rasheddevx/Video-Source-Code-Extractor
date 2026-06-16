import * as cheerio from "cheerio";
async function test() {
  const p = "https://vidsrc.to/embed/movie/tt39388107";
  const r = await fetch(p, {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://vidsrc.to/"
    }
  });
  const text = await r.text();
  console.log("length:", text.length, "status:", r.status);
  const iframeMatch = text.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
     console.log("Inner iframe:", iframeMatch[1]);
  }
}
test();
