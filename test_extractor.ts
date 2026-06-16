import * as cheerio from "cheerio";

async function run() {
  const response = await fetch("https://mp4cast.com/17878-purushaha-2026-telugu-audio-hdtc-720p-480p-1080p.html", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Find Watch Online and print 2 levels up
  const watchOnline = $("*:contains('Watch Online')").last();
  console.log("Watch Online Block:", watchOnline.parent().parent().parent().html());
}

run();
