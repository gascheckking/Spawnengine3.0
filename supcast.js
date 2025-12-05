// supcast.js — enkel lokal SupCast-mock

(function () {
  function initSupCast() {
    const titleEl = document.getElementById("supcastTitle");
    const descEl = document.getElementById("supcastDescription");
    const tagsEl = document.getElementById("supcastTags");
    const ctxEl = document.getElementById("supcastContext");
    const btn = document.getElementById("supcastSubmit");
    const feed = document.getElementById("supcastFeed");

    if (!titleEl || !descEl || !btn || !feed) return;

    const localFeed = [];

    function renderFeed() {
      feed.innerHTML = "";
      if (!localFeed.length) {
        const li = document.createElement("li");
        li.className = "supcast-feed-item";
        li.textContent = "No questions yet. Post your first SupCast.";
        feed.appendChild(li);
        return;
      }

      localFeed.forEach((item) => {
        const li = document.createElement("li");
        li.className = "supcast-feed-item";

        const title = document.createElement("div");
        title.className = "supcast-feed-title";
        title.textContent = item.title;

        const body = document.createElement("div");
        body.textContent = item.desc;

        const meta = document.createElement("div");
        meta.className = "supcast-feed-meta";
        meta.innerHTML = `<span>${item.context}</span><span>${item.tags}</span>`;

        li.appendChild(title);
        li.appendChild(body);
        li.appendChild(meta);
        feed.appendChild(li);
      });
    }

    renderFeed();

    btn.addEventListener("click", () => {
      const title = titleEl.value.trim();
      const desc = descEl.value.trim();
      const tags = (tagsEl.value || "").trim();
      const ctx = ctxEl.value || "Context";

      if (!title || !desc) {
        if (window.spawnToast) window.spawnToast("Title + description required");
        return;
      }

      localFeed.unshift({
        title,
        desc,
        tags: tags || "no_tags",
        context: ctx,
      });
      if (localFeed.length > 20) localFeed.length = 20;

      titleEl.value = "";
      descEl.value = "";
      tagsEl.value = "";

      renderFeed();
      if (window.spawnToast) window.spawnToast("SupCast posted (mock)");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSupCast);
  } else {
    initSupCast();
  }
})();