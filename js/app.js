// js/app.js
import { loadState, saveState } from "./storage.js";
import { openPack } from "./gacha.js";
import {
  bootUI,
  setOnlineStatus,
  updateCoins,
  renderHomeView,
  renderPlayView,
  renderCollectionView,
  renderSettingsView,
  showView
} from "./ui.js";

let state = loadState() || {};
if (typeof state.coins !== "number") state.coins = 0;

function init() {
  // render views (home já existe no HTML, mas ok)
  renderHomeView();
  renderPlayView();
  renderCollectionView();
  renderSettingsView();

  // UI boot (menu + voltar + status)
  bootUI();

  updateCoins(state.coins);
  setOnlineStatus();

  // service worker (não trava se falhar)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

// pack
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#btnOpenPack");
  if (!btn) return;

  const cards = openPack();
  state.coins += 10;
  saveState(state);
  updateCoins(state.coins);

  const log = document.getElementById("playLog");
  if (log) {
    const text = cards.map(c => `${c.rank}${c.suitSymbol}`).join(" • ");
    log.textContent = `Pack aberto: ${text}`;
  }
});

document.addEventListener("DOMContentLoaded", init);
