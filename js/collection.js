// js/collection.js
(function () {
  const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
  const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

  // Persistência de view no refresh (vale pro app inteiro)
  const STORAGE_LAST_VIEW = "unpled:lastView";

  // Cartas Base - Espadas (A-4)
  const CARDS = [
    { id: "sp-a", nome: "Ás de Espadas", tipo: "Base", naipe: "Espadas", valor: "A", img: "assets/cards/base/espadas/A_espadas.png" },
    { id: "sp-2", nome: "2 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "2", img: "assets/cards/base/espadas/2_espadas.png" },
    { id: "sp-3", nome: "3 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "3", img: "assets/cards/base/espadas/3_espadas.png" },
    { id: "sp-4", nome: "4 de Espadas",  tipo: "Base", naipe: "Espadas", valor: "4", img: "assets/cards/base/espadas/4_espadas.png" }
  ];

  const state = {
    selectedType: "Base",
    selectedSuit: "Todos",
  };

  function qs(sel) { return document.querySelector(sel); }
  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // ====== View persistence (sem travar na coleção) ======
  function setLastView(viewId) {
    try { localStorage.setItem(STORAGE_LAST_VIEW, viewId); } catch {}
  }
  function getLastView() {
    try { return localStorage.getItem(STORAGE_LAST_VIEW); } catch { return null; }
  }

  // embrulha UNPLED.showView pra salvar a view SEM precisar mexer no ui.js
  function patchShowViewPersistence() {
    const w = window;
    if (!w.UNPLED || typeof w.UNPLED.showView !== "function") return;

    // evita patch duplicado
    if (w.UNPLED.__patched_lastView) return;

    const original = w.UNPLED.showView;
    w.UNPLED.showView = function (viewId) {
      setLastView(viewId);
      return original.call(this, viewId);
    };

    w.UNPLED.__patched_lastView = true;
  }

  function restoreLastViewOnce() {
    // Só restaura se for um id válido e existir no DOM
    const last = getLastView();
    if (!last) return;

    const elView = document.getElementById(last);
    if (!elView) return;

    // Se já tem alguma view ativa (ex.: view-home), não força nada
    const active = document.querySelector(".view.active");
    if (active && active.id) return;

    if (window.UNPLED && typeof window.UNPLED.showView === "function") {
      window.UNPLED.showView(last);
    }
  }

  // ====== UI mount ======
  function mount() {
    const root = qs("#view-collection");
    if (!root) return;
    if (qs("#collectionTypes")) return; // já montado

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
    // tipos
    qs("#collectionTypes").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-type]");
      if (!btn) return;
      state.selectedType = btn.dataset.type;
      state.selectedSuit = "Todos";
      render();
    });

    // naipes
    qs("#suitFilter").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-suit]");
      if (!btn) return;
      state.selectedSuit = btn.dataset.suit;
      render();
    });

    // click carta -> modal
    qs("#cardsGrid").addEventListener("click", (e) => {
      const card = e.target.closest(".card-mini");
      if (!card) return;
      openModal(card.dataset.id);
    });

    // voltar para HOME (sem seta do navegador)
    qs("#btnCollectionBack").addEventListener("click", () => {
      // fecha modal se estiver aberto
      closeModal();

      if (window.UNPLED && typeof window.UNPLED.showView === "function") {
        window.UNPLED.showView("view-home");
      }
    });

    // modal fechar
    qs("#cardModalClose").addEventListener("click", closeModal);

    // clicar fora fecha
    qs("#cardModalInner").addEventListener("click", (e) => {
      if (e.target && e.target.id === "cardModalInner") closeModal();
    });

    // ESC fecha
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
    const shown = cardsInType.filter(c => {
      if (state.selectedSuit === "Todos") return true;
      return c.naipe === state.selectedSuit;
    });

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
      card.dataset.tipo = c.tipo; // <<< borda Base via CSS

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

      const info = el("div", "info");
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

    img.onerror = () => {
      img.removeAttribute("src");
    };

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

  // Evento disparado pelo ui.js quando clica em Coleção
  function openCollection() {
    mount();
    render();

    // marca view atual (persistência)
    setLastView("view-collection");
  }

  window.addEventListener("unpled:open-collection", openCollection);

  document.addEventListener("DOMContentLoaded", () => {
    // garante que o patch do showView exista cedo
    patchShowViewPersistence();

    // monta a view (sem forçar ela ativa)
    mount();

    // tenta restaurar a última view APENAS se nenhuma estiver ativa
    restoreLastViewOnce();
  });

})();