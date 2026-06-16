import { useState } from "react";
import { 
  Link as LinkIcon, 
  Loader2, 
  Copy, 
  Check, 
  FileVideo, 
  AlertCircle, 
  ExternalLink, 
  Code, 
  Play, 
  Globe, 
  Sparkles, 
  Terminal, 
  HelpCircle, 
  Info,
  Layers,
  ArrowRight,
  ClipboardPaste,
  ShieldCheck,
  Eye,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExtractedSource, ExtractionResponse } from "./types";

export default function App() {
  const [url, setUrl] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [inputMode, setInputMode] = useState<"url" | "html">("url");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ExtractedSource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [activeTabMap, setActiveTabMap] = useState<Record<number, "preview" | "code">>({});

  // Popular websites the user requested, for quick testing
  const presets = [
    {
      title: "ToffeeLive DNS Stream",
      url: "https://toffeelive.duckdns.org/",
      badge: "Toffee Live",
    },
    {
      title: "MovieLinkBD Sports",
      url: "https://2ayryx.movielinkbd.li/livetv/",
      badge: "MovieLink Stream",
    },
    {
      title: "Watch Footy HD",
      url: "https://watch-footyhd.blogspot.com/p/if3.html?id=TSN1&m=1",
      badge: "Blogger Iframe",
    },
    {
      title: "Premium Sports Blog",
      url: "https://premiumsportstv.blogspot.com/2026/06/australia-vs-bangladesh-2nd-odi-i-live.html?m=1",
      badge: "Sports Blogspot",
    }
  ];

  const handleExtract = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    
    if (inputMode === "url" && !finalUrl) return;
    if (inputMode === "html" && !htmlContent) return;

    if (targetUrl) {
      setUrl(targetUrl);
      setInputMode("url");
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setCopiedLinkIndex(null);
    setCopiedCodeIndex(null);
    setActiveTabMap({});

    try {
      const payload = inputMode === "url" ? { url: finalUrl } : { htmlContent: htmlContent };
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ExtractionResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse streaming sources");
      }

      const extractedItems = data.extracted || [];
      
      // If the backend returned raw sources array but not the rich extracted objects:
      if (extractedItems.length === 0 && data.sources && data.sources.length > 0) {
        // Fallback for simple sources
        const simpleExtracted: ExtractedSource[] = data.sources.map((src) => {
          let domain = "Unknown Host";
          try { domain = new URL(src).hostname; } catch {}
          return {
            url: src,
            type: src.match(/\.(mp4|m3u8|mkv)$/i) ? "Direct Stream Link" : "Embedded Player / Frame",
            domain,
            context: `<!-- Found URL directly in source scope -->\n<iframe src="${src}"></iframe>`,
          };
        });
        setResults(simpleExtracted);
      } else {
        setResults(extractedItems);
      }

      // Initialize tab map: default of each card is preview
      const initialTabs: Record<number, "preview" | "code"> = {};
      extractedItems.forEach((_, idx) => {
        initialTabs[idx] = "preview";
      });
      setActiveTabMap(initialTabs);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during extracting");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith("http")) {
        setUrl(text);
      }
    } catch {
      // Clipboard read failed or permission denied
    }
  };

  const copyToClipboard = (text: string, index: number, isCode: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } else {
      setCopiedLinkIndex(index);
      setTimeout(() => setCopiedLinkIndex(null), 2000);
    }
  };

  const isDirectVideo = (src: string) => {
    return src.match(/\.(mp4|webm|ogg|mp3|wav|mkv)$/i) !== null;
  };

  const toggleTab = (idx: number, tab: "preview" | "code") => {
    setActiveTabMap(prev => ({
      ...prev,
      [idx]: tab
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#1d1f3b] via-[#0b0f19] to-transparent opacity-50 blur-3xl pointer-events-none z-0" />

      <main className="relative max-w-5xl mx-auto px-4 py-12 sm:py-20 z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-5 mb-14">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-20 h-20 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20"
          >
            <Layers className="h-10 w-10 text-white animate-pulse" />
          </motion.div>
          
          <div className="space-y-2">
            <motion.h1 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
            >
              Ultimate Video Extractor Pro
            </motion.h1>
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 font-medium text-sm sm:text-base max-w-xl mx-auto"
            >
              প্লেয়ার সোর্স কোড এবং ভিডিও লিংক এক্সট্র্যাক্টর
            </motion.p>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 max-w-2xl text-xs sm:text-sm leading-relaxed"
          >
            Paste the webpage URL below to crawl its HTML source. Our advanced engine decrypts hidden players, extracts direct <code className="text-amber-400 font-mono">.m3u8</code> / <code className="text-amber-400 font-mono">.mp4</code> streaming lines, and uncovers the <span className="text-emerald-400 font-medium">original player source code</span> snippets!
          </motion.p>
        </div>

        {/* Configuration / Form Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#131b2e]/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl shadow-black/40 mb-10"
        >
          {/* Quick suggestions presets */}
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick Test Links (দ্রুত পরীক্ষার লিংক)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExtract(preset.url)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 hover:text-white transition-all text-xs font-medium text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-400">{preset.badge}:</span> {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleExtract(); }} className="space-y-5">
            <div className="relative group">
              <div className="flex justify-between items-center mb-3">
                 <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                   {inputMode === "url" ? "Webpage Player Link (পৃষ্ঠার লিঙ্ক)" : "Raw HTML Source Code (সোর্স কোড পেস্ট করুন)"}
                 </label>
                 
                 <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setInputMode("url")}
                      className={`text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${inputMode === "url" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1.5 align-text-top" /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("html")}
                      className={`text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${inputMode === "html" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      <Code className="w-3 h-3 inline mr-1.5 align-text-top" /> Raw HTML (Bypass)
                    </button>
                 </div>
              </div>
              
              <div className="relative flex items-center">
                
                {inputMode === "url" ? (
                  <>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="url-input"
                      type="url"
                      required
                      placeholder="https://example.com/live-stream-or-movie"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="block w-full pl-12 pr-28 py-3.5 sm:py-4 border border-slate-800/80 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base shadow-inner"
                    />
                  </>
                ) : (
                  <textarea
                     id="html-input"
                     required
                     rows={5}
                     placeholder="<!DOCTYPE html><html>... (right click page -> view source -> copy all)"
                     value={htmlContent}
                     onChange={(e) => setHtmlContent(e.target.value)}
                     className="block w-full p-4 border border-slate-800/80 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs sm:text-sm font-mono shadow-inner scrollbar-thin overflow-auto leading-relaxed"
                  />
                )}

                <div className={`absolute ${inputMode === "url" ? "inset-y-0 right-0 pr-3" : "top-2 right-2"} flex items-center gap-2`}>
                  {(inputMode === "url" ? url : htmlContent) && (
                    <button
                      type="button"
                      onClick={() => inputMode === "url" ? setUrl("") : setHtmlContent("")}
                      className="p-1.5 sm:p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-md border border-rose-500/10 hover:border-rose-500/50"
                      title="Clear text"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                       try {
                         const text = await navigator.clipboard.readText();
                         if (inputMode === "url") setUrl(text);
                         else setHtmlContent(text);
                       } catch {}
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 hover:border-indigo-500 text-xs font-semibold shadow-md backdrop-blur-sm transition-all"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                </div>
              </div>
              
              {inputMode === "html" && (
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HTML Mode bypasses Cloudflare entirely. Just paste the page's source code!
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || (inputMode === "url" && !url) || (inputMode === "html" && !htmlContent)}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    Analyzing Node Code...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 text-white fill-current" />
                    Extract Player & Source Code
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-rose-500/10 text-rose-300 rounded-xl flex gap-3 text-sm border border-rose-500/25 items-start"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-200">Extraction Error (ব্যর্থ হয়েছে):</p>
                  <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Live crawling animation */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#131b2e]/60 rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center space-y-5"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Terminal className="h-6 w-6 text-indigo-400 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-slate-100">Crawl & Extraction Agent Initiated...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Fetching pages via backend gateway, bypassing Cloudflare protections, analyzing JavaScript execution and HTML5 trees...
                </p>
              </div>

              {/* Crawl steps list */}
              <div className="w-full max-w-xs space-y-2 py-2 text-left">
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>Connecting to destination host...</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Bypassing network headers & cookies...</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Parsing Cheerio objects & iframe tags...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {results !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 mt-4"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-indigo-400" />
                Extracted Players & Streams ({results.length})
              </h2>
              <div className="text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
                Extracted for URL: <code className="text-slate-300 font-mono font-semibold">{url}</code>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="bg-[#131b2e]/40 border border-slate-800/80 rounded-2xl p-16 text-center max-w-2xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto">
                  <HelpCircle className="h-6 w-6 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-200">কোন সরাসরি ভিডিও বা প্লেয়ার পাওয়া যায়নি</h3>
                  <p className="text-xs text-slate-400">
                    No explicit player iframes, script variables, or media tags (.m3u8/.mp4) were parsed on the parsed HTML content.
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-left leading-relaxed">
                    <strong>Note:</strong> Some sites use complex cookie barriers or dynamic API calls. If the live broadcast requires authentication, the player elements will not be initialized in plain HTML scraping. Try custom API parsing if available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {results.map((src, idx) => {
                  const currentTab = activeTabMap[idx] || "preview";
                  return (
                    <div
                      key={idx}
                      className="group bg-[#121829] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-black/60 transition-all duration-300"
                    >
                      {/* Card Header detail */}
                      <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1 w-full sm:w-auto">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                              {src.type}
                            </span>
                            <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5">
                              <Globe className="h-3 w-3" />
                              {src.domain}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate break-all block max-w-lg" title={src.url}>
                            {src.url}
                          </p>
                        </div>

                        {/* Top Toggles (Preview inside Iframe vs. Player Original Source Code) */}
                        <div className="flex shrink-0 w-full sm:w-auto bg-slate-955 p-1 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => toggleTab(idx, "preview")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                              currentTab === "preview" 
                                ? "bg-indigo-600 text-white" 
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <Eye className="h-3 w-3" />
                            <span>প্লেয়ার প্রিভিউ (Preview)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleTab(idx, "code")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                              currentTab === "code" 
                                ? "bg-indigo-600 text-white" 
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <Code className="h-3 w-3" />
                            <span>প্লেয়ার সোর্স কোড (Source Code)</span>
                          </button>
                        </div>
                      </div>

                      {/* Display active tab */}
                      <div className="relative">
                        {currentTab === "preview" ? (
                          /* Embed Preview Media */
                          <div className="w-full aspect-video bg-black relative">
                            {isDirectVideo(src.url) ? (
                              <video 
                                src={src.url} 
                                controls 
                                className="w-full h-full object-contain"
                                preload="none"
                              />
                            ) : (
                              <div className="w-full h-full relative">
                                <div className="absolute top-2 left-2 z-20 flex bg-indigo-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-md backdrop-blur-sm pointer-events-none items-center gap-1">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  <span>Pop-ups Defended & Blocked</span>
                                </div>
                                <iframe 
                                  src={src.url} 
                                  className="w-full h-full border-0 absolute top-0 left-0"
                                  allowFullScreen
                                  referrerPolicy="no-referrer"
                                  sandbox="allow-scripts allow-same-origin allow-presentation"
                                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture" 
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Original Source Code block */
                          <div className="w-full aspect-video bg-[#070a13] p-5 font-mono overflow-auto text-xs leading-relaxed border-b border-slate-800 relative scrollbar-thin">
                            
                            {/* Copy button for code snippet */}
                            <div className="sticky top-0 float-right z-10">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(src.context, idx, true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition"
                              >
                                {copiedCodeIndex === idx ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Copy Snippet (কোড কপি করুন)</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800/80 pb-3">
                                <Code className="h-4 w-4 text-emerald-400" />
                                <span className="font-sans text-[11px] font-bold text-slate-300">
                                  FOUND IN ORIGINAL PAGE SOURCE (পৃষ্ঠার সোর্স কোডে যেভাবে পাওয়া গেছে):
                                </span>
                              </div>
                              
                              <pre className="text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap select-text selection:bg-emerald-500/20 p-2 rounded">
                                {src.context || `<!-- Dynamic source link extracted via regex parsing -->\n<!-- Link: ${src.url} -->`}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Actions Bottom bar */}
                      <div className="p-4 sm:p-5 bg-slate-900/40 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center select-none">
                        
                        {/* Notice for nested iframes */}
                        {!isDirectVideo(src.url) && (
                          <div className="w-full max-w-md flex items-start gap-2 bg-amber-500/5 text-amber-200 text-[11px] p-2.5 rounded-lg border border-amber-500/10">
                             <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400"/>
                             <p className="leading-normal">
                               <strong>Ad-Block Active:</strong> We strip background advertisements. However, video-internal player controllers might serve overlays. Try checking other alternate stream links if ads persist.
                             </p>
                          </div>
                        )}

                        <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end ml-auto">
                          <a 
                            href={src.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold select-none transition-all cursor-pointer"
                          >
                            <span>Open Player in New Tab</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </a>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(src.url, idx, false)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold select-none transition-all cursor-pointer"
                          >
                            {copiedLinkIndex === idx ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-white" />
                                <span className="font-bold">Copied Source URL!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-white/80" />
                                <span>Copy Stream Link</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Informational Guidelines Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto space-y-6 text-slate-400 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-wider text-xs">
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span>কিভাবে এই সোর্স কোড এক্সট্র্যাক্টর কাজ করে? (How it works?)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="space-y-2">
              <h4 className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                ১. বায়পাস গেটওয়ে (CF Bypass)
              </h4>
              <p>
                যখন কোনো ওয়েবসাইটের পৃষ্ঠা সরাসরি ব্লক বা Cloudflare প্রটেকশন দিয়ে আটকানো থাকে, তখন এটি ডোমেইনের প্লেইন টেক্সট স্ক্র্যাপ করতে পারছে না। আমাদের সার্ভার সাইড প্রক্সি সরাসরি ব্রাউজার মেমোরির মতো করে পেজ সোর্স রিড করে ডেটা কালেক্ট করে।
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                ২. সোর্স কোড বের করা (Source Code Snippets)
              </h4>
              <p>
                প্রতিটি ভিডিও স্ট্রিম বা এমবেডের ক্ষেত্রে, আমরা তার চারিপাশের ৩০০-৮০০ ক্যারেক্টার এইচটিএমএল বা স্ক্রিপ্ট ব্লক তুলে ধরি। এর ফলে অ্যাডমিনরা এবং ব্যবহারকারীরা সরাসরি দেখতে পাবেন যে মূল সাইটের ওয়েব প্লেয়ারটি তাদের ভিডিও ফাইলটি চালাতে কিভাবে কোড তৈরি করেছে।
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                ৩. পপআপ ডিফেন্ড ডিফেন্স (Anti Pop-ups)
              </h4>
              <p>
                বহু মুভি সাইটে প্লেয়ার বাটনে ক্লিক করলে ক্ষতিকারক বিজ্ঞাপনের পপআপ আসে। এই অ্যাপের প্রিভিউ আইফ্রেমে <code className="text-emerald-400 font-mono bg-[#1c233a] px-1 py-0.5 rounded text-[10px]">sandbox</code> প্যারামিটার ব্যবহার করে সব ধরনের কাস্টম রিডাইরেক্ট বা পপআপ চিরতরের জন্য নিষ্ক্রিয় করা আছে।
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                ৪. ডাইরেক্ট ব্রডকাস্ট ফাইলস
              </h4>
              <p>
                ToffeeLive বা সমগোত্রীয় ফিফা ফুটবল স্ট্রিমিং সাইটগুলোর স্ট্রিম সাধারণত <code className="text-amber-400 font-mono bg-[#1c233a] px-1 py-0.5 rounded text-[10px]">.m3u8</code> ফরম্যাটের হয়ে থাকে। এগুলোকে সরাসরি আইফ্রেম ছাড়াই যেকোনো থার্ডপার্টি মিডিয়া প্লেয়ারে (যেমন MX Player, VLC) পেস্ট করে বা সরাসরি চালানো যায়।
              </p>
            </div>
          </div>
          
          <div className="text-center pt-4 text-[11px] text-slate-500">
            Ultimate Video Source & Player Code Extractor • Build with Pure Craft.
          </div>
        </div>

      </main>
    </div>
  );
}
