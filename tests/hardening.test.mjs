import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";
const root = fileURLToPath(new URL("../", import.meta.url));
const transformSync = (source) => ({ code: stripTypeScriptTypes(source) });
const script = transformSync(
  readFileSync(root + "/src/scripts/recipe.ts", "utf8"),
  { loader: "ts", format: "iife" },
).code;
const html =
  '<html><body><section class="recipe-ingredients"><ul><li>1 cup 米 🍚</li><li>Salt &amp; pepper</li></ul></section><div class="recipe-instructions"></div><button data-recipe-print hidden>Print</button></body></html>';
const tick = () => new Promise((r) => setTimeout(r, 0));
function fixture(raw, blocked = false) {
  const dom = new JSDOM(html, {
    url: "https://example.test/recipe/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.matchMedia = () => ({ matches: true });
  w.HTMLElement.prototype.scrollIntoView = function (options) {
    w.scrollOptions = options;
  };
  if (raw !== undefined) w.localStorage.setItem("recipe-checked-/recipe/", raw);
  if (blocked)
    Object.defineProperty(w, "localStorage", {
      get() {
        throw Error("blocked");
      },
    });
  w.eval(script);
  return w;
}
for (const raw of [
  "{broken",
  "null",
  "[]",
  "42",
  '"string"',
  '{"0":"false","1":false}',
]) {
  const w = fixture(raw);
  assert.equal(w.document.querySelectorAll("input[type=checkbox]").length, 2);
  assert.equal(w.document.querySelector("input").checked, false);
  w.document.querySelector("input").click();
  assert(w.document.querySelector("li").classList.contains("checked"));
  w.close();
}
console.log(
  "PASS: malformed and wrong-shape storage; only boolean true restored",
);
{
  const w = fixture(undefined, true);
  const d = w.document;
  d.querySelector("input").click();
  d.querySelector(".ingredients-action").click();
  await tick();
  assert.match(
    d.querySelector(".ingredients-status").textContent,
    /Copy unavailable/,
  );
  assert.equal(d.querySelector(".ingredients-action").disabled, false);
  w.close();
}
console.log(
  "PASS: blocked storage and missing clipboard",
);
{
  const w = fixture('{"0":true,"1":true}');
  const d = w.document;
  d.querySelectorAll(".ingredients-action")[1].click();
  d.querySelector("input").click();
  assert.deepEqual(
    JSON.parse(w.localStorage.getItem("recipe-checked-/recipe/")),
    { 0: true },
  );
  assert.equal(d.querySelectorAll("input")[1].checked, false);
  w.close();
}
console.log("PASS: clear then recheck does not resurrect old checks");
{
  const w = fixture();
  const d = w.document;
  Object.defineProperty(w.navigator, "clipboard", {
    value: {
      writeText: async () => {
        throw Error("denied");
      },
    },
  });
  d.querySelector(".ingredients-action").click();
  await tick();
  assert.match(
    d.querySelector(".ingredients-status").textContent,
    /Copy unavailable/,
  );
  w.close();
}
console.log("PASS: denied clipboard reports recovery");
{
  const w = fixture();
  const d = w.document;
  for (const input of d.querySelectorAll("input")) input.click();
  assert.equal(d.querySelector(".ingredients-progress").textContent, "Everything ready. Let’s cook.");
  assert(d.querySelector(".recipe-ingredients").classList.contains("all-ready"));
  d.querySelectorAll(".ingredients-action")[1].click();
  assert.equal(d.querySelector(".ingredients-progress").textContent, "0 of 2 ready");
  assert(!d.querySelector(".recipe-ingredients").classList.contains("all-ready"));
  let prints = 0;
  w.print = () => prints++;
  assert.equal(d.querySelector("[data-recipe-print]").hidden, false);
  d.querySelector("[data-recipe-print]").click();
  assert.equal(prints, 1);
  w.close();
}
console.log("PASS: ingredient completion, reset, and visible print action");
{
  const w = fixture();
  let prints = 0;
  w.print = () => {
    prints++;
  };
  w.document.body.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "p", ctrlKey: true, bubbles: true }),
  );
  assert.equal(prints, 0);
  w.document.body.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "p", bubbles: true }),
  );
  assert.equal(prints, 1);
  w.close();
}
console.log("PASS: modified keyboard shortcuts are preserved");
{
  const source = readFileSync(
    root + "/src/components/SecretSearch.astro",
    "utf8",
  );
  const code = transformSync(
    source.match(/<script>\n([\s\S]*?)<\/script>/)[1],
    { loader: "ts", format: "iife" },
  ).code;
  const title = "安全 🍚 مرحبا <img src=x onerror=alert(1)> " + "x".repeat(180);
  const data = JSON.stringify([{ title, slug: "safe-title" }]).replace(
    /</g,
    "\\u003c",
  );
  const dom = new JSDOM(
    `<dialog id="secret-search"><button data-close-search>Close</button><input id="secret-input"><p id="search-status"></p><div id="secret-results"></div></dialog><script type="application/json" id="search-data">${data}</script>`,
    { url: "https://example.test", runScripts: "outside-only" },
  );
  const w = dom.window;
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.eval(code);
  const input = w.document.querySelector("input");
  input.value = "安全";
  input.dispatchEvent(new w.Event("input"));
  assert.equal(
    w.document.querySelector("#secret-results a").textContent,
    title,
  );
  assert.equal(w.document.querySelectorAll("img").length, 0);
  input.value = "notfound";
  input.dispatchEvent(new w.Event("input"));
  assert.equal(w.document.querySelectorAll("#secret-results a").length, 0);
  assert.match(
    w.document.querySelector("#search-status").textContent,
    /No articles found/,
  );
  w.close();
}
console.log(
  "PASS: long multilingual and HTML-shaped search titles remain literal text; empty results recover",
);
