// supcast.js — SupCast · Support mesh (plattform-känsla, allt mockat men komplett)

(function () {
  const supState = {
    contexts: {
      spawn_core: {
        id: "spawn_core",
        label: "Spawn Core · Boosterbox",
      },
      tiny_legends: {
        id: "tiny_legends",
        label: "Tiny Legends · Game",
      },
      vibe_packs: {
        id: "vibe_packs",
        label: "$VIBE · Pack Series",
      },
      zora_creators: {
        id: "zora_creators",
        label: "Zora · Creator coins",
      },
    },
    feed: [],
    experts: {
      spawn_core: [
        { wallet: "feetsniffer.base", solved: 27, xp: 420 },
        { wallet: "vibeking.eth", solved: 18, xp: 310 },
        { wallet: "spawniz.base", solved: 9, xp: 180 },
      ],
      tiny_legends: [
        { wallet: "tinydungeon.eth", solved: 21, xp: 360 },
        { wallet: "bossmom.base", solved: 12, xp: 210 },
        { wallet: "spawniz.base", solved: 7, xp: 140 },
      ],
      vibe_packs: [
        { wallet: "packoracle.base", solved: 33, xp: 510 },
        { wallet: "netnose.eth", solved: 16, xp: 260 },
        { wallet: "spawniz.base", solved: 8, xp: 150 },
      ],
      zora_creators: [
        { wallet: "zora-guardian.base", solved: 19, xp: 300 },
        { wallet: "farcaster-og.eth", solved: 11, xp: 190 },
        { wallet: "spawniz.base", solved: 6, xp: 120 },
      ],
    },
    profile: {
      xp: 0,
      solved: 0,
      rating: 5.0,
    },
    nextId: 1,
  };

  function $(sel) {
    return document.querySelector(sel);
  }

  function showToastSafe(msg) {
    if (typeof window.showToast === "function") {
      window.showToast(msg);
    }
  }

  function formatTime() {
    const d = new Date();
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function currentContextId() {
    const sel = $("#supcastContext");
    return sel ? sel.value : "spawn_core";
  }

  // ----- FEED RENDER -----

  function renderFeed() {
    const ul = $("#supcastFeed");
    if (!ul) return;
    ul.innerHTML = "";

    const ctx = currentContextId();
    const items = supState.feed.filter((q) => q.context === ctx);

    if (!items.length) {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";
      li.innerHTML =
        "<div class=\"supcast-feed-title\">No open questions in this mesh yet.</div>" +
        "<div class=\"supcast-feed-meta\"><span>Be the first to ask.</span><span>XP ready</span></div>";
      ul.appendChild(li);
      return;
    }

    items.forEach((q) => {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";

      const title = document.createElement("div");
      title.className = "supcast-feed-title";
      title.textContent = q.title;

      const body = document.createElement("div");
      body.style.fontSize = "11px";
      body.style.marginBottom = "4px";
      body.textContent = q.body;

      const metaRow = document.createElement("div");
      metaRow.className = "supcast-feed-meta";

      const leftMeta = document.createElement("span");
      leftMeta.textContent = `${q.app} · ${q.chain} · ${q.device}`;

      const rightMeta = document.createElement("span");
      rightMeta.textContent = q.status === "open" ? "+15 XP · Open" : "+15 XP · Solved";

      metaRow.appendChild(leftMeta);
      metaRow.appendChild(rightMeta);

      const bottomRow = document.createElement("div");
      bottomRow.style.display = "flex";
      bottomRow.style.justifyContent = "space-between";
      bottomRow.style.alignItems = "center";
      bottomRow.style.marginTop = "4px";

      const tagsEl = document.createElement("span");
      tagsEl.style.fontSize = "10px";
      tagsEl.style.color = "#aeb8ff";
      tagsEl.textContent = q.tags ? q.tags.join(" · ") : "no tags";

      const btn = document.createElement("button");
      btn.className = "btn-outline";
      btn.style.fontSize = "10px";
      btn.style.padding = "3px 10px";

      if (q.status === "open") {
        btn.textContent = "Claim & solve (mock)";
        btn.addEventListener("click", () => {
          q.status = "solved";
          q.solvedBy = "you";
          supState.profile.solved += 1;
          supState.profile.xp += 15;
          updateProfile();
          renderFeed();
          showToastSafe("Case solved · +15 Support XP (mock)");
        });
      } else {
        btn.textContent = q.solvedBy === "you" ? "Solved by you" : "Solved";
        btn.disabled = true;
      }

      bottomRow.appendChild(tagsEl);
      bottomRow.appendChild(btn);

      li.appendChild(title);
      li.appendChild(body);
      li.appendChild(metaRow);
      li.appendChild(bottomRow);

      ul.appendChild(li);
    });
  }

  // ----- EXPERTS RENDER -----

  function renderExperts() {
    const ul = $("#supcastExperts");
    if (!ul) return;
    ul.innerHTML = "";

    const ctx = currentContextId();
    const list = supState.experts[ctx] || [];

    list.forEach((ex) => {
      const li = document.createElement("li");
      li.className = "supcast-expert-item";

      const left = document.createElement("span");
      left.textContent = ex.wallet;

      const right = document.createElement("span");
      right.textContent = `${ex.solved} solved · ${ex.xp} XP`;

      li.appendChild(left);
      li.appendChild(right);
      ul.appendChild(li);
    });
  }

  // ----- PROFILE RENDER -----

  function updateProfile() {
    const xpEl = $("#supcastProfileXp");
    const solvedEl = $("#supcastProfileSolved");
    const ratingEl = $("#supcastProfileRating");

    if (xpEl) xpEl.textContent = supState.profile.xp;
    if (solvedEl) solvedEl.textContent = supState.profile.solved;
    if (ratingEl) ratingEl.textContent = supState.profile.rating.toFixed(1);
  }

  // ----- FORM HANDLING -----

  function setupForm() {
    const form = $("#supcastAskForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const ctx = currentContextId();
      const appSel = $("#supcastApp");
      const chainSel = $("#supcastChain");
      const devSel = $("#supcastDevice");
      const tagsInput = $("#supcastTags");
      const bodyInput = $("#supcastBody");

      const app = appSel ? appSel.value : "other";
      const chain = chainSel ? chainSel.value : "base";
      const device = devSel ? devSel.value : "unknown";
      const tagsRaw = tagsInput ? tagsInput.value : "";
      const body = bodyInput ? bodyInput.value.trim() : "";

      if (!body) {
        showToastSafe("Describe the problem first.");
        return;
      }

      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const shortTitle =
        body.length > 60 ? body.slice(0, 57).trim() + "…" : body;

      const question = {
        id: supState.nextId++,
        context: ctx,
        title: shortTitle || "New support question",
        body,
        app: app.charAt(0).toUpperCase() + app.slice(1),
        chain: chain === "base" ? "Base" : chain,
        device,
        tags,
        status: "open",
        createdAt: formatTime(),
      };

      supState.feed.unshift(question);
      renderFeed();

      if (bodyInput) bodyInput.value = "";
      if (tagsInput) tagsInput.value = "";

      showToastSafe("Question posted to SupCast (mock).");
    });
  }

  // ----- CONTEXT SWITCH -----

  function setupContextSelector() {
    const sel = $("#supcastContext");
    if (!sel) return;
    sel.addEventListener("change", () => {
      renderFeed();
      renderExperts();
      showToastSafe("Switched SupCast context (mock).");
    });
  }

  // ----- SEED DEMO DATA -----

  function seedDemoFeed() {
    const now = formatTime();
    supState.feed = [
      {
        id: supState.nextId++,
        context: "spawn_core",
        title: "Pack open failed after gas spike",
        body: "Tried to open a Spawn Core booster but transaction reverted right after a gas spike on Base.",
        app: "Vibe",
        chain: "Base",
        device: "iphone",
        tags: ["wallet", "gas", "pack_open"],
        status: "open",
        createdAt: now,
      },
      {
        id: supState.nextId++,
        context: "tiny_legends",
        title: "Tiny Legends XP not updating",
        body: "I finished a run in Tiny Legends but my mesh XP did not move in the HUD.",
        app: "WarpAI",
        chain: "Base",
        device: "desktop",
        tags: ["xp", "sync"],
        status: "open",
        createdAt: now,
      },
      {
        id: supState.nextId++,
        context: "vibe_packs",
        title: "Wrong rarity shown after reveal",
        body: "Opened a $VIBE pack and the card looks Epic but shows as Common in my inventory.",
        app: "Vibe",
        chain: "Base",
        device: "android",
        tags: ["rarity", "inventory"],
        status: "open",
        createdAt: now,
      },
      {
        id: supState.nextId++,
        context: "zora_creators",
        title: "Creator coin doesn’t appear in HUD",
        body: "Bought creator coin on Zora but the balance hasn’t synced to SpawnEngine yet.",
        app: "Zora",
        chain: "Base",
        device: "iphone",
        tags: ["creator_coin", "sync"],
        status: "open",
        createdAt: now,
      },
    ];
  }

  // ----- INIT -----

  function initSupCast() {
    const supportTab = document.getElementById("tab-support");
    if (!supportTab) return; // säker körning även om HTML ändras

    seedDemoFeed();
    setupContextSelector();
    setupForm();
    renderExperts();
    updateProfile();
    renderFeed();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSupCast);
  } else {
    initSupCast();
  }
})();