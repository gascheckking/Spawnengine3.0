// supcast.js — SupCast · Support mesh (mock backend)

// Enkel in-memory feed
const supcastState = {
  items: [],
};

function supcastFormatTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function renderSupcastFeed() {
  const feed = document.getElementById("supcastFeed");
  if (!feed) return;

  feed.innerHTML = "";

  if (!supcastState.items.length) {
    const li = document.createElement("li");
    li.className = "supcast-feed-item";
    li.innerHTML =
      "<div class='supcast-feed-title'>No questions yet</div><div class='supcast-feed-meta'><span>Post a mock case above</span><span>SpawnEngine</span></div>";
    feed.appendChild(li);
    return;
  }

  supcastState.items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "supcast-feed-item";

    const title = document.createElement("div");
    title.className = "supcast-feed-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "supcast-feed-meta";
    meta.innerHTML = `
      <span>${item.context} · ${item.tags}</span>
      <span>${item.time}</span>
    `;

    li.appendChild(title);

    if (item.description) {
      const desc = document.createElement("div");
      desc.style.marginTop = "4px";
      desc.textContent = item.description;
      li.appendChild(desc);
    }

    li.appendChild(meta);
    feed.appendChild(li);
  });
}

function seedSupcast() {
  supcastState.items = [
    {
      context: "Spawn Core · Boosterbox",
      title: "Pack stuck in pending state",
      tags: "pack, pending, claim",
      description:
        "Mint succeeded but pack never showed up in my inventory. TX looks fine.",
      time: supcastFormatTime(),
    },
    {
      context: "WarpAI · Onchain Activitys",
      title: "XP not updating after streak",
      tags: "xp, streak, bug",
      description:
        "Checked in 3 times this week but streak only shows 1 day in HUD.",
      time: supcastFormatTime(),
    },
  ];
}

// Setup när DOM är redo
function initSupcast() {
  const ctx = document.getElementById("supcastContext");
  const title = document.getElementById("supcastTitle");
  const tags = document.getElementById("supcastTags");
  const desc = document.getElementById("supcastDescription");
  const submit = document.getElementById("supcastSubmit");

  if (!ctx || !title || !tags || !desc || !submit) {
    return;
  }

  seedSupcast();
  renderSupcastFeed();

  submit.addEventListener("click", () => {
    const contextValue = ctx.value || "Spawn Core · Boosterbox";
    const titleValue = title.value.trim() || "Untitled question";
    const tagsValue = tags.value.trim() || "mesh, support";
    const descValue = desc.value.trim();

    supcastState.items.unshift({
      context: contextValue,
      title: titleValue,
      tags: tagsValue,
      description: descValue,
      time: supcastFormatTime(),
    });

    // Begränsa feeden lite
    if (supcastState.items.length > 20) {
      supcastState.items.length = 20;
    }

    renderSupcastFeed();

    title.value = "";
    tags.value = "";
    desc.value = "";

    if (window.spawnToast) {
      window.spawnToast("SupCast question posted (mock)");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSupcast);
} else {
  initSupcast();
}