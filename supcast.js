// SupCast — enkel lokal Base-helpline
// all data i localStorage, redo att kopplas mot riktig backend

(function () {
  const STORAGE_KEY = "se_supcast_threads";

  let threads = loadThreads();
  let activeTopic = "base";

  const TOPICS = [
    { id: "base", label: "Base chain" },
    { id: "zora", label: "Zora / tokens" },
    { id: "farcaster", label: "Farcaster / frames" },
    { id: "wallets", label: "Wallets & bridges" },
    { id: "packs", label: "Packs / SpawnEngine" },
  ];

  function loadThreads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveThreads() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }

  function byTopic(topicId) {
    return threads.filter((t) => t.topic === topicId);
  }

  function renderTopics() {
    const ul = document.getElementById("supcastTopicList");
    if (!ul) return;
    ul.innerHTML = "";
    TOPICS.forEach((t) => {
      const li = document.createElement("li");
      li.className =
        "supcast-topic" + (t.id === activeTopic ? " supcast-topic-active" : "");
      const count = byTopic(t.id).length;
      li.innerHTML = `<span>${t.label}</span><span>${count}</span>`;
      li.dataset.topicId = t.id;
      ul.appendChild(li);
    });

    ul.addEventListener("click", (e) => {
      const li = e.target.closest(".supcast-topic");
      if (!li) return;
      activeTopic = li.dataset.topicId || "base";
      renderTopics();
      renderThread();
    });
  }

  function renderThread() {
    const box = document.getElementById("supcastThread");
    if (!box) return;
    const list = byTopic(activeTopic);
    box.innerHTML = "";
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "supcast-item";
      empty.innerHTML =
        "<div class='supcast-question'>No questions yet.</div><div class='supcast-meta'><span>Ask the first question for this topic.</span></div>";
      box.appendChild(empty);
      return;
    }
    list
      .slice()
      .reverse()
      .forEach((q) => {
        const div = document.createElement("div");
        div.className = "supcast-item";
        div.innerHTML = `
          <div class="supcast-question">${q.text}</div>
          <div class="supcast-meta">
            <span>${q.topicLabel}</span>
            <span>${q.time}</span>
          </div>
        `;
        box.appendChild(div);
      });
  }

  function initForm() {
    const form = document.getElementById("supcastForm");
    const textarea = document.getElementById("supcastQuestion");
    if (!form || !textarea) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text) return;
      const topic = TOPICS.find((t) => t.id === activeTopic) || TOPICS[0];
      const now = new Date();
      threads.push({
        id: "q_" + Date.now(),
        text,
        topic: topic.id,
        topicLabel: topic.label,
        time: now.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      saveThreads();
      textarea.value = "";
      renderTopics();
      renderThread();
    });
  }

  window.initSupcast = function () {
    renderTopics();
    renderThread();
    initForm();
  };
})();