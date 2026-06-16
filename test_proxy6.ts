async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/get?url=${target}`);
      let text = await r.text();
      if (text.startsWith("{")) {
          text = JSON.parse(text).contents;
      }
      
      console.log(text);
      
  } catch(e) {
      console.log(e);
  }
}
test();
