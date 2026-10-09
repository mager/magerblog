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
  const progress = document.createElement("span");
  progress.className = "ingredients-progress";
  progress.setAttribute("role", "status");
  const updateProgress = () => {
    const count = Array.from(ingredients).filter(li => li.querySelector<HTMLInputElement>("input")?.checked).length;
    const ready = count === ingredients.length;
    progress.textContent = ready ? "Everything ready. Let’s cook." : `${count} of ${ingredients.length} ready`;
    section.classList.toggle("all-ready", ready);
  };
  section.addEventListener("change", updateProgress);
  clear.addEventListener("click", updateProgress);
  updateProgress();
  toolbar.append(copy, clear, progress);
  section.append(toolbar, status);
}

const printButton = document.querySelector<HTMLButtonElement>('[data-recipe-print]');
if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
}

const recipeStops = Array.from(document.querySelectorAll<HTMLElement>(
  '.recipe-ingredients, .recipe-instructions .recipe-steps > li',
));
let recipeStop = -1;
let lastJumpY: number | undefined;

const jumpThroughRecipe = (direction: number) => {
  if (!recipeStops.length) return;
  // After manual scrolling or a section link, continue from the visible step.
  // Keep the explicit index otherwise, including near the bottom of the page
  // where the browser cannot align the final steps to the top of the viewport.
  if (lastJumpY !== window.scrollY) {
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    recipeStop = recipeStops.findLastIndex(stop => {
      const margin = parseFloat(getComputedStyle(stop).scrollMarginTop) || 0;
      return stop.getBoundingClientRect().top <= padding + margin + 2;
    });
  }
  const next = Math.max(0, Math.min(recipeStops.length - 1, recipeStop + direction));
  if (direction < 0 && recipeStop < 0) return;
  recipeStop = next;
  const stop = recipeStops[next];
  stop.tabIndex = -1;
  stop.focus({ preventScroll: true });
  stop.scrollIntoView({ behavior: 'instant', block: 'start' });
  lastJumpY = window.scrollY;
};

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.shiftKey ||
    event.isComposing ||
    document.querySelector("dialog[open]")
  )
    return;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest('input, textarea, select, button, audio, video, [role="textbox"], [role="slider"], [role="spinbutton"], [contenteditable]:not([contenteditable="false"])'))
  )
    return;
  if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && recipeStops.length) {
    event.preventDefault();
    jumpThroughRecipe(event.key === "ArrowRight" ? 1 : -1);
    return;
  }
  const direction =
    event.key === "j" ? "next" : event.key === "k" ? "prev" : null;
  const link =
    direction &&
    document.querySelector<HTMLAnchorElement>(`.recipe-navigation a[rel="${direction}"]`);
  if (link) {
    event.preventDefault();
    window.location.href = link.href;
  }
  if (event.key === "p") {
    event.preventDefault();
    window.print();
  }
});

const jumps = document.querySelector<HTMLElement>('.recipe-jumps');
if (jumps && typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(([entry]) => {
    document.documentElement.style.setProperty('--recipe-nav-height', `${entry.target.getBoundingClientRect().height}px`);
  }).observe(jumps);
}
