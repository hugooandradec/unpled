export function setOnlineStatus() {
  const dot = document.getElementById("onlineDot");
  const label = document.getElementById("onlineLabel");

  const online = navigator.onLine;
  dot.style.background = online ? "#2ecc71" : "#e74c3c";
  label.textContent = online ? "Online" : "Offline";
}

export function updateCoins(value) {
  document.getElementById("coinsLabel").textContent = value;
}

export function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));

      tab.classList.add("active");
      document
        .getElementById(`view-${tab.dataset.view}`)
        .classList.add("active");
    };
  });
}
