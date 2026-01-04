// collection.js
(function () {
  const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  const SUITS = [
    { key: "espadas", label: "Espadas", symbol: "♠" },
    { key: "ouro",    label: "Ouro",    symbol: "♦" },
    { key: "paus",    label: "Paus",    symbol: "♣" },
    { key: "copas",   label: "Copas",   symbol: "♥" },
  ];

  const FRAME_SRC = "assets/cards/_frame/base.png";

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    for (const c of children) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    return node;
  }

  function viewCollection() {
    return document.getElementById("view-collection");
  }

  function getSuitInfo(key) {
    return SUITS.find(s => s.key === key) || { key, label: key, symbol: "?" };
  }

  // ✅ SUA estrutura:
  // assets/cards/base/espadas/A_espadas.png
  function cardArtSrc(suitKey, rank) {
    return `assets/cards/base/${suitKey}/${rank}_${suitKey}.png`;
  }

  function renderCollectionHome() {
    const root = viewCollection();
    if (!root) return;

    root.innerHTML = "";

    const title = el("div", { class: "collection-title" }, ["Coleção"]);
    const sub = el("div", { class: "collection-sub" }, ["Escolha um naipe"]);

    const grid = el("div", { class: "suits-grid" });

    SUITS.forEach(suit => {
      const btn = el("button", { class: "suit-btn", type: "button" }, [
        el("span", { class: "suit-symbol" }, [suit.symbol]),
        el("span", { class: "suit-label" }, [suit.label]),
      ]);

      btn.addEventListener("click", () => renderAlbum(suit.key));
      grid.appendChild(btn);
    });

    const back = el("button", { class: "collection-back", type: "button" }, ["← Voltar"]);
    back.addEventListener("click", () => window.UNPLED?.showView?.("view-home"));

    const wrap = el("div", { class: "collection-wrap" }, [title, sub, grid, back]);
    root.appendChild(wrap);
  }

  function renderAlbum(suitKey) {
    const root = viewCollection();
    if (!root) return;

    root.innerHTML = "";

    const suit = getSuitInfo(suitKey);

    const bigTitle = el("div", { class: "collection-title" }, ["Coleção"]);
    const line = el("div", { class: "album-sub" }, [`Naipe: ${suit.symbol} ${suit.label}`]);

    const header = el("div", { class: "album-header" }, [
      el("button", { class: "album-back", type: "button" }, ["←"]),
      el("div", { class: "album-title" }, [`${suit.label}`]),
    ]);
    header.querySelector(".album-back").addEventListener("click", renderCollectionHome);

    const album = el("div", { class: "album-grid" });

    RANKS.forEach(rank => {
      const tile = el("div", { class: "card-tile" });

      // container da carta com overlay
      const stack = el("div", { class: "card-stack" });

      const art = el("img", {
        class: "card-art",
        src: cardArtSrc(suitKey, rank),
        alt: `${rank} de ${suit.label}`
      });

      const frame = el("img", {
        class: "card-frame",
        src: FRAME_SRC,
        alt: "Frame"
      });

      const fallback = el("div", { class: "card-fallback", html: `
        <div class="card-fallback-rank">${rank}</div>
        <div class="card-fallback-suit">${suit.symbol}</div>
      `});

      // se a arte não existir, esconde arte e mostra fallback
      art.onerror = () => {
        art.style.display = "none";
        fallback.style.display = "grid";
      };

      // fallback começa escondido (só aparece quando falta imagem)
      fallback.style.display = "none";

      stack.appendChild(art);
      stack.appendChild(fallback);
      stack.appendChild(frame);

      const caption = el("div", { class: "card-caption" }, [`${rank} ${suit.symbol}`]);

      tile.appendChild(stack);
      tile.appendChild(caption);
      album.appendChild(tile);
    });

    const footerBack = el("button", { class: "collection-back", type: "button" }, ["← Voltar aos Naipes"]);
    footerBack.addEventListener("click", renderCollectionHome);

    const wrap = el("div", { class: "collection-wrap" }, [bigTitle, line, header, album, footerBack]);
    root.appendChild(wrap);
  }

  function init() {
    window.addEventListener("unpled:open-collection", renderCollectionHome);

    // se entrar direto na view por debug
    if (viewCollection()?.classList.contains("active")) renderCollectionHome();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
