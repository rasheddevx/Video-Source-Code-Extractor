import * as cheerio from "cheerio";
async function test() {
  const url = "https://4yyan4.movielinkbd.li/watch/7lppVxbDVllcToqDizGXJ9dsiYPTcYlJGqwY2oX_74wwaDysC6SnI1PXpnFdwkBMvyaM4oxHXSNj7jktQlXL0ED0DArxQp9TlMfyUAU5EJfdOm3iXc5SrDfodhTTLqkw9GPygcyyYYdClFhE00CH8NccoSK6M7tX0wlkgulNt-9LwxqdippSBahyM1RSJylc";

  const r = await fetch("http://localhost:3000/api/extract", {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify({url})
  });
  console.log(await r.json());
}
test();
