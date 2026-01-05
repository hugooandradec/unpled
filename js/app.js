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

// =========================
// ESTADO DO JOGO (TEMP)
// =========================
let currentPack = [];
let handIndex = 0;

function init() {
  bootUI();

  updateCoins(state.coins);
  setOnlineStatus();

  // gera um pack inicial só pra alimentar a mão
  currentPack = openPack();
  handIndex = 0;

  window.dispatchEvent(
    new CustomEvent("unpled:new-pack", { detail: { cards: currentPack } })
  );

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

// =========================
// VIRAR PRÓXIMA CARTA
// =========================
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#btnFlipCard");
  if (!btn) return;

  if (handIndex >= 5) return;

  const card = currentPack[handIndex];
  if (!card) return;

  window.dispatchEvent(
    new CustomEvent("unpled:flip-card", {
      detail: { card, index: handIndex }
    })
  );

  handIndex++;
});

document.addEventListener("DOMContentLoaded", init);
