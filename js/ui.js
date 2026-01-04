// ui.js
(function () {
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
    try {
      localStorage.setItem(STORAGE_LAST_VIEW, viewId);
    } catch {}
  }

  function getLastView() {
    try {
      return localStorage.getItem(STORAGE_LAST_VIEW);
    } catch {
      return null;
    }
  }

  function ensureBackOverlay() {
    if (document.getElementById("unpledBackOverlay")) return;

    // CSS mínimo (sem depender do global.css)
    const style = document.createElement("style");
    style.id = "unpledBackOverlayStyle";
    style.textContent = `
      #unpledBackOverlay{
        position: fixed;
        left: 14px;
        top: 74px; /* abaixo da topbar */
        z-index: 90;
        display: none;
      }
      #unpledBackOverlay button{
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(15,18,30,0.45);
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
        box-shadow: 0 18px 40px rgba(0,0,0,0.35);
      }
      #unpledBackOverlay button:active{
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.id = "unpledBackOverlay";
    wrap.innerHTML = `<button type="button" id="unpledBackBtn">Voltar</button>`;
    document.body.appendChild(wrap);

    wrap.querySelector("#unpledBackBtn").addEventListener("click", () => {
      showView("view-home");
    });
  }

  function toggleBackOverlay(currentViewId) {
    const overlay = document.getElementById("unpledBackOverlay");
    if (!overlay) return;

    // Só aparece fora da home
    overlay.style.display = currentViewId && currentViewId !== "view-home" ? "block" : "none";
  }

  function showView(viewId) {
    const views = Array.from(document.querySelectorAll(".view"));
    views.forEach(v => v.classList.remove("active"));

    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    // salva a tela atual (pra refresh manter)
    if (viewId) saveLastView(viewId);

    // botão voltar interno
    toggleBackOverlay(viewId);

    // scroll pro topo quando trocar de tela
    const main = document.querySelector(".screen"); // <-- era ".main"
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

  function restoreLastView() {
    const last = getLastView();

    // Se não tiver last view, vai pra home e salva
    if (!last) {
      showView("view-home");
      return;
    }

    // Se existir e estiver no DOM, restaura
    const exists = document.getElementById(last);
    if (exists) {
      showView(last);

      // Se for coleção, dispara o render
      if (last === "view-collection") {
        window.dispatchEvent(new CustomEvent("unpled:open-collection"));
      }
      return;
    }

    // fallback
    showView("view-home");
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureBackOverlay();

    updateNetStatus();
    window.addEventListener("online", updateNetStatus);
    window.addEventListener("offline", updateNetStatus);

    initMenu();

    // restaura a tela após refresh
    restoreLastView();
  });
})();