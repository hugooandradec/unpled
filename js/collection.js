// js/collection.js
// Coleção com:
// - Tipos sempre visíveis
// - Grid 4 colunas
// - Cartas Base (Espadas A-4) com borda Base
// - Clique -> modal fullscreen
// - Botão "Voltar" interno (não depende do navegador)
// - Persistência da última view no refresh (localStorage)
// - pushState/popstate quando possível

(function () {
  const TYPES = ["Base", "Incomum", "Rara", "Épica", "Lendária"];
  const SUITS = ["Todos", "Espadas", "Ouro", "Paus", "Copas"];

  const STORAGE_LAST_VIEW = "unpled:lastView";

  // Cartas Base - Espadas (A-4)
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

  // ===== helpers: navegação/persistência =====
  function showViewSafe(viewId) {
    // usa a função do seu ui.js, se existir
    if (window.UNPLED && typeof window.UNPLED.showView === "function") {
      window.UNPLED.showView(viewId);
      return true;
    }
    return false;
  }

  function rememberView(viewId) {
    try { localStorage.setItem(STORAGE_LAST_VIEW, viewId); } catch {}
  }

  function pushViewState(viewId) {
    // evita lotar history com o mesmo estado
    try {
      const cur = history.state && history.state.view;
      if (cur !== viewId) history.pushState({ view: viewId }, "", "");
    } catch {}
  }

  function restoreLastView() {
    // Tenta restaurar a última view após refresh
    let last = null;
    try { last = localStorage.getItem(STORAGE_LAST_VIEW); } catch {}
    if (!last) return;

    // Espera UNPLED estar pronto (ui.js)
    const start = Date.now();
    (function tick() {
      if (showViewSafe(last)) return;
      if (Date.now() - start > 1200) return; // para não ficar infinito
      requestAnimationFrame(tick);
    })();
  }

  // ===== montagem =====
  function mount() {
    const root = qs("#view-collection");
    if (!root) return;
    if (qs("#collectionTypes")) return;

    root.innerHTML = `
      <div class="collection-wrap">
        <div class="collection-top">
          <button class="pill-btn small collection-back-btn" id="btnCollectionBackHome" type="button">Voltar</button>
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

    // Botão voltar interno (evita seta do navegador fechar PWA)
    qs("#btnCollectionBackHome").addEventListener("click", () => {
      rememberView("view-home");
      pushViewState("view-home");
      showViewSafe("view-home");
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

    // back/forward do browser (quando não fecha o app)
    window.addEventListener("popstate", (e) => {
      const view = e.state && e.state.view;
      if (view) {
        rememberView(view);
        showViewSafe(view);
      }
    });

    // fallback: se o modal estiver aberto e o usuário "voltar", fecha modal primeiro
    modal.addEventListener("click", () => {});
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

  function highlight(selector, dataKey, value) {
    document.querySelectorAll(selector).forEach((b) => {
      const key = dataKey === "type" ? b.dataset.type : b.dataset.suit;
      b.classList.toggle("active", key === value);
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
      card.dataset.tipo = c.tipo; // <<< habilita borda por tipo (Base)

      const art = el("div", "art");
      const img = document.createElement("img");
      img.src = c.img || "";
      img.alt = c.nome;

      // fallback se imagem quebrar
      img.onerror = () => {
        img.remove();
        art.textContent = "★";
      };

      art.appendChild(img);
      card.appendChild(art);

      // Mantém estrutura pra futuro (mas escondida no CSS)
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

    // trava scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = qs("#cardModal");
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    // destrava scroll
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  // Integração com ui.js (evento que você já usa)
  function openCollection() {
    mount();
    render();
    rememberView("view-collection");
    pushViewState("view-collection");
  }

  window.addEventListener("unpled:open-collection", openCollection);

  // Inicialização
  document.addEventListener("DOMContentLoaded", () => {
    mount();

    // Restaura view após refresh (se estava em coleção, volta pra ela)
    restoreLastView();

    // Se não tiver estado no history, define home como base
    try {
      if (!history.state || !history.state.view) {
        history.replaceState({ view: "view-home" }, "", "");
      }
    } catch {}
  });

})();