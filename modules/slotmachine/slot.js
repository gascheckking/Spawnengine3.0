/*
 * Slot Machine Module - Advanced Casino-Style Version
 * Inspired by Dead or Alive / Bonanza: 5x3 reels, paylines, wilds, scatters for freespins.
 * Uses SpawnEng (SPN) as currency. Mock balance and outcomes – real onchain in production.
 */

// --- Configuration Constants ---
const SYMBOLS = ['🍒', '🍋', '🍉', '🔔', '⭐', '7️⃣', 'W', 'S']; // W = Wild, S = Scatter
const REELS = 5; // Number of reels (columns)
const ROWS = 3; // Visible rows
const ROLL_COUNT = 30; // Symbols to roll through per reel
const SYMBOL_HEIGHT = 40; // Must match CSS .slot-symbol height
const PAYLINES = [
  // Example 10 paylines (indices: row0-col0, row0-col1, etc.)
  [0,1,2,3,4], // Top row
  [5,6,7,8,9], // Middle row
  [10,11,12,13,14], // Bottom row
  [0,6,12,8,4], // V-shape
  [10,6,2,8,14], // Inverted V
  // Add more for Bonanza-style all-ways or fixed lines
];
const WIN_MULTIPLIERS = {3: 2, 4: 5, 5: 20}; // Multiplier for matching symbols
const FREESPINS_TRIGGER = 3; // Scatters needed
const FREESPINS_COUNT = 10; // Base freespins
const FREESPINS_MULTIPLIER = 2; // Win multiplier during freespins

// --- Helper Functions ---

/**
 * Generates a random symbol.
 * @returns {string} Random symbol from config.
 */
function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

/**
 * Builds the content strip for a reel column (3 visible + rolling symbols).
 * @param {string[]} finalSymbols - Array of 3 symbols for the visible rows.
 * @returns {string} HTML string for the column content.
 */
function buildColumnContent(finalSymbols) {
  let content = '';
  // Add ROLL_COUNT random symbols for roll effect (per row, but since vertical, multiply)
  for (let i = 0; i < ROLL_COUNT * ROWS; i++) {
    content += `<div class="slot-symbol">${getRandomSymbol()}</div>`;
  }
  // Add the final 3 symbols
  finalSymbols.forEach(sym => {
    content += `<div class="slot-symbol slot-final ${sym === 'W' ? 'wild' : sym === 'S' ? 'scatter' : ''}">${sym}</div>`;
  });
  return content;
}

/**
 * Checks for wins across paylines.
 * @param {string[][]} grid - 3x5 grid of symbols (rows x columns).
 * @param {number} multiplier - Current win multiplier (1 or FREESPINS_MULTIPLIER).
 * @returns {number} Total win amount.
 */
function checkWins(grid, multiplier = 1) {
  let totalWin = 0;
  PAYLINES.forEach(line => {
    const symbols = line.map(idx => {
      const row = Math.floor(idx / REELS);
      const col = idx % REELS;
      return grid[row][col];
    });
    // Check for matching (ignoring wilds as substitutes for now)
    let matchCount = 1;
    let first = symbols[0];
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === first || symbols[i] === 'W') {
        matchCount++;
      } else {
        break;
      }
    }
    if (matchCount >= 3 && WIN_MULTIPLIERS[matchCount]) {
      totalWin += WIN_MULTIPLIERS[matchCount] * multiplier;
    }
  });
  return totalWin;
}

/**
 * Counts scatters in the grid.
 * @param {string[][]} grid - 3x5 grid.
 * @returns {number} Number of scatters.
 */
function countScatters(grid) {
  return grid.flat().filter(sym => sym === 'S').length;
}

// --- Main Slot Machine Class ---

class SpawnSlotMachine {
  constructor(containerElement) {
    this.container = containerElement;
    this.columns = containerElement.querySelectorAll('.slot-reel-column');
    this.spinBtn = document.getElementById('slot-spin-btn');
    this.betSelector = document.getElementById('slot-bet-selector');
    this.balanceElem = document.getElementById('slot-balance');
    this.resultElem = document.getElementById('slot-result');
    this.freespinsElem = document.getElementById('slot-freespins');
    this.balance = 1000; // Mock SPN balance
    this.freespins = 0;
    this.isSpinning = false;

    this.spinBtn.disabled = false;
    this.spinBtn.textContent = 'Spin';
    this.spinBtn.addEventListener('click', () => this.spin());
  }

  updateUI() {
    this.balanceElem.textContent = `${this.balance} SPN`;
    this.freespinsElem.textContent = `Freespins: ${this.freespins}`;
    this.spinBtn.textContent = this.freespins > 0 ? 'Freespin!' : 'Spin';
    this.spinBtn.classList.toggle('freespin', this.freespins > 0);
  }

  reset() {
    this.isSpinning = false;
    this.columns.forEach(col => {
      col.classList.remove('rolling', 'stopped');
      col.style.transform = 'translateY(0)';
      col.innerHTML = '';
      for (let i = 0; i < ROWS; i++) {
        col.innerHTML += `<div class="slot-symbol">${SYMBOLS[0]}</div>`;
      }
    });
    // Remove win highlights
    document.querySelectorAll('.win-highlight').forEach(el => el.classList.remove('win-highlight'));
  }

  async spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.reset();
    this.resultElem.textContent = 'Spinning...';
    this.spinBtn.disabled = true;

    const bet = this.freespins > 0 ? 0 : parseInt(this.betSelector.value);
    if (bet > this.balance && this.freespins === 0) {
      this.resultElem.textContent = 'Insufficient SPN!';
      this.isSpinning = false;
      this.spinBtn.disabled = false;
      return;
    }

    if (this.freespins === 0) this.balance -= bet;
    else this.freespins--;

    // Generate random grid (3x5)
    const grid = Array.from({length: ROWS}, () => Array.from({length: REELS}, getRandomSymbol));

    // Start rolling each column
    const rollPromises = Array.from(this.columns).map((col, index) => {
      return new Promise(resolve => {
        const finalSymbols = grid.map(row => row[index]); // Column symbols
        col.innerHTML = buildColumnContent(finalSymbols);
        col.classList.add('rolling');
        const delay = 3000 + (index * 700);
        setTimeout(() => {
          const distanceToStop = (ROLL_COUNT * ROWS) * SYMBOL_HEIGHT;
          col.style.transform = `translateY(-${distanceToStop}px)`;
          col.classList.remove('rolling');
          col.classList.add('stopped');
          resolve();
        }, delay);
      });
    });

    await Promise.all(rollPromises);

    // Check wins and scatters
    const multiplier = this.freespins > 0 ? FREESPINS_MULTIPLIER : 1;
    const win = checkWins(grid, multiplier) * bet;
    const scatters = countScatters(grid);
    if (scatters >= FREESPINS_TRIGGER) {
      this.freespins += FREESPINS_COUNT;
      this.resultElem.textContent = `Freespins Triggered! +${FREESPINS_COUNT} spins. Win: ${win} SPN`;
    } else {
      this.resultElem.textContent = win > 0 ? `Win: ${win} SPN!` : 'No win. Try again!';
    }
    this.balance += win;

    // Highlight winning symbols (simple: all in paylines)
    if (win > 0) {
      // For demo, highlight all matching (expand for real paylines)
      this.columns.forEach((col, colIdx) => {
        col.querySelectorAll('.slot-symbol.slot-final').forEach((sym, rowIdx) => {
          if (grid[rowIdx][colIdx] !== 'S') sym.classList.add('win-highlight');
        });
      });
    }

    this.updateUI();
    this.isSpinning = false;
    this.spinBtn.disabled = false;
  }
}

// Initialize
const slotMachine = new SpawnSlotMachine(document.querySelector('.slot-machine'));
slotMachine.updateUI();