// js/collection.js (ES Module)

const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

let state = { type: "Base", suit: "Todos" };

function qs(sel) { return document.querySelector(sel); }

// ✅ Igual ao ui.js: resolve caminho usando baseURI (funciona no /unpled/)
function assetUrl(pathFromRoot) {
  return new URL(pathFromRoot, document.baseURI).toString();
}

const CARDS = [
  {
    id: "sp-a",
    nome: "Ás de Espadas",
    tipo: "Base",
    naipe: "Espadas",
    valor: "A",
    img: assetUrl("assets/cards/base/espadas/A_espadas.png")
  },
  {
    id: "sp-2",
    nome: "2 de Espadas",
    tipo: "Base",
    naipe: "Espadas",
    valor: "2",
    img: assetUrl("assets/cards/base/espadas/2_espadas.png")
  },
  {
    id: "sp-3",
    nome: "3 de Espadas",
    tipo: "Base",
    naipe: "Espadas",
    valor: "3",
    img: assetUrl("assets/cards/base/espadas/3_espadas.png")
  },
  {
    id: "sp-4",
    nome: "4 de Espadas",
    tipo: "Base",
    naipe: "Espadas",
    valor: "4",
    img: assetUrl("assets/cards/base/espadas/4_espadas.png")
  }
];

function filterCards() {
  return CARDS.filter(c => {
    if (c.tipo !== state.type) return false;
    if (state.suit === "Todos") return true;
    return (c.naipe || "") === state.suit;
  });
}

function openCardModal(card) {
  let modal = qs("#cardModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "cardModal";
    modal.innerHTML = `
      <div class="card-modal-backdrop"></div>
      <div class="card-modal-box">
        <button class="card-modal-close" type="button">Fechar</button>
        <img class="card-modal-img" alt="" />
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".card-modal-backdrop").addEventListener("click", closeCardModal);
    modal.querySelector(".card-modal-close").addEventListener("click", closeCardModal);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCardModal();
    });
  }

  const img = modal.querySelector(".card-modal-img");
  img.src = card.img;
  img.alt = card.nome;

  modal.classList.add("open");
}

function closeCardModal() {
  const modal = qs("#cardModal");
  if (modal) modal.classList.remove("open");
}

function render() {
  const root = qs("#view-collection");
  if (!root) return;

  root.innerHTML = `
    <div class="collection-wrap">
      <h1 class="collection-title">COLEÇÃO</h1>

      <div class="collection-types" id="collectionTypes"></div>

      <div class="collection-sub" id="collectionSub"></div>

      <div class="suit-filter" id="suitFilter"></div>

      <div class="cards-grid" id="cardsGrid"></div>

      <div class="empty-text" id="emptyText" style="display:none;"></div>
    </div>
  `;

  // tipos
  const typesEl = qs("#collectionTypes");
  TYPES.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pill-btn" + (t === state.type ? " active" : "");
    b.textContent = t.toUpperCase();
    b.addEventListener("click", () => {
      state.type = t;
      state.suit = "Todos";
      render();
    });
    typesEl.appendChild(b);
  });

  // suits
  const suitEl = qs("#suitFilter");
  SUITS.forEach(s => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pill-btn" + (s === state.suit ? " active" : "");
    b.textContent = s.toUpperCase();
    b.addEventListener("click", () => {
      state.suit = s;
      render();
    });
    suitEl.appendChild(b);
  });

  // cards
  const list = filterCards();
  qs("#collectionSub").textContent = `${state.type} — ${list.length} carta(s)`;

  const grid = qs("#cardsGrid");
  const empty = qs("#emptyText");

  if (!list.length) {
    empty.style.display = "block";
    empty.textContent = "Nenhuma carta encontrada nesse filtro.";
    return;
  }

  empty.style.display = "none";

  list.forEach(card => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-thumb rarity-base";
    btn.title = card.nome;

    btn.innerHTML = `
      <img class="card-thumb-img" src="${card.img}" alt="${card.nome}">
    `;

    btn.addEventListener("click", () => openCardModal(card));
    grid.appendChild(btn);
  });
}

// export chamado pelo ui.js
export function renderCollectionView() {
  render();
}

// quando a home manda o evento
window.addEventListener("unpled:open-collection", () => {
  render();
});
