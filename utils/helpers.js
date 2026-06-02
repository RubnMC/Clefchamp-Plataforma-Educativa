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

    if (minutes < 1)  return 'less than a minute ago';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24)   return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days <= 30)   return `${days} day${days === 1 ? '' : 's'} ago`;
    if (months < 12)  return `${months} month${months === 1 ? '' : 's'} ago`;
    if (months < 24)  return '1 year ago';
    return 'more than a year ago';
}

module.exports = { relativeTime, getLevels };
