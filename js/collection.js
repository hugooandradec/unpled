// js/collection.js
// Coleção com:
// - título grande central
// - tipos sempre visíveis
// - grid 4 colunas
// - cartas mini
// - clique -> modal fullscreen

(function () {
  const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
  const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

  // Por enquanto: Espadas (Ás - 4) na Base
  // Ajuste os paths das imagens conforme seu projeto
  const CARDS = [
    { id: "sp-a", nome: "Ás de Espadas", tipo: "Base", naipe: "Espadas", valor: "A", img: "assets/cards/base/espadas/A_espadas.png" },
    { id: "sp-2", nome: "2 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "2", img: "assets/cards/base/espadas/2_espadas.png" },
    { id: "sp-3", nome: "3 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "3", img: "assets/cards/base/espadas/3_espadas.png" },
    { id: "sp-4", nome: "4 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "4", img: "assets/cards/base/espadas/4_espadas.png" }
  ];

  let state = {
    selectedType: "Base",
    selectedSuit: "Todos"
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
    if (qs("#collectionTypes")) return;

    root.innerHTML = `
      <div class="collection-wrap">
        <h2 class="collection-title">Coleção</h2>

        <div class="collection-types" id="collectionTypes"></div>

        <p class="collection-sub" id="collectionSub"></p>

        <div class="suit-filter" id="suitFilter"></div>

        <div class="cards-grid" id="cardsGrid"></div>
      </div>

      <!-- Modal fullscreen -->
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
    render(); // já abre mostrando Base + Todos
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

    // Modal
    const modal = qs("#cardModal");
    qs("#cardModalClose").addEventListener("click", closeModal);

    // clicar fora fecha
    qs("#cardModalInner").addEventListener("click", (e) => {
      if (e.target.id === "cardModalInner") closeModal();
    });

    // ESC fecha
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // impedir scroll do body quando modal abre
    modal.addEventListener("transitionend", () => {});
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

  function render() {
    highlight("#collectionTypes .pill-btn", "type", state.selectedType);
    highlight("#suitFilter .pill-btn", "suit", state.selectedSuit);

    const cardsInType = CARDS.filter(c => c.tipo === state.selectedType);
    const shown = cardsInType.filter(c => {
      if (state.selectedSuit === "Todos") return true;
      return c.naipe === state.selectedSuit;
    });

    qs("#collectionSub").textContent = `${state.selectedType} — ${shown.length} carta(s)`;

    renderCards(shown);
  }

  function highlight(selector, dataKey, value) {
    document.querySelectorAll(selector).forEach((b) => {
      const key = dataKey === "type" ? b.dataset.type : b.dataset.suit;
      b.classList.toggle("active", key === value);
    });
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

      const art = el("div", "art");
      const img = document.createElement("img");
      img.src = c.img || "";
      img.alt = c.nome;
      art.appendChild(img);

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

  function openModal(cardId) {
    const c = CARDS.find(x => x.id === cardId);
    if (!c) return;

    const modal = qs("#cardModal");
    const img = qs("#cardModalImg");

    img.src = c.img || "";
    img.alt = c.nome;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = qs("#cardModal");
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden"; // seu body já é hidden; mantém consistente
  }

  // Integração com seu ui.js (evento que você já usa)
  function openCollection() {
    mount();
    render(); // garante base/todos renderizado
  }

  window.addEventListener("unpled:open-collection", openCollection);

  // fallback
  document.addEventListener("DOMContentLoaded", () => {
    mount();
  });

})();
