import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // API Extract Endpoint
  app.post("/api/extract", async (req, res) => {
    try {
      const { url, htmlContent } = req.body;
      if (!url && !htmlContent) {
        return res.status(400).json({ error: "URL or HTML content is required" });
      }

      let html = "";
      let finalUrl = url || "https://example.com";

      if (htmlContent) {
        html = htmlContent;
      } else {
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
            },
          });
          if (!response.ok) {
            return res.json({ sources: [url] });
          }
          html = await response.text();
        } catch (err) {
          return res.json({ sources: [url] });
        }
      }

      const $ = cheerio.load(html);

      interface ExtractedItem {
        url: string;
        type: string;
        domain: string;
        context: string;
      }

      const extracted: ExtractedItem[] = [];
      const seenUrls = new Set<string>();

      const addSource = (src: string, type: string, context: string) => {
        if (!src || src.trim().startsWith("blob:")) return;
        let resolvedUrl = src.trim();
        if (resolvedUrl.startsWith("//")) {
          resolvedUrl = "https:" + resolvedUrl;
        }
        try {
          resolvedUrl = new URL(resolvedUrl, finalUrl).href;
        } catch {
          // Fallback if not absolute and url package is broken
        }

        if (seenUrls.has(resolvedUrl)) return;
        seenUrls.add(resolvedUrl);

        let domain = "Unknown Host";
        try {
          domain = new URL(resolvedUrl).hostname;
        } catch {}

        extracted.push({
          url: resolvedUrl,
          type,
          domain,
          context: context.substring(0, 1200).trim(), // 1.2k safe characters snippet
        });
      };

      // 1. Extract raw video tags
      $("video").each((_, el) => {
        const src = $(el).attr("src");
        const htmlSnippet = $.html(el);
        if (src) addSource(src, "HTML5 Video Tag", htmlSnippet);
      });

      // 2. Extract video source elements
      $("video source").each((_, el) => {
        const src = $(el).attr("src");
        const parentHtml = $.html($(el).parent()) || $.html(el);
        if (src) addSource(src, "HTML5 Source Element", parentHtml);
      });

      // 3. Extract existing Iframes
      const possibleDeepIframes: string[] = [];
      $("iframe").each((_, el) => {
         let src = $(el).attr("src");
         if (src) {
           const lowSrc = src.toLowerCase();
           if (
             !lowSrc.includes("ads") &&
             !lowSrc.includes("banner") &&
             !lowSrc.includes("translate") &&
             !lowSrc.includes("telegram") &&
             !lowSrc.includes("facebook") &&
             !lowSrc.includes("youtube.com/embed/") &&
             !lowSrc.includes("vidsrc.me") &&
             !lowSrc.includes("vidsrc.cc") &&
             !lowSrc.includes("youtube-nocookie.com")
           ) {
              addSource(src, "Iframe Embed Player", $.html(el));
              if (src.includes("bd-streams.site") || src.includes("deviantart.lovetier.bz") || src.includes("lovetier.bz")) {
                possibleDeepIframes.push(src);
              }
           }
         }
      });

      // 4. Matches URLs ending with .mp4, .m3u8, or .mkv safely
      const regex = /(https?:\/\/[^\s"'<>\\]+\.(?:mp4|m3u8|mkv)(?:\?[^\s"'<>\\]+)?)/gi;
      const matches = Array.from(html.matchAll(regex));
      matches.forEach((m) => {
        const matchedUrl = m[1];
        const index = html.indexOf(matchedUrl);
        let snippet = "";
        if (index !== -1) {
          const startIdx = Math.max(0, index - 120);
          const endIdx = Math.min(html.length, index + matchedUrl.length + 120);
          snippet = "..." + html.substring(startIdx, endIdx).replace(/\s+/g, " ") + "...";
        } else {
          snippet = `Found via raw script URL pattern matching: "${matchedUrl}"`;
        }
        addSource(matchedUrl, "Streaming Link JS/Regex", snippet);
      });

      // 4.0. Extract ANY quoted URL that contains .m3u8 or .mp4
      const quotedStreamRegex = /["'](https?:\/\/[^"']*(?:\.m3u8|\.mp4)[^"']*)["']/gi;
      let quotedMatch;
      while ((quotedMatch = quotedStreamRegex.exec(html)) !== null) {
        const matchedUrl = quotedMatch[1];
        if (!extracted.some(e => e.url === matchedUrl)) {
           // Prevent duplicates if 4.0 and 4.1 overlap
           const index = quotedMatch.index;
           const startIdx = Math.max(0, index - 100);
           const endIdx = Math.min(html.length, index + matchedUrl.length + 100);
           const snippet = "..." + html.substring(startIdx, endIdx).replace(/\s+/g, " ") + "...";
           addSource(matchedUrl, "Quoted Stream URL", snippet);
        }
      }

      // 4.1. Extract full player configurations (source/src/file) in JS to catch URLs with complex query params
      const playerConfigRegex = /(?:source|src|file)\s*:\s*["'](https?:\/\/[^"']+)["']/gi;
      let playerMatch;
      while ((playerMatch = playerConfigRegex.exec(html)) !== null) {
        const matchedUrl = playerMatch[1];
        if (!matchedUrl.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/i)) {
          const index = playerMatch.index;
          const startIdx = Math.max(0, index - 120);
          const endIdx = Math.min(html.length, index + matchedUrl.length + 120);
          const snippet = "..." + html.substring(startIdx, endIdx).replace(/\s+/g, " ") + "...";
          addSource(matchedUrl, "Player Config (JS/Vars)", snippet);
        }
      }

      // 4.2. Decode base64 obfuscated atob() configs
      const atobRegex = /(?:source|src|file)\s*:\s*(?:window\.)?atob\s*\(\s*["']([^"']+)["']\s*\)/gi;
      let atobMatch;
      while ((atobMatch = atobRegex.exec(html)) !== null) {
        try {
          const decodedUrl = Buffer.from(atobMatch[1], 'base64').toString('utf8');
          if (decodedUrl.startsWith("http")) {
             addSource(decodedUrl, "Decoded Base64 Source", "Extracted from atob(...) inline function");
          }
        } catch {}
      }

      // 4.3. Find raw Base64 encoded URLs starting with 'http' (aHR0c...) mostly
      const rawBase64Http = html.match(/["'](aHR0c[a-zA-Z0-9+/=]+)["']/g);
      if (rawBase64Http) {
         rawBase64Http.forEach(m => {
            try {
               const b64 = m.replace(/["']/g, '');
               const decoded = Buffer.from(b64, 'base64').toString('utf8');
               if (decoded.startsWith("http") && (decoded.includes(".m3u8") || decoded.includes(".mp4"))) {
                  addSource(decoded, "Decoded Raw Base64 string", "Found raw string starting with aHR0c... representing a stream");
               }
            } catch {}
         });
      }

      // 5. Extract Custom Config APIs (e.g. /api/config for ToffeeLive/FIFA players)
      if (html.includes("/api/config")) {
          try {
             const baseUrl = new URL(url).origin;
             const configUrl = `${baseUrl}/api/config`;
             const index = html.indexOf("/api/config");
             const startIdx = Math.max(0, index - 150);
             const endIdx = Math.min(html.length, index + 250);
             const snippet = "..." + html.substring(startIdx, endIdx).replace(/\s+/g, " ") + "...";
             addSource(configUrl, "Toffee Player Custom Config Endpoint", snippet);
          } catch {}
      }

      // 6. Strategy: Extract IndStreamPlayer or similar JS configured players
      const indStreamMatch = html.match(/src:\s*['"]([a-z0-9]+)['"]/i);
      if (indStreamMatch && indStreamMatch[1]) {
         const videoId = indStreamMatch[1];
         const index = html.indexOf(videoId);
         const startIdx = Math.max(0, index - 80);
         const endIdx = Math.min(html.length, index + videoId.length + 120);
         const contextText = "..." + html.substring(startIdx, endIdx).replace(/\s+/g, " ") + "...";
         
         addSource(`https://gemma416okl.com/play/${videoId}`, "IndStream Play Node", contextText);
         addSource(`https://vidlink.pro/movie/${videoId}`, "VidLink Play Node (Alt)", "Generated clean mirror matching video ID: " + videoId);
         addSource(`https://vidsrc.to/embed/movie/${videoId}`, "VidSrc Play Node (Alt)", "Generated clean player matching video ID: " + videoId);
         addSource(`https://multiembed.mov/directstream.php?video_id=${videoId}`, "MultiEmbed Play Node (Alt)", "Generated stream provider fallback for ID: " + videoId);
      }

      // 7. Extract generic Blogger JS iframe constructors (e.g. watch-footyhd.blogspot.com)
      const bloggerMatch = html.match(/iframeSrc\s*=\s*.*?bd-streams\.site\/lovebiz\.php\?id=.*?(?:'|"|`)/i);
      if (bloggerMatch || html.includes("getElementById('matchIframe').src = iframeSrc")) {
          // If the page itself is loaded with an id query parameter, construct the known iframe URL
          let matchId = null;
          try {
             matchId = new URL(url).searchParams.get("id");
          } catch {}
          
          if (matchId) {
             const iframeUrl = `https://bd-streams.site/lovebiz.php?id=${matchId}`;
             addSource(iframeUrl, "Iframe Embed Player (Dynamic ID)", "Generated iframe URL from parent ID parameter: " + matchId);
             possibleDeepIframes.push(iframeUrl);
          }
      }

      // 8. Auto-subfetch known streaming iframes to find direct .m3u8 streams
      for (const iframeUrl of [...new Set(possibleDeepIframes)]) {
         try {
            const subRes = await fetch(iframeUrl, { headers: { "Referer": finalUrl, "User-Agent": "Mozilla/5.0" } });
            const subHtml = await subRes.text();
            
            // Check for explicit .m3u8 URLs
            const m3u8Regex = /(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/gi;
            const matches = Array.from(subHtml.matchAll(m3u8Regex));
            matches.forEach((m) => {
                addSource(m[1], "Direct Stream Link", "Scraped from inner iframe: " + iframeUrl);
            });
            
            // In case it's another nested iframe or JS variable setup
            if (matches.length === 0) {
               // Sometimes the m3u8 is obfuscated or within a token JSON streamUrl variable
               const streamUrlMatch = subHtml.match(/streamUrl\s*=\s*(?:'|"|`)(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)(?:'|"|`)/i);
               if (streamUrlMatch && streamUrlMatch[1]) {
                   addSource(streamUrlMatch[1], "Direct Stream Link", "Scraped streamUrl var from inner iframe: " + iframeUrl);
               }
            }
         } catch (e) {
            console.error("Sub-fetch failed for", iframeUrl, e);
         }
      }

      // 9. Extract LiveKhela / MovieLinkBD Channels
      const channelsMatch = html.match(/(?:const|var|let)\s+CHANNELS\s*=\s*(\[.*?\])\s*;/is);
      if (channelsMatch && channelsMatch[1]) {
         try {
            const playApiMatch = html.match(/(?:const|var|let)\s+PLAY_API_URL\s*=\s*(?:.*?\+\s*)?["']([^"']+)["']/i);
            const apiPath = playApiMatch ? playApiMatch[1] : "/api/channel";
            let baseUrl = "https://example.com";
            try { baseUrl = new URL(finalUrl).origin; } catch {}
            
            const channelRegex = /"key"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)".*?"play_token"\s*:\s*"([^"]+)"/gs;
            let match;
            const fetchPromises: Promise<void>[] = [];
            let count = 0;
            
            while ((match = channelRegex.exec(channelsMatch[1])) !== null && count < 20) {
              const key = match[1];
              const name = match[2];
              const token = match[3];
              const apiEndpoint = `${baseUrl}${apiPath}`;
              
              addSource(
                `${apiEndpoint}?key=${key}&access=...`,
                `Protected API Stream`,
                `Locked API Stream for Channel: ${name}`
              );

              // Concurrently attempt to solve the DRM/Token payload
              const fetchTask = fetch(apiEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                  "Origin": baseUrl,
                  "Referer": finalUrl
                },
                body: `key=${key}&access=${encodeURIComponent(token)}`
              })
              .then(r => r.json())
              .then(json => {
                 if (json.success && json.payload) {
                    const base64 = json.payload.split("").reverse().join("");
                    const decodedStr = Buffer.from(base64, "base64").toString("utf-8");
                    const streamData = JSON.parse(decodedStr);
                    let clearKeyInfo = "";
                    if (streamData.drm === "clearkey" && streamData.key_id && streamData.key_value) {
                       clearKeyInfo = ` | Keys: ${streamData.key_id}:${streamData.key_value}`;
                    }
                    if (streamData.url) {
                       addSource(streamData.url, `Decoded API Stream (${name})`, `Type: ${streamData.type || 'HLS/DASH'}${clearKeyInfo}`);
                    }
                 }
              })
              .catch(err => console.error("API payload decode failed", err));
              
              fetchPromises.push(fetchTask);
              count++;
            }
            
            // Wait for all payload resolution tasks to complete (max 3 seconds to avoid hanging)
            if (fetchPromises.length > 0) {
               await Promise.race([
                  Promise.all(fetchPromises),
                  new Promise(resolve => setTimeout(resolve, 3000))
               ]);
            }
         } catch (e) {
            console.error("Failed to parse MLBD channels", e);
         }
      }

      const sourcesList = extracted.map(e => e.url);
      res.json({ 
        sources: sourcesList,
        extracted: extracted
      });
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "An error occurred while extracting the video sources." });
    }
  });

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
