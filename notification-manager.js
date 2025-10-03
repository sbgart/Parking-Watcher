// notification-manager.js
import { telegram, messages } from './config.js';

async function sendTelegram(text, silent, chatId = telegram.chatId) {
  const url = `https://api.telegram.org/bot${telegram.botToken}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_notification: Boolean(silent),
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const err = await res.text().catch(()=> '');
    throw new Error(`Telegram HTTP ${res.status}: ${err.slice(0,200)}`);
  }
}

function formatSpotStatusForTemplate(spotNumber, spotStatus) {
  if (spotStatus === 'свободно') {
    return `Моё место (<code>${spotNumber}</code>): 🟢 <b>${spotStatus}</b>`;
  } else if (spotStatus === 'занято') {
    return `Моё место (<code>${spotNumber}</code>): 🔴 <b><s>${spotStatus}</s></b>`;
  } else {
    return `Моё место (<code>${spotNumber}</code>): не найдено`;
  }
}

function formatSpotStatusChangeMessage(spotNumber, spotStatus) {
  if (spotStatus === 'свободно') {
    return `🟢 Место <code>${spotNumber}</code> освободилось!`;
  } else {
    return `🔴 Место <code>${spotNumber}</code> заняли.`;
  }
}

const MESSAGE_TEMPLATE = messages.template;
const ALERT_TEMPLATE = messages.alertTemplate;
const CHAT_ID = telegram.chatId;

export { 
  sendTelegram, 
  MESSAGE_TEMPLATE,
  ALERT_TEMPLATE,
  CHAT_ID,
  formatSpotStatusForTemplate, 
  formatSpotStatusChangeMessage 
};