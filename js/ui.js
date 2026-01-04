// js/ui.js
(function () {
  function setActive(items, idx) {
    items.forEach((el, i) => el.classList.toggle("is-active", i === idx));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // ===== status online/offline (HUD) =====
  function updateNetStatus() {
    const dot = document.getElementById("onlineDot");
    const label = document.getElementById("onlineLabel");
    const statusText = document.getElementById("statusText");

    if (!dot || !label) return;

    const online = navigator.onLine;

    dot.classList.toggle("online", online);
    dot.classList.toggle("offline", !online);

    label.textContent = online ? "Online" : "Offline";
    if (statusText) statusText.textContent = online ? "Online" : "Offline-ready";
  }

  // ===== troca de views (SPA simples) =====
  function showView(viewId) {
    const views = Array.from(document.querySelectorAll(".view"));
    if (!views.length) return;

    views.forEach(v => v.classList.remove("active"));
    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    // rola pro topo quando troca
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // expõe pra outros scripts (collection.js)
  window.UNPLED = window.UNPLED || {};
  window.UNPLED.showView = showView;

  // ===== Menu da Home (setas + enter) =====
  function initMenu() {
    const items = Array.from(document.querySelectorAll("#view-home .menu-item"));
    if (!items.length) return;

    let activeIndex = clamp(
      items.findIndex((el) => el.classList.contains("is-active")),
      0,
      items.length - 1
    );

    setActive(items, activeIndex);

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
        const action = el.getAttribute("data-action");
        if (action) {
          e.preventDefault();
          triggerAction(action);
        }
      });
    });

    window.addEventListener("keydown", (e) => {
      const key = e.key;

      // só navega no menu quando a home está ativa
      const homeActive = document.getElementById("view-home")?.classList.contains("active");
      if (!homeActive) return;

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
        }
      }
    });
  }

  // ===== ações do menu =====
  function triggerAction(action) {
    switch (action) {
      case "play":
        showView("view-play");
        break;

      case "collection":
        showView("view-collection");
        // avisa o módulo de coleção pra renderizar (se existir)
        window.dispatchEvent(new CustomEvent("unpled:open-collection"));
        break;

      case "settings":
        showView("view-settings");
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
