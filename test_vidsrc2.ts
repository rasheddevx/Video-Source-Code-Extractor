async function test() {
  const p = "https://vsembed.ru/embed/movie/tt39388107/";
  const r = await fetch(p, {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://vidsrc.to/"
    }
  });
  const text = await r.text();
  console.log("length:", text.length, "status:", r.status);
  const m3u8Match = text.match(/(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/gi);
  if (m3u8Match) {
     console.log("m3u8:", m3u8Match[0]);
  } else {
     console.log("No m3u8 directly. Scripts:", text.match(/<script[^>]*>(.*?)<\/script>/gis)?.length);
  }
}
test();
