const KEY = "unpled_save_v1"; 

export function loadState() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : { coins: 0, collection: {} };
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
