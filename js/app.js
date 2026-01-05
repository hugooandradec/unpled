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
  // Inicializa UI inteira
  bootUI();

  updateCoins(state.coins);
  setOnlineStatus();

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

// =========================
// GACHA – ABRIR PACK
// =========================
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#btnOpenPack");
  if (!btn) return;

  const PACK_COST = 10;

  if (state.coins < PACK_COST) {
    alert(`Sem moedas 😭 Precisa de ${PACK_COST}.`);
    return;
  }

  // paga o pack
  state.coins -= PACK_COST;
  saveState(state);
  updateCoins(state.coins);

  // gera cartas
  const cards = openPack();

  // salva pack pendente
  localStorage.setItem("unpled:pendingPack", JSON.stringify(cards));

  // avisa UI
  window.dispatchEvent(
    new CustomEvent("unpled:pack-opened", { detail: { cards } })
  );
});

document.addEventListener("DOMContentLoaded", init);
