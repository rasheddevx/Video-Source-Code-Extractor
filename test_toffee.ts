import * as cheerio from "cheerio";

async function test() {
  const url = "https://toffeelive.duckdns.org/";
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const text = await r.text();
    console.log("length:", text.length, "status:", r.status);
    
    console.log("Iframes:", text.match(/<iframe[^>]+src=["'`]([^"'`]+)["'`]/gi));
    console.log("source tag:", text.match(/<source[^>]+src=["'`]([^"'`]+)["'`]/gi));
    console.log("video tag:", text.match(/<video[^>]+src=["'`]([^"'`]+)["'`]/gi));
    console.log("m3u8:", text.match(/(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/gi));
    console.log("mkv/mp4:", text.match(/(https?:\/\/[^\s"'<>\\]+\.(mp4|mkv)[^\s"'<>\\]*)/gi));
    
  } catch(e) {
    console.log(e);
  }
}
test();
