import * as cheerio from "cheerio";
async function test() {
  const url = "https://4yyan4.movielinkbd.li/watch/7lppVxbDVllcToqDizGXJ9dsiYPTcYlJGqwY2oX_74wwaDysC6SnI1PXpnFdwkBMvyaM4oxHXSNj7jktQlXL0ED0DArxQp9TlMfyUAU5EJfdOm3iXc5SrDfodhTTLqkw9GPygcyyYYdClFhE00CH8NccoSK6M7tX0wlkgulNt-9LwxqdippSBahyM1RSJylc";

  // Check if we can fetch it with better headers
  const r = await fetch(url, {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Referer": "https://movielinkbd.li/"
    }
  });
  console.log("Status:", r.status);
  const text = await r.text();
  console.log("Body snippet:", text.substring(0, 300));
}
test();
