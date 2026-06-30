# PropTax Engine 🇧🇪

> Belgische vastgoedfiscaliteit-rekenmotor — open source headless API (MIT)

🌐 [Français](README.md) · [English](README.en.md) · **Nederlands** · [Deutsch](README.de.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Wat is PropTax Engine?

PropTax Engine is een zelfstandige REST API die Belgische vastgoedbelastingen en -kosten berekent. Gebouwd om geïntegreerd te worden in vastgoed-CRM's (Whise, Zoho), makelaarsportalen of elk systeem dat Belgische vastgoedfiscale berekeningen nodig heeft.

**3 API-lagen**:
- **Calcul** — 7 fiscale rekenmodules (stateless, geen afhankelijkheden)
- **Documents** — DOCX/PDF-generatie vanuit JSON
- **Dossiers** — MongoDB CRUD voor vastgoeddossiers (optioneel)

**Verminderde modus**: zonder `MONGODB_URI` starten enkel de lagen Calcul en Documents. Ideaal voor een lichte deployment.

## Beschikbare rekenmodules

| Rekenmodule | Endpoint | Beschrijving |
|------------|----------|-------------|
| Registratierechten | `POST /api/v1/calcul/registration-fees` | 3 gewesten (Wallonië 12,5%/6%, Vlaanderen 12%/3%, Brussel 12,5%) |
| Huurindexering | `POST /api/v1/calcul/indexation` | Art. 1728bis — huur × (nieuwe_index / aanvangsindex) |
| Opzegtermijn huur | `POST /api/v1/calcul/notice-period` | Huur van 9 jaar, korte duur, student |
| Meerwaarde vastgoed | `POST /api/v1/calcul/capital-gains` | Speculatief < 5 jaar (16,5%), vrijstelling hoofdverblijfplaats |
| Geïndexeerd kadastraal inkomen | `POST /api/v1/calcul/cadastral-income` | Kadastraal inkomen (1975) × jaarlijkse coëfficiënt |
| Huurwaarborg | `POST /api/v1/calcul/rental-guarantee` | Wettelijke plafonds (2–3 maanden naargelang type) |
| Onroerende voorheffing | `POST /api/v1/calcul/property-tax` | Geïndexeerd KI × gewestelijk tarief + opcentiemen |

## Snel starten

### Zonder Docker

```bash
npm install
npm run dev    # Ontwikkelmodus (tsx watch)
```

### Met Docker

```bash
docker compose up -d
```

De API is beschikbaar op `http://localhost:3400`.
Swagger-documentatie: `http://localhost:3400/docs`

## Configuratie

| Variabele | Standaard | Beschrijving |
|----------|-----------|-------------|
| `PORT` | `3400` | Luisterpoort |
| `HOST` | `0.0.0.0` | Luisteradres |
| `MONGODB_URI` | — | MongoDB URI (optioneel — activeert de laag Dossiers) |
| `API_KEYS` | — | SHA-256-gehashte API-sleutels, gescheiden door komma's |
| `RATE_LIMIT_MAX` | `100` | Max. aantal verzoeken per minuut per API-sleutel |
| `LOG_LEVEL` | `info` | Logniveau (debug, info, warn, error) |

### Authenticatie

Als `API_KEYS` niet is ingesteld, is authenticatie uitgeschakeld (dev-modus).

Authenticatie inschakelen:

```bash
# Genereer de SHA-256-hash van een sleutel
echo -n "my-secret-key" | shasum -a 256 | cut -d' ' -f1

# Configureer
export API_KEYS="hash1,hash2"
```

Voeg `X-API-Key: my-secret-key` toe aan elk verzoek.

## Voorbeelden

### Registratierechten (Brussel)

```bash
curl -X POST http://localhost:3400/api/v1/calcul/registration-fees \
  -H "Content-Type: application/json" \
  -d '{
    "purchasePrice": 350000,
    "region": "bruxelles",
    "isOnlyHome": true
  }'
```

### Onroerende voorheffing

```bash
curl -X POST http://localhost:3400/api/v1/calcul/property-tax \
  -H "Content-Type: application/json" \
  -d '{
    "baseCadastralIncome": 1500,
    "fiscalYear": 2025,
    "region": "bruxelles",
    "postalCode": "1050"
  }'
```

### Huurindexering

```bash
curl -X POST http://localhost:3400/api/v1/calcul/indexation \
  -H "Content-Type: application/json" \
  -d '{
    "baseRent": 850,
    "startIndex": 110.5,
    "newIndex": 128.7,
    "leaseStartDate": "2021-09-01",
    "calculationDate": "2025-09-01"
  }'
```

### Een DOCX-document genereren

```bash
curl -X POST http://localhost:3400/api/v1/documents/property-tax-summary \
  -H "Content-Type: application/json" \
  -d '{
    "format": "docx",
    "ownerName": "Jean Dupont",
    "propertyAddress": "Rue de la Loi 42, 1000 Bruxelles",
    "postalCode": "1000",
    "region": "bruxelles",
    "baseCadastralIncome": 1500,
    "fiscalYear": 2025
  }' -o precompte-2025.docx
```

## Technische stack

- **Runtime**: Node.js 22, TypeScript strict, ESM
- **Framework**: Fastify 5
- **Validatie**: Zod
- **Database**: MongoDB 7 + Mongoose 8 (optioneel)
- **Documenten**: docx (DOCX), pdfkit (PDF)
- **Tests**: Vitest

## Tests

```bash
npm test              # Tests uitvoeren
npm run test:watch    # Watch-modus
npm run test:coverage # Met dekking
```

## Licentie

MIT © IT-Transform
