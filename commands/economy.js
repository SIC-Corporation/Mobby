const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../data/economy.json');

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const data = load();
  if (!data[userId]) data[userId] = { coins: 0, lastDaily: null, inventory: [] };
  save(data);
  return data[userId];
}

function setUser(userId, userData) {
  const data = load();
  data[userId] = userData;
  save(data);
}

function addCoins(userId, amount) {
  const user = getUser(userId);
  user.coins += amount;
  setUser(userId, user);
  return user.coins;
}

function removeCoins(userId, amount) {
  const user = getUser(userId);
  if (user.coins < amount) return false;
  user.coins -= amount;
  setUser(userId, user);
  return user.coins;
}

function getLeaderboard() {
  const data = load();
  return Object.entries(data)
    .map(([id, u]) => ({ id, coins: u.coins }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10);
}

module.exports = { getUser, setUser, addCoins, removeCoins, getLeaderboard };
