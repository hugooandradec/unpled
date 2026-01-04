// ui.js
(function () {
  // Se quiser que refresh mantenha a tela, mude para true depois que tudo estiver ok
  const ENABLE_RESTORE_LAST_VIEW = false;

  const STORAGE_LAST_VIEW = "unpled:lastView";

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

  function saveLastView(viewId) {
    try { localStorage.setItem(STORAGE_LAST_VIEW, viewId); } catch {}
  }

  function getLastView() {
    try { return localStorage.getItem(STORAGE_LAST_VIEW); } catch { return null; }
  }

  function ensureBackOverlay() {
    if (document.getElementById("unpledBackOverlay")) return;

    const style = document.createElement("style");
    style.textContent = `
      #unpledBackOverlay{
        position: fixed;
        left: 14px;
        top: 74px;
        z-index: 999999;
        display: none;
        pointer-events: auto;
      }
      #unpledBackOverlay button{
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(15,18,30,0.55);
        color: rgba(255,255,255,0.92);
        padding: 12px 16px;
        border-radius: 999px;
        cursor: pointer;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        font-size: 12px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 18px 40px rgba(0,0,0,0.45);
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.id = "unpledBackOverlay";
    wrap.innerHTML = `<button type="button" id="unpledBackBtn">Voltar</button>`;
    document.body.appendChild(wrap);

    wrap.querySelector("#unpledBackBtn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showView("view-home");
    });
  }

  function toggleBackOverlay(viewId) {
    const overlay = document.getElementById("unpledBackOverlay");
    if (!overlay) return;
    overlay.style.display = (viewId && viewId !== "view-home") ? "block" : "none";
  }

  function showView(viewId) {
    const views = Array.from(document.querySelectorAll(".view"));
    views.forEach(v => v.classList.remove("active"));

    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    toggleBackOverlay(viewId);
    saveLastView(viewId);

    const main = document.querySelector(".screen");
    if (main) main.scrollTo({ top: 0, behavior: "auto" });
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

  function bootView() {
    // SEMPRE começa na HOME (pra nunca “travar”)
    showView("view-home");

    // Se você quiser restaurar depois, liga ENABLE_RESTORE_LAST_VIEW
    if (ENABLE_RESTORE_LAST_VIEW) {
      const last = getLastView();
      if (last && document.getElementById(last)) {
        showView(last);
        if (last === "view-collection") {
          window.dispatchEvent(new CustomEvent("unpled:open-collection"));
        }
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureBackOverlay();

    updateNetStatus();
    window.addEventListener("online", updateNetStatus);
    window.addEventListener("offline", updateNetStatus);

    initMenu();
    bootView();
  });
})();