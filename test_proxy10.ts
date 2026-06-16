async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/api/config");
  try {
      const r = await fetch(`https://api.allorigins.win/raw?url=${target}`);
      const text = await r.text();
      console.log("Config response", text);
  } catch(e) {
      console.log(e);
  }
}
test();
