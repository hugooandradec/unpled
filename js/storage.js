const KEY = "card_gacha_save_v1";

export function loadSave(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch{
    return null;
  }
}

export function saveGame(state){
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function defaultSave(){
  return {
    coins: 25, // começa com um trocado pra testar
    // coleção: { [cardId]: quantidade }
    collection: {},
    // controle do preço diário do pack
    packDaily: {
      dayKey: todayKey(),
      boughtToday: 0
    },
    // run atual (partida)
    run: null
  };
}

export function todayKey(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
