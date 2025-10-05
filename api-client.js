// api-client.js
import { api } from './config.js';

function isAvailable(status) {
  if (!status) {return true;}
  const s = String(status).trim().toLowerCase();
  return s === 'свободна' || s === 'free' || s === 'available' || s === 'on_sale';
}

async function fetchWithRetry(url, options, retries = api.retryAttempts) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), api.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      
      console.warn(`API request failed (attempt ${i + 1}/${retries + 1}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, api.retryDelay * (i + 1)));
    }
  }
}

async function getFullList() {
  const res = await fetchWithRetry(api.url, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (parking-watcher/1.0)',
      'Referer': 'https://sibakademstroy.brusnika.ru/projects/evropeyskybereg/parking/',
    },
  });
  
  const data = await res.json();
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