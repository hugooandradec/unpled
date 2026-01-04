import { BASE_POOL } from "./cards.js";

export function openPack() {
  const pack = [];
  for (let i = 0; i < 3; i++) {
    const card = BASE_POOL[Math.floor(Math.random() * BASE_POOL.length)];
    pack.push(card);
  }
  return pack;
}
