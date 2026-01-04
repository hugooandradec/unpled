const SUITS = ["espadas", "ouro", "paus", "copas"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const collectionView = document.getElementById("view-collection");

window.addEventListener("open-collection", renderSuitMenu);

function renderSuitMenu() {
  collectionView.innerHTML = `
    <h1 class="collection-title">Coleção</h1>
    <div class="suits-grid">
      ${SUITS.map(s => `<button class="suit-btn" data-suit="${s}">${s}</button>`).join("")}
    </div>
  `;

  document.querySelectorAll(".suit-btn").forEach(btn => {
    btn.onclick = () => renderAlbum(btn.dataset.suit);
  });
}

function renderAlbum(suit) {
  let html = `
    <h1 class="collection-title">${suit}</h1>
    <div class="album-grid">
  `;

  RANKS.forEach(rank => {
    const src = `assets/cards/base/${suit}/${rank}_${suit}.png`;

    html += `
      <div class="card">
        <img src="assets/cards/_frame/base.png">
        <img src="${src}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'">
        <div class="card-fallback" style="display:none">${rank}</div>
      </div>
    `;
  });

  html += `
    </div>
    <button class="back-btn">← Voltar</button>
  `;

  collectionView.innerHTML = html;
  document.querySelector(".back-btn").onclick = renderSuitMenu;
}
