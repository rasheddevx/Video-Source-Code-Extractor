async function test() {
  const target = encodeURIComponent("https://toffeelive.duckdns.org/");
  try {
      const r = await fetch(`https://api.allorigins.win/get?url=${target}`);
      console.log("Status:", r.status);
      const data = await r.json();
      console.log("CF bypass string?", data.contents ? data.contents.substring(0, 300) : data);
  } catch(e) {
      console.log(e);
  }
}
test();
