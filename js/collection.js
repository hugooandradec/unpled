// js/collection.js
(function () {
  const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  const SUITS = [
    { key: "espadas", label: "Espadas", symbol: "♠" },
    { key: "ouro",    label: "Ouro",    symbol: "♦" },
    { key: "paus",    label: "Paus",    symbol: "♣" },
    { key: "copas",   label: "Copas",   symbol: "♥" },
  ];

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

  function renderCollectionHome() {
    const root = viewCollection();
    if (!root) return;

    root.innerHTML = "";

    const title = el("div", { class: "collection-title" }, ["Coleção"]);
    const sub = el("div", { class: "collection-sub" }, ["Escolha um naipe"]);

    const grid = el("div", { class: "suits-grid" });

    SUITS.forEach(suit => {
      const btn = el("button", { class: "suit-btn", "data-suit": suit.key }, [
        el("span", { class: "suit-symbol" }, [suit.symbol]),
        el("span", { class: "suit-label" }, [suit.label]),
      ]);

      btn.addEventListener("click", () => renderAlbum(suit.key));
      grid.appendChild(btn);
    });

    const back = el("button", { class: "collection-back" }, ["← Voltar"]);
    back.addEventListener("click", () => window.UNPLED?.showView?.("view-home"));

    const wrap = el("div", { class: "collection-wrap" }, [title, sub, grid, back]);
    root.appendChild(wrap);
  }

  function getSuitInfo(key) {
    return SUITS.find(s => s.key === key) || { key, label: key, symbol: "?" };
  }

  function cardSrc(suitKey, rank) {
    // padrão de caminho:
    // assets/cards/espadas/A.png
    // assets/cards/copas/10.png
    return `assets/cards/${suitKey}/${rank}.png`;
  }

  function renderAlbum(suitKey) {
    const root = viewCollection();
    if (!root) return;

    root.innerHTML = "";

    const suit = getSuitInfo(suitKey);

    const header = el("div", { class: "album-header" }, [
      el("button", { class: "album-back", type: "button" }, ["←"]),
      el("div", { class: "album-title" }, [`${suit.label}`]),
    ]);

    header.querySelector(".album-back").addEventListener("click", renderCollectionHome);

    const bigTitle = el("div", { class: "collection-title" }, ["Coleção"]);
    const line = el("div", { class: "album-sub" }, [`Naipe: ${suit.symbol} ${suit.label}`]);

    const album = el("div", { class: "album-grid" });

    RANKS.forEach(rank => {
      const card = el("div", { class: "card-tile" });

      const img = el("img", {
        class: "card-img",
        src: cardSrc(suitKey, rank),
        alt: `${rank} de ${suit.label}`
      });

      // fallback bonito caso a imagem ainda não exista
      img.onerror = () => {
        img.remove();
        card.appendChild(
          el("div", { class: "card-fallback" }, [
            el("div", { class: "card-fallback-rank" }, [rank]),
            el("div", { class: "card-fallback-suit" }, [suit.symbol]),
          ])
        );
      };

      const caption = el("div", { class: "card-caption" }, [`${rank} ${suit.symbol}`]);

      card.appendChild(img);
      card.appendChild(caption);
      album.appendChild(card);
    });

    const footerBack = el("button", { class: "collection-back" }, ["← Voltar aos Naipes"]);
    footerBack.addEventListener("click", renderCollectionHome);

    const wrap = el("div", { class: "collection-wrap" }, [bigTitle, line, header, album, footerBack]);
    root.appendChild(wrap);
  }

  function init() {
    // quando abrir coleção pelo menu
    window.addEventListener("unpled:open-collection", () => {
      renderCollectionHome();
    });

    // se alguém cair direto na view-collection (debug), renderiza
    if (viewCollection()?.classList.contains("active")) renderCollectionHome();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
