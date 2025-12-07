// supcast.js — SupCast · Support mesh (local mock storage)

(function () {
  const STORAGE_KEY = "se_supcast_cases_v1";

  let cases = loadCases();

  function loadCases() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCases() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch {
      // ignore quota errors etc
    }
  }

  function notify(msg) {
    if (window.spawnToast) {
      window.spawnToast(msg);
    }
  }

  function renderFeed() {
    const ul = document.getElementById("supcastFeed");
    if (!ul) return;

    ul.innerHTML = "";

    if (!cases.length) {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";
      const title = document.createElement("div");
      title.className = "supcast-feed-title";
      title.textContent = "No questions yet.";
      const meta = document.createElement("div");
      meta.className = "supcast-feed-meta";
      meta.innerHTML =
        "<span>SupCast</span><span>Be first to ask something.</span>";

      li.appendChild(title);
      li.appendChild(meta);
      ul.appendChild(li);
      return;
    }

    // visa senaste först
    cases
      .slice()
      .reverse()
      .forEach((c) => {
        const li = document.createElement("li");
        li.className = "supcast-feed-item";

        const title = document.createElement("div");
        title.className = "supcast-feed-title";
        title.textContent = c.title || "(no title)";

        const metaTop = document.createElement("div");
        metaTop.className = "supcast-feed-meta";
        metaTop.innerHTML = `<span>${c.context || "Other"}</span><span>${c.time}</span>`;

        const body = document.createElement("p");
        body.textContent = c.description || "";

        const metaBottom = document.createElement("div");
        metaBottom.className = "supcast-feed-meta";
        metaBottom.innerHTML = `<span>${c.tags || "no_tags"}</span><span>#${c.shortId}</span>`;

        li.appendChild(title);
        li.appendChild(metaTop);
        li.appendChild(body);
        li.appendChild(metaBottom);

        ul.appendChild(li);
      });
  }

  function initForm() {
    const ctxEl = document.getElementById("supcastContext");
    const titleEl = document.getElementById("supcastTitle");
    const tagsEl = document.getElementById("supcastTags");
    const descEl = document.getElementById("supcastDescription");
    const btn = document.getElementById("supcastSubmit");

    if (!btn || !ctxEl || !titleEl || !tagsEl || !descEl) return;

    btn.addEventListener("click", () => {
      const title = (titleEl.value || "").trim();
      const description = (descEl.value || "").trim();
      const tags = (tagsEl.value || "").trim();
      const context = ctxEl.value || "Spawn Core · Boosterbox";

      if (!title && !description) {
        notify("Write a short title or description first.");
        return;
      }

      const now = new Date();
      const id = "q_" + Date.now();
      const shortId = id.slice(-4);

      const entry = {
        id,
        shortId,
        title,
        description,
        tags,
        context,
        time: now.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      cases.push(entry);
      saveCases();
      renderFeed();

      // rensa inputs
      // lämna context som det är, så man kan posta flera på rad
      titleEl.value = "";
      tagsEl.value = "";
      descEl.value = "";

      notify("Question posted to SupCast (mock).");
    });
  }

  // Publik init-funktion som du anropar från app.js
  window.initSupcast = function () {
    renderFeed();
    initForm();
  };
})();