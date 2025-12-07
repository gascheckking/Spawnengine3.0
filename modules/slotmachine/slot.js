(function () {
  const symbols = [
    "SPN", 
    "PACK", 
    "XP", 
    "FOIL", 
    "🔥", 
    "MESH",
    "DEGEN",
    "BASS",
    "VIBE"
  ];
  
  const ROLL_COUNT = 30; // Antal symboler i rullen
  const SYMBOL_HEIGHT = 40; // Måste matcha CSS-höjden (height: 40px)
  const TARGET_INDEX = 1; // Slutresultatet visas på index 1 i listan
  
  // Funktion för att bygga upp det rullande innehållet
  function buildReelContent(reelElement, finalSymbol) {
    let content = '';
    
    // 1. Skapa en lång lista med slumpmässiga symboler
    for (let i = 0; i < ROLL_COUNT; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        content += `<div>${symbol}</div>`;
    }
    
    // 2. Placera den slutliga symbolen på rätt plats
    const finalSymbolPosition = ROLL_COUNT - TARGET_INDEX;
    
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    if (tempDiv.children.length > finalSymbolPosition) {
        tempDiv.children[finalSymbolPosition].textContent = finalSymbol;
    }
    
    reelElement.innerHTML = tempDiv.innerHTML;
  }
  
  // Helper-funktion för att efterlikna en asynkron Web3-transaktion
  function simulateWeb3Call(durationMs) {
    return new Promise(resolve => setTimeout(resolve, durationMs));
  }
  
  // Funktion för att slumpa fram ett resultat
  function getResult() {
    return [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
  }
  
  // Funktion för att stoppa hjulet med animation
  function stopReel(reel, finalSymbol, stopTime, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Bygger innehållet så att finalSymbol är i position 1
            buildReelContent(reel, finalSymbol); 
            
            // Beräkna stoppositionen i pixlar
            const stopPosition = (ROLL_COUNT - TARGET_INDEX) * SYMBOL_HEIGHT;
            
            // Ställ in transition för mjuk inbromsning
            reel.style.transition = `transform ${stopTime}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            // Flytta elementet
            reel.style.transform = `translateY(-${stopPosition}px)`;
            
            // Ta bort den oändliga CSS-rullningen
            reel.classList.remove('rolling');

            setTimeout(resolve, stopTime); // Lös Promise efter animationen är klar
        }, delay);
    });
  }

  // Funktion för att utvärdera vinsten
  async function evaluateResult(a, b, c, display) {
      await simulateWeb3Call(200); 
      
      let msg;
      let color;

      if (a === b && b === c) {
          msg = `🔥 JACKPOT! ${a} ${b} ${c}. Du vinner en EXKLUSIV MESH-PACK! (mock payout)`;
          color = '#3cff8d'; 
      } else if (a === b || b === c || a === c) {
          msg = `Bra Snurr: ${a} ${b} ${c}. Du vinner 150 XP och en Standard PACK. (mock payout)`;
          color = '#9cf6ff'; 
      } else {
          msg = `Inget matchande: ${a} ${b} ${c}. Bättre lycka nästa gång.`;
          color = '#c7d5ff'; 
      }

      display.textContent = msg;
      display.style.color = color;
      
      setTimeout(() => display.style.color = '#c7d5ff', 5000);
  }

  // Huvudmodulens initiationsfunktion
  function initSlotMachine(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    const reel1 = document.getElementById("slot-reel-1");
    const reel2 = document.getElementById("slot-reel-2");
    const reel3 = document.getElementById("slot-reel-3");
    const btn = document.getElementById("slot-spin-btn");
    const resultDisplay = document.getElementById("slot-result");
    const txStatus = document.getElementById("slot-status-tx");
    
    // Initialisera hjulen (visar en start-symbol i mitten)
    buildReelContent(reel1, "SPN");
    buildReelContent(reel2, "PACK");
    buildReelContent(reel3, "XP");

    btn.textContent = "SPIN (Stake 100 SPN)";
    btn.disabled = false;
    resultDisplay.textContent = "Klar. Klicka för att satsa och snurra.";

    // Hanterar snurran
    const handleSpin = async () => {
      if (btn.disabled) return;

      btn.disabled = true;
      resultDisplay.textContent = "Initierar on-chain transaktion...";
      txStatus.textContent = "Väntar på plånbok...";
      
      // Återställ hjulen till toppen inför ny rullning
      reel1.style.transition = 'none';
      reel2.style.transition = 'none';
      reel3.style.transition = 'none';
      reel1.style.transform = 'translateY(0)';
      reel2.style.transform = 'translateY(0)';
      reel3.style.transform = 'translateY(0)';

      try {
        await simulateWeb3Call(1500); // Simulerar Web3 Godkännande
        txStatus.textContent = "Transaktion bekräftad. Rullar...";
        
        // Starta rullande animationen (sätter på CSS-klassen)
        reel1.classList.add('rolling');
        reel2.classList.add('rolling');
        reel3.classList.add('rolling');
        resultDisplay.textContent = "Rullar... håll tummarna!";

        const [final1, final2, final3] = getResult();
        
        // Stanna hjulen i sekvens med olika animationstider
        await stopReel(reel1, final1, 1500, 100); 
        await stopReel(reel2, final2, 1800, 100); 
        await stopReel(reel3, final3, 2200, 100); 

        // Utvärdera resultatet
        await evaluateResult(final1, final2, final3, resultDisplay);

      } catch (error) {
        resultDisplay.textContent = `FEL: Transaktionen misslyckades. Försök igen.`;
        console.error("Spin error:", error);
      } finally {
        txStatus.textContent = "";
        btn.disabled = false; 
      }
    };
    
    // Event Listener
    btn.addEventListener("click", handleSpin);
  }

  // Exponera modulen globalt
  window.SpawnSlotMachine = {
    init: initSlotMachine,
  };
  
  // Starta modulen för den fristående demon
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("slot-root")) {
      initSlotMachine("slot-root");
    }
  });

})();
