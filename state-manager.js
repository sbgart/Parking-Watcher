// state-manager.js
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve('./data');
const stateFile = path.join(dataDir, 'state.json');
if (!fs.existsSync(dataDir)) {fs.mkdirSync(dataDir, { recursive: true });}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  } catch {
    return { numbers: [], available: null, mySpotStatus: null };
  }
}

function saveState(st) {
  fs.writeFileSync(stateFile, JSON.stringify(st, null, 2), 'utf-8');
}

export { loadState, saveState };