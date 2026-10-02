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
  '<html><body><section class="recipe-ingredients"><ul><li>1 cup 米 🍚</li><li>Salt &amp; pepper</li></ul></section><div class="recipe-instructions"></div><button id="cook-mode-btn" hidden><span class="toggle-label"></span></button></body></html>';
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
  d.querySelector("#cook-mode-btn").click();
  assert.equal(
    d.querySelector("#cook-mode-btn").getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(w.scrollOptions.behavior, "instant");
  d.querySelector(".ingredients-action").click();
  await tick();
  assert.match(
    d.querySelector("[role=status]").textContent,
    /Copy unavailable/,
  );
  assert.equal(d.querySelector(".ingredients-action").disabled, false);
  w.close();
}
console.log(
  "PASS: blocked storage, missing clipboard, reduced motion, cook mode state",
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
    d.querySelector("[role=status]").textContent,
    /Copy unavailable/,
  );
  w.close();
}
console.log("PASS: denied clipboard reports recovery");
{
  const w = fixture();
  const d = w.document;
  let resolve;
  let releases = 0;
  Object.defineProperty(w.navigator, "wakeLock", {
    value: { request: () => new Promise((r) => (resolve = r)) },
  });
  d.querySelector("#cook-mode-btn").click();
  d.querySelector("#cook-mode-btn").click();
  resolve({
    release: async () => {
      releases++;
    },
    addEventListener() {},
  });
  await tick();
  assert.equal(releases, 1);
  w.close();
}
console.log("PASS: wake lock acquired after exit is released");
{
  const w = fixture();
  const d = w.document;
  let requests = 0,
    releases = 0;
  Object.defineProperty(w.navigator, "wakeLock", {
    value: {
      request: async () => {
        requests++;
        return {
          release: async () => {
            releases++;
          },
          addEventListener() {},
        };
      },
    },
  });
  d.querySelector("#cook-mode-btn").click();
  await tick();
  d.querySelector("#cook-mode-btn").click();
  await tick();
  assert.equal(requests, 1);
  assert.equal(releases, 1);
  w.close();
}
console.log("PASS: normal cook mode exit releases wake lock");
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
