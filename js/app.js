import { loadState, saveState } from "./storage.js";
import { openPack } from "./gacha.js";
import {
  setOnlineStatus,
  updateCoins,
  renderHomeView,
  renderPlayView,
  renderCollectionView,
  showView
} from "./ui.js";

let state = loadState();

function init() {
  // Render base
  renderHomeView();
  renderPlayView();
  renderCollectionView();

  updateCoins(state.coins);
  setOnlineStatus();

  bindHomeEvents();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}

// =========================
// HOME EVENTS
// =========================
function bindHomeEvents() {
  document.getElementById("btnGoPlay")?.addEventListener("click", () => {
    showView("play");
  });

  document.getElementById("btnGoCollection")?.addEventListener("click", () => {
    showView("collection");
  });

  document.getElementById("btnGoSettings")?.addEventListener("click", () => {
    showView("settings");
    renderSettingsPlaceholder();
  });
}

// =========================
// GAME ACTION
// =========================
window.openPack = () => {
  const cards = openPack();
  state.coins += 10;
  saveState(state);
  updateCoins(state.coins);
  console.log("Pack aberto:", cards);
};

// =========================
// SETTINGS (placeholder)
// =========================
function renderSettingsPlaceholder() {
  const root = document.getElementById("view-settings");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <h2>Configurações</h2>
      <p class="muted">Em breve 😌</p>

      <div class="spacer"></div>

      <button class="btn ghost" id="btnBackHome">
        Voltar
      </button>
    </div>
  `;

  document.getElementById("btnBackHome")?.addEventListener("click", () => {
    showView("home");
  });
}

document.addEventListener("DOMContentLoaded", init);