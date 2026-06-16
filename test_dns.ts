import dns from "dns/promises";

async function run() {
  try {
     const res = await dns.resolve("toffeelive.duckdns.org");
     console.log(res);
  } catch (e) {
     console.error(e);
  }
}
run();
