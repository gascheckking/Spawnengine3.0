// modules/marketplace/listings.js

/**
 * Mock-data för marknadslistningar.
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
    description: "Unlocks the 'Builder' role with development tools.",
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
 * HTML-template för ett kort.
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
        <span class="market-card-participants">${listing.participants} users</span>

        <button class="link-btn market-card-btn" data-action="view-details">
          Details
        </button>
      </div>
    </article>
  `;
}

/**
 * Renderar trending + alla listningar.
 */
function renderListings() {
  const trendingRow = document.getElementById("marketTrendingRow");
  const allGrid = document.getElementById("marketAllGrid");

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
 * Hanterar “Details”.
 */
function handleMarketActions() {
  const marketPanel = document.querySelector(".tab-panel#tab-market");
  if (!marketPanel) return;

  marketPanel.addEventListener("click", (e) => {
    if (e.target.dataset.action !== "view-details") return;

    const card = e.target.closest(".market-card");
    const id = card?.dataset.id;
    if (!id) return;

    const listing = MOCK_LISTINGS.find((l) => String(l.id) === id);
    if (!listing) return;

    if (typeof openMarketDetails === "function") {
      openMarketDetails(listing);
      return;
    }

    if (typeof showToast === "function") {
      showToast(`Viewing: ${listing.title}`);
    } else {
      console.log(`Viewing: ${listing.title}`);
    }
  });

  const buyBtn = document.getElementById("btn-buy-spn");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      if (typeof showToast === "function") {
        showToast("Simulating DEX swap for SPN.");
      }
    });
  }
}

/**
 * Init exporteras globalt så app.js kan anropa den.
 */
window.initMarketplace = function () {
  renderListings();
  handleMarketActions();
};