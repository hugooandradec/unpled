// ui.js

(function () {
  // ===== util: ativa/desativa classe "is-active" =====
  function setActive(items, idx) {
    items.forEach((el, i) => el.classList.toggle("is-active", i === idx));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // ===== status online/offline (HUD) =====
  function updateNetStatus() {
    const dot = document.querySelector(".hud .dot");
    const label = document.querySelector(".hud .label");
    if (!dot || !label) return;

    const online = navigator.onLine;
    dot.classList.toggle("online", online);
    dot.classList.toggle("offline", !online);
    label.textContent = online ? "Online" : "Offline";
  }

  // ===== navegação de menu (teclado + mouse) =====
  function initMenu() {
    const items = Array.from(document.querySelectorAll(".menu-item"));
    if (!items.length) return;

    let activeIndex = clamp(
      items.findIndex((el) => el.classList.contains("is-active")),
      0,
      items.length - 1
    );

    setActive(items, activeIndex);

    // mouse hover também "seleciona"
    items.forEach((el, idx) => {
      el.addEventListener("mouseenter", () => {
        activeIndex = idx;
        setActive(items, activeIndex);
      });

      el.addEventListener("focus", () => {
        activeIndex = idx;
        setActive(items, activeIndex);
      });

      el.addEventListener("click", (e) => {
        // se for <a>, deixa navegar normal.
        // se for <button/div>, dispare pelo data-action.
        const action = el.getAttribute("data-action");
        if (action) {
          e.preventDefault();
          triggerAction(action);
        }
      });
    });

    // teclado: setas + enter
    window.addEventListener("keydown", (e) => {
      const key = e.key;

      if (key === "ArrowUp" || key === "w" || key === "W") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        setActive(items, activeIndex);
        items[activeIndex].focus?.();
      }

      if (key === "ArrowDown" || key === "s" || key === "S") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        setActive(items, activeIndex);
        items[activeIndex].focus?.();
      }

      if (key === "Enter" || key === " ") {
        const el = items[activeIndex];
        if (!el) return;

        const action = el.getAttribute("data-action");
        if (action) {
          e.preventDefault();
          triggerAction(action);
          return;
        }

        // se for link, navega
        const href = el.getAttribute("href");
        if (href) {
          e.preventDefault();
          window.location.href = href;
        }
      }
    });
  }

  // ===== ações (ajusta aqui pro teu projeto) =====
  function triggerAction(action) {
    // Aqui você pluga no teu roteamento / páginas
    // Só deixei um padrão bem simples:
    switch (action) {
      case "play":
        // exemplo: ir pra tela do jogo
        window.location.href = "games/money-clicker/index.html";
        break;

      case "collection":
        window.location.href = "collection.html";
        break;

      case "settings":
        window.location.href = "settings.html";
        break;

      default:
        console.log("[UNPLED] ação não mapeada:", action);
        break;
    }
  }

  // ===== boot =====
  document.addEventListener("DOMContentLoaded", () => {
    updateNetStatus();
    window.addEventListener("online", updateNetStatus);
    window.addEventListener("offline", updateNetStatus);

    initMenu();
  });
})();
