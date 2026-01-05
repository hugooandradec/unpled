// js/ui.js (ES Module)

// =========================
// HELPERS
// =========================
function normalizeViewId(view) {
  if (!view) return "view-home";
  if (view.startsWith("view-")) return view;
  return `view-${view}`;
}

function getCardLabel(card) {
  return `${card.rank}${card.suitSymbol}`;
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
// BACK + CSS
// =========================
function ensureStyles() {
  if (document.getElementById("handStyles")) return;

  const style = document.createElement("style");
  style.id = "handStyles";
  style.textContent = `
    .play-wrap{
      width:min(980px,92vw);
      margin:0 auto;
      padding:90px 0 36px;
      text-align:center;
    }

    .play-title{
      margin-bottom:24px;
      font-weight:900;
      letter-spacing:.22em;
      font-size:28px;
      opacity:.95;
    }

    .hand{
      display:flex;
      justify-content:center;
      gap:14px;
      margin-bottom:18px;
    }

    .card-slot{
      width:84px;
      height:120px;
      border-radius:14px;
      background:rgba(20,22,26,.55);
      border:1px solid rgba(255,255,255,.14);
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      font-weight:900;
      box-shadow:0 14px 30px rgba(0,0,0,.4);
      backdrop-filter:blur(10px);
      transition:transform .25s ease, opacity .25s ease;
    }

    .card-slot.empty{
      opacity:.25;
    }

    .card-rank{
      font-size:28px;
      line-height:1;
    }

    .card-suit{
      font-size:20px;
      opacity:.9;
      margin-top:4px;
    }

    .hand-info{
      margin:10px 0 18px;
      font-size:14px;
      opacity:.85;
    }
  `;
  document.head.appendChild(style);
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
// HOME (SIMPLIFICADO)
// =========================
export function renderHomeView() {
  const root = document.getElementById("view-home");
  if (!root || root.dataset.ready) return;

  root.innerHTML = `
    <h1 class="home-title">UNPLED</h1>
    <div class="home-menu">
      <button class="menu-item" id="goPlay">Jogar</button>
    </div>
  `;

  root.querySelector("#goPlay").onclick = () => showView("view-play");
  root.dataset.ready = "1";
}

// =========================
// JOGAR – UI DA MÃO
// =========================
export function renderPlayView() {
  ensureStyles();

  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div class="play-wrap">
      <h1 class="play-title">JOGAR</h1>

      <div class="hand" id="handSlots">
        ${Array.from({ length: 5 }).map(() =>
          `<div class="card-slot empty"></div>`
        ).join("")}
      </div>

      <div class="hand-info">
        <div id="lastCard">Nenhuma carta ainda</div>
      </div>

      <button id="btnFlipCard" class="pill-btn">
        Virar próxima carta
      </button>
    </div>
  `;

  const slots = root.querySelectorAll(".card-slot");

  // ouvir evento de virar carta
  window.addEventListener("unpled:flip-card", (e) => {
    const { card, index } = e.detail;
    const slot = slots[index];
    if (!slot) return;

    slot.classList.remove("empty");
    slot.innerHTML = `
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${card.suitSymbol}</div>
    `;

    document.getElementById("lastCard").textContent =
      `Última carta: ${getCardLabel(card)}`;
  });
}

// =========================
// BOOT
// =========================
export function bootUI() {
  renderHomeView();
  renderPlayView();
  showView("view-home");
}
