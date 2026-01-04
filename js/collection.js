// js/collection.js
(function () {
  const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
  const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

  const CARDS = [
    { id: "sp-a", nome: "Ás de Espadas", tipo: "Base", naipe: "Espadas", valor: "A", img: "assets/cards/base/espadas/A_espadas.png" },
    { id: "sp-2", nome: "2 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "2", img: "assets/cards/base/espadas/2_espadas.png" },
    { id: "sp-3", nome: "3 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "3", img: "assets/cards/base/espadas/3_espadas.png" },
    { id: "sp-4", nome: "4 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "4", img: "assets/cards/base/espadas/4_espadas.png" }
  ];

  let state = { selectedType: "Base", selectedSuit: "Todos" };

  function qs(sel) { return document.querySelector(sel); }
  function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function mount() {
    const root = qs("#view-collection");
    if (!root) return;
    if (qs("#collectionTypes")) return;

    root.innerHTML = `
      <div class="collection-wrap">
        <div class="collection-top">
          <button class="pill-btn small collection-back-btn" id="btnCollectionBack" type="button">Voltar</button>
          <h2 class="collection-title">Coleção</h2>
        </div>

        <div class="collection-types" id="collectionTypes"></div>
        <p class="collection-sub" id="collectionSub"></p>
        <div class="suit-filter" id="suitFilter"></div>
        <div class="cards-grid" id="cardsGrid"></div>
      </div>

      <div class="card-modal" id="cardModal" aria-hidden="true">
        <button class="card-modal-close" id="cardModalClose" type="button">Fechar</button>
        <div class="card-modal-inner" id="cardModalInner">
          <figure class="card-modal-figure">
            <img id="cardModalImg" alt="Carta" />
          </figure>
        </div>
      </div>
    `;

    renderTypes();
    renderSuits();
    bindEvents();
    render();
  }

  function bindEvents() {
    qs("#collectionTypes").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-type]");
      if (!btn) return;
      state.selectedType = btn.dataset.type;
      state.selectedSuit = "Todos";
      render();
    });

    qs("#suitFilter").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-suit]");
      if (!btn) return;
      state.selectedSuit = btn.dataset.suit;
      render();
    });

    qs("#cardsGrid").addEventListener("click", (e) => {
      const card = e.target.closest(".card-mini");
      if (!card) return;
      openModal(card.dataset.id);
    });

    qs("#btnCollectionBack").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      window.UNPLED?.showView?.("view-home");
    });

    qs("#cardModalClose").addEventListener("click", closeModal);

    qs("#cardModalInner").addEventListener("click", (e) => {
      if (e.target && e.target.id === "cardModalInner") closeModal();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
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

  function highlight(selector, key, value) {
    document.querySelectorAll(selector).forEach((b) => {
      const v = key === "type" ? b.dataset.type : b.dataset.suit;
      b.classList.toggle("active", v === value);
    });
  }

  function render() {
    highlight("#collectionTypes .pill-btn", "type", state.selectedType);
    highlight("#suitFilter .pill-btn", "suit", state.selectedSuit);

    const cardsInType = CARDS.filter(c => c.tipo === state.selectedType);
    const shown = cardsInType.filter(c => state.selectedSuit === "Todos" ? true : c.naipe === state.selectedSuit);

    qs("#collectionSub").textContent = `${state.selectedType} — ${shown.length} carta(s)`;
    renderCards(shown);
  }

  function renderCards(cards) {
    const grid = qs("#cardsGrid");
    grid.innerHTML = "";

    if (!cards.length) {
      const empty = el("div", "collection-empty");
      empty.textContent = "Nenhuma carta encontrada nesse filtro.";
      grid.appendChild(empty);
      return;
    }

    cards.forEach((c) => {
      const card = el("div", "card-mini");
      card.dataset.id = c.id;
      card.dataset.tipo = c.tipo;

      const art = el("div", "art");
      const img = document.createElement("img");
      img.src = c.img || "";
      img.alt = c.nome;

      img.onerror = () => {
        img.remove();
        art.textContent = "★";
      };

      art.appendChild(img);
      card.appendChild(art);

      card.appendChild(el("div", "info"));
      grid.appendChild(card);
    });
  }

  function openModal(cardId) {
    const c = CARDS.find(x => x.id === cardId);
    if (!c) return;

    const modal = qs("#cardModal");
    const img = qs("#cardModalImg");

    img.src = c.img || "";
    img.alt = c.nome;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = qs("#cardModal");
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  window.addEventListener("unpled:open-collection", () => {
    mount();
    render();
  });

  document.addEventListener("DOMContentLoaded", () => {
    mount();
  });
})();