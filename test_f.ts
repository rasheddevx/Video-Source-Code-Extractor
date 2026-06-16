(async() => {
   const res = await fetch("https://fast-dl.one/dl/c94966", {
       headers:{"User-Agent":"Mozilla/5.0"},
       redirect:"manual"
   });
   console.log("Status:", res.status);
   console.log("Headers:", Array.from(res.headers.entries()));
   const text = await res.text();
   console.log("Html length:", text.length);
   const match = text.match(/window\.location\.replace\(["']([^"']+)["']\)/i);
   if (match) console.log("Redirect url:", match[1]);
})();
