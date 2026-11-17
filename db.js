// Oddiy JSON-fayl ma'lumotlar bazasi (data/db.json).
// Kichik va o'rta botlar uchun yetarli. Katta oqim bo'lsa SQLite/PostgreSQL ga o'tkazing.
const fs = require("fs");
const path = require("path");

// Doimiy disk ulangan bo'lsa, DATA_DIR orqali uning yo'lini bering (masalan /data)
const FILE = path.join(process.env.DATA_DIR || path.join(__dirname, "data"), "db.json");

const defaults = () => ({
  settings: {
    cardNumber: "0000 0000 0000 0000",
    cardOwner: "Ism Familiya",
    contact: "@admin",
    welcome:
      "Xush kelibsiz! Bu yerda o'yinlar uchun tez va ishonchli donat qilishingiz mumkin.",
    minTopup: 5000,
    providerMode: "manual", // manual | api
    buttons: [], // maxsus menyu tugmalari { id, label, type: "text"|"link", content }
    provider: {}, // provayder sozlamalari (panel → Provayder)
    admins: [], // panel orqali qo'shilgan adminlar (Telegram ID)
    refBonus: 0, // taklif qilgan foydalanuvchiga bonus (so'm), 0 = o'chiq
    requiredChannels: [], // majburiy obuna kanallari (@username)
    ordersChat: "", // buyurtma xabarlari boradigan guruh/kanal (ID yoki @username)
  },
  games: [
    { id: 1, name: "PUBG Mobile", emoji: "🔫", needsServer: false, active: true, providerCode: "" },
    { id: 2, name: "Free Fire", emoji: "🔥", needsServer: false, active: true, providerCode: "" },
    { id: 3, name: "Mobile Legends", emoji: "⚔️", needsServer: true, active: true, providerCode: "" },
    { id: 4, name: "Standoff 2", emoji: "🎯", needsServer: false, active: true, providerCode: "" },
  ],
  packages: [], // { id, gameId, name, price, active, sku }
  users: {}, // { id, name, username, balance, joined }
  orders: [],
  topups: [],
  promos: [], // { code, amount, maxUses, usedBy: [], active }
  seq: { game: 4, pkg: 0, order: 0, topup: 0 },
  migrated: {},
});

// Telegram xizmatlari: kind = "premium" | "stars" (oddiy o'yin: kind yo'q yoki "game").
// Narxlar — NAMUNA, admin paneldan o'zingizning narxingizga o'zgartiring.
const TG_SEED = [
  { kind: "premium", name: "Telegram Premium", emoji: "⭐️", pkgs: [["3 oy", 150000, "premium_3"], ["6 oy", 200000, "premium_6"], ["12 oy", 360000, "premium_12"]] },
  { kind: "stars", name: "Telegram Stars", emoji: "🌟", pkgs: [["50 Stars", 15000, "stars_50"], ["100 Stars", 28000, "stars_100"], ["250 Stars", 70000, "stars_250"], ["500 Stars", 135000, "stars_500"], ["1000 Stars", 265000, "stars_1000"]] },
];

// Mavjud bazaga ham bir marta Premium/Stars qo'shadi (admin o'chirsa, qayta paydo bo'lmaydi)
function migrate(d) {
  if (d.migrated.tgServices) return false;
  for (const s of TG_SEED) {
    if (d.games.some((g) => g.kind === s.kind)) continue;
    const gid = (d.seq.game = (d.seq.game || 0) + 1);
    d.games.push({ id: gid, name: s.name, emoji: s.emoji, kind: s.kind, needsServer: false, active: true, providerCode: s.kind });
    for (const [name, price, sku] of s.pkgs) {
      const pid = (d.seq.pkg = (d.seq.pkg || 0) + 1);
      d.packages.push({ id: pid, gameId: gid, name, price, active: true, sku });
    }
  }
  d.migrated.tgServices = true;
  return true;
}

function load() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const d = defaults();
  if (fs.existsSync(FILE)) {
    const saved = JSON.parse(fs.readFileSync(FILE, "utf8"));
    const merged = {
      ...d,
      ...saved,
      settings: { ...d.settings, ...saved.settings },
      seq: { ...d.seq, ...saved.seq },
      migrated: { ...d.migrated, ...saved.migrated },
    };
    if (migrate(merged)) fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));
    return merged;
  }
  migrate(d);
  fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
  return d;
}

let db = load();

const data = () => db;

function save() {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE);
}

function nextId(key) {
  db.seq[key] = (db.seq[key] || 0) + 1;
  return db.seq[key];
}

function getUser(from) {
  let created = false;
  if (!db.users[from.id]) {
    db.users[from.id] = { id: from.id, balance: 0, joined: Date.now() };
    created = true;
  }
  const u = db.users[from.id];
  u.name = [from.first_name, from.last_name].filter(Boolean).join(" ");
  u.username = from.username || "";
  if (created) save();
  return u;
}

module.exports = { data, save, nextId, getUser };
