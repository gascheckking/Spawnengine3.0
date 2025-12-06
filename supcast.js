// supcast.js — SupCast · Support mesh logik
// Hanterar formulär, feed och enkla "claim"–interaktioner.

(function () {
  // Liten helper
  const $ = (sel) => document.querySelector(sel);

  // In-memory feed (mock)
  const supcastState = {
    items: [],
  };

  function formatTime() {
    const d = new Date();
    return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  }

  function toast(msg) {
    if (typeof window.spawnToast === "function") {
      window.spawnToast(msg);
    } else {
      console.log("[SupCast]", msg);
    }
  }

  // Seed med några exempel
  function seedSupcastItems() {
    supcastState.items = [
      {
        id: "ex1",
        context: "Spawn Core · Boosterbox",
        title: "Pack öppnades men XP syns inte?",
        tags: ["xp", "pack", "delay"],
        createdAt: formatTime(),
        status: "open",
      },
      {
        id: "ex2",
        context: "WarpAI · Onchain Activitys",
        title: "Base gas flippade när jag skulle köpa coin",
        tags: ["gas", "wallet", "purchase"],
        createdAt: formatTime(),
        status: "claimed",
      },
      {
        id: "ex3",
        context: "Vibe · Packs",
        title: "Hur funkar royalties om jag gör egna packs?",
        tags: ["creator", "royalties"],
        createdAt: formatTime(),
        status: "open",
      },
    ];
  }

  function renderSupcastFeed() {
    const ul = $("#supcastFeed");
    if (!ul) return;

    ul.innerHTML = "";

    if (!supcastState.items.length) {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";
      li.textContent = "Inga frågor inlagda ännu. Posta den första från formuläret.";
      ul.appendChild(li);
      return;
    }

    supcastState.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";

      const title = document.createElement("div");
      title.className = "supcast-feed-title";
      title.textContent = item.title;

      const metaRow = document.createElement("div");
      metaRow.className = "supcast-feed-meta";

      const leftMeta = document.createElement("span");
      leftMeta.textContent = `${item.context} · ${item.createdAt}`;

      const rightMeta = document.createElement("span");
      rightMeta.textContent =
        item.status === "claimed" ? "Claimed (mock)" : "Open · Tap to claim";

      metaRow.appendChild(leftMeta);
      metaRow.appendChild(rightMeta);

      // Tagrad under
      if (item.tags && item.tags.length) {
        const tagRow = document.createElement("div");
        tagRow.style.marginTop = "4px";
        tagRow.style.display = "flex";
        tagRow.style.flexWrap = "wrap";
        tagRow.style.gap = "4px";

        item.tags.forEach((t) => {
          const tag = document.createElement("span");
          tag.textContent = t;
          tag.style.fontSize = "10px";
          tag.style.padding = "2px 6px";
          tag.style.borderRadius = "999px";
          tag.style.background = "rgba(30, 40, 90, 0.9)";
          tag.style.border = "1px solid rgba(140, 180, 255, 0.7)";
          tagRow.appendChild(tag);
        });

        li.appendChild(tagRow);
      }

      li.prepend(metaRow);
      li.prepend(title);

      li.addEventListener("click", () => {
        if (item.status === "claimed") {
          toast("Den här SupCasten är redan claimed (mock).");
          return;
        }
        item.status = "claimed";
        toast("Du claimed caset (mock) · support XP +50");
        renderSupcastFeed();
      });

      ul.appendChild(li);
    });
  }

  function setupSupcastForm() {
    const contextEl = $("#supcastContext");
    const titleEl = $("#supcastTitle");
    const tagsEl = $("#supcastTags");
    const descEl = $("#supcastDescription");
    const submitBtn = $("#supcastSubmit");

    if (!submitBtn) return;

    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const context = contextEl?.value?.trim() || "Base · General";
      const title = titleEl?.value?.trim() || "";
      const tagsRaw = tagsEl?.value?.trim() || "";
      const desc = descEl?.value?.trim() || "";

      if (!title || !desc) {
        toast("Titel + beskrivning behövs för en SupCast.");
        return;
      }

      const tags =
        tagsRaw.length > 0
          ? tagsRaw
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

      const item = {
        id: `sup_${Date.now()}`,
        context,
        title,
        tags,
        createdAt: formatTime(),
        status: "open",
        desc,
      };

      // nyast först
      supcastState.items.unshift(item);
      renderSupcastFeed();

      if (titleEl) titleEl.value = "";
      if (tagsEl) tagsEl.value = "";
      if (descEl) descEl.value = "";

      toast("SupCast postad (mock) · syns nu i feeden");
    });
  }

  function initSupCast() {
    seedSupcastItems();
    renderSupcastFeed();
    setupSupcastForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSupCast);
  } else {
    initSupCast();
  }

  // Litet debug-handtag globalt om du vill leka i konsolen
  window.supcastDebug = {
    state: supcastState,
    rerender: renderSupcastFeed,
  };
})();