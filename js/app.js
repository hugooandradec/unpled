import { loadState, saveState } from "./storage.js";
import { openPack } from "./gacha.js";
import {
  setOnlineStatus,
  updateCoins,
  renderHomeView,
  renderPlayView,
  renderCollectionView,
  renderSettingsView,
  showView
} from "./ui.js";

// =========================
// STATE
// =========================
let state = loadState();

// fallback seguro
if (!state.coins) {
  state.coins = 0;
}

// =========================
// INIT
// =========================
function init() {
  // 1️⃣ Renderiza todas as views base
  renderHomeView();
  renderPlayView();
  renderCollectionView();
  renderSettingsView();

  // 2️⃣ Bind navegação
  bindNavigation();

  // 3️⃣ HUD / Status
  updateCoins(state.coins);
  setOnlineStatus();

  // 4️⃣ Service Worker (web por enquanto, mas já pronto)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  // 5️⃣ Eventos de conexão
  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}

// =========================
// NAVIGATION
// =========================
function bindNavigation() {
  // HOME → PLAY
  document.getElementById("btnGoPlay")?.addEventListener("click", () => {
    showView("play");
  });

  // HOME → COLLECTION
  document.getElementById("btnGoCollection")?.addEventListener("click", () => {
    showView("collection");
  });

  // HOME → SETTINGS
  document.getElementById("btnGoSettings")?.addEventListener("click", () => {
    showView("settings");
  });

  // PLAY → HOME
  document.getElementById("btnBackFromPlay")?.addEventListener("click", () => {
    showView("home");
  });

  // COLLECTION → HOME
  document
    .getElementById("btnBackFromCollection")
    ?.addEventListener("click", () => {
      showView("home");
    });

  // SETTINGS → HOME
  document
    .getElementById("btnBackFromSettings")
    ?.addEventListener("click", () => {
      showView("home");
    });

  // PLAY → OPEN PACK
  document.getElementById("btnOpenPack")?.addEventListener("click", handleOpenPack);
}

// =========================
// GAME LOGIC
// =========================
function handleOpenPack() {
  const cards = openPack();

  // recompensa temporária
  state.coins += 10;
  saveState(state);
  updateCoins(state.coins);

  renderPackResult(cards);
}

// =========================
// RENDER RESULTS
// =========================
function renderPackResult(cards) {
  const log = document.getElementById("playLog");
  if (!log) return;

  const text = cards
    .map(c => `${c.rank}${c.suitSymbol}`)
    .join(" • ");

  log.textContent = `Pack aberto: ${text}`;
}

// =========================
document.addEventListener("DOMContentLoaded", init);
