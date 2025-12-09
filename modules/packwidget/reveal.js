(function () {
  
  const itemPool = [
    { name: "SpawnEngine Shard", rarity: "common", icon: "💎" },
    { name: "XP Boost (Minor)", rarity: "common", icon: "⭐" },
    { name: "Mesh Blueprint #001", rarity: "rare", icon: "⚙️" },
    { name: "BASE Roll Badge", rarity: "rare", icon: "🔵" },
    { name: "SPN Token Bonus", rarity: "rare", icon: "💰" },
    { name: "Vibe Pass Fragment", rarity: "epic", icon: "✨" },
    { name: "Legendary Fire Token", rarity: "legendary", icon: "🔥" },
  ];

  function simulateWeb3Call(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function getPackContents() {
    const numItems = Math.floor(Math.random() * 3) + 2;
    const results = [];
    
    for (let i = 0; i < numItems; i++) {
      const r = Math.random();
      let item;

      if (r < 0.05) {
        item = itemPool.find(i => i.rarity === "legendary");
      } else if (r < 0.25) {
        item = itemPool.find(i => i.rarity === "epic");
      } else if (r < 0.6) {
        const rares = itemPool.filter(i => i.rarity === "rare");
        item = rares[Math.floor(Math.random() * rares.length)];
      } else {
        const commons = itemPool.filter(i => i.rarity === "common");
        item = commons[Math.floor(Math.random() * commons.length)];
      }

      results.push(item);
    }

    return results;
  }

  function renderResults(results, container) {
    container.innerHTML = "";

    results.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = `item-card rarity-${item.rarity}`;
      card.style.animationDelay = `${index * 100}ms`;

      card.innerHTML = `
        <div class="card-icon" style="font-size: 30px;">${item.icon}</div>
        <div class="card-details">
          <div style="font-weight: 700;">${item.name}</div>
          <div style="color: #939fda; margin-top: 2px;">Raritet: ${item.rarity.toUpperCase()}</div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function initPackReveal(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    const packCover = document.getElementById("pack-cover");
    const resultsContainer = document.getElementById("reveal-results");
    const openBtn = document.getElementById("reveal-open-btn");
    const statusDisplay = document.getElementById("reveal-status");

    if (!packCover || !resultsContainer || !openBtn || !statusDisplay) return;

    const handleOpen = async () => {
      if (openBtn.disabled) return;

      openBtn.disabled = true;
      statusDisplay.textContent = "Signerar transaktion...";

      try {
        await simulateWeb3Call(2000);
        statusDisplay.textContent = "Pack öppnas...";

        packCover.classList.add("revealing");

        await simulateWeb3Call(800);

        const contents = getPackContents();
        renderResults(contents, resultsContainer);

        packCover.classList.add("hidden");
        resultsContainer.classList.remove("hidden");

        setTimeout(() => {
          resultsContainer.classList.add("visible");
          statusDisplay.textContent = `Grattis! Du fick ${contents.length} föremål.`;
        }, 10);

      } catch (err) {
        statusDisplay.textContent = "FEL: Packen kunde inte öppnas.";
      }
    };

    openBtn.addEventListener("click", handleOpen);
  }

  window.SpawnPackReveal = {
    init: initPackReveal,
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("reveal-root")) {
      initPackReveal("reveal-root");
    }
  });

})();