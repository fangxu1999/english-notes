function initNotesPage(notesData) {
  let currentCategory = "全部";
  let searchQuery = "";

  const filterBar = document.getElementById("filterBar");
  const notesGrid = document.getElementById("notesGrid");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");

  function renderFilters() {
    const categories = [
      "全部",
      ...new Set(notesData.map((n) => n.category)),
    ];
    filterBar.innerHTML = categories
      .map(
        (cat) => `
      <button class="filter-btn ${cat === currentCategory ? "active" : ""}" data-cat="${cat}">
        ${cat}
      </button>
    `,
      )
      .join("");

    filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentCategory = btn.dataset.cat;
        renderFilters();
        renderCards();
      });
    });
  }

  function renderCards() {
    const q = searchQuery.trim().toLowerCase();
    let html = "";
    let count = 0;

    notesData.forEach((group) => {
      if (currentCategory !== "全部" && group.category !== currentCategory)
        return;

      const filteredItems = (group.items || []).filter((item) => {
        if (!q) return true;
        return (
          item.en.toLowerCase().includes(q) ||
          item.zh.toLowerCase().includes(q) ||
          (item.note && item.note.toLowerCase().includes(q)) ||
          group.title.toLowerCase().includes(q)
        );
      });

      const filteredVocabGroups = (group.vocabGroups || [])
        .map((vg) => {
          const matchedWords = vg.words.filter((w) => {
            if (!q) return true;
            return (
              w.en.toLowerCase().includes(q) ||
              w.zh.toLowerCase().includes(q) ||
              vg.label.toLowerCase().includes(q) ||
              group.title.toLowerCase().includes(q)
            );
          });
          return { ...vg, words: matchedWords };
        })
        .filter((vg) => vg.words.length > 0);

      if (filteredItems.length === 0 && filteredVocabGroups.length === 0)
        return;
      count++;

      const itemsHtml =
        filteredItems.length > 0
          ? `
        <ul class="phrase-list">
          ${filteredItems
            .map(
              (item) => `
            <li class="phrase-item">
              <div class="phrase-top">
                <span class="en-text">${item.en}</span>
              </div>
              <div class="zh-text">${item.zh}</div>
              ${item.note ? `<span class="note-tag">${item.note}</span>` : ""}
            </li>
          `,
            )
            .join("")}
        </ul>
      `
          : "";

      const vocabHtml = filteredVocabGroups
        .map(
          (vg) => `
        <div class="vocab-group">
          <div class="vocab-group-title">
            <span>${vg.label}</span>
          </div>
          <div class="word-pills">
            ${vg.words
              .map(
                (w) => `
              <div class="word-pill">
                <strong>${w.en}</strong>
                <span>${w.zh}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
        )
        .join("");

      html += `
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">${group.title}</h2>
            <span class="badge">${group.tag}</span>
          </div>
          ${itemsHtml}
          ${vocabHtml}
        </section>
      `;
    });

    notesGrid.innerHTML = html;
    emptyState.style.display = count === 0 ? "block" : "none";
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCards();
    });
  }

  renderFilters();
  renderCards();
}
