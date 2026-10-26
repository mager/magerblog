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
