const STATUS_OPTIONS = ["all", "active", "paused", "archived"];

const state = {
  allProjects: [],
  query: "",
  status: "all",
  tag: "all"
};

const ui = {
  search: document.getElementById("search-input"),
  statusFilters: document.getElementById("status-filters"),
  tagFilters: document.getElementById("tag-filters"),
  cardsGrid: document.getElementById("cards-grid"),
  resultsCount: document.getElementById("results-count"),
  emptyState: document.getElementById("empty-state"),
  errorState: document.getElementById("error-state")
};

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeProject(item) {
  return {
    id: String(item?.id ?? crypto.randomUUID()),
    title: String(item?.title ?? "Untitled Project"),
    description: String(item?.description ?? "No description provided."),
    url: String(item?.url ?? "#"),
    tags: safeArray(item?.tags).map((tag) => String(tag).trim()).filter(Boolean),
    status: STATUS_OPTIONS.includes(String(item?.status ?? "").toLowerCase())
      ? String(item.status).toLowerCase()
      : "archived"
  };
}

function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createChip(label, value, active, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip${active ? " active" : ""}`;
  button.textContent = label;
  button.dataset.value = value;
  button.addEventListener("click", onClick);
  return button;
}

function getAvailableTags(projects) {
  const tags = new Set();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tags.add(tag));
  });
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function passesFilters(project) {
  const haystack = `${project.title} ${project.description} ${project.tags.join(" ")}`.toLowerCase();
  const matchesQuery = state.query.length === 0 || haystack.includes(state.query);
  const matchesStatus = state.status === "all" || project.status === state.status;
  const matchesTag = state.tag === "all" || project.tags.includes(state.tag);
  return matchesQuery && matchesStatus && matchesTag;
}

function renderStatusFilters() {
  ui.statusFilters.replaceChildren();
  STATUS_OPTIONS.forEach((status) => {
    const chip = createChip(
      status === "all" ? "All" : toTitleCase(status),
      status,
      state.status === status,
      () => {
        state.status = status;
        render();
      }
    );
    ui.statusFilters.append(chip);
  });
}

function renderTagFilters(projects) {
  const tags = getAvailableTags(projects);
  ui.tagFilters.replaceChildren();

  const allChip = createChip("All Tags", "all", state.tag === "all", () => {
    state.tag = "all";
    render();
  });
  ui.tagFilters.append(allChip);

  tags.forEach((tag) => {
    const chip = createChip(tag, tag, state.tag === tag, () => {
      state.tag = tag;
      render();
    });
    ui.tagFilters.append(chip);
  });

  if (state.tag !== "all" && !tags.includes(state.tag)) {
    state.tag = "all";
  }
}

function renderCards(projects) {
  ui.cardsGrid.replaceChildren();

  projects.forEach((project) => {
    const article = document.createElement("article");
    const safeTitle = escapeHtml(project.title);
    const safeDescription = escapeHtml(project.description);
    const safeStatus = escapeHtml(project.status);
    const tagsMarkup = project.tags
      .slice(0, 4)
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("");

    article.innerHTML = `
      <a class="card" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">
        <h2 class="card-title">${safeTitle}</h2>
        <p class="card-description">${safeDescription}</p>
        <div class="card-meta">
          <span class="status-badge status-${safeStatus}">${safeStatus}</span>
        </div>
        <div class="tag-list">${tagsMarkup || "<span class='tag'>untagged</span>"}</div>
      </a>
    `;
    ui.cardsGrid.append(article);
  });
}

function renderResultsCount(total, shown) {
  ui.resultsCount.textContent = `${shown} of ${total} projects`;
}

function render() {
  const filtered = state.allProjects.filter(passesFilters);
  renderStatusFilters();
  renderTagFilters(state.allProjects);
  renderCards(filtered);
  renderResultsCount(state.allProjects.length, filtered.length);
  ui.emptyState.hidden = filtered.length > 0;
}

function showError() {
  ui.errorState.hidden = false;
  ui.emptyState.hidden = true;
  ui.cardsGrid.replaceChildren();
  ui.resultsCount.textContent = "0 projects";
}

async function init() {
  ui.search.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  try {
    const response = await fetch("./data/projects.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load projects.json: ${response.status}`);
    }

    const parsed = await response.json();
    if (!Array.isArray(parsed)) {
      throw new Error("projects.json must be an array of project objects.");
    }

    state.allProjects = parsed.map(normalizeProject);
    render();
  } catch (error) {
    console.error(error);
    showError();
  }
}

init();
