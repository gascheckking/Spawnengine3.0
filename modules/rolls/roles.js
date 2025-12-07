(function () {
  
  // Helper-funktion för att efterlikna en asynkron Web3/API-transaktion
  function simulateWeb3Call(durationMs) {
    return new Promise(resolve => setTimeout(resolve, durationMs));
  }

  // Huvudmodulens initiationsfunktion
  function initRollSelection(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    const cards = root.querySelectorAll('.role-card');
    const confirmBtn = document.getElementById('role-confirm-btn');
    const statusDisplay = document.getElementById('role-status');
    let selectedRole = null;

    if (!cards.length || !confirmBtn || !statusDisplay) return;

    // 1. Hantera Rollval
    cards.forEach(card => {
      card.addEventListener('click', () => {
        // Ta bort 'selected' från alla kort
        cards.forEach(c => c.classList.remove('selected'));
        
        // Markera det klickade kortet
        card.classList.add('selected');
        selectedRole = card.getAttribute('data-role');
        
        confirmBtn.disabled = false;
        confirmBtn.textContent = `Bekräfta Roll: ${selectedRole}`;
        statusDisplay.textContent = `Roll vald: ${selectedRole}. Klicka på knappen för att spara.`;
      });
    });

    // 2. Hantera Bekräftelse/Sparande
    const handleConfirm = async () => {
      if (!selectedRole || confirmBtn.disabled) return;
      
      confirmBtn.disabled = true;
      statusDisplay.textContent = `Skickar ${selectedRole} till SpawnEngine API (on-chain TX)...`;
      
      try {
        // Simulera en transaktion som lagrar rollen (via din api/user-profile.js)
        await simulateWeb3Call(2500); 
        
        statusDisplay.textContent = `🎉 Roll '${selectedRole}' sparad! Din nya Badge är nu aktiv.`;
        
        // Här skulle du i produktion:
        // 1. Skicka TX till smart contract/backend.
        // 2. Omdirigera användaren eller ladda nästa vy.
        // 3. (Mock) Lägg till en 'completed' klass för att visa att det är klart
        confirmBtn.textContent = "Roll sparad!";
        confirmBtn.classList.add('role-saved');

      } catch (error) {
        statusDisplay.textContent = "FEL: Rollen kunde inte sparas on-chain. Försök igen.";
        console.error("Roll saving error:", error);
      } finally {
        // Vi håller knappen inaktiverad efter lyckad sparning (detta är on-boarding)
      }
    };

    // Event Listener
    confirmBtn.addEventListener("click", handleConfirm);
    
    // Initial status
    statusDisplay.textContent = "Anslut för att välja din Roll och låsa upp din första Quest.";
  }

  // Exponera modulen globalt
  window.SpawnRolls = {
    init: initRollSelection,
  };
  
  // Starta modulen för den fristående demon
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("roles-root")) {
      initRollSelection("roles-root");
    }
  });
})();
