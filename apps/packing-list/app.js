const STORAGE_KEY = "packing-list:v1";

const form = document.getElementById("itemForm");
const itemTopic = document.getElementById("itemTopic");
const itemName = document.getElementById("itemName");
const itemQuantity = document.getElementById("itemQuantity");
const itemCategory = document.getElementById("itemCategory");
const itemList = document.getElementById("itemList");
const topicSuggestions = document.getElementById("topicSuggestions");
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

function normalizeTopic(topic) {
  return topic.trim().replace(/\s+/g, " ");
}

function getTopicName(item) {
  return item.topic || "General";
}

function getTopics() {
  return Array.from(new Set(state.map((item) => getTopicName(item)))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function getEmptyStateMessage() {
  if (state.length === 0) {
    return "Create a topic and start adding small items.";
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
  const groupedItems = visibleItems.reduce((groups, item) => {
    const topic = getTopicName(item);
    if (!groups.has(topic)) {
      groups.set(topic, []);
    }
    groups.get(topic).push(item);
    return groups;
  }, new Map());

  totalCount.textContent = state.length;
  packedCount.textContent = packedItems.length;
  remainingCount.textContent = state.length - packedItems.length;

  itemList.innerHTML = "";
  topicSuggestions.innerHTML = "";

  emptyState.textContent = getEmptyStateMessage();
  emptyState.classList.toggle("is-hidden", visibleItems.length > 0);
  clearPackedBtn.disabled = packedItems.length === 0;
  getTopics().forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    topicSuggestions.appendChild(option);
  });

  if (visibleItems.length === 0) {
    return;
  }

  groupedItems.forEach((items, topic) => {
    const group = document.createElement("section");
    group.className = "topic-group";

    const header = document.createElement("header");
    header.className = "topic-header";

    const title = document.createElement("div");
    title.className = "topic-title";

    const heading = document.createElement("h2");
    heading.textContent = topic;

    const count = document.createElement("span");
    count.className = "topic-count";
    count.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

    title.append(heading, count);
    header.append(title);
    group.append(header);

    const list = document.createElement("ul");
    list.className = "topic-items";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = `item ${item.packed ? "packed" : ""}`;
      if (item.id === lastAddedId) {
        li.classList.add("item-enter");
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.setAttribute("aria-label", `Mark ${item.name} in ${topic} as packed`);
      checkbox.checked = item.packed;

      const main = document.createElement("div");
      main.className = "item-main";

      const titleRow = document.createElement("div");
      titleRow.className = "item-title";

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

      titleRow.append(name);
      meta.append(badge, quantity);
      main.append(titleRow, meta);
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

      list.appendChild(li);
    });

    group.append(list);
    itemList.appendChild(group);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const topic = normalizeTopic(itemTopic.value);
  const name = itemName.value.trim();
  const quantity = Number(itemQuantity.value);
  const category = itemCategory.value;
  const topicName = topic || "General";

  if (!name) {
    itemName.focus();
    return;
  }

  state = [
    {
      id: crypto.randomUUID(),
      topic: topicName,
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
  itemTopic.value = topic;
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
