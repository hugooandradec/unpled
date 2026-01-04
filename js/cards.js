export const SUITS = [
  { key: "S", name: "Espadas", symbol: "♠" },
  { key: "H", name: "Copas", symbol: "♥" },
  { key: "D", name: "Ouros", symbol: "♦" },
  { key: "C", name: "Paus", symbol: "♣" }
];

export const RANKS = [
  { rank: "A", value: 1 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 }
];

export const BASE_POOL = SUITS.flatMap(s =>
  RANKS.map(r => ({
    id: `${r.rank}${s.key}`,
    rank: r.rank,
    suit: s.key,
    suitSymbol: s.symbol,
    value: r.value,
    rarity: "comum"
  }))
);
