import * as cheerio from "cheerio";

async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/get?url=${target}`);
      const data = await r.json();
      const text = data.contents;
      
      console.log("length:", text.length);
      console.log("Iframes:", text.match(/<iframe[^>]+src=["'`]([^"'`]+)["'`]/gi));
      console.log("source tag:", text.match(/<source[^>]+src=["'`]([^"'`]+)["'`]/gi));
      console.log("video tag:", text.match(/<video[^>]+src=["'`]([^"'`]+)["'`]/gi));
      console.log("m3u8:", text.match(/(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/gi));
      console.log("mp4 mkv ts:", text.match(/(https?:\/\/[^\s"'<>\\]+\.(mp4|mkv|ts)[^\s"'<>\\]*)/gi));
      
      const scripts = text.match(/<script[^>]*>(.*?)<\/script>/gis);
      if (scripts) {
         for (const s of scripts) {
             if (s.includes("m3u8") || s.includes("http")) {
                console.log("Script snippet:\n", s.substring(0, 300));
             }
         }
      }
      
  } catch(e) {
      console.log(e);
  }
}
test();
