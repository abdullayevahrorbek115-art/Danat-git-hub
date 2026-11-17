# Provayderni ulash — qadam-baqadam qo'llanma

Provayder (supplier) — PUBG/Free Fire/Premium/Stars kabi xizmatlarni API orqali sotadigan xizmat. Bot u bilan ulansa: ID/username avtomatik tekshiriladi va buyurtma **avtomatik yetkaziladi**. Ulanmasa — buyurtma adminga keladi va siz qo'lda bajarasiz (bu ham ishlaydi).

## 0. Nima kerak
Provayderdan quyidagilarni oling (odatda "API hujjati / API docs" sahifasida bo'ladi):
1. **API manzili** (masalan `https://api.provayder.com/v1`)
2. **API kalit** va u **qaysi sarlavhada** yuboriladi (`Authorization: Bearer ...` yoki `X-API-Key: ...`)
3. **ID tekshirish** so'rovi: yo'l, yuboriladigan JSON, javob ko'rinishi
4. **Buyurtma** so'rovi: yo'l, yuboriladigan JSON, javob ko'rinishi
5. **O'yin kodlari** va **paket kodlari (SKU)** ro'yxati (masalan `pubgm`, `mlbb`, `premium_3`, `stars_100`)

> Cheklov: faqat oddiy JSON API ishlaydi. Imzo (MD5/HMAC) talab qiladigan yoki natijani keyin webhook bilan yuboradigan provayderlar uchun qo'shimcha kod kerak.

## 1. Admin panelda ulash
`/admin` → **🔌 Provayder** (faqat bosh adminlar).

**Ulanish bo'limi**
- 🌐 **Manzil (URL)** — API manzili.
- 🔑 **API kalit** — kalitni yuboring (xabaringiz o'chirib yuboriladi).
- ↔️ **So'rov usuli** — `POST` (ko'pchilikda) yoki `GET`.
- 🛡 **Sarlavha nomi** va **qiymati** — masalan `Authorization` va `Bearer {key}`; yoki `X-API-Key` va `{key}`. Kalit sarlavhada kerak bo'lmasa `-` yozing.

**ID tekshirish bo'limi**
- 📍 **Yo'l** — masalan `/check-id`
- 📝 **So'rov shabloni** — JSON. O'rinbosarlar: `{game}` `{player_id}` `{username}` `{kind}` `{server_id}` `{key}`
- ✅ **Muvaffaqiyat sharti** — javobdagi maydon yo'li: `success` yoki `status==ok` yoki `data.found`
- 👤 **Nik yo'li** — javobda nik qayerda: `nickname` yoki `data.name`

**Buyurtma bo'limi**
- 📍 **Yo'l** — masalan `/order`
- 📝 **So'rov shabloni** — O'rinbosarlar: `{game}` `{sku}` `{player_id}` `{username}` `{kind}` `{server_id}` `{order_id}` `{key}`
- ✅ **Muvaffaqiyat sharti**, 🧾 **Buyurtma raqami yo'li**, ⚠️ **Xato matni yo'li**

Qiymatni standartga qaytarish uchun `default` yozing.

### Misol
Provayder hujjatida shunday yozilgan bo'lsin:
```
POST https://api.provayder.com/v1/order
Header: X-API-Key: abc123
Body: {"service":"mlbb","package":"86","uid":"12345","zone":"2001"}
Javob: {"status":"ok","data":{"id":"777"}}
```
Panelda:
| Maydon | Qiymat |
|---|---|
| Manzil | `https://api.provayder.com/v1` |
| Sarlavha nomi / qiymati | `X-API-Key` / `{key}` |
| Buyurtma yo'li | `/order` |
| So'rov shabloni | `{"service":"{game}","package":"{sku}","uid":"{player_id}","zone":"{server_id}"}` |
| Muvaffaqiyat sharti | `status==ok` |
| Buyurtma raqami yo'li | `data.id` |

## 2. Sinash
Panelda **🧪 Sinash** → `mlbb 12345678 2001` (o'yin_kodi playerID [serverID]) yuboring. Bot provayderga haqiqiy so'rov yuboradi va **xom javobni** ko'rsatadi (buyurtma yuborilmaydi). Javobga qarab "Muvaffaqiyat sharti" va "Nik yo'li" ni to'g'rilang, to'g'ri bo'lguncha takrorlang.

Premium/Stars uchun: `premium @username` yoki `stars username` ko'rinishida sinang (kodni o'zingiz belgilagan provayder kodiga almashtiring).

## 3. Kodlarni kiritish
- 🎮 O'yinlar → o'yin → **🔑 Provayder kodi** (masalan `mlbb`). Premium/Stars uchun oldindan `premium` va `stars` yozilgan — provayderingiz kodiga moslang.
- 📦 Paketlar → paket → **SKU** (masalan `86`, `premium_3`, `stars_100`).
- Kodi/SKU yo'q o'yin yoki paket avtomatik **qo'lda (manual)** bo'lib qoladi.

## 4. Yoqish
⚙️ Sozlamalar → **Yetkazish rejimi** → `api`. Avval **kichik buyurtma** bilan sinab ko'ring.

## Qanday ishlaydi / xavfsizlik
- Provayder **aniq rad etsa** — pul mijozga avtomatik qaytadi.
- Javob **noaniq** bo'lsa (tarmoq xatosi, vaqt tugashi, 5xx) — pul **qaytarilmaydi**, buyurtma adminga tekshirish uchun beriladi. Avval provayder panelida buyurtma bajarilganini tekshirib, so'ng "Bajarildi" yoki "Bekor qilish" bosing.
- API kalitni `.env` ga (`PROVIDER_KEY`) ham yozish mumkin; panelda kiritilgan qiymat ustun turadi.

## Tez-tez uchraydigan xatolar
| Belgi | Sabab |
|---|---|
| "Provayder kalitni qabul qilmadi (401/403)" | Kalit yoki sarlavha nomi/qiymati noto'g'ri |
| "JSON qaytarmadi" | Manzil yoki yo'l xato (HTML sahifa qaytyapti) |
| ID doim "topilmadi" | "Muvaffaqiyat sharti" yo'li noto'g'ri — 🧪 Sinash javobiga qarang |
| So'rov shabloni noto'g'ri | JSON da qo'shtirnoq/vergul xato |
