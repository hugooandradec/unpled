// js/app.js
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
let state = loadState() || {};
if (typeof state.coins !== "number") state.coins = 0;

// =========================
// HELPERS
// =========================
function normalizeViewId(view) {
  // aceita "home" e "view-home"
  if (!view) return "view-home";
  if (view.startsWith("view-")) return view;
  return `view-${view}`;
}

function go(view) {
  showView(normalizeViewId(view));
}

// =========================
// INIT
// =========================
function init() {
  // 1) Renderiza o HTML base das views
  renderHomeView();
  renderPlayView();
  renderCollectionView();
  renderSettingsView();

  // 2) Navegação e ações
  bindNavigation();

  // 3) HUD / Status
  updateCoins(state.coins);
  setOnlineStatus();

  // 4) Começa sempre na HOME (não deixa preso em coleção no refresh)
  go("home");

  // 5) Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(() => {}); // não trava se falhar
  }

  // 6) Eventos de conexão
  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}

// =========================
// NAVIGATION (delegation)
// =========================
function bindNavigation() {
  // Event delegation: funciona mesmo se os botões forem renderizados depois
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, a");
    if (!btn) return;

    // Você pode usar data-action nos botões:
    // data-action="go:collection" | "go:home" | "open-pack"
    const action = btn.getAttribute("data-action");
    if (action) {
      e.preventDefault();

      if (action.startsWith("go:")) {
        const dest = action.split(":")[1];
        go(dest);
        return;
      }

      if (action === "open-pack") {
        handleOpenPack();
        return;
      }
    }

    // Compat: se você já tem IDs antigos, ainda funciona
    switch (btn.id) {
      case "btnGoPlay":
        go("play");
        break;

      case "btnGoCollection":
        go("collection");
        // opcional: evento pra coleção montar/re-render
        window.dispatchEvent(new CustomEvent("unpled:open-collection"));
        break;

      case "btnGoSettings":
        go("settings");
        break;

      case "btnBackFromPlay":
      case "btnBackFromCollection":
      case "btnBackFromSettings":
        go("home");
        break;

      case "btnOpenPack":
        handleOpenPack();
        break;

      default:
        break;
    }
  });
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

  const text = (cards || [])
    .map((c) => `${c.rank ?? ""}${c.suitSymbol ?? ""}`)
    .join(" • ");

  log.textContent = `Pack aberto: ${text || "(vazio)"}`;
}

document.addEventListener("DOMContentLoaded", init);
