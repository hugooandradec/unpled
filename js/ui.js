// js/ui.js (ES Module)

const ENABLE_RESTORE_LAST_VIEW = false;
const STORAGE_LAST_VIEW = "unpled:lastView";

function saveLastView(viewId) {
  try { localStorage.setItem(STORAGE_LAST_VIEW, viewId); } catch {}
}
function getLastView() {
  try { return localStorage.getItem(STORAGE_LAST_VIEW); } catch { return null; }
}

function normalizeViewId(view) {
  if (!view) return "view-home";
  if (view.startsWith("view-")) return view;
  return `view-${view}`;
}

// ===== Online status =====
export function setOnlineStatus() {
  const dot = document.getElementById("onlineDot");
  const label = document.getElementById("onlineLabel");
  if (!dot || !label) return;

  const online = navigator.onLine;
  dot.classList.toggle("online", online);
  dot.classList.toggle("offline", !online);
  label.textContent = online ? "Online" : "Offline";
}

// ===== Coins =====
export function updateCoins(coins) {
  const el = document.getElementById("coinsLabel");
  if (el) el.textContent = String(coins ?? 0);
}

// ===== Back overlay =====
function ensureBackOverlay() {
  if (document.getElementById("unpledBackOverlay")) return;

  const style = document.createElement("style");
  style.textContent = `
    #unpledBackOverlay{
      position: fixed;
      left: 14px;
      top: 74px;
      z-index: 999999;
      display: none;
      pointer-events: auto;
    }
    #unpledBackOverlay button{
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(15,18,30,0.55);
      color: rgba(255,255,255,0.92);
      padding: 12px 16px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      font-size: 12px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 0 18px 40px rgba(0,0,0,0.45);
    }

    /* ===== Home menu minimal (caso seu CSS não tenha) ===== */

    /* 🔽 desce o bloco da home */
    #view-home{
      width: min(980px, 92vw);
      margin: 0 auto;
      padding: 110px 0 36px;
    }

    /* 🔥 título maior */
    .home-title{
      margin: 0 0 34px;
      font-weight: 900;
      letter-spacing: .28em;
      text-transform: uppercase;
      font-size: 46px;
      text-align: center;
      opacity: .96;
    }

    .home-menu{
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 6px;
    }

    /* 🔽 botões um pouco menores */
    .menu-item{
      width: 100%;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(20,22,26,0.45);
      color: rgba(255,255,255,0.92);
      cursor: pointer;
      text-decoration: none;
      outline: none;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 16px 36px rgba(0,0,0,0.35);
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      justify-content: center;
      font-size: 13px;
    }

    .menu-item.is-active{
      border-color: rgba(255,255,255,0.22);
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.id = "unpledBackOverlay";
  wrap.innerHTML = `<button type="button" id="unpledBackBtn">Voltar</button>`;
  document.body.appendChild(wrap);

  wrap.querySelector("#unpledBackBtn").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showView("view-home");
  });
}

function toggleBackOverlay(viewId) {
  const overlay = document.getElementById("unpledBackOverlay");
  if (!overlay) return;
  overlay.style.display = (viewId && viewId !== "view-home") ? "block" : "none";
}

// ===== Views =====
export function showView(view) {
  const viewId = normalizeViewId(view);

  const views = Array.from(document.querySelectorAll(".view"));
  views.forEach(v => v.classList.remove("active"));

  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  toggleBackOverlay(viewId);

  if (ENABLE_RESTORE_LAST_VIEW) saveLastView(viewId);

  const main = document.querySelector(".screen");
  if (main) main.scrollTo({ top: 0, behavior: "auto" });
}

// ===== Renderers =====
export function renderHomeView() {
  ensureBackOverlay();

  const root = document.getElementById("view-home");
  if (!root) return;

  // Se já renderizou uma vez, não recria tudo (evita duplicar listeners)
  if (root.dataset.ready === "1") return;

  root.innerHTML = `
    <h1 class="home-title">UNPLED</h1>

    <div class="home-menu" role="menu" aria-label="Menu principal">
      <button class="menu-item is-active" data-action="play" type="button" role="menuitem">Jogar</button>
      <button class="menu-item" data-action="collection" type="button" role="menuitem">Coleção</button>
      <button class="menu-item" data-action="settings" type="button" role="menuitem">Configurações</button>
    </div>
  `;

  root.dataset.ready = "1";
}

export function renderPlayView() {
  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div style="width:min(980px,92vw); margin:24px auto 0; text-align:center;">
      <h1 style="margin:0 0 18px; font-weight:900; letter-spacing:.22em; text-transform:uppercase; font-size:26px;">JOGAR</h1>
      <button id="btnOpenPack" class="pill-btn" type="button">Abrir Pack</button>
      <div id="playLog" style="margin-top:18px; font-size:14px; opacity:.85;"></div>
    </div>
  `;
}

export function renderSettingsView() {
  const root = document.getElementById("view-settings");
  if (!root) return;

  root.innerHTML = `
    <div style="width:min(980px,92vw); margin:24px auto 0; text-align:center;">
      <h1 style="margin:0 0 18px; font-weight:900; letter-spacing:.22em; text-transform:uppercase; font-size:26px;">CONFIGURAÇÕES</h1>
      <p style="opacity:.8;">Em breve…</p>
    </div>
  `;
}

// Coleção vem do collection.js
import { renderCollectionView as renderCollectionModule } from "./collection.js";
export function renderCollectionView() {
  renderCollectionModule();
}

// ===== Menu Home (click + teclado) =====
function initHomeMenu() {
  const items = Array.from(document.querySelectorAll("#view-home .menu-item"));
  if (!items.length) return;

  let activeIndex = Math.max(0, items.findIndex(el => el.classList.contains("is-active")));

  function setActive(idx) {
    items.forEach((el, i) => el.classList.toggle("is-active", i === idx));
  }
  setActive(activeIndex);

  items.forEach((el, idx) => {
    el.addEventListener("mouseenter", () => { activeIndex = idx; setActive(activeIndex); });
    el.addEventListener("focus", () => { activeIndex = idx; setActive(activeIndex); });

    el.addEventListener("click", (e) => {
      const action = el.getAttribute("data-action");
      if (!action) return;
      e.preventDefault();

      if (action === "play") showView("view-play");
      if (action === "collection") {
        showView("view-collection");
        window.dispatchEvent(new CustomEvent("unpled:open-collection"));
      }
      if (action === "settings") showView("view-settings");
    });
  });

  window.addEventListener("keydown", (e) => {
    const homeActive = document.getElementById("view-home")?.classList.contains("active");
    if (!homeActive) return;

    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      setActive(activeIndex);
      items[activeIndex].focus?.();
    }

    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      setActive(activeIndex);
      items[activeIndex].focus?.();
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      items[activeIndex].click();
    }
  });
}

export function bootUI() {
  ensureBackOverlay();
  setOnlineStatus();

  // ✅ agora a Home realmente existe
  renderHomeView();
  initHomeMenu();

  // sempre HOME no boot (pra não “travar” em coleção)
  showView("view-home");

  if (ENABLE_RESTORE_LAST_VIEW) {
    const last = getLastView();
    if (last && document.getElementById(last)) showView(last);
  }

  window.addEventListener("online", setOnlineStatus);
  window.addEventListener("offline", setOnlineStatus);
}
