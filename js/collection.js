// js/collection.js
// Coleção: 1) escolhe tipo (Base/Rara/etc) 2) mostra grid + filtro opcional de naipe
// Naipe/valor são opcionais: se a carta não tiver naipe, aparece em "Todos" e some ao filtrar.

(function () {
  const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
  const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

  // Mock inicial (só pra você ver funcionando AGORA)
  // Depois a gente liga isso no seu pool real (cards.js + storage.js).
  const CARDS = [
    { id: "b-001", nome: "Sentinela", tipo: "Base", naipe: "Espadas", valor: "A", especial: null },
    { id: "b-002", nome: "Alquimista", tipo: "Base", naipe: "Ouro", valor: "7", especial: null },
    { id: "b-003", nome: "Corvo", tipo: "Base", naipe: "Paus", valor: "3", especial: null },
    { id: "b-004", nome: "Mercenária", tipo: "Base", naipe: "Copas", valor: "K", especial: null },
    { id: "b-005", nome: "Relíquia", tipo: "Base", naipe: null, valor: null, especial: "Artefato" },

    { id: "i-001", nome: "Bênção Menor", tipo: "Incomum", naipe: "Copas", valor: null, especial: null },

    { id: "r-001", nome: "Vórtice", tipo: "Rara", naipe: null, valor: null, especial: "Sem Naipe" },

    { id: "e-001", nome: "Acordo Sombrio", tipo: "Épica", naipe: "Espadas", valor: null, especial: "Especial" },

    { id: "l-001", nome: "O Juramento", tipo: "Lendária", naipe: null, valor: null, especial: "Lendária" }
  ];

  let state = {
    selectedType: null,     // "Base" etc
    selectedSuit: "Todos"   // "Todos" / suit
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

    // Monta estrutura 1 vez
    if (qs("#collectionTypes")) return;

    root.innerHTML = `
      <div class="collection-wrap">
        <div class="collection-top">
          <h2 class="collection-title">Coleção</h2>

          <button class="pill-btn small" id="btnCollectionExit" type="button">
            Voltar
          </button>
        </div>

        <div class="collection-types" id="collectionTypes"></div>

        <p class="collection-sub" id="collectionSub">Escolha um tipo de coleção</p>

        <div class="suit-filter" id="suitFilter" style="display:none;"></div>

        <div class="cards-grid" id="cardsGrid" style="display:none;"></div>

        <div class="collection-back" id="collectionBack" style="display:none;">
          <button class="pill-btn" id="btnCollectionBack" type="button">Voltar aos tipos</button>
        </div>
      </div>
    `;

    renderTypes();
    bindEvents();
    render(); // estado inicial
  }

  function bindEvents() {
    const typesWrap = qs("#collectionTypes");
    const suitWrap = qs("#suitFilter");
    const grid = qs("#cardsGrid");

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

    qs("#btnCollectionBack").addEventListener("click", () => {
      state.selectedType = null;
      state.selectedSuit = "Todos";
      render();
    });

    qs("#btnCollectionExit").addEventListener("click", () => {
      // Voltar para HOME
      window.UNPLED?.showView?.("view-home");
    });

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card-mini");
      if (!card) return;
      const id = card.dataset.id;
      // Por enquanto só loga. Depois vira modal.
      console.log("[UNPLED] clicou carta:", id);
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
      const b = el("button", "pill-btn small");
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
      const empty = el("div", "collection-empty");
      empty.textContent = "Nenhuma carta encontrada nesse filtro.";
      grid.appendChild(empty);
      return;
    }

    cards.forEach((c) => {
      const card = el("div", "card-mini");
      card.dataset.id = c.id;

      const art = el("div", "art");
      art.textContent = c.naipe ? c.naipe[0].toUpperCase() : "★";

      const info = el("div", "info");

      const name = el("p", "name");
      name.textContent = c.nome;

      const meta = el("div", "meta");
      const left = el("span");
      left.textContent = c.naipe ?? (c.especial ? c.especial : "Sem naipe");

      const right = el("span");
      right.textContent = c.valor ?? "";

      meta.appendChild(left);
      meta.appendChild(right);

      info.appendChild(name);
      info.appendChild(meta);

      card.appendChild(art);
      card.appendChild(info);

      grid.appendChild(card);
    });
  }

  // ===== Integração com seu ui.js =====
  function openCollection() {
    mount();
    render();
  }

  // quando o ui.js dispara o evento:
  window.addEventListener("unpled:open-collection", openCollection);

  // fallback: se você abrir direto a view e recarregar
  document.addEventListener("DOMContentLoaded", () => {
    // monta mas não força a view
    mount();
  });

})();
