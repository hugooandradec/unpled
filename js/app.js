import { BASE_POOL } from "../data/cards.js";
import { loadSave, saveGame, defaultSave, todayKey } from "./storage.js";

/* ======================
   STATE
====================== */
let state = loadSave() || defaultSave();
normalizeDailyPackState();
saveGame(state);

/* ======================
   DOM
====================== */
const $ = (q)=>document.querySelector(q);

const coinsLabel = $("#coinsLabel");
const onlineDot = $("#onlineDot");
const onlineLabel = $("#onlineLabel");
const statusText = $("#statusText");

const tabs = document.querySelectorAll(".tab");
const views = {
  play: $("#view-play"),
  packs: $("#view-packs"),
  collection: $("#view-collection"),
};

const btnStartRun = $("#btnStartRun");
const btnResetAll = $("#btnResetAll");
const playArea = $("#playArea");
const handEl = $("#hand");
const pickLabel = $("#pickLabel");
const btnPlaySelected = $("#btnPlaySelected");
const btnRerollHand = $("#btnRerollHand");

const roundLabel = $("#roundLabel");
const scoreLabel = $("#scoreLabel");
const roundSum = $("#roundSum");
const roundDetail = $("#roundDetail");
const roundResult = $("#roundResult");

const runEnd = $("#runEnd");
const runSummary = $("#runSummary");
const btnClaim = $("#btnClaim");

const packCostLabel = $("#packCostLabel");
const btnBuyPack = $("#btnBuyPack");
const packReveal = $("#packReveal");

const collectionGrid = $("#collectionGrid");
const uniqueCount = $("#uniqueCount");

/* ======================
   INIT
====================== */
wireTabs();
wireConnectivity();
renderAll();

/* ======================
   UI - Tabs
====================== */
function wireTabs(){
  tabs.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabs.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      const v = btn.dataset.view;
      Object.values(views).forEach(sec=>sec.classList.remove("active"));
      views[v].classList.add("active");
      renderAll();
    });
  });
}

/* ======================
   Connectivity
====================== */
function wireConnectivity(){
  const update = ()=>{
    const on = navigator.onLine;
    onlineDot.style.background = on ? "#2ecc71" : "#e74c3c";
    onlineLabel.textContent = on ? "Online" : "Offline";
    statusText.textContent = on ? "Conectado" : "Offline (funciona igual)";
  };
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();

  // PWA SW
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  }
}

/* ======================
   GAME: RUN RULES
   - deck 20
   - 3 rounds
   - each round draw 5, pick 4
====================== */
function startRun(){
  // deck inicial = as 20 cartas do pool base (por enquanto)
  const deck = shuffle([...BASE_POOL]);
  state.run = {
    deck,
    round: 1,
    score: 0,
    hand: [],
    playedThisRound: [],
    canClaim: false,
    reward: 0,
  };
  drawHand();
  saveGame(state);
}

function drawHand(){
  const run = state.run;
  run.hand = run.deck.splice(0, 5);
  run.playedThisRound = [];
}

function playSelected(selectedIds){
  const run = state.run;
  const selected = run.hand.filter(c => selectedIds.includes(c.id));
  if(selected.length !== 4) return;

  const sum = selected.reduce((a,c)=>a + c.value, 0);
  run.score += sum;
  run.playedThisRound = selected;

  // remove as 4 jogadas da mão; sobra 1 descartada automaticamente
  run.hand = [];
  // próxima rodada ou fim
  if(run.round < 3){
    run.round += 1;
    drawHand();
  }else{
    finishRun();
  }

  saveGame(state);
}

function finishRun(){
  const run = state.run;
  // recompensa simples: score + bônus fixo
  const reward = Math.max(0, Math.floor(run.score * 1.2) + 10);
  run.reward = reward;
  run.canClaim = true;
}

function claimReward(){
  const run = state.run;
  if(!run?.canClaim) return;
  state.coins += run.reward;
  state.run = null;
  saveGame(state);
}

/* ======================
   PACKS (3 cards)
   - custo sobe por compra do dia e reseta diariamente
====================== */
function normalizeDailyPackState(){
  const key = todayKey();
  if(!state.packDaily || state.packDaily.dayKey !== key){
    state.packDaily = { dayKey: key, boughtToday: 0 };
  }
}

function packCost(){
  normalizeDailyPackState();
  // preço base + aumento por compra do dia (soft cap diário)
  const base = 12;
  const step = 4;
  return base + (state.packDaily.boughtToday * step);
}

function buyPack(){
  normalizeDailyPackState();
  const cost = packCost();
  if(state.coins < cost) return { ok:false, msg:"Sem moedas 😭" };

  state.coins -= cost;
  state.packDaily.boughtToday += 1;

  // pack de 3 (por enquanto só pool base)
  const opened = [];
  for(let i=0;i<3;i++){
    const c = BASE_POOL[Math.floor(Math.random()*BASE_POOL.length)];
    opened.push(c);
    state.collection[c.id] = (state.collection[c.id] || 0) + 1;
  }

  saveGame(state);
  return { ok:true, opened, cost };
}

/* ======================
   RENDER
====================== */
function renderAll(){
  coinsLabel.textContent = state.coins;

  renderPlay();
  renderPacks();
  renderCollection();
}

function renderPlay(){
  const run = state.run;

  if(!run){
    playArea.classList.add("hidden");
    runEnd.classList.add("hidden");
    roundLabel.textContent = "—";
    scoreLabel.textContent = "0";
    roundSum.textContent = "—";
    roundDetail.textContent = "—";
    return;
  }

  playArea.classList.remove("hidden");
  roundLabel.textContent = `${run.round}/3`;
  scoreLabel.textContent = run.score;

  // mão
  handEl.innerHTML = "";
  const selected = new Set();
  pickLabel.textContent = "0";

  run.hand.forEach(card=>{
    const el = document.createElement("button");
    el.className = "playCard";
    el.type = "button";
    el.innerHTML = `
      <div class="rank">${card.rank}</div>
      <div class="suit">${card.suitSymbol}</div>
      <div class="val">valor: ${card.value}</div>
    `;

    el.addEventListener("click", ()=>{
      if(selected.has(card.id)){
        selected.delete(card.id);
        el.classList.remove("selected");
      }else{
        if(selected.size >= 4) return;
        selected.add(card.id);
        el.classList.add("selected");
      }
      pickLabel.textContent = String(selected.size);
    });

    handEl.appendChild(el);
  });

  btnPlaySelected.onclick = ()=>{
    if(selected.size !== 4) return;
    playSelected([...selected]);
    renderAll();
    renderLastRound();
  };

  btnRerollHand.onclick = ()=>{
    // só pra teste (remove 5 e compra 5)
    // se quiser tirar isso depois, a gente tira fácil
    drawHand();
    saveGame(state);
    renderAll();
  };

  btnStartRun.onclick = ()=>{
    startRun();
    renderAll();
  };

  btnResetAll.onclick = ()=>{
    localStorage.clear();
    state = defaultSave();
    saveGame(state);
    renderAll();
  };

  if(run.canClaim){
    playArea.classList.add("hidden");
    runEnd.classList.remove("hidden");
    runSummary.textContent = `Score final: ${run.score} • Recompensa: +${run.reward} moedas`;
    btnClaim.onclick = ()=>{
      claimReward();
      renderAll();
    };
  }else{
    runEnd.classList.add("hidden");
  }

  renderLastRound();
}

function renderLastRound(){
  const run = state.run;
  if(!run || run.playedThisRound.length === 0){
    roundSum.textContent = "—";
    roundDetail.textContent = "Selecione 4 cartas e jogue.";
    return;
  }
  const sum = run.playedThisRound.reduce((a,c)=>a+c.value,0);
  roundSum.textContent = `+${sum} pontos`;
  roundDetail.textContent = run.playedThisRound.map(c=>`${c.rank}${c.suitSymbol}`).join("  ");
}

function renderPacks(){
  packCostLabel.textContent = `${packCost()} moedas`;

  btnBuyPack.onclick = ()=>{
    const res = buyPack();
    renderAll();

    if(!res.ok){
      packReveal.innerHTML = `<div class="muted small">${res.msg}</div>`;
      return;
    }

    // mostra as 3 cartas
    packReveal.innerHTML = "";
    res.opened.forEach(c=>{
      const el = document.createElement("div");
      el.className = "playCard";
      el.innerHTML = `
        <div class="rank">${c.rank}</div>
        <div class="suit">${c.suitSymbol}</div>
        <div class="val">${c.rarity}</div>
      `;
      packReveal.appendChild(el);
    });
  };
}

function renderCollection(){
  const ids = Object.keys(state.collection);
  uniqueCount.textContent = String(ids.length);

  collectionGrid.innerHTML = "";
  if(ids.length === 0){
    collectionGrid.innerHTML = `<div class="muted small">Ainda nada… compra um pack 👀</div>`;
    return;
  }

  // ordena tipo: A,2,3,4,5 por naipe
  const order = ["A","2","3","4","5"];
  const suitOrder = ["S","H","D","C"];

  const all = ids
    .map(id=>{
      const base = BASE_POOL.find(c=>c.id===id);
      return { ...base, count: state.collection[id] };
    })
    .sort((a,b)=>{
      const ra = order.indexOf(a.rank), rb = order.indexOf(b.rank);
      if(ra!==rb) return ra-rb;
      return suitOrder.indexOf(a.suit)-suitOrder.indexOf(b.suit);
    });

  all.forEach(c=>{
    const el = document.createElement("div");
    el.className = "collectItem";
    el.innerHTML = `
      <div class="top">
        <span class="badge">${c.rarity}</span>
        <span class="count">x${c.count}</span>
      </div>
      <div style="font-weight:900;font-size:18px">${c.rank}${c.suitSymbol}</div>
      <div class="muted small">${c.id}</div>
    `;
    collectionGrid.appendChild(el);
  });
}

/* ======================
   Utils
====================== */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}
