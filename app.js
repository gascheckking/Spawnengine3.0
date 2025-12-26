function selectRole(role) {
  document.getElementById("roleSelectScreen").classList.remove("active");
  document.getElementById("bootScreen").classList.add("active");

  let loader = document.getElementById("loaderFill");
  let progress = 0;
  const interval = setInterval(() => {
    progress += 4;
    loader.style.width = progress + "%";

    if (progress >= 100) {
      clearInterval(interval);
      document.getElementById("bootScreen").classList.remove("active");
      document.getElementById("app").classList.add("active");
    }
  }, 50);
}

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach((tc) => tc.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add("active");
}