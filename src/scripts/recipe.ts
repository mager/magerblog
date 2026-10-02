const recipeKey = `recipe-checked-${window.location.pathname}`;
let saved: Record<string, boolean> = {};
try {
  const value: unknown = JSON.parse(localStorage.getItem(recipeKey) || "{}");
  if (value && typeof value === "object" && !Array.isArray(value)) {
    saved = Object.fromEntries(
      Object.entries(value).filter(
        ([key, checked]) => /^\d+$/.test(key) && checked === true,
      ),
    );
  }
} catch {
  /* Ingredient controls work without persistent storage. */
}
const persist = () => {
  try {
    localStorage.setItem(recipeKey, JSON.stringify(saved));
  } catch {
    /* Keep the in-memory state. */
  }
};
const ingredients = document.querySelectorAll<HTMLLIElement>(
  ".recipe-ingredients li",
);
ingredients.forEach((li, index) => {
  const label = document.createElement("label");
  label.className = "ingredient-label";
  const text = document.createElement("span");
  text.append(...li.childNodes);
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "ingredient-check";
  checkbox.checked = saved[index] === true;
  li.classList.toggle("checked", checkbox.checked);
  label.append(checkbox, text);
  li.append(label);
  checkbox.addEventListener("change", () => {
    li.classList.toggle("checked", checkbox.checked);
    saved[index] = checkbox.checked;
    persist();
  });
});
const section = document.querySelector(".recipe-ingredients");
if (section && ingredients.length) {
  const toolbar = document.createElement("div");
  toolbar.className = "ingredients-toolbar";
  const status = document.createElement("p");
  status.className = "ingredients-status";
  status.setAttribute("role", "status");
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "ingredients-action";
  copy.textContent = "Copy ingredients";
  copy.addEventListener("click", async () => {
    copy.disabled = true;
    try {
      await navigator.clipboard.writeText(
        Array.from(ingredients, (li) => li.textContent?.trim())
          .filter(Boolean)
          .join("\n"),
      );
      status.textContent = "Ingredients copied.";
    } catch {
      status.textContent =
        "Copy unavailable. Select the ingredient text and copy it manually.";
    } finally {
      copy.disabled = false;
    }
  });
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "ingredients-action";
  clear.textContent = "Clear checks";
  clear.addEventListener("click", () => {
    saved = {};
    ingredients.forEach((li) => {
      li.classList.remove("checked");
      const checkbox = li.querySelector<HTMLInputElement>("input");
      if (checkbox) checkbox.checked = false;
    });
    persist();
    status.textContent = "Ingredient checks cleared.";
  });
  toolbar.append(copy, clear);
  section.prepend(toolbar, status);
}

const modeButton = document.querySelector<HTMLButtonElement>("#cook-mode-btn");
if (modeButton) {
  const html = document.documentElement;
  const label = modeButton.querySelector(".toggle-label");
  let lock: WakeLockSentinel | null = null;
  let pending = false;
  const syncLock = async () => {
    const active =
      html.classList.contains("cook-mode") &&
      document.visibilityState === "visible";
    if (!active) {
      const held = lock;
      lock = null;
      await held?.release().catch(() => {});
      return;
    }
    if (lock || pending || !("wakeLock" in navigator)) return;
    pending = true;
    try {
      const acquired = await navigator.wakeLock.request("screen");
      if (
        !html.classList.contains("cook-mode") ||
        document.visibilityState !== "visible"
      ) {
        await acquired.release();
      } else {
        lock = acquired;
        acquired.addEventListener("release", () => {
          if (lock === acquired) lock = null;
        });
      }
    } catch {
      /* Screen wake locks are optional. */
    } finally {
      pending = false;
    }
  };
  const syncMode = () => {
    const active = html.classList.contains("cook-mode");
    modeButton.setAttribute("aria-pressed", String(active));
    if (label) label.textContent = active ? "Exit Cook Mode" : "Cook Mode";
    void syncLock();
  };
  try {
    html.classList.toggle(
      "cook-mode",
      localStorage.getItem("cook-mode") === "on",
    );
  } catch {
    /* Default off. */
  }
  modeButton.hidden = false;
  syncMode();
  modeButton.addEventListener("click", () => {
    const active = html.classList.toggle("cook-mode");
    try {
      localStorage.setItem("cook-mode", active ? "on" : "off");
    } catch {
      /* Still usable this visit. */
    }
    syncMode();
    if (active) {
      const instructions =
        document.querySelector(".recipe-instructions") ||
        document.querySelector(".recipe-text");
      instructions?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
  });
  document.addEventListener("visibilitychange", () => {
    void syncLock();
  });
  window.addEventListener("pagehide", () => {
    void lock?.release().catch(() => {});
    lock = null;
  });
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.isComposing ||
    document.querySelector("dialog[open]")
  )
    return;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest('input, textarea, select, button, [role="textbox"]'))
  )
    return;
  const direction =
    event.key === "j" ? "next" : event.key === "k" ? "prev" : null;
  const link =
    direction &&
    document.querySelector<HTMLAnchorElement>(`.nav-card[rel="${direction}"]`);
  if (link) {
    event.preventDefault();
    window.location.href = link.href;
  }
  if (event.key === "p") {
    event.preventDefault();
    window.print();
  }
});
