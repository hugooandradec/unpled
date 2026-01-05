// js/ui.js (ES Module)

function normalizeViewId(view) {
  if (!view) return "view-home";
  if (view.startsWith("view-")) return view;
  return `view-${view}`;
}

// =========================
// STATUS / COINS
// =========================
export function setOnlineStatus() {
  const dot = document.getElementById("onlineDot");
  const label = document.getElementById("onlineLabel");
  if (!dot || !label) return;

  const online = navigator.onLine;
  dot.classList.toggle("online", online);
  dot.classList.toggle("offline", !online);
  label.textContent = online ? "Online" : "Offline";
}

export function updateCoins(coins) {
  const el = document.getElementById("coinsLabel");
  if (el) el.textContent = String(coins ?? 0);
}

// =========================
// BACK OVERLAY + CSS
// =========================
function ensureBackOverlay() {
  if (document.getElementById("unpledBackOverlay")) return;

  const style = document.createElement("style");
  style.textContent = `
    #view-home{
      width:min(980px,92vw);
      margin:0 auto;
      padding:90px 0 36px;
    }

    .home-title{
      margin:0 0 34px;
      font-weight:900;
      letter-spacing:.28em;
      text-transform:uppercase;
      font-size:46px;
      text-align:center;
      opacity:.96;
    }

    .home-menu{
      display:flex;
      flex-direction:column;
      gap:16px;
    }

    .menu-item{
      padding:14px 16px;
      font-size:13px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.12);
      background:rgba(20,22,26,.45);
      color:#fff;
      font-weight:800;
      letter-spacing:.08em;
      text-transform:uppercase;
      cursor:pointer;
      backdrop-filter:blur(12px);
    }

    .menu-item.is-active{
      border-color:rgba(255,255,255,.3);
    }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.id = "unpledBackOverlay";
  wrap.innerHTML = `<button id="unpledBackBtn">Voltar</button>`;
  wrap.style.cssText = `
    position:fixed;left:14px;top:74px;display:none;z-index:9999;
  `;
  document.body.appendChild(wrap);

  wrap.querySelector("#unpledBackBtn").onclick = () => showView("view-home");
}

function toggleBackOverlay(viewId) {
  const ov = document.getElementById("unpledBackOverlay");
  if (!ov) return;
  ov.style.display = viewId !== "view-home" ? "block" : "none";
}

// =========================
// VIEWS
// =========================
export function showView(view) {
  const id = normalizeViewId(view);
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  toggleBackOverlay(id);
}

// =========================
// HOME
// =========================
export function renderHomeView() {
  ensureBackOverlay();
  const root = document.getElementById("view-home");
  if (!root || root.dataset.ready) return;

  root.innerHTML = `
    <h1 class="home-title">UNPLED</h1>
    <div class="home-menu">
      <button class="menu-item is-active" data-go="play">Jogar</button>
      <button class="menu-item" data-go="collection">Coleção</button>
      <button class="menu-item" data-go="settings">Configurações</button>
    </div>
  `;

  root.querySelectorAll(".menu-item").forEach(btn => {
    btn.onclick = () => {
      const go = btn.dataset.go;
      if (go === "play") showView("view-play");
      if (go === "collection") {
        showView("view-collection");
        window.dispatchEvent(new CustomEvent("unpled:open-collection"));
      }
      if (go === "settings") showView("view-settings");
    };
  });

  root.dataset.ready = "1";
}

// =========================
// JOGAR – GACHA
// =========================
function getPendingPack() {
  try {
    return JSON.parse(localStorage.getItem("unpled:pendingPack") || "null");
  } catch {
    return null;
  }
}

function getCollection() {
  try {
    return JSON.parse(localStorage.getItem("unpled:collection") || "[]");
  } catch {
    return [];
  }
}

function saveCollection(list) {
  localStorage.setItem("unpled:collection", JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("unpled:collection-updated"));
}

export function renderPlayView() {
  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div style="padding:90px 0;text-align:center">
      <h1>JOGAR</h1>
      <button id="btnOpenPack">Abrir Pack (10)</button>
      <button id="btnSavePack">Salvar na coleção</button>
      <div id="packResult"></div>
    </div>
  `;

  const renderPack = (cards) => {
    const el = document.getElementById("packResult");
    if (!cards) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = cards.map(c =>
      `<div>${c.rank}${c.suitSymbol} – ${c.name || ""}</div>`
    ).join("");
  };

  renderPack(getPendingPack());

  root.querySelector("#btnSavePack").onclick = () => {
    const pack = getPendingPack();
    if (!pack) return;
    saveCollection(getCollection().concat(pack));
    localStorage.removeItem("unpled:pendingPack");
    renderPack(null);
  };

  window.addEventListener("unpled:pack-opened", e => {
    renderPack(e.detail.cards);
  }, { once: true });
}

// =========================
// SETTINGS (placeholder)
// =========================
export function renderSettingsView() {
  const root = document.getElementById("view-settings");
  if (!root) return;
  root.innerHTML = `<div style="padding:90px;text-align:center">Em breve…</div>`;
}

// =========================
// COLEÇÃO (delegada)
// =========================
import { renderCollectionView as renderCollectionModule } from "./collection.js";
export function renderCollectionView() {
  renderCollectionModule();
}

// =========================
// BOOT
// =========================
export function bootUI() {
  ensureBackOverlay();
  setOnlineStatus();

  renderHomeView();
  renderPlayView();
  renderCollectionView();
  renderSettingsView();

  showView("view-home");

  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}
