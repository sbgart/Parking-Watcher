// api-client.js
import fs from 'node:fs';
import path from 'node:path';

const API_URL = process.env.API_URL || 'https://sibakademstroy.brusnika.ru/api/parking_spaces/?building=286&floor=-2&limit=300';

function isAvailable(status) {
  if (!status) return true;
  const s = String(status).trim().toLowerCase();
  return s === 'свободна' || s === 'free' || s === 'available' || s === 'on_sale';
}

async function getFullList() {
  const res = await fetch(API_URL, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (parking-watcher/1.0)',
      'Referer': 'https://sibakademstroy.brusnika.ru/projects/evropeyskybereg/parking/',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json(); // DRF: {count, next, previous, results} [2]
  const items = Array.isArray(data.results) ? data.results : [];
  const free = items.filter(x => isAvailable(x.status));
  const numbers = free.map(x => x.number).sort((a,b) => (a??0)-(b??0));
  return { total: items.length, available: free.length, numbers, all: items };
}

function diff(prev, curr) {
  const prevSet = new Set(prev);
  const currSet = new Set(curr);
  const appeared = curr.filter(n => !prevSet.has(n));
  const disappeared = prev.filter(n => !currSet.has(n));
  return { appeared, disappeared };
}

export { isAvailable, getFullList, diff };