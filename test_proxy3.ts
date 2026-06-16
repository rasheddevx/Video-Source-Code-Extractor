async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/get?url=${target}`);
      const text = await r.text();
      console.log(text.substring(0, 500));
  } catch(e) {
      console.log(e);
  }
}
test();
