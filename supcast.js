// supcast.js — SupCast mock engine for Support tab

(function () {
  // ------- UTIL -------

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function supToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast-visible");
    setTimeout(() => toast.classList.remove("toast-visible"), 2200);
  }

  function formatTime() {
    const d = new Date();
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function shortId() {
    return Math.random().toString(16).slice(2, 8);
  }

  // ------- STATE -------

  const supcastState = {
    questions: [],
    experts: [
      {
        wallet: "0xspawn…mesh",
        label: "Spawniz · Mesh creator",
        solved: 32,
        rating: 5.0,
      },
      {
        wallet: "0xvibe…packs",
        label: "VibeHunter · Pack alpha",
        solved: 21,
        rating: 4.9,
      },
      {
        wallet: "0xzora…cast",
        label: "ZoraCaster · Creator coins",
        solved: 17,
        rating: 4.8,
      },
    ],
    profile: {
      xp: 0,
      solved: 0,
      rating: 5.0,
    },
  };

  // ------- SEED DATA -------

  function seedQuestions() {
    const now = formatTime();
    supcastState.questions = [
      {
        id: "q-" + shortId(),
        context: "Spawn Core · Boosterbox",
        app: "Vibe",
        chain: "Base",
        device: "iPhone",
        tags: ["pack_open", "gas", "delay"],
        body: "My pack open tx is confirmed on Base but Vibe still shows pending.",
        status: "open",
        createdAt: now,
      },
      {
        id: "q-" + shortId(),
        context: "Tiny Legends · Game",
        app: "WarpAI",
        chain: "Base",
        device: "Desktop",
        tags: ["xp", "streak"],
        body: "Lost my Tiny Legends streak after switching wallets, can I recover XP?",
        status: "open",
        createdAt: now,
      },
      {
        id: "q-" + shortId(),
        context: "Zora · Creator coins",
        app: "Zora",
        chain: "Base",
        device: "Android",
        tags: ["creator_coin", "buy", "limit"],
        body: "Trying to buy more of a creator coin but UI says ‘max reached’.",
        status: "open",
        createdAt: now,
      },
    ];
  }

  // ------- RENDER -------

  function renderExperts() {
    const list = $("#supcastExperts");
    if (!list) return;
    list.innerHTML = "";

    supcastState.experts.forEach((ex) => {
      const li = document.createElement("li");
      li.className = "supcast-expert-item";

      const left = document.createElement("div");
      left.textContent = ex.label;

      const right = document.createElement("div");
      right.textContent = `Solved ${ex.solved} · ★${ex.rating.toFixed(1)}`;

      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    });
  }

  function renderProfile() {
    const xpEl = $("#supcastProfileXp");
    const solvedEl = $("#supcastProfileSolved");
    const ratingEl = $("#supcastProfileRating");

    if (xpEl) xpEl.textContent = supcastState.profile.xp;
    if (solvedEl) solvedEl.textContent = supcastState.profile.solved;
    if (ratingEl) ratingEl.textContent = supcastState.profile.rating.toFixed(1);
  }

  function renderFeed() {
    const list = $("#supcastFeed");
    if (!list) return;
    list.innerHTML = "";

    if (!supcastState.questions.length) {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";
      li.textContent = "No open questions in this context yet.";
      list.appendChild(li);
      return;
    }

    supcastState.questions.forEach((q) => {
      const li = document.createElement("li");
      li.className = "supcast-feed-item";

      const title = document.createElement("div");
      title.className = "supcast-feed-title";

      // korta ner texten lite om den är lång
      const maxLen = 90;
      const bodyShort =
        q.body.length > maxLen ? q.body.slice(0, maxLen - 1) + "…" : q.body;
      title.textContent = bodyShort;

      const meta = document.createElement("div");
      meta.className = "supcast-feed-meta";

      const left = document.createElement("span");
      left.textContent = `${q.context} · ${q.app} · ${q.chain} · ${q.device}`;

      const right = document.createElement("span");
      right.textContent = q.status === "solved" ? "SOLVED" : "OPEN";

      meta.appendChild(left);
      meta.appendChild(right);

      const tagsRow = document.createElement("div");
      tagsRow.style.marginTop = "3px";
      tagsRow.style.fontSize = "10px";
      tagsRow.style.color = "#aeb7ef";
      tagsRow.textContent = `${q.createdAt} · Tags: ${q.tags.join(", ")}`;

      const actions = document.createElement("div");
      actions.style.marginTop = "4px";
      actions.style.display = "flex";
      actions.style.justifyContent = "flex-end";

      const btn = document.createElement("button");
      btn.className = "btn-outline";
      btn.style.fontSize = "10px";

      if (q.status === "solved") {
        btn.textContent = "Solved";
        btn.disabled = true;
        btn.style.opacity = "0.7";
      } else {
        btn.textContent = "Mark solved (mock)";
        btn.addEventListener("click", () => {
          markQuestionSolved(q.id);
        });
      }

      actions.appendChild(btn);

      li.appendChild(title);
      li.appendChild(meta);
      li.appendChild(tagsRow);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  // ------- ACTIONS -------

  function markQuestionSolved(id) {
    const q = supcastState.questions.find((x) => x.id === id);
    if (!q || q.status === "solved") return;

    q.status = "solved";
    supcastState.profile.solved += 1;
    supcastState.profile.xp += 25; // mock XP för solved

    renderFeed();
    renderProfile();
    supToast("Case marked as solved · +25 support XP");
  }

  function handleAskSubmit(e) {
    e.preventDefault();
    const contextSel = $("#supcastContext");
    const appSel = $("#supcastApp");
    const chainSel = $("#supcastChain");
    const deviceSel = $("#supcastDevice");
    const tagsInput = $("#supcastTags");
    const bodyInput = $("#supcastBody");

    if (!bodyInput || !bodyInput.value.trim()) {
      supToast("Describe the problem before posting.");
      return;
    }

    const q = {
      id: "q-" + shortId(),
      context: contextSel ? contextSel.options[contextSel.selectedIndex].text : "Unknown context",
      app: appSel ? appSel.value : "other",
      chain: chainSel ? chainSel.value : "base",
      device: deviceSel ? deviceSel.value : "desktop",
      tags: tagsInput && tagsInput.value.trim()
        ? tagsInput.value.split(",").map((t) => t.trim()).filter(Boolean)
        : ["question"],
      body: bodyInput.value.trim(),
      status: "open",
      createdAt: formatTime(),
    };

    supcastState.questions.unshift(q);

    // nollställ formulär
    if (tagsInput) tagsInput.value = "";
    bodyInput.value = "";

    renderFeed();
    supToast("Question posted to SupCast (mock).");
  }

  function setupForm() {
    const form = $("#supcastAskForm");
    if (!form) return;
    form.addEventListener("submit", handleAskSubmit);
  }

  function setupContextChange() {
    const ctxSel = $("#supcastContext");
    if (!ctxSel) return;

    ctxSel.addEventListener("change", () => {
      // I riktig version skulle vi filtra på context här.
      // Nu kör vi bara toast som feedback.
      const label = ctxSel.options[ctxSel.selectedIndex].text;
      supToast(`Context switched to: ${label} (mock filter)`);
    });
  }

  // ------- INIT -------

  function initSupCast() {
    seedQuestions();
    renderExperts();
    renderProfile();
    renderFeed();
    setupForm();
    setupContextChange();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSupCast);
  } else {
    initSupCast();
  }
})();