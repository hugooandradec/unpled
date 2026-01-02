// Baralho clássico inicial (20 cartas): A–5 em 4 naipes
export const SUITS = [
  { key: "S", name: "Espadas", symbol: "♠" },
  { key: "H", name: "Copas",   symbol: "♥" },
  { key: "D", name: "Ouros",   symbol: "♦" },
  { key: "C", name: "Paus",    symbol: "♣" },
];

export const RANKS = [
  { rank: "A", value: 1 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
];

// pool base = as 20 cartas
export const BASE_POOL = SUITS.flatMap(s =>
  RANKS.map(r => ({
    id: `${r.rank}${s.key}`,          // ex: AS, 3H...
    rank: r.rank,
    suit: s.key,
    suitSymbol: s.symbol,
    value: r.value,
    rarity: "comum",                   // por enquanto
  }))
);

// futuramente: fantasia, raridades, etc.
