import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  const url = "https://4yyan4.movielinkbd.li/watch/7lppVxbDVllcToqDizGXJ9dsiYPTcYlJGqwY2oX_74wwaDysC6SnI1PXpnFdwkBMvyaM4oxHXSNj7jktQlXL0ED0DArxQp9TlMfyUAU5EJfdOm3iXc5SrDfodhTTLqkw9GPygcyyYYdClFhE00CH8NccoSK6M7tX0wlkgulNt-9LwxqdippSBahyM1RSJylc";
  console.log("Navigating...");
  await page.goto(url, { waitUntil: 'networkidle2' });
  const content = await page.content();
  console.log("Is CF?", content.includes("Just a moment"));
  
  const vids = await page.$$eval("video", els => els.map(e => e.src));
  const iframes = await page.$$eval("iframe", els => els.map(e => e.src));
  console.log("videos:", vids);
  console.log("iframes:", iframes);
  
  await browser.close();
}
run();
