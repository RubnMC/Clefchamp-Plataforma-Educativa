const fs = require('fs');
const path = require('path');

function getLevels() {
  const raw = fs.readFileSync(path.join(__dirname, '../data/levels.json'), 'utf-8');
  return JSON.parse(raw);
}

function relativeTime(date) {
    if (!date) return 'Never played';
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours   = Math.floor(diffMs / 3600000);
    const days    = Math.floor(diffMs / 86400000);
    const months  = Math.floor(days / 30.44);

    if (minutes < 1)  return 'hace menos de un minuto';
    if (minutes < 60) return `hace ${minutes} minuto${minutes === 1 ? '' : 's'} `;
    if (hours < 24)   return `hace ${hours} hora${hours === 1 ? '' : 's'}`;
    if (days <= 30)   return `hace ${days} día${days === 1 ? '' : 's'}`;
    if (months < 12)  return `hace ${months} mes${months === 1 ? '' : 'es'}`;
    if (months < 24)  return 'hace 1 año';
    return 'hace más de 1 año';
}

function formatDateTime(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

module.exports = { relativeTime, formatDateTime, getLevels };
