import dns from "dns/promises";

async function run() {
  try {
     const resA = await dns.resolve4("toffeelive.duckdns.org").catch(e => e.code);
     const resAAAA = await dns.resolve6("toffeelive.duckdns.org").catch(e => e.code);
     const resCNAME = await dns.resolveCname("toffeelive.duckdns.org").catch(e => e.code);
     console.log("A:", resA);
     console.log("AAAA:", resAAAA);
     console.log("CNAME:", resCNAME);
  } catch (e) {
     console.error(e);
  }
}
run();
