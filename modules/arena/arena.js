// /modules/arena/arena.js
import { SpawnArena } from "./spawn-arena.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("%c[Arena] UI Loaded", "color:#47f7ff");

  const contests = [
    { title: "First 100 Pack Pulls", reward: "500 XP" },
    { title: "Forge Your First Relic", reward: "200 XP" },
    { title: "Cast to Farcaster 10x", reward: "100 XP" },
  ];

  const list = document.getElementById("arenaContests");
  contests.forEach((c) => {
    const card = document.createElement("div");
    card.className = "arena-contest-card";
    card.innerHTML = `
      <h3>${c.title}</h3>
      <div class="arena-contest-meta">${c.reward}</div>
      <button class="arena-btn">Join</button>
    `;
    list.appendChild(card);
  });

  // Leaderboard mock
  const leaderboard = [
    { player: "@spawniz", role: "Operator", xp: 4200, wins: 5 },
    { player: "@zorauser", role: "Explorer", xp: 3600, wins: 3 },
    { player: "@meshdev", role: "Creator", xp: 2950, wins: 2 },
  ];

  const tbody = document.getElementById("arenaLeaderboardBody");
  leaderboard.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${row.player}</td>
      <td>${row.role}</td>
      <td>${row.xp}</td>
      <td>${row.wins}</td>
    `;
    tbody.appendChild(tr);
  });

  // Toast example
  const toast = document.getElementById("arenaToast");
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1500);
  }

  document.querySelectorAll(".arena-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      showToast("Joined contest!");
      SpawnArena.simulate("pack_open");
    })
  );
});