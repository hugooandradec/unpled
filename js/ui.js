// js/ui.js (ES Module)

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

// Só as cartas que você quer (já “existem” no seu universo):
// A♠, 2♠, 3♠, 4♠.
// Mão tem 5: então repete uma (random) pra completar.
function buildHand5() {
  const base = [
    { rank: "A", suit: "spades", suitSymbol: "♠" },
    { rank: "2", suit: "spades", suitSymbol: "♠" },
    { rank: "3", suit: "spades", suitSymbol: "♠" },
    { rank: "4", suit: "spades", suitSymbol: "♠" }
  ];

  // duplica uma aleatória pra dar 5
  const extra = base[Math.floor(Math.random() * base.length)];
  const hand = shuffle([...base, { ...extra }]);

  return hand;
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

  const main = document.querySelector(".screen");
  if (main) main.scrollTo({ top: 0, behavior: "auto" });
}

// =========================
// GLOBAL STYLES (uma vez)
// =========================
function ensureUIStyles() {
  if (document.getElementById("unpled-ui-styles")) return;

  const style = document.createElement("style");
  style.id = "unpled-ui-styles";
  style.textContent = `
    /* HOME */
    #view-home{
      width:min(980px,92vw);
      margin:0 auto;
      padding:90px 0 36px;
      text-align:center;
    }
    .home-title{
      margin:0 0 34px;
      font-weight:900;
      letter-spacing:.28em;
      text-transform:uppercase;
      font-size:46px;
      opacity:.96;
    }
    .home-menu{
      display:flex;
      flex-direction:column;
      gap:16px;
      align-items:center;
    }
    .menu-item{
      width:min(520px, 92vw);
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
      box-shadow:0 16px 36px rgba(0,0,0,.35);
    }

    /* PLAY - mesa verde cassino */
    .play-wrap{
      width:min(980px,92vw);
      margin:0 auto;
      padding:64px 0 40px;
      text-align:center;
    }
    .play-title{
      margin:0 0 18px;
      font-weight:900;
      letter-spacing:.22em;
      text-transform:uppercase;
      font-size:28px;
      opacity:.95;
    }

    .table{
      width:100%;
      max-width:900px;
      margin:0 auto;
      border-radius:22px;
      padding:24px 18px 20px;
      position:relative;
      overflow:hidden;

      /* feltro verde + vinheta */
      background:
        radial-gradient(circle at 30% 20%, rgba(255,255,255,.10), transparent 45%),
        radial-gradient(circle at 80% 70%, rgba(0,0,0,.35), transparent 55%),
        linear-gradient(180deg, #0f6b2f, #0b4f23);
      border:1px solid rgba(255,255,255,.14);
      box-shadow:0 30px 70px rgba(0,0,0,.55);
    }

    /* "borda" de mesa */
    .table::before{
      content:"";
      position:absolute;
      inset:10px;
      border-radius:16px;
      border:1px solid rgba(255,255,255,.10);
      pointer-events:none;
    }

    .hand-row{
      display:flex;
      justify-content:center;
      gap:14px;
      flex-wrap:wrap;
      padding:10px 8px 0;
    }

    /* Carta (flip) */
    .card{
      width:110px;
      height:156px;
      perspective:900px;
      user-select:none;
    }
    @media (max-width: 520px){
      .card{ width:92px; height:132px; }
    }

    .card-inner{
      width:100%;
      height:100%;
      position:relative;
      transform-style:preserve-3d;
      transition:transform .55s cubic-bezier(.2,.9,.2,1);
    }
    .card.is-flipped .card-inner{
      transform:rotateY(180deg);
    }

    .card-face{
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

    /* Verso (fundo da carta) */
    .card-back{
      background:
        radial-gradient(circle at 30% 20%, rgba(255,255,255,.12), transparent 40%),
        linear-gradient(135deg, rgba(120,60,220,.85), rgba(30,20,60,.85));
    }
    .card-back::after{
      content:"UNPLED";
      font-weight:900;
      letter-spacing:.22em;
      opacity:.35;
      font-size:14px;
      text-transform:uppercase;
    }

    /* Frente */
    .card-front{
      background:
        radial-gradient(circle at 20% 10%, rgba(0,0,0,.06), transparent 50%),
        linear-gradient(180deg, rgba(255,255,255,.92), rgba(245,245,245,.88));
      transform:rotateY(180deg);
      color:#121212;
    }

    .card-front .rank{
      position:absolute;
      top:10px;
      left:10px;
      font-weight:900;
      font-size:18px;
    }
    .card-front .suit{
      position:absolute;
      top:32px;
      left:11px;
      font-size:16px;
      opacity:.9;
    }
    .card-front .center{
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:6px;
    }
    .card-front .big{
      font-weight:900;
      font-size:34px;
      line-height:1;
    }
    .card-front .bigSuit{
      font-size:26px;
      line-height:1;
      opacity:.95;
    }

    /* Preto para espadas */
    .spades{ color:#111; }

    /* Controles */
    .controls{
      display:flex;
      justify-content:center;
      gap:10px;
      flex-wrap:wrap;
      margin-top:16px;
    }

    .btn{
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
    .btn:disabled{
      opacity:.45;
      cursor:not-allowed;
    }

    .hint{
      margin-top:12px;
      font-size:13px;
      opacity:.85;
    }
  `;
  document.head.appendChild(style);
}

// =========================
// HOME
// =========================
export function renderHomeView() {
  ensureUIStyles();
  const root = document.getElementById("view-home");
  if (!root || root.dataset.ready === "1") return;

  root.innerHTML = `
    <h1 class="home-title">UNPLED</h1>
    <div class="home-menu">
      <button class="menu-item" id="goPlay">Jogar</button>
      <button class="menu-item" id="goCollection">Coleção</button>
      <button class="menu-item" id="goSettings">Configurações</button>
    </div>
  `;

  root.querySelector("#goPlay")?.addEventListener("click", () => showView("view-play"));
  root.querySelector("#goCollection")?.addEventListener("click", () => showView("view-collection"));
  root.querySelector("#goSettings")?.addEventListener("click", () => showView("view-settings"));

  root.dataset.ready = "1";
}

// =========================
// PLAY - mesa + mão 5 cartas
// =========================
export function renderPlayView() {
  ensureUIStyles();

  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div class="play-wrap">
      <h1 class="play-title">JOGAR</h1>

      <div class="table">
        <div class="hand-row" id="handRow"></div>

        <div class="controls">
          <button class="btn" id="btnFlip">Virar carta</button>
          <button class="btn" id="btnNewHand">Nova mão</button>
        </div>

        <div class="hint" id="hintText">Clique em “Virar carta” pra revelar uma por vez.</div>
      </div>
    </div>
  `;

  const handRow = root.querySelector("#handRow");
  const btnFlip = root.querySelector("#btnFlip");
  const btnNewHand = root.querySelector("#btnNewHand");
  const hintText = root.querySelector("#hintText");

  // Estado local da tela
  let hand = buildHand5();     // 5 cartas (A-4♠ + 1 repetida)
  let flipIndex = 0;

  function renderHandBacks() {
    handRow.innerHTML = hand.map((_, i) => `
      <div class="card" data-i="${i}">
        <div class="card-inner">
          <div class="card-face card-back"></div>
          <div class="card-face card-front">
            <div class="rank"></div>
            <div class="suit"></div>
            <div class="center">
              <div class="big"></div>
              <div class="bigSuit"></div>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  function revealCard(i) {
    const card = hand[i];
    const el = handRow.querySelector(`.card[data-i="${i}"]`);
    if (!card || !el) return;

    const front = el.querySelector(".card-front");
    const rank = front.querySelector(".rank");
    const suit = front.querySelector(".suit");
    const big = front.querySelector(".big");
    const bigSuit = front.querySelector(".bigSuit");

    // espadas: preto
    front.classList.add("spades");
    rank.textContent = card.rank;
    suit.textContent = card.suitSymbol;
    big.textContent = card.rank;
    bigSuit.textContent = card.suitSymbol;

    // flip
    el.classList.add("is-flipped");
  }

  function updateControls() {
    const done = flipIndex >= hand.length;
    btnFlip.disabled = done;
    hintText.textContent = done
      ? "Mão completa. Clique em “Nova mão”."
      : "Clique em “Virar carta” pra revelar uma por vez.";
  }

  // inicial
  renderHandBacks();
  updateControls();

  btnFlip.addEventListener("click", () => {
    if (flipIndex >= hand.length) return;

    revealCard(flipIndex);
    flipIndex++;

    updateControls();
  });

  btnNewHand.addEventListener("click", () => {
    hand = buildHand5();
    flipIndex = 0;
    renderHandBacks();
    updateControls();
  });
}

// =========================
// PLACEHOLDERS (pra não quebrar navegação)
// =========================
export function renderSettingsView() {
  const root = document.getElementById("view-settings");
  if (!root) return;
  root.innerHTML = `<div style="padding:90px; text-align:center; opacity:.85;">Em breve…</div>`;
}

export function renderCollectionView() {
  const root = document.getElementById("view-collection");
  if (!root) return;
  root.innerHTML = `<div style="padding:90px; text-align:center; opacity:.85;">Coleção (por enquanto) 😄</div>`;
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
