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
        price: 50, 
        participants: 120, 
        type: 'widget',
        trending: true
    },
    { 
        id: 2, 
        title: "Alpha Access Pass", 
        description: "Grants early access to new SpawnEngine features.",
        icon: "🔑", 
        price: 1500, 
        participants: 25, 
        type: 'pass',
        trending: true
    },
    { 
        id: 3, 
        title: "Builder Role Token", 
        description: "Unlocks the 'Builder' role and development access.",
        icon: "🛠️", 
        price: 800, 
        participants: 45, 
        type: 'role'
    },
    { 
        id: 4, 
        title: "Community Vibe Share", 
        description: "Governance token representing a stake in the Vibe DAO.",
        icon: "V", 
        price: 15, 
        participants: 300, 
        type: 'token'
    },
    { 
        id: 5, 
        title: "Exclusive Mesh Theme", 
        description: "Dark mode theme with neon blue accents.",
        icon: "✨", 
        price: 100, 
        participants: 60, 
        type: 'cosmetic'
    },
];

/**
 * Genererar HTML för ett enskilt marknadskort.
 */
function createListingCard(listing, isTrending = false) {
    const cardClass = isTrending ? 'market-card market-card-trending' : 'market-card';
    
    return `
        <div class="${cardClass}" data-id="${listing.id}">
            <div class="market-card-icon">${listing.icon}</div>
            <h4>${listing.title}</h4>
            <p>${listing.description}</p>
            <div class="market-card-footer">
                <span class="market-card-price">${listing.price} SPN</span>
                <span class="market-card-participants">${listing.participants} users</span>
                <button class="market-card-btn btn-small" data-action="view-details">Details</button>
            </div>
        </div>
    `;
}

/**
 * Renderar alla listningar till DOM:en.
 */
function renderListings() {
    const trendingRow = document.getElementById('marketTrendingRow');
    const allGrid = document.getElementById('marketAllGrid');

    if (trendingRow) {
        trendingRow.innerHTML = MOCK_LISTINGS
            .filter(l => l.trending)
            .map(l => createListingCard(l, true))
            .join('');
    }
    
    if (allGrid) {
        // Visa icke-trending (och inkludera trending här också om designen kräver det)
        allGrid.innerHTML = MOCK_LISTINGS
            .map(l => createListingCard(l, false))
            .join('');
    }
}

/**
 * Simulerar hantering av detaljknappar.
 */
function handleMarketActions() {
    // Lägger till en lyssnare för alla detaljknappar (använder event bubbling)
    document.querySelector('.tab-panel#tab-panel-market')?.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'view-details') {
            const cardElement = e.target.closest('.market-card');
            const listingId = cardElement?.dataset.id;
            
            if (listingId) {
                const listing = MOCK_LISTINGS.find(l => l.id == listingId);
                if (listing) {
                    showToast(`Simulating details view for: ${listing.title}`, 'info');
                    // Här skulle du normalt öppna en detaljsida/sheet
                }
            }
        }
    });

    // Buy SPN-knappen
    document.getElementById('btn-buy-spn')?.addEventListener('click', () => {
        showToast("Simulating redirect to DEX / Swap interface.", 'info');
    });
}

// Exponera init-funktionen för att anropas från app.js
window.initMarketplace = function() {
    renderListings();
    handleMarketActions();
}

// Kör initMarketplace() i app.js efter DOMContentLoaded.
