async function test() {
  const url = "https://watch-footyhd.blogspot.com/p/if3.html?id=TSN1&m=1";
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const text = await r.text();
  console.log("Status:", r.status);
  
  const iframes = text.match(/<iframe[^>]+src=["']([^"']+)["']/gi);
  if (iframes) console.log("Iframes:", iframes);
  
  const scripts = text.match(/<script[^>]*>(.*?)<\/script>/gis);
  if (scripts) {
     for (const s of scripts) {
         if (s.includes("iframe") || s.includes("m3u8") || s.includes("source") || s.includes("player") || s.includes("Clappr") || s.includes("TSN1")) {
            console.log("------------------------");
            console.log(s.substring(0, 800));
         }
     }
  }
}
test();
