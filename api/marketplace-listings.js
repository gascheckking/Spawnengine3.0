// api/marketplace-listings.js

/**
 * Mock-data för marknadsplatslistningar.
 * Denna data skulle normalt hämtas från en databas/blockchain.
 */
export const MOCK_MARKETPLACE_LISTINGS = [
  { 
    id: 101, 
    name: "Rare Shard Pack (Series A)", 
    price: 0.05, 
    currency: "ETH", 
    seller: "@mesh_trader",
    type: "Pack",
    quantity: 1 
  },
  { 
    id: 102, 
    name: "Golden Builder Role Key", 
    price: 0.012, 
    currency: "ETH", 
    seller: "@spawniz",
    type: "Role",
    quantity: 1 
  },
  { 
    id: 103, 
    name: "Fragment Bundle x10", 
    price: 0.005, 
    currency: "ETH", 
    seller: "@fragment_farm",
    type: "Material",
    quantity: 10 
  },
];

/**
 * Simulerad funktion för att hämta listningsdata.
 */
export function getMarketplaceListings() {
  // Simulerar ett framgångsrikt API-anrop
  return MOCK_MARKETPLACE_LISTINGS;
}

/**
 * Simulerad funktion för att köpa en listning.
 * @param {number} listingId - ID:t på objektet som ska köpas.
 */
export function simulatePurchase(listingId) {
    const item = MOCK_MARKETPLACE_LISTINGS.find(l => l.id === listingId);

    if (item) {
        // Mock-logik: tar bort objektet från listan
        // Normalt skulle detta hantera en transaktion
        return {
            success: true,
            message: `Successfully purchased "${item.name}" for ${item.price} ${item.currency}.`,
            item: item
        };
    } else {
        return {
            success: false,
            message: "Purchase failed: Listing not found or already sold."
        };
    }
}
