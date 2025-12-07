(function () {
  
  // Lista över möjliga föremål och deras rariteter
  const itemPool = [
    { name: "SpawnEngine Shard", rarity: "common", icon: "💎" },
    { name: "XP Boost (Minor)", rarity: "common", icon: "⭐" },
    { name: "Mesh Blueprint #001", rarity: "rare", icon: "⚙️" },
    { name: "BASE Roll Badge", rarity: "rare", icon: "🔵" },
    { name: "SPN Token Bonus", rarity: "rare", icon: "💰" },
    { name: "Vibe Pass Fragment", rarity: "epic", icon: "✨" },
    { name: "Legendary Fire Token", rarity: "legendary", icon: "🔥" },
  ];

  // Helper-funktion för att efterlikna en asynkron Web3-transaktion
  function simulateWeb3Call(durationMs) {
    return new Promise(resolve => setTimeout(resolve, durationMs));
  }

  // Funktion för att slumpa fram ett antal föremål (2 till 4)
  function getPackContents() {
    const numItems = Math.floor(Math.random() * 3) + 2; // 2, 3, eller 4 föremål
    const results = [];
    
    for (let i = 0; i < numItems; i++) {
      const rand = Math.random();
      let item;
      
      // Enkel sannolikhetsbaserad raritetsallokering
      if (rand < 0.05) {
        item = itemPool.find(i => i.rarity === 'legendary');
      } else if (rand < 0.25) {
        item = itemPool.find(i => i.rarity === 'epic');
      } else if (rand < 0.6) {
        // Slumpar mellan rare items
        const rareItems = itemPool.filter(i => i.rarity === 'rare');
        item = rareItems[Math.floor(Math.random() * rareItems.length)];
      } else {
        // Slumpar mellan common items
        const commonItems = itemPool.filter(i => i.rarity === 'common');
        item = commonItems[Math.floor(Math.random() * commonItems.length)];
      }

      results.push(item);
    }
    return results;
  }
  
  // Funktion för att rendera resultaten
  function renderResults(results, container) {
    container.innerHTML = ''; // Rensa gamla resultat
    
    results.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `item-card rarity-${item.rarity}`;
      card.style.animationDelay = `${index * 100}ms`; // Förskjut animationen
      
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

  // Huvudmodulens initiationsfunktion
  function initPackReveal(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    const packCover = document.getElementById("pack-cover");
    const resultsContainer = document.getElementById("reveal-results");
    const openBtn = document.getElementById("reveal-open-btn");
    const statusDisplay = document.getElementById("reveal-status");
    
    if (!packCover || !resultsContainer || !openBtn || !statusDisplay) return;

    // Huvudfunktionen för att öppna packen
    const handleOpen = async () => {
      if (openBtn.disabled) return;
      openBtn.disabled = true;
      
      statusDisplay.textContent = "Signerar transaktion för att konsumera packen...";
      
      try {
        // 1. SIMULERA ON-CHAIN FÖRBRUKNING AV PACKEN (t.ex. bränna NFT eller spendera token)
        await simulateWeb3Call(2000); 
        statusDisplay.textContent = "Pack konsumerat on-chain. Hämtar metadata...";
        
        // 2. STARTA VISUELL ANIMATION
        packCover.classList.add('revealing'); // Startar fade/scale animation
        
        // 3. HÄMTA RESULTAT
        await simulateWeb3Call(800); // Vänta tills packen nästan försvunnit
        
        const contents = getPackContents();
        renderResults(contents, resultsContainer);
        
        // 4. VISA RESULTATET
        packCover.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        // Aktivera fade-in effekten (synliggör resultaten)
        setTimeout(() => {
          resultsContainer.classList.add('visible');
          statusDisplay.textContent = `Grattis! Du fick ${contents.length} nya föremål.`;
        }, 10); 

      } catch (error) {
        statusDisplay.textContent = "FEL: Packen kunde inte öppnas on-chain.";
        console.error("Reveal error:", error);
      } finally {
        // Notera: Vi återaktiverar inte knappen här eftersom packen är konsumerad.
        // I en riktig app skulle knappen leda till att öppna en NY pack.
      }
    };

    // Event Listener
    openBtn.addEventListener("click", handleOpen);
  }

  // Exponera modulen globalt
  window.SpawnPackReveal = {
    init: initPackReveal,
  };
  
  // Starta modulen för den fristående demon
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("reveal-root")) {
      initPackReveal("reveal-root");
    }
  });

})();
