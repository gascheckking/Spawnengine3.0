// SPAWNENGINE APP CORE v3.6

document.querySelectorAll("#mainNav button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll("#mainNav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.view).classList.add("active");
    spawnMeshPulse("#4df2ff", innerWidth / 2, innerHeight / 2);
  });
});

// Mock ticker
const ticker = document.querySelector(".live-ticker");
const events = [
  "PACK_OPEN · Neon Fragment",
  "BURN_EVENT · XP Sync",
  "CAST_POST · Farcaster",
  "SWAP · Base Mesh",
];
let index = 0;
setInterval(() => {
  if (ticker) ticker.textContent = "LIVE " + events[index % events.length];
  index++;
}, 4000);

Index.html

<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SPAWNENGINE · Interface</title>
  <link rel="stylesheet" href="style.css" />
  <script>
    function openTab(tab) {
      window.location.href = tab + '.html';
    }
  </script>
</head>
<body>
  <canvas id="mesh-bg"></canvas>

  <div class="app-container">
    <header class="top-tabs">
      <button class="tab" onclick="openTab('dashboard')">Dashboard</button>
      <button class="tab" onclick="openTab('forge')">Forge</button>
      <button class="tab" onclick="openTab('worlds')">Worlds</button>
      <button class="tab" onclick="openTab('factory')">Factory</button>
      <button class="tab" onclick="openTab('kernel')">Kernel</button>
      <button class="tab" onclick="openTab('profile')">Profile</button>
      <button class="tab" onclick="openTab('modules')">Modules</button>
      <button class="tab" onclick="openTab('settings')">Settings</button>
    </header>

    <main>
      <section class="tab-view active">
        <h1 class="tab-title">Welcome to SPAWNENGINE</h1>
        <p>Välj en flik ovan för att navigera.</p>
      </section>
    </main>
  </div>
</body>
</html>
