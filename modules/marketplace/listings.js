/* ============================================================
   SpawnEngine Marketplace Module v3.1
   Handles marketplace listings and simulated purchases
   ============================================================ */

import { getMarketplaceListings, simulatePurchase } from "../../api/marketplace-listings.js";

const listingsArea = document.getElementById("listingsArea");
const refreshBtn = document.getElementById("refreshListings");

/* —— Load and render marketplace listings —— */
export async function renderMarketplace() {
  listingsArea.innerHTML = `<div class="loader">Loading listings...</div>`;

  try {
    const listings = await getMarketplaceListings();

    if (!listings || listings.length === 0) {
      listingsArea.innerHTML = `<p>No active listings available.</p>`;
      return;
    }

    listingsArea.innerHTML = listings.map(item => `
      <div class="listing-card" data-id="${item.id}">
        <h3>${item.name}</h3>
        <p><span class="price">${item.price} ${item.currency}</span></p>
        <p>Seller: ${item.seller}</p>
        <p>Type: ${item.type}</p>
        <p>Qty: ${item.quantity}</p>
      </div>
    `).join("");

    attachPurchaseListeners();
  } catch (err) {
    listingsArea.innerHTML = `<p>Error loading listings. Try again later.</p>`;
    console.error("Marketplace load error:", err);
  }
}

/* —— Simulated purchase action —— */
function attachPurchaseListeners() {
  const cards = document.querySelectorAll(".listing-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      const result = simulatePurchase(id);
      showPurchaseToast(result.message, result.success);
    });
  });
}

/* —— UI Toast Feedback —— */
function showPurchaseToast(message, success = true) {
  const toast = document.createElement("div");
  toast.className = "market-toast";
  toast.style = `
    position: fixed;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: ${success ? "#4df2ff" : "#ff4d4d"};
    color: #000;
    padding: 10px 18px;
    border-radius: 10px;
    font-family: system-ui, sans-serif;
    box-shadow: 0 0 10px rgba(0,0,0,0.4);
    z-index: 9999;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* —— Refresh handler —— */
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    renderMarketplace();
  });
}

/* —— Auto-init on load —— */
window.addEventListener("DOMContentLoaded", renderMarketplace);