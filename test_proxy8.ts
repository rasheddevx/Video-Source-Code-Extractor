async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/raw?url=${target}`);
      const text = await r.text();
      
      const scripts = text.match(/<script[^>]*>(.*?)<\/script>/gis);
      if (scripts) {
         for (const s of scripts) {
             if (s.includes("fetch") || s.includes("hls") || s.includes("loadSource") || s.includes("CF_WORKER")) {
                console.log("------------------------------");
                console.log(s);
             }
         }
      }
  } catch(e) {
      console.log(e);
  }
}
test();
