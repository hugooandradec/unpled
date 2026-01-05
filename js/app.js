// js/app.js
import { loadState, saveState } from "./storage.js";
import { openPack } from "./gacha.js";
import {
  bootUI,
  setOnlineStatus,
  updateCoins
} from "./ui.js";

let state = loadState() || {};
if (typeof state.coins !== "number") state.coins = 0;

function init() {
  // 🔥 UM ÚNICO PONTO DE BOOT DA UI
  bootUI();

  updateCoins(state.coins);
  setOnlineStatus();

  // service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

// abrir pack
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
