// modules/marketplace/listings.js

/**
 * Mock-data för olika marknadslistningar.
 */
const MOCK_LISTINGS = [
  {
    id: 1,
    title: "Pack Opener Widget",
    description: "Integration widget for pack opening in external apps.",
    icon: "📦",
    price: "0.025 ETH",
    participants: 120,
    type: "widget",
    trending: true,
  },
  {
    id: 2,
    title: "Alpha Access Pass",
    description: "Grants early access to new SpawnEngine features.",
    icon: "🔑",
    price: "0.10 ETH",
    participants: 25,
    type: "pass",
    trending: true,
  },
  {
    id: 3,
    title: "Builder Role Token",
    description: "Unlocks the 'Builder' role and development access.",
    icon: "🛠️",
    price: "0.08 ETH",
    participants: 45,
    type: "role",
    trending: false,
  },
  {
    id: 4,
    title: "Community Vibe Share",
    description: "Governance token representing a stake in the Vibe DAO.",
    icon: "V",
    price: "0.015 ETH",
    participants: 300,
    type: "token",
    trending: false,
  },
  {
    id: 5,
    title: "Exclusive Mesh Theme",
    description: "Dark mode theme with neon blue accents.",
    icon: "✨",
    price: "0.03 ETH",
    participants: 60,
    type: "cosmetic",
    trending: false,
  },
];

/**
 * Genererar HTML för ett enskilt marknadskort.
 * Matchar dina .market-card-styles i style.css
 */
function createListingCard(listing, isTrending = false) {
  const cardClass = isTrending
    ? "market-card market-card-trending"
    : "market-card";

  return `
    <article class="${cardClass}" data-id="${listing.id}">
      <div class="market-card-icon">${listing.icon}</div>
      <h4>${listing.title}</h4>
      <p class="market-card-desc">${listing.description}</p>
      <div class="market-card-footer">
        <span class="market-card-price">${listing.price}</span>
        <span class="market-card-participants">${listing.participants} joined</span>
        <button class="link-btn market-card-btn" data-action="view-details">
          View
        </button>
      </div>
    </article>
  `;
}

/**
 * Renderar trending och alla slots in i dina containers.
 * HTML måste ha:
 *  - <div id="marketTrendingRow" class="market-trending-row"></div>
 *  - <div id="marketGrid" class="market-grid"></div>
 */
function renderListings() {
  const trendingRow = document.getElementById("marketTrendingRow");
  const allGrid = document.getElementById("marketGrid");

  if (trendingRow) {
    trendingRow.innerHTML = MOCK_LISTINGS
      .filter((l) => l.trending)
      .map((l) => createListingCard(l, true))
      .join("");
  }

  if (allGrid) {
    allGrid.innerHTML = MOCK_LISTINGS.map((l) =>
      createListingCard(l, false)
    ).join("");
  }
}

/**
 * Click-logik för “Details”-knapparna.
 * Här kan du anropa din Market Details Sheet (marketDetailsBackdrop).
 */
function handleMarketActions() {
  const marketPanel = document.querySelector(".tab-panel#tab-market");
  if (!marketPanel) return;

  marketPanel.addEventListener("click", (e) => {
    const target = e.target;
    if (!target || target.dataset.action !== "view-details") return;

    const cardElement = target.closest(".market-card");
    const listingId = cardElement?.dataset.id;
    if (!listingId) return;

    const listing = MOCK_LISTINGS.find((l) => String(l.id) === String(listingId));
    if (!listing) return;

    // Om du har en riktig details-sheet-funktion, kalla den här:
    if (typeof openMarketDetails === "function") {
      openMarketDetails(listing);
      return;
    }

    // Fallback: bara en toast/logg
    if (typeof showToast === "function") {
      showToast(`Simulating details view for: ${listing.title}`);
    } else {
      console.log(`Simulating details view for: ${listing.title}`);
    }
  });

  // Exempel för en "buy spn"-knapp om du har en sådan i HTML
  const buyBtn = document.getElementById("btn-buy-spn");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      if (typeof showToast === "function") {
        showToast("Simulating redirect to DEX / Swap interface.");
      } else {
        console.log("Simulating redirect to DEX / Swap interface.");
      }
    });
  }
}

// Exponera init-funktion för app.js
window.initMarketplace = function () {
  renderListings();
  handleMarketActions();
};