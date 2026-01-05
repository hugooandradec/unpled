// js/ui.js (ES Module)
import { renderCollectionView as renderCollectionModule } from "./collection.js";

// =========================
// HELPERS
// =========================
function normalizeViewId(view) {
  if (!view) return "view-home";
  if (view.startsWith("view-")) return view;
  return `view-${view}`;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =========================
// ASSET URLS (à prova de subpasta)
// =========================
// ui.js está em /js/ui.js → assets está em /assets/...
const ASSETS_BASE = new URL("../assets/", import.meta.url);

function assetUrl(relPathFromAssets) {
  // retorna string absoluta/segura
  return new URL(relPathFromAssets, ASSETS_BASE).toString();
}

const PATH_FRAME = assetUrl("cards/_frame/base_border.png");
const pathEspadas = (rank) => assetUrl(`cards/base/espadas/${rank}_espadas.png`);

// Só A,2,3,4 de espadas. Mão tem 5 → repete 1 aleatória.
function buildHand5() {
  const base = [
    { rank: "A", img: pathEspadas("A") },
    { rank: "2", img: pathEspadas("2") },
    { rank: "3", img: pathEspadas("3") },
    { rank: "4", img: pathEspadas("4") }
  ];
  const extra = base[Math.floor(Math.random() * base.length)];
  return shuffle([...base, { ...extra }]);
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
// VIEWS
// =========================
export function showView(view) {
  const id = normalizeViewId(view);
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

// =========================
// STYLES (uma vez)
// =========================
function ensureUIStyles() {
  if (document.getElementById("unpled-ui-styles")) return;

  const style = document.createElement("style");
  style.id = "unpled-ui-styles";
  style.textContent = `
    .u-play-wrap{
      width:min(980px,92vw);
      margin:0 auto;
      padding:64px 0 40px;
      text-align:center;
    }
    .u-play-head{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:14px;
      margin:0 0 18px;
      position:relative;
    }
    .u-back-btn{
      position:absolute;
      left:0;
      top:50%;
      transform:translateY(-50%);
      border:1px solid rgba(255,255,255,.18);
      background:rgba(15,18,30,.55);
      color:rgba(255,255,255,.92);
      padding:10px 14px;
      border-radius:999px;
      cursor:pointer;
      font-weight:900;
      letter-spacing:.06em;
      text-transform:uppercase;
      font-size:12px;
      backdrop-filter:blur(10px);
      box-shadow:0 18px 40px rgba(0,0,0,.35);
    }
    .u-play-title{
      margin:0;
      font-weight:900;
      letter-spacing:.22em;
      text-transform:uppercase;
      font-size:28px;
      opacity:.95;
    }

    .u-table{
      width:100%;
      max-width:900px;
      margin:0 auto;
      border-radius:22px;
      padding:22px 18px 18px;
      position:relative;
      overflow:hidden;

      background:
        radial-gradient(circle at 30% 20%, rgba(255,255,255,.10), transparent 45%),
        radial-gradient(circle at 80% 70%, rgba(0,0,0,.35), transparent 55%),
        linear-gradient(180deg, #0f6b2f, #0b4f23);

      border:1px solid rgba(255,255,255,.14);
      box-shadow:0 30px 70px rgba(0,0,0,.55);
    }
    .u-table::before{
      content:"";
      position:absolute;
      inset:10px;
      border-radius:16px;
      border:1px solid rgba(255,255,255,.10);
      pointer-events:none;
      z-index:1;
    }

    .u-hand-row{
      position:relative;
      z-index:2;
      display:flex;
      justify-content:center;
      align-items:center;
      gap:14px;
      flex-wrap:wrap;
      padding:10px 8px 0;
      min-height:180px;
    }

    .u-card{
      width:110px;
      height:156px;
      perspective:900px;
      user-select:none;
      flex:0 0 auto;
    }
    @media (max-width: 520px){
      .u-card{ width:92px; height:132px; }
      .u-back-btn{ left:6px; }
    }

    .u-card-inner{
      width:100%;
      height:100%;
      position:relative;
      transform-style:preserve-3d;
      transition:transform .55s cubic-bezier(.2,.9,.2,1);
    }
    .u-card.u-flipped .u-card-inner{
      transform:rotateY(180deg);
    }

    .u-face{
      position:absolute;
      inset:0;
      border-radius:14px;
      backface-visibility:hidden;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 18px 40px rgba(0,0,0,.45);
      border:1px solid rgba(255,255,255,.18);
    }

    .u-back{
      background:
        radial-gradient(circle at 30% 20%, rgba(255,255,255,.12), transparent 40%),
        linear-gradient(135deg, rgba(120,60,220,.85), rgba(30,20,60,.85));
    }
    .u-back::after{
      content:"UNPLED";
      font-weight:900;
      letter-spacing:.22em;
      opacity:.35;
      font-size:14px;
      text-transform:uppercase;
    }

    .u-front{
      transform:rotateY(180deg);
      background:rgba(255,255,255,.08);
      position:relative;
    }

    .u-art, .u-frame{
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      display:block;
    }
    .u-art{ object-fit:cover; }
    .u-frame{
      object-fit:contain;
      pointer-events:none;
      transform:scale(1.01);
    }

    .u-fallback{
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:900;
      font-size:28px;
      color:#111;
      background:rgba(255,255,255,.92);
      letter-spacing:.08em;
    }

    .u-controls{
      position:relative;
      z-index:2;
      display:flex;
      justify-content:center;
      gap:10px;
      flex-wrap:wrap;
      margin-top:14px;
    }

    .u-btn{
      border:1px solid rgba(255,255,255,.18);
      background:rgba(15,18,30,.55);
      color:rgba(255,255,255,.92);
      padding:12px 16px;
      border-radius:999px;
      cursor:pointer;
      font-weight:900;
      letter-spacing:.10em;
      text-transform:uppercase;
      font-size:12px;
      backdrop-filter:blur(10px);
      box-shadow:0 18px 40px rgba(0,0,0,.35);
    }
    .u-btn:disabled{ opacity:.45; cursor:not-allowed; }

    .u-hint{
      position:relative;
      z-index:2;
      margin-top:10px;
      font-size:13px;
      opacity:.85;
    }
  `;
  document.head.appendChild(style);
}

// =========================
// HOME (não mexo no teu se já tiver render)
// =========================
export function renderHomeView() {
  // se você já renderiza o home em outro arquivo, ignora
  const root = document.getElementById("view-home");
  if (!root) return;
  if (root.dataset.keep === "1") return;
  if (root.dataset.ready === "1") return;

  root.innerHTML = `
    <div style="width:min(980px,92vw);margin:0 auto;padding:90px 0 36px;text-align:center;">
      <h1 style="margin:0 0 34px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;font-size:46px;opacity:.96;">
        UNPLED
      </h1>
      <div style="display:flex;flex-direction:column;gap:16px;align-items:center;">
        <button class="menu-item" id="goPlay">Jogar</button>
        <button class="menu-item" id="goCollection">Coleção</button>
        <button class="menu-item" id="goSettings">Configurações</button>
      </div>
    </div>
  `;

  root.querySelector("#goPlay")?.addEventListener("click", () => showView("view-play"));
  root.querySelector("#goCollection")?.addEventListener("click", () => showView("view-collection"));
  root.querySelector("#goSettings")?.addEventListener("click", () => showView("view-settings"));

  root.dataset.ready = "1";
}

// =========================
// COLEÇÃO (teu módulo real)
// =========================
export function renderCollectionView() {
  renderCollectionModule();
}

// =========================
// SETTINGS (placeholder)
// =========================
export function renderSettingsView() {
  const root = document.getElementById("view-settings");
  if (!root) return;
  root.innerHTML = `<div style="padding:90px; text-align:center; opacity:.85;">Em breve…</div>`;
}

// =========================
// PLAY (mesa + auto flip)
// =========================
let autoTimer = null;

export function renderPlayView() {
  ensureUIStyles();

  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div class="u-play-wrap">
      <div class="u-play-head">
        <button class="u-back-btn" id="uBack">Voltar</button>
        <h1 class="u-play-title">JOGAR</h1>
      </div>

      <div class="u-table">
        <div class="u-hand-row" id="uHand"></div>

        <div class="u-controls">
          <button class="u-btn" id="uFlip">Virar carta</button>
          <button class="u-btn" id="uAuto">Auto: ON</button>
          <button class="u-btn" id="uNew">Nova mão</button>
        </div>

        <div class="u-hint" id="uHint">Virando automaticamente…</div>
      </div>
    </div>
  `;

  const handEl = root.querySelector("#uHand");
  const btnBack = root.querySelector("#uBack");
  const btnFlip = root.querySelector("#uFlip");
  const btnAuto = root.querySelector("#uAuto");
  const btnNew = root.querySelector("#uNew");
  const hint = root.querySelector("#uHint");

  let hand = buildHand5();
  let idx = 0;
  let autoOn = true;

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!autoOn) return;
      flipOne();
    }, 850);
  }

  function renderBacks() {
    handEl.innerHTML = hand.map((_, i) => `
      <div class="u-card" data-i="${i}">
        <div class="u-card-inner">
          <div class="u-face u-back"></div>
          <div class="u-face u-front">
            <img class="u-art" alt="" />
            <img class="u-frame" alt="frame" />
          </div>
        </div>
      </div>
    `).join("");

    // seta frame em todas (garante que carregou)
    handEl.querySelectorAll(".u-frame").forEach(img => {
      img.src = PATH_FRAME;
    });
  }

  function reveal(i) {
    const card = hand[i];
    const el = handEl.querySelector(`.u-card[data-i="${i}"]`);
    if (!card || !el) return;

    const art = el.querySelector(".u-art");
    const front = el.querySelector(".u-front");

    art.onload = () => {
      // ok
    };

    art.onerror = () => {
      // fallback visível se path der ruim
      const fb = document.createElement("div");
      fb.className = "u-fallback";
      fb.textContent = `${card.rank}♠`;
      front.appendChild(fb);
    };

    art.src = card.img;

    el.classList.add("u-flipped");
  }

  function updateUI() {
    const done = idx >= hand.length;
    btnFlip.disabled = done;

    if (done) {
      hint.textContent = "Mão completa. Clique em “Nova mão”.";
      stopAuto();
      return;
    }

    hint.textContent = autoOn
      ? "Virando automaticamente…"
      : "Auto OFF. Clique em “Virar carta”.";
  }

  function flipOne() {
    if (idx >= hand.length) return;
    reveal(idx);
    idx++;
    updateUI();
  }

  // init
  renderBacks();
  idx = 0;
  updateUI();
  startAuto();

  btnBack.addEventListener("click", () => {
    stopAuto();
    showView("view-home");
  });

  btnFlip.addEventListener("click", () => flipOne());

  btnAuto.addEventListener("click", () => {
    autoOn = !autoOn;
    btnAuto.textContent = autoOn ? "Auto: ON" : "Auto: OFF";
    if (autoOn) startAuto();
    else stopAuto();
    updateUI();
  });

  btnNew.addEventListener("click", () => {
    hand = buildHand5();
    idx = 0;
    renderBacks();

    autoOn = true;
    btnAuto.textContent = "Auto: ON";

    updateUI();
    startAuto();
  });
}

// =========================
// BOOT
// =========================
export function bootUI() {
  ensureUIStyles();

  renderHomeView();
  renderPlayView();
  renderCollectionView();
  renderSettingsView();

  showView("view-home");
}
