// Local-only audit server. The production dist files are never changed.
// Run npm run build, then npm run audit:preview. Append ?audit=1 to any route;
// optional theme=dark and textScale=2 exercise dark mode and enlarged text.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const runner = `
(async () => {
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const params = new URLSearchParams(location.search);
  const scale = Number(params.get('textScale'));
  if (scale === 2) {
    const text = [...document.querySelectorAll('body *')].filter(el => !['SCRIPT','STYLE','SVG','PATH'].includes(el.tagName));
    const sizes = text.map(el => { const css = getComputedStyle(el); return [parseFloat(css.fontSize),parseFloat(css.lineHeight)]; });
    text.forEach((el, i) => { el.style.fontSize = sizes[i][0] * scale + 'px'; if (Number.isFinite(sizes[i][1])) el.style.lineHeight = sizes[i][1] * scale + 'px'; });
  }
  const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] }, iframes: false });
  const overflow = [...document.querySelectorAll('body *')].filter(el => {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(el).position === 'absolute' || el.closest('pre, table, .sr-only')) return false;
    return rect.right > innerWidth + 1 || rect.left < -1;
  }).slice(0, 20).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0,100) }));
  const report = document.createElement('details');
  report.id = 'audit-report';
  report.style.cssText = 'position:fixed;bottom:0;right:0;z-index:10000;max-width:90vw;max-height:50vh;overflow:auto;background:white;color:black;border:1px solid black;padding:8px;font:14px/1.5 monospace';
  const summary = document.createElement('summary'); summary.textContent = 'Audit: ' + result.violations.length + ' rule violations';
  const data = document.createElement('pre'); data.id = 'audit-results'; data.style.cssText = 'white-space:pre-wrap;color:black;background:white';
  data.textContent = JSON.stringify({ path:location.pathname, scale:scale || 1, viewport:innerWidth, violations:result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})), incomplete:result.incomplete.map(v=>v.id), overflow });
  report.append(summary,data);document.body.append(report);
})().catch(error => { const pre=document.createElement('pre');pre.id='audit-results';pre.textContent=JSON.stringify({error:String(error)});document.body.append(pre); });`;
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/__audit__/axe.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(await readFile(require.resolve("axe-core/axe.min.js")));
      return;
    }
    if (url.pathname === "/__audit__/runner.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(runner);
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(
      root,
      "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
    );
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let contents = await readFile(file);
    if (extname(file) === ".html" && url.searchParams.has("audit")) {
      let html = contents.toString();
      const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
      html = html.replace(
        "</head>",
        `<script>document.documentElement.dataset.theme="${theme}";</script></head>`,
      );
      // Disable motion while inspecting settled content, without changing production CSS.
      html = html.replace(
        "</head>",
        "<style>*{animation:none!important;transition:none!important}</style></head>",
      );
      contents = Buffer.from(
        html.replace(
          "</body>",
          '<script src="/__audit__/axe.js"></script><script type="module" src="/__audit__/runner.js"></script></body>',
        ),
      );
    }
    res.setHeader(
      "Content-Type",
      types[extname(file)] || "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-store");
    res.end(contents);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(4331, "127.0.0.1", () =>
  console.log("Audit preview: http://127.0.0.1:4331/?audit=1"),
);
