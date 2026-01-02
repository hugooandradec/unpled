import { loadState, saveState } from "./storage.js";
import { openPack } from "./gacha.js";
import { setOnlineStatus, updateCoins, setupTabs } from "./ui.js";

let state = loadState();

function init() {
  setupTabs();
  updateCoins(state.coins);
  setOnlineStatus();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}

window.openPack = () => {
  const cards = openPack();
  state.coins += 10;
  saveState(state);
  updateCoins(state.coins);
  console.log("Pack aberto:", cards);
};

document.addEventListener("DOMContentLoaded", init);
