// ui.js
(function () {
  function setActive(items, idx) {
    items.forEach((el, i) => el.classList.toggle("is-active", i === idx));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

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

  function showView(viewId) {
    const views = Array.from(document.querySelectorAll(".view"));
    views.forEach(v => v.classList.remove("active"));

    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    // deixa o scroll voltar pro topo quando trocar de tela
    const main = document.querySelector(".main");
    if (main) main.scrollTo({ top: 0, behavior: "instant" });
  }

  window.UNPLED = window.UNPLED || {};
  window.UNPLED.showView = showView;

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
        if (!action) return;
        e.preventDefault();
        triggerAction(action);
      });
    });

    window.addEventListener("keydown", (e) => {
      const homeActive = document.getElementById("view-home")?.classList.contains("active");
      if (!homeActive) return;

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
        if (!action) return;

        e.preventDefault();
        triggerAction(action);
      }
    });
  }

  function triggerAction(action) {
    switch (action) {
      case "play":
        showView("view-play");
        break;

      case "collection":
        showView("view-collection");
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

  document.addEventListener("DOMContentLoaded", () => {
    updateNetStatus();
    window.addEventListener("online", updateNetStatus);
    window.addEventListener("offline", updateNetStatus);
    initMenu();
  });
})();
