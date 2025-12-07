/*
 * Slot Machine Module - Advanced Rolling Version
 * Used for simulated pack openings and game hooks within the Mesh HUD.
 *
 * NOTE: This is a visual-only mock. All outcomes are determined upfront.
 */

// --- Configuration Constants ---
const SYMBOLS = ['⚡', '💎', '🧪', '🏆', '📡', '🔥', '🌌'];
const ROLL_COUNT = 30; // Number of symbols to roll through for a dramatic effect
const SYMBOL_HEIGHT = 80; // Must match CSS .slot-symbol height

/**
 * Helper function to create the content strip for a single reel.
 * It contains ROLL_COUNT symbols + the final winning symbol at the end.
 * @param {string} finalSymbol - The symbol the reel should land on.
 * @returns {string} HTML string for the reel content.
 */
function buildReelContent(finalSymbol) {
    let content = '';
    // 1. Add ROLL_COUNT random symbols for the roll effect
    for (let i = 0; i < ROLL_COUNT; i++) {
        const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        content += `<div class="slot-symbol">${randomSymbol}</div>`;
    }
    // 2. Add the final winning symbol
    content += `<div class="slot-symbol slot-final">${finalSymbol}</div>`;
    return content;
}

/**
 * Initiates the visual roll effect for a single reel element.
 * @param {HTMLElement} reel - The reel element.
 * @param {string} finalSymbol - The symbol to land on.
 * @param {number} delay - The delay before this reel stops (in ms).
 */
function startReelRoll(reel, finalSymbol, delay) {
    // 1. Prepare the content strip
    reel.innerHTML = buildReelContent(finalSymbol);
    
    // 2. Calculate the distance needed to move
    // Total symbols in the strip: ROLL_COUNT (rolling) + 1 (final)
    const totalContentHeight = (ROLL_COUNT + 1) * SYMBOL_HEIGHT;

    // The final symbol is at the bottom of the strip.
    // We want the reel to move 'up' so that the final symbol aligns with the view window.
    // The distance to travel is the height of all rolling symbols.
    const distanceToStop = ROLL_COUNT * SYMBOL_HEIGHT; // This is a positive value in pixels

    // 3. Apply the rolling class to start animation
    reel.classList.add('rolling');

    // 4. Set the final transform position after a delay
    // This transform will stop the CSS animation by overriding it.
    setTimeout(() => {
        // Stop the reel at the position where the final symbol is visible.
        reel.style.transform = `translateY(-${distanceToStop}px)`;
        reel.classList.remove('rolling');
        reel.classList.add('stopped');
    }, delay);
}

// --- Main Slot Machine Class ---

/**
 * A mock slot machine component for the Mesh HUD.
 * Handles the visual reel roll based on a pre-determined result.
 */
class SpawnSlotMachine {
    /**
     * @param {HTMLElement} containerElement - The DOM element containing the slot reels.
     */
    constructor(containerElement) {
        this.container = containerElement;
        this.reels = containerElement.querySelectorAll('.slot-reel');
        this.isSpinning = false;
    }

    /**
     * Resets the slot machine state and reels.
     */
    reset() {
        this.isSpinning = false;
        this.reels.forEach(reel => {
            reel.classList.remove('rolling', 'stopped');
            reel.style.transform = 'translateY(0)';
            reel.innerHTML = `<div class="slot-symbol">${SYMBOLS[0]}</div>`;
        });
    }

    /**
     * Starts the slot spin animation with a predetermined result.
     * @param {string[]} resultSymbols - An array of 3 symbols to land on, e.g., ['⚡', '⚡', '🏆'].
     * @returns {Promise<string[]>} A promise that resolves when all reels have stopped.
     */
    spin(resultSymbols) {
        if (this.isSpinning) {
            return Promise.reject(new Error("Slot machine is already spinning."));
        }
        this.isSpinning = true;
        this.reset(); // Reset before starting the new spin

        // 1. Start the rolls sequentially
        const rollPromises = Array.from(this.reels).map((reel, index) => {
            return new Promise(resolve => {
                const finalSymbol = resultSymbols[index];
                // Delay each reel to stop one after the other for effect (e.g., 500ms separation)
                const delay = 3000 + (index * 700); 

                startReelRoll(reel, finalSymbol, delay);

                // Resolve the promise when this reel is fully stopped (a bit after the transform)
                setTimeout(() => {
                    resolve(finalSymbol);
                }, delay + 500); 
            });
        });

        // 2. Wait for all reels to finish
        return Promise.all(rollPromises).then(() => {
            this.isSpinning = false;
            // The result evaluation should happen external to the visual component
            return resultSymbols;
        });
    }
}

// Expose the class globally (or via module export if using modules)
window.SpawnSlotMachine = SpawnSlotMachine;

/*
 * Den enklare versionen har raderats härifrån för att undvika konflikt.
 */
