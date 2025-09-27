// notification-manager.js
import fs from 'node:fs';
import path from 'node:path';

const BOT_TOKEN = process.env.BOT_TOKEN || "8310853925:AAEOhH2RVCzXBIFnlhXhqn0NcSuaFGMoR4k";
const CHAT_ID = process.env.CHAT_ID || "-1003024904605";

// Шаблон сообщения - можно настраивать под себя
const MESSAGE_TEMPLATE = process.env.MESSAGE_TEMPLATE || `{{header}} — {{timestamp}}
Всего мест: {{total}}
Свободно: {{available}}
Номера: {{numbers}}
{{my_spot_status}}`;

// Шаблон дополнительного уведомления при изменении статуса места
const ALERT_TEMPLATE = process.env.ALERT_TEMPLATE || `⚠️ <b>ВНИМАНИЕ!</b> Ваше парковочное место <code>{{spot_number}}</code> сейчас занято!`;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('Missing BOT_TOKEN or CHAT_ID');
  process.exit(1);
}

async function sendTelegram(text, silent, chatId = CHAT_ID) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`; // [2]
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_notification: Boolean(silent), // тихо = без звука [1]
    // protect_content: true, // опционально
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
    return `Моё место (<code>${spotNumber}</code>): 🔴 <b><s>${spotStatus}</s></b>`; // Зачеркнутый текст для обозначения занятости
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

export { sendTelegram, MESSAGE_TEMPLATE, ALERT_TEMPLATE, CHAT_ID, formatSpotStatusForTemplate, formatSpotStatusChangeMessage };