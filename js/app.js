// js/app.js
import { loadState } from "./storage.js";
import { bootUI, setOnlineStatus, updateCoins } from "./ui.js";

let state = loadState() || {};
if (typeof state.coins !== "number") state.coins = 0;

function init() {
  bootUI();

  updateCoins(state.coins);
  setOnlineStatus();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}

document.addEventListener("DOMContentLoaded", init);
