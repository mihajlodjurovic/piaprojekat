# SportSphere Hub

Sistem za rezervisanje sportskih terena i hala, zakazivanje treninga, kupovinu opreme, pronalaženje saigrača i promocije.

**Studentski projekat — Programiranje internet aplikacija (ETF Beograd)**

## Tehnologije

- **Frontend:** Angular 18
- **Backend:** Express.js + Node.js (TypeScript)
- **Baza:** MongoDB (Mongoose)
- **Auth:** Plain text (korisnički ID u localStorage)

## Struktura projekta

```
NOVIPROJ/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose modeli (TypeScript)
│   │   ├── controller.ts    # JEDAN kontroler za sve endpoint-e
│   │   ├── routes.ts        # JEDAN route fajl
│   │   └── server.ts        # Glavni server fajl
│   ├── uploads/             # Upload folder (auto-kreiran)
│   ├── seed.js              # Seed skripta za demo podatke
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Sve Angular komponente (4 fajla svaka)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── reset-password/
│   │   │   │   ├── home/
│   │   │   │   ├── facility-details/
│   │   │   │   ├── athlete/
│   │   │   │   ├── employee/
│   │   │   │   └── admin/
│   │   │   ├── services/    # ApiService (JEDAN centralni servis)
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   ├── styles.css       # Globalni CSS
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
└── README.md
```

## Pokretanje

### 1. MongoDB

MongoDB mora biti pokrenut na `localhost:27017` (default port).

### 2. Backend

```bash
cd backend
npm install
npm run build    # Kompajlira TypeScript
npm run seed     # Popuni bazu demo podacima
npm start        # Pokreće server na portu 4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start       # Pokreće Angular dev server na portu 4200
```

Otvori `http://localhost:4200` u browseru.

## Demo nalozi

| Uloga      | Username    | Lozinka   |
|------------|-------------|-----------|
| Admin      | `admin`     | `Lozinka1!` |
| Sportista  | `sportista1`| `Lozinka1!` |
| Sportista  | `sportista2`| `Lozinka1!` |
| Sportista  | `sportista3`| `Lozinka1!` |
| Zaposleni  | `zaposleni1`| `Lozinka1!` |
| Zaposleni  | `zaposleni2`| `Lozinka1!` |

## Admin ruta (skrivena)

Admin panel se nalazi na: `/system-admin-2025`

Nije linkovan sa početne strane niti vidljiv u meniju — pristupa se direktnim unosom URL-a.

## Napomene

- Backend server pokreće se na `http://localhost:4000`
- Frontend šalji API pozive na `http://localhost:4000/api`
- Auth: korisnički objekat se čuva u localStorage (bez JWT)
- Lozinke se čuvaju kao plain text (studentski projekat, ne produkcija)
- Seed skripta briše sve postojeće podatke pre popunjavanja
- Profilna slika se može otpremiti sa diska ili generisati preko DiceBear API-ja
