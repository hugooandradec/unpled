import { loadState, saveState } from "./storage.js";
import { openPack } from "./gacha.js";
import {
  setOnlineStatus,
  updateCoins,
  setupTabs,
  renderPlayView,
  renderPacksView,
  renderCollectionView
} from "./ui.js";

let state = loadState();

// =========================
// INIT
// =========================
function init() {
  // 1️⃣ Renderiza o HTML base das views
  renderPlayView();
  renderPacksView();
  renderCollectionView();

  // 2️⃣ Setup UI
  setupTabs();
  updateCoins(state.coins);
  setOnlineStatus();

  // 3️⃣ Eventos
  bindEvents();

  // 4️⃣ Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}

// =========================
// EVENTS
// =========================
function bindEvents() {
  const btnOpenPack = document.getElementById("btnOpenPack");
  if (btnOpenPack) {
    btnOpenPack.onclick = handleOpenPack;
  }

  const btnBuyPack = document.getElementById("btnBuyPack");
  if (btnBuyPack) {
    btnBuyPack.onclick = handleOpenPack;
  }
}

// =========================
// GAME ACTIONS
// =========================
function handleOpenPack() {
  const cards = openPack();

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
  const pack = document.getElementById("packResult");

  const html = cards
    .map(c => `${c.rank}${c.suitSymbol}`)
    .join(" • ");

  if (log) {
    log.textContent = `Pack aberto: ${html}`;
  }

  if (pack) {
    pack.innerHTML = cards
      .map(
        c => `
        <div class="playCard">
          <div class="rank">${c.rank}</div>
          <div class="suit">${c.suitSymbol}</div>
          <div class="val">${c.rarity}</div>
        </div>
      `
      )
      .join("");
  }
}

// =========================
document.addEventListener("DOMContentLoaded", init);
