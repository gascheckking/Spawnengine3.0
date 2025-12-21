/* ============================================================
   SPAWNENGINE · SLOT MACHINE v3.2 — XP Mesh Casino
   ============================================================ */

.slot-container {
  color: #e5eaff;
  font-family: system-ui, sans-serif;
  padding: 1.2em;
  text-align: center;
  max-width: 420px;
  margin: 0 auto;
  background: radial-gradient(circle at top left, #05061a, #02030a);
  border-radius: 16px;
  box-shadow: 0 0 25px rgba(77, 242, 255, 0.08);
}

/* —— HEADER —— */
.slot-header {
  border-bottom: 1px solid #2b2f5c;
  padding-bottom: 0.6em;
  margin-bottom: 1.2em;
}

.slot-header h2 {
  color: #4df2ff;
  font-size: 1.5em;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.slot-sub {
  color: #9aa2cc;
  font-size: 0.9em;
  margin-top: 0.3em;
}

/* —— BALANCE —— */
.slot-balance {
  margin: 0.8em 0;
  color: #79ffb6;
  font-weight: 600;
  font-size: 1em;
}

/* —— CONTROLS —— */
.slot-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8em;
  margin-bottom: 1.2em;
}

.slot-controls select {
  background: #0a0e26;
  color: #e5eaff;
  border: 1px solid #4df2ff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.9em;
}

#spinBtn {
  background: linear-gradient(135deg, #3cf6ff, #b9ff7a);
  color: #050510;
  border: none;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.25s ease;
  box-shadow: 0 0 10px rgba(60, 246, 255, 0.3);
}

#spinBtn:hover {
  transform: scale(1.05);
  filter: brightness(1.15);
}

/* —— REELS —— */
.slot-reels {
  display: flex;
  justify-content: space-around;
  background: #0a0e26;
  border-radius: 14px;
  padding: 1.2em;
  border: 1px solid #2b2f5c;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.reel {
  flex: 1;
  margin: 0 6px;
  height: 120px;
  border-radius: 10px;
  background: linear-gradient(145deg, #11152c, #1a1f48);
  border: 1px solid #4df2ff1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2em;
  color: #4df2ff;
  transition: transform 0.4s ease, color 0.2s ease;
}

.reel.win {
  color: #b9ff7a;
  box-shadow: 0 0 15px rgba(185, 255, 122, 0.5);
  animation: glowPulse 1s infinite alternate;
}

@keyframes glowPulse {
  from { box-shadow: 0 0 6px #4df2ff; }
  to { box-shadow: 0 0 18px #4df2ff; }
}

/* —— RESULT —— */
.slot-result {
  margin-top: 1.2em;
  font-size: 1em;
  color: #c6d0ff;
  font-weight: 500;
}

/* —— FOOTER —— */
.slot-footer {
  margin-top: 1.4em;
}

#collectBtn {
  background: #4df2ff;
  color: #000;
  border: none;
  padding: 9px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

#collectBtn:hover {
  transform: scale(1.05);
  background: #b9ff7a;
}