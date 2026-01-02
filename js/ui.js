// =========================
// STATUS / HUD
// =========================
export function setOnlineStatus() {
  const dot = document.getElementById("onlineDot");
  const label = document.getElementById("onlineLabel");

  if (!dot || !label) return;

  const online = navigator.onLine;
  dot.style.background = online ? "#2ecc71" : "#e74c3c";
  label.textContent = online ? "Online" : "Offline";
}

export function updateCoins(value) {
  const el = document.getElementById("coinsLabel");
  if (el) el.textContent = value;
}

// =========================
// NAVEGAÇÃO ENTRE VIEWS
// =========================
export function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add("active");
}

// =========================
// HOME (MENU INICIAL)
// =========================
export function renderHomeView() {
  const root = document.getElementById("view-home");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <div style="text-align:center; padding: 6px 0 2px;">
        <h1 style="font-size:32px; margin:0 0 6px;">UNPLED</h1>
        <p class="muted" style="margin:0;">Um jogo de cartas em construção</p>
      </div>

      <div class="spacer"></div>

      <button class="btn primary" id="btnGoPlay">Jogar</button>

      <div class="spacer"></div>

      <button class="btn" id="btnGoCollection">Coleção</button>

      <div class="spacer"></div>

      <button class="btn" id="btnGoSettings">Configurações</button>
    </div>
  `;
}

// =========================
// PLAY
// =========================
export function renderPlayView() {
  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <div class="row between">
        <h2>Partida</h2>
        <button class="btn ghost" id="btnBackFromPlay" style="width:auto; padding:10px 12px;">
          Voltar
        </button>
      </div>

      <p class="muted">Abra packs e monte sua coleção</p>

      <div class="divider"></div>

      <button class="btn primary" id="btnOpenPack">Abrir Pack</button>

      <div class="spacer"></div>

      <div id="playLog" class="muted small"></div>
    </div>
  `;
}

// =========================
// COLEÇÃO
// =========================
export function renderCollectionView() {
  const root = document.getElementById("view-collection");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <div class="row between">
        <h2>Coleção</h2>
        <button class="btn ghost" id="btnBackFromCollection" style="width:auto; padding:10px 12px;">
          Voltar
        </button>
      </div>

      <p class="muted">Suas cartas desbloqueadas</p>

      <div class="divider"></div>

      <div id="collectionGrid" class="collection"></div>
    </div>
  `;
}

// =========================
// SETTINGS
// =========================
export function renderSettingsView() {
  const root = document.getElementById("view-settings");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <div class="row between">
        <h2>Configurações</h2>
        <button class="btn ghost" id="btnBackFromSettings" style="width:auto; padding:10px 12px;">
          Voltar
        </button>
      </div>

      <p class="muted">Em breve 😌</p>
    </div>
  `;
}