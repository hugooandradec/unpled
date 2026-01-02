const STORAGE_KEY = "money_clicker_save_v1";

const state = {
  money: 0,
  perClick: 1,
  perSec: 0,
  bought: {},     // upgrades comprados
  unlocked: {},   // notas desbloqueadas
  lastTick: Date.now()
};

const upgradesDef = [
  { id:"click1", name:"+1 por clique", desc:"Clique mais forte.", cost: 20,  effect: s => s.perClick += 1 },
  { id:"click5", name:"+5 por clique", desc:"Agora vai.",        cost: 120, effect: s => s.perClick += 5 },
  { id:"auto1",  name:"+1 por segundo", desc:"Renda passiva 😈",  cost: 200, effect: s => s.perSec  += 1 },
  { id:"auto5",  name:"+5 por segundo", desc:"Modo farm.",       cost: 900, effect: s => s.perSec  += 5 },
];

// Notas (álbum). Você troca os src pras suas imagens reais.
const notesDef = [
  { id:"brl10", label:"BRL 10", src:"assets/notes/nota_brasil_comum.png", unlockAt: 50 },
  { id:"usd1",  label:"USD 1",  src:"assets/notes/usd_1.png",  unlockAt: 250 },
  { id:"eur5",  label:"EUR 5",  src:"assets/notes/eur_5.png",  unlockAt: 800 },
  { id:"gbp5",  label:"GBP 5",  src:"assets/notes/gbp_5.png",  unlockAt: 1500 },
  { id:"jpy1000",label:"JPY 1000",src:"assets/notes/jpy_1000.png",unlockAt: 3000 },
  { id:"cad5",  label:"CAD 5",  src:"assets/notes/cad_5.png",  unlockAt: 6000 },
];

const $ = (id) => document.getElementById(id);

function formatMoney(n){
  return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  toast("Salvo ✅");
}

function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try{
    const data = JSON.parse(raw);
    Object.assign(state, data);
  }catch(e){
    // se corromper, ignora
  }
}

function reset(){
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function toast(msg){
  // toast simples e direto (sem framework)
  let el = document.querySelector(".toast");
  if (!el){
    el = document.createElement("div");
    el.className = "toast";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "18px";
    el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(0,0,0,.65)";
    el.style.border = "1px solid rgba(255,255,255,.18)";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "999px";
    el.style.fontWeight = "800";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.style.opacity = "0", 1200);
}

function canBuy(cost){ return state.money >= cost; }

function buy(upg){
  if (state.bought[upg.id]) return;
  if (!canBuy(upg.cost)) return toast("Sem grana 😭");
  state.money -= upg.cost;
  state.bought[upg.id] = true;
  upg.effect(state);
  render();
  save();
}

function checkUnlocks(){
  for (const n of notesDef){
    if (!state.unlocked[n.id] && state.money >= n.unlockAt){
      state.unlocked[n.id] = true;
      toast(`Nova nota desbloqueada: ${n.label} 🎉`);
    }
  }
}

function tick(){
  const now = Date.now();
  const dt = (now - state.lastTick) / 1000;
  state.lastTick = now;

  if (state.perSec > 0){
    state.money += state.perSec * dt;
  }
  checkUnlocks();
  renderHUD();
}

function renderHUD(){
  $("saldo").textContent = formatMoney(state.money);
  $("rate").textContent = `+ ${formatMoney(state.perSec)}/s`;
}

function renderUpgrades(){
  const root = $("upgrades");
  root.innerHTML = "";

  for (const u of upgradesDef){
    const owned = !!state.bought[u.id];
    const el = document.createElement("div");
    el.className = "item";

    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = u.name;
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = `${u.desc} • Custo: ${formatMoney(u.cost)}`;

    left.appendChild(name);
    left.appendChild(desc);

    const btn = document.createElement("button");
    btn.textContent = owned ? "Comprado" : "Comprar";
    btn.disabled = owned;
    btn.style.opacity = owned ? ".6" : "1";
    btn.onclick = () => buy(u);

    el.appendChild(left);
    el.appendChild(btn);
    root.appendChild(el);
  }
}

function renderAlbum(){
  const root = $("album");
  root.innerHTML = "";

  for (const n of notesDef){
    const unlocked = !!state.unlocked[n.id];

    const card = document.createElement("div");
    card.className = "note" + (unlocked ? "" : " locked");

    const img = document.createElement("img");
    img.alt = n.label;
    img.src = n.src;

    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = unlocked ? n.label : `Bloqueado (≥ ${formatMoney(n.unlockAt)})`;

    card.appendChild(img);
    card.appendChild(tag);
    root.appendChild(card);
  }
}

function render(){
  renderHUD();
  renderUpgrades();
  renderAlbum();
}

function setStatus(){
  const el = $("status");
  const online = navigator.onLine;
  el.textContent = online ? "Status: online 🟢" : "Status: offline 🔴 (mas o jogo funciona)";
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  setStatus();
  render();

  $("btnClick").addEventListener("click", () => {
    state.money += state.perClick;
    checkUnlocks();
    renderHUD();
  });

  $("btnSave").addEventListener("click", save);
  $("btnReset").addEventListener("click", reset);

  window.addEventListener("online", () => { setStatus(); toast("Voltou online 🟢"); });
  window.addEventListener("offline", () => { setStatus(); toast("Ficou offline 🔴"); });

  // loop do “dinheiro por segundo”
  setInterval(tick, 200);

  // auto-save de tempos em tempos
  setInterval(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), 5000);
});
