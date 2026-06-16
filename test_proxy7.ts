import * as cheerio from "cheerio";

async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/raw?url=${target}`);
      const text = await r.text();
      
      console.log("length:", text.length);
      console.log("Iframes:", text.match(/<iframe[^>]+src=["'`]([^"'`]+)["'`]/gi));
      console.log("source tag:", text.match(/<source[^>]+src=["'`]([^"'`]+)["'`]/gi));
      console.log("video tag:", text.match(/<video[^>]+src=["'`]([^"'`]+)["'`]/gi));
      console.log("m3u8:", text.match(/(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/gi));
      const config = text.match(/source\s*=\s*['"]([^'"]+)['"]/i);
      console.log("source =", config);
      
      const scripts = text.match(/<script[^>]*>(.*?)<\/script>/gis);
      if (scripts) {
         for (const s of scripts) {
             if (s.includes("m3u8") || s.includes("http") || s.includes("source")) {
                console.log("Script snippet:\n", s.substring(0, 300));
             }
         }
      }
      
  } catch(e) {
      console.log(e);
  }
}
test();
