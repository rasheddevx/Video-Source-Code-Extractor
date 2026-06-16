import * as cheerio from "cheerio";
(async() => {
   const res = await fetch("https://nexdrive.love/genxfm332156113022390/", {headers:{"User-Agent":"Mozilla/5.0"}});
   const text = await res.text();
   console.log("Len:", text.length, "mp4 found?", text.includes(".mp4"));
   const $ = cheerio.load(text);
   $("a").each((_,el)=> { 
       const href = $(el).attr("href");
       if(href && href.includes("dl")) console.log("Link:", href);
   });
})();
