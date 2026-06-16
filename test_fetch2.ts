async function test() {
  const url = "https://bd-streams.site/lovebiz.php?id=TSN1";
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://watch-footyhd.blogspot.com/" } });
  const text = await r.text();
  console.log("Status:", r.status);
  
  const scripts = text.match(/<script[^>]*>(.*?)<\/script>/gis);
  if (scripts) {
     for (const s of scripts) {
         if (s.includes("iframe") || s.includes("m3u8") || s.includes("source") || s.includes("player") || s.includes("Clappr") || s.includes("TSN1") || s.includes("jwplayer") || s.includes("fetch")) {
            console.log("------------------------");
            console.log(s);
         }
     }
  }
}
test();
