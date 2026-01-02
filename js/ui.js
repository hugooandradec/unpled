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
// TABS
// =========================
export function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));

      tab.classList.add("active");
      const view = document.getElementById(`view-${tab.dataset.view}`);
      if (view) view.classList.add("active");
    };
  });
}

// =========================
// RENDER VIEWS (HTML BASE)
// =========================
export function renderPlayView() {
  const root = document.getElementById("view-play");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <h2>Partida</h2>
      <p class="muted">Abra packs e monte sua coleção</p>

      <div class="divider"></div>

      <button class="btn primary" id="btnOpenPack">
        Abrir Pack
      </button>

      <div class="spacer"></div>

      <div id="playLog" class="muted small"></div>
    </div>
  `;
}

export function renderPacksView() {
  const root = document.getElementById("view-packs");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <h2>Packs</h2>
      <p class="muted">Cada pack contém 3 cartas aleatórias</p>

      <div class="divider"></div>

      <button class="btn primary" id="btnBuyPack">
        Comprar Pack
      </button>

      <div class="spacer"></div>

      <div id="packResult" class="packReveal"></div>
    </div>
  `;
}

export function renderCollectionView() {
  const root = document.getElementById("view-collection");
  if (!root) return;

  root.innerHTML = `
    <div class="card panel">
      <h2>Coleção</h2>
      <p class="muted">Suas cartas desbloqueadas</p>

      <div class="divider"></div>

      <div id="collectionGrid" class="collection"></div>
    </div>
  `;
}
