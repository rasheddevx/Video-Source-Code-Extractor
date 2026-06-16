import * as cheerio from "cheerio";

async function run() {
  try {
    const r = await fetch("https://gemma416okl.com/play/tt39388107", { 
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://mp4cast.com/"
        } 
    });
    const text = await r.text();
    console.log("gemma length:", text.length, text.includes("m3u8"), text.includes("mp4"));
    
    const m3u8 = text.match(/(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/gi);
    console.log("m3u8 links:", m3u8);
    
    const mp4 = text.match(/(https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*)/gi);
    console.log("mp4 links:", mp4);
    
    const config = text.match(/file\s*:\s*["']([^"']+)["']/i);
    console.log("file config:", config ? config[1] : null);

    const sourceRegex = /sources\s*:\s*(\[.*?\])/is;
    const sourceMatch = text.match(sourceRegex);
    if (sourceMatch) {
        console.log("Sources array:", sourceMatch[1]);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
