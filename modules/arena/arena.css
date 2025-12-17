/* /modules/arena/arena.css */
/*——— ARENA CORE LAYOUT ——*/
.arena-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  color: #e9f1ff;
  font-family: "Inter", system-ui, sans-serif;
  background: radial-gradient(circle at top left, #05061a, #02030a);
}

.arena-header {
  text-align: center;
  margin-bottom: 32px;
}

.arena-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, #47f7ff, #b7ff73);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.arena-subtitle {
  font-size: 14px;
  opacity: 0.75;
  margin-top: 6px;
}

/*——— SECTIONS ——*/
.arena-section {
  margin-bottom: 42px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(10, 14, 38, 0.75);
  border: 1px solid rgba(130, 170, 255, 0.25);
  box-shadow: 0 0 32px rgba(0, 0, 0, 0.5) inset;
}

.arena-section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ec8ff;
}

/*——— CONTEST CARDS ——*/
.arena-contest-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.arena-contest-card {
  flex: 1 1 280px;
  padding: 18px;
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(8, 12, 28, 0.9), rgba(5, 7, 16, 0.9));
  border: 1px solid rgba(100, 150, 255, 0.3);
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.arena-contest-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 24px rgba(60, 255, 180, 0.25);
}

.arena-contest-card h3 {
  font-size: 15px;
  margin-bottom: 4px;
  color: #dff8ff;
}

.arena-contest-meta {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 10px;
}

.arena-contest-card .arena-btn {
  font-size: 13px;
  border-radius: 999px;
  padding: 8px 14px;
  background: linear-gradient(90deg, #3cf6ff, #b9ff7a);
  border: none;
  color: #050510;
  font-weight: 700;
  cursor: pointer;
}

/*——— LEADERBOARD ——*/
.arena-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
}

.arena-table th {
  background: rgba(80, 120, 255, 0.1);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 10px;
  border-bottom: 1px solid rgba(110, 160, 255, 0.2);
}

.arena-table td {
  padding: 8px 10px;
  font-size: 13px;
  text-align: center;
  border-bottom: 1px solid rgba(80, 120, 255, 0.1);
}

.arena-table tr:nth-child(odd) td {
  background: rgba(10, 16, 40, 0.4);
}

.arena-table tr:nth-child(even) td {
  background: rgba(6, 10, 26, 0.5);
}

.arena-table tr:hover td {
  background: rgba(20, 30, 60, 0.7);
}

/*——— FEED ——*/
.arena-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
}

.arena-feed-item {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(110, 160, 255, 0.1);
  font-size: 13px;
}

.arena-feed-item b {
  color: #b0ffef;
}

/*——— MODAL ——*/
.arena-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 999;
  align-items: center;
  justify-content: center;
}

.arena-modal.open {
  display: flex;
}

.arena-modal-content {
  background: linear-gradient(180deg, #07091c, #050713);
  border: 1px solid rgba(140, 180, 255, 0.35);
  border-radius: 14px;
  padding: 20px;
  width: min(400px, 90vw);
  text-align: center;
}

.arena-btn-ghost {
  background: rgba(10, 14, 28, 0.8);
  border: 1px solid rgba(140, 180, 255, 0.4);
  color: #e9f1ff;
}

/*——— TOAST ——*/
.arena-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3cf6ff, #b9ff7a);
  color: #050510;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1000;
}

.arena-toast.show {
  opacity: 1;
}

/*——— RESPONSIVE ——*/
@media (max-width: 600px) {
  .arena-contest-list {
    flex-direction: column;
  }
  .arena-section {
    padding: 14px;
  }
}