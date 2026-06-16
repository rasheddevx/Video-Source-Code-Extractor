async function test() {
  const target = encodeURIComponent("https://4yyan4.movielinkbd.li/watch/7lppVxbDVllcToqDizGXJ9dsiYPTcYlJGqwY2oX_74wwaDysC6SnI1PXpnFdwkBMvyaM4oxHXSNj7jktQlXL0ED0DArxQp9TlMfyUAU5EJfdOm3iXc5SrDfodhTTLqkw9GPygcyyYYdClFhE00CH8NccoSK6M7tX0wlkgulNt-9LwxqdippSBahyM1RSJylc");
  const r = await fetch(`https://api.allorigins.win/get?url=${target}`);
  console.log("Status:", r.status);
  const data = await r.json();
  console.log("CF bypass string?", data.contents.substring(0, 100));
}
test();
