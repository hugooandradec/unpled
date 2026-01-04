// js/collection.js
// Coleção: escolha tipo (Base/Rara/etc) -> mostra grid + filtro opcional de naipe

(function () {
  const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
  const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

  // Mock inicial (pra você ver funcionando já)
  // Depois você troca isso pra vir do seu “pool” real de cartas.
  const CARDS = [
    { id: "b-001", nome: "Sentinela", tipo: "Base", naipe: "Espadas", valor: "A" },
    { id: "b-002", nome: "Alquimista", tipo: "Base", naipe: "Ouro", valor: "7" },
    { id: "b-003", nome: "Corvo", tipo: "Base", naipe: "Paus", valor: "3" },
    { id: "b-004", nome: "Mercenária", tipo: "Base", naipe: "Copas", valor: "K" },
    { id: "b-005", nome: "Relíquia", tipo: "Base", naipe: null, valor: null }, // exemplo sem naipe/valor

    { id: "r-001", nome: "Vórtice", tipo: "Rara", naipe: null, valor: null },
    { id: "e-001", nome: "Acordo Sombrio", tipo: "Épica", naipe: "Espadas", valor: null },
    { id: "l-001", nome: "O Juramento", tipo: "Lendária", naipe: null, valor: null }
  ];

  let state = {
    selectedType: null,      // "Base" etc
    selectedSuit: "Todos"    // "Todos" / suit
  };

  function qs(sel) { return document.querySelector(sel); }
  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function mount() {
    const root = qs("#view-collection");
    if (!root) return;

    // Monta estrutura uma vez (se você já tiver no HTML, dá pra remover isso)
    if (!qs("#collectionTypes")) {
      root.innerHTML = `
        <div class="screen">
          <div class="collection-wrap">
            <h2 class="collection-title">Coleção</h2>

            <div class="collection-types" id="collectionTypes"></div>

            <p class="collection-sub" id="collectionSub">
              Escolha um tipo de coleção
            </p>

            <div class="suit-filter" id="suitFilter" style="display:none;"></div>

            <div class="cards-grid" id="cardsGrid" style="display:none;"></div>

            <div class="collection-back" id="collectionBack" style="display:none;">
              <button class="pill-btn" id="btnCollectionBack">Voltar</button>
            </div>
          </div>
        </div>
      `;
    }

    renderTypes();
    bindEvents();
  }

  function bindEvents() {
    const typesWrap = qs("#collectionTypes");
    const suitWrap = qs("#suitFilter");

    typesWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-type]");
      if (!btn) return;
      selectType(btn.dataset.type);
    });

    suitWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-suit]");
      if (!btn) return;
      selectSuit(btn.dataset.suit);
    });

    const backBtn = qs("#btnCollectionBack");
    backBtn.addEventListener("click", () => {
      // volta pra escolha de tipo
      state.selectedType = null;
      state.selectedSuit = "Todos";
      render();
    });
  }

  function renderTypes() {
    const wrap = qs("#collectionTypes");
    wrap.innerHTML = "";

    TYPES.forEach((t) => {
      const b = el("button", "pill-btn");
      b.textContent = t;
      b.dataset.type = t;
      wrap.appendChild(b);
    });
  }

  function selectType(type) {
    state.selectedType = type;
    state.selectedSuit = "Todos";
    render();
  }

  function selectSuit(suit) {
    state.selectedSuit = suit;
    renderCards();
    highlightSuit();
  }

  function render() {
    const sub = qs("#collectionSub");
    const suitWrap = qs("#suitFilter");
    const grid = qs("#cardsGrid");
    const back = qs("#collectionBack");

    // highlight tipos
    highlightType();

    if (!state.selectedType) {
      sub.textContent = "Escolha um tipo de coleção";
      suitWrap.style.display = "none";
      grid.style.display = "none";
      back.style.display = "none";
      return;
    }

    const cardsInType = CARDS.filter(c => c.tipo === state.selectedType);
    sub.textContent = `${state.selectedType} — ${cardsInType.length} carta(s)`;

    // Suit filter: aparece sempre, mas é opcional (padrão: Todos)
    suitWrap.style.display = "flex";
    grid.style.display = "grid";
    back.style.display = "block";

    renderSuits();
    renderCards();
    highlightSuit();
  }

  function highlightType() {
    document.querySelectorAll("#collectionTypes .pill-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.type === state.selectedType);
    });
  }

  function renderSuits() {
    const wrap = qs("#suitFilter");
    wrap.innerHTML = "";

    SUITS.forEach((s) => {
      const b = el("button", "pill-btn");
      b.textContent = s;
      b.dataset.suit = s;
      wrap.appendChild(b);
    });
  }

  function highlightSuit() {
    document.querySelectorAll("#suitFilter .pill-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.suit === state.selectedSuit);
    });
  }

  function renderCards() {
    const grid = qs("#cardsGrid");
    grid.innerHTML = "";

    const cards = CARDS
      .filter(c => c.tipo === state.selectedType)
      .filter(c => {
        if (state.selectedSuit === "Todos") return true;
        return c.naipe === state.selectedSuit;
      });

    if (cards.length === 0) {
      const empty = el("div");
      empty.style.gridColumn = "1 / -1";
      empty.style.opacity = "0.8";
      empty.style.padding = "20px 0";
      empty.textContent = "Nenhuma carta encontrada nesse filtro.";
      grid.appendChild(empty);
      return;
    }

    cards.forEach((c) => {
      const card = el("div", "card-mini");
      card.dataset.id = c.id;

      const art = el("div", "art");
      art.textContent = c.naipe ? (c.naipe[0].toUpperCase()) : "★";

      const info = el("div", "info");
      const name = el("p", "name");
      name.textContent = c.nome;

      const meta = el("div", "meta");
      meta.innerHTML = `
        <span>${c.naipe ?? "Sem naipe"}</span>
        <span>${c.valor ?? ""}</span>
      `;

      info.appendChild(name);
      info.appendChild(meta);

      card.appendChild(art);
      card.appendChild(info);

      grid.appendChild(card);
    });
  }

  // API pública (pra ui.js chamar)
  window.UnpledCollection = {
    init() { mount(); },
    open() {
      // se seu ui.js usa views, só ativa a view e deixa o resto renderizar
      mount();
      render();
    }
  };
})();
