const STORAGE_KEY = "packing-list:v1";

const form = document.getElementById("itemForm");
const itemName = document.getElementById("itemName");
const itemQuantity = document.getElementById("itemQuantity");
const itemCategory = document.getElementById("itemCategory");
const itemList = document.getElementById("itemList");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const packedCount = document.getElementById("packedCount");
const remainingCount = document.getElementById("remainingCount");
const clearPackedBtn = document.getElementById("clearPackedBtn");
const filterButtons = Array.from(document.querySelectorAll(".filter"));

let state = loadState();
let currentFilter = "all";
let lastAddedId = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Unable to read saved packing list.", error);
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item) => item && typeof item.id === "string" && typeof item.name === "string");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatQuantity(quantity) {
  return quantity > 1 ? `${quantity}x` : "1x";
}

function getEmptyStateMessage() {
  if (state.length === 0) {
    return "Add your first packing item to get started.";
  }

  if (currentFilter === "packed") {
    return "No packed items yet.";
  }

  if (currentFilter === "unpacked") {
    return "Everything is packed already.";
  }

  return "No items match this view.";
}

function render() {
  const packedItems = state.filter((item) => item.packed);
  const visibleItems = state.filter((item) => {
    if (currentFilter === "packed") return item.packed;
    if (currentFilter === "unpacked") return !item.packed;
    return true;
  });

  totalCount.textContent = state.length;
  packedCount.textContent = packedItems.length;
  remainingCount.textContent = state.length - packedItems.length;

  itemList.innerHTML = "";

  emptyState.textContent = getEmptyStateMessage();
  emptyState.classList.toggle("is-hidden", visibleItems.length > 0);
  clearPackedBtn.disabled = packedItems.length === 0;

  if (visibleItems.length === 0) {
    return;
  }

  visibleItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = `item ${item.packed ? "packed" : ""}`;
    if (item.id === lastAddedId) {
      li.classList.add("item-enter");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", `Mark ${item.name} as packed`);
    checkbox.checked = item.packed;

    const main = document.createElement("div");
    main.className = "item-main";

    const title = document.createElement("div");
    title.className = "item-title";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "meta";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = item.category;

    const quantity = document.createElement("span");
    quantity.textContent = formatQuantity(item.quantity);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";

    title.append(name);
    meta.append(badge, quantity);
    main.append(title, meta);
    li.append(checkbox, main, remove);

    checkbox.addEventListener("change", () => {
      state = state.map((current) =>
        current.id === item.id ? { ...current, packed: !current.packed } : current
      );
      saveState();
      render();
    });

    remove.addEventListener("click", () => {
      state = state.filter((current) => current.id !== item.id);
      saveState();
      render();
    });

    itemList.appendChild(li);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = itemName.value.trim();
  const quantity = Number(itemQuantity.value);
  const category = itemCategory.value;

  if (!name) {
    itemName.focus();
    return;
  }

  state = [
    {
      id: crypto.randomUUID(),
      name,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      category,
      packed: false
    },
    ...state
  ];
  lastAddedId = state[0].id;

  saveState();
  form.reset();
  itemQuantity.value = "1";
  itemCategory.value = "Clothing";
  itemName.focus();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((control) => {
      control.classList.toggle("active", control === button);
    });

    render();
  });
});

clearPackedBtn.addEventListener("click", () => {
  state = state.filter((item) => !item.packed);
  saveState();
  render();
});

render();
