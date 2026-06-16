async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/raw?url=${target}`);
      const text = await r.text();
      
      const scripts = text.match(/<script[^>]*>(.*?)<\/script>/gis);
      if (scripts) {
         for (const s of scripts) {
             if (s.includes("function proxyUrl")) {
                const match = s.match(/function proxyUrl[\s\S]{1,500}/);
                console.log("------------------------------");
                console.log(match ? match[0] : "proxyUrl not found in 500 chars");
             }
         }
      }
  } catch(e) {
      console.log(e);
  }
}
test();
