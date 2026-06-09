<p align="center">
  <img src="client/src/assets/images/logo-transparent.png" alt="FinanceTracker logo" width="200" />
</p>

<h1 align="center">💰 FinanceTracker</h1>

<p align="center">
  Sistem za pametno upravljanje osebnih financ
</p>

Spletna aplikacija za sledenje osebnim financam z avtomatsko kategorizacijo transakcij, upravljanjem budžetov, analitiko porabe in napovedovanjem denarnega toka.

---

## 📋 Kazalo

- [O projektu](#o-projektu)
- [Funkcionalnosti](#funkcionalnosti)
- [Tech Stack](#tech-stack)
- [Arhitektura projekta](#arhitektura-projekta)
- [Zasloni aplikacije](#zasloni-aplikacije)
- [REST API](#rest-api)
- [Namestitev in zagon](#namestitev-in-zagon)
- [Okoljespremenljivke](#okoljespremenljivke)
- [Testiranje](#testiranje)

---

## O projektu

FinanceTracker je full-stack spletna aplikacija, ki uporabniku pomaga razumeti, spremljati in izboljšati osebne finance. Aplikacija omogoča uvoz bančnih izpiskov (CSV), samodejno kategorizacijo transakcij, nastavitev mesečnih budžetov, pregled analitike porabe ter osnovno napovedovanje prihodnjega denarnega toka.

Namenjena je:
- **Študentom**, ki želijo nadzorovati omejen mesečni budget
- **Zaposlenim**, ki sledijo porabi in prihrankom
- **Vsakomur**, ki želi boljši nadzor nad denarjem brez kompleksnih orodij

---

## Funkcionalnosti

### Že implementirano

- 🔐 **Avtentikacija** — registracija, prijava, JWT s piškotki, pozabljeno geslo
- 🚀 **Onboarding** — vodeni postopek prve nastavitve (valuta, budget, cilji)
- 📊 **Dashboard** — pregled prihodkov, odhodkov, prihrankov in trendov
- 💳 **Transakcije** — prikaz, filtriranje, ročno urejanje, dodajanje opomb
- 📥 **Uvoz CSV** — nalaganje bančnih izpiskov z predogledom in validacijo
- 🏷️ **Kategorije** — upravljanje kategorij z barvami, ikonami in avtomatskimi pravili
- 💼 **Budžeti** — nastavitev limitov po kategorijah, progress indikatorji, predlogi
- 📈 **Analitika** — grafi trendov, primerjave po mesecih, top porabniki, vzorci porabe
- 👤 **Profil** — upravljanje uporabniških podatkov in nastavitev
- ⚙️ **Nastavitve** — tema, prikaz, obvestila

### V razvoju / Načrtovano

- 🎯 Cilji varčevanja (Goals)
- 🔁 Naročnine in ponavljajoči stroški
- 🔮 Napoved denarnega toka (Cash Flow Prediction)
- 📄 Izvoz poročil (PDF, Excel)
- 🤖 ML model za izboljšano kategorizacijo

---

## Tech Stack

### Frontend
| Tehnologija | Verzija | Namen |
|---|---|---|
| React | 19 | UI framework |
| React Router DOM | 7 | Routing |
| Vite | 8 | Build tool / dev server |

### Backend
| Tehnologija | Verzija | Namen |
|---|---|---|
| Node.js + Express | 5 | REST API strežnik |
| MongoDB + Mongoose | 9 | Podatkovna baza |
| JWT | — | Avtentikacija |
| bcryptjs | — | Hashiranje gesel |
| Multer | — | Upload datotek |
| csv-parser | — | Razčlenjevanje CSV |
| Helmet | — | Varnostne HTTP glave |
| express-validator | — | Validacija vhodnih podatkov |

### DevOps
| Tehnologija | Namen |
|---|---|
| Docker + Docker Compose | Lokalno okolje (MongoDB + Mongo Express + API) |
| Bruno | API testiranje (`.bru` kolekcija) |
| Jest | Unit testi |

---

## Arhitektura projekta

```
/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # Skupne komponente (Sidebar, TopBar, Modal, Chart ...)
│   │   ├── screens/          # Strani aplikacije
│   │   ├── context/          # React Context (Auth, App, TransactionsModal)
│   │   ├── hooks/            # Custom hooks (useAuth, useTheme, useTransactions)
│   │   ├── services/         # API klici po domenah
│   │   ├── utils/            # Pomožne funkcije in konstante
│   │   └── styles/           # CSS datoteke
│   └── index.html
│
└── server/                   # Express backend
    ├── controllers/          # Logika za vsak endpoint
    ├── routes/               # Express routerji
    ├── models/               # Mongoose sheme
    ├── middleware/           # Auth, error handling, upload
    ├── services/             # Poslovne storitve (CSV parser, kategorizator)
    ├── config/               # Konfiguracija baze
    ├── utils/                # Pomožne funkcije
    ├── tests/                # Jest unit testi
    ├── mongo/                # Začetni podatki za MongoDB
    ├── finance-sipv/         # Bruno API kolekcija
    ├── Dockerfile
    └── compose.yaml
```

---

## Zasloni aplikacije

| Pot | Zaslon | Opis |
|---|---|---|
| `/` | Landing | Javna predstavitvena stran |
| `/signup` | Registracija | Ustvarjanje računa |
| `/login` | Prijava | Obstoječi uporabniki |
| `/forgot-password` | Pozabljeno geslo | Ponastavitev dostopa |
| `/onboarding` | Onboarding | Vodena prva nastavitev |
| `/dashboard` | Dashboard | Glavni pregled financ |
| `/transactions` | Transakcije | Seznam in upravljanje transakcij |
| `/import` | Uvoz | Nalaganje CSV izpiskov |
| `/categories` | Kategorije | Upravljanje kategorij |
| `/budgets` | Budžeti | Nastavitev in pregled limitov |
| `/analytics` | Analitika | Grafi in pametni vpogledi |
| `/profile` | Profil | Uporabniški podatki |
| `/settings` | Nastavitve | Sistemske nastavitve |

---

## REST API

Osnovna pot: `http://localhost:3000`

| Prefix | Controller | Opis |
|---|---|---|
| `/auth` | authController | Registracija, prijava, odjava |
| `/category` | categoryController | CRUD kategorij |
| `/transactions` | transactionController | CRUD transakcij, filtriranje |
| `/import` | importController | Uvoz CSV, zgodovina uvozov |
| `/budgets` | budgetController | CRUD budžetov, poročila, predlogi |
| `/statements` | statementsController | Bančni izpiski |
| `/analytics` | analyticsController | Trendi, top porabniki, vzorci |
| `/user` | profileController | Profil in nastavitve |

Za testiranje API-ja je na voljo Bruno kolekcija v `server/finance-sipv/`.

---

## Namestitev in zagon

### Predpogoji

- Node.js ≥ 18
- Docker & Docker Compose

### 1. Kloniranje repozitorija

```bash
git clone <repo-url>
cd <repo-ime>
```

### 2. Zagon backenda (Docker)

```bash
cd server
cp .env.example .env
# Uredi .env po potrebi

docker compose up -d
```

Docker zažene:
- **MongoDB** na portu `27017` (z začetnimi podatki)
- **Mongo Express** na `http://localhost:8081` (GUI za bazo)
- **Express API** na `http://localhost:3000`

### 3. Zagon frontenda

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend bo dostopen na `http://localhost:5173`.

---

## Okoljespremenljivke

### `server/.env`

```env
# MongoDB
MONGO_USERNAME=root
MONGO_PASSWORD=example
MONGO_URI=mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo-db:27017

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
```

> ⚠️ Nikoli ne commitas `.env` datoteke v repozitorij!

### `client/.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## Testiranje

### Unit testi (Jest)

```bash
cd server
npm run unit-test
```

### API testiranje (Bruno)

Odpri mapo `server/finance-sipv/` v aplikaciji [Bruno](https://www.usebruno.com/) in zaženi kolekcijo.

Kolekcija vsebuje zahteve za:
- Avtentikacijo (register, login)
- Kategorije, transakcije, budžete
- Analitiko in uvoz

---

## Prispevanje

1. Ustvari novo vejo: `git checkout -b feat/ime-funkcionalnosti`
2. Commitaj spremembe: `git commit -m "feat: dodaj X"`
3. Odpri Pull Request na `main`

Upoštevaj [Conventional Commits](https://www.conventionalcommits.org/) za sporočila commitov.

---

## Licenca

Ta projekt je namenjen izobraževalnim namenom.