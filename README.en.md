# PropTax Engine 🇧🇪

> Belgian real-estate tax calculation engine — open source headless API (MIT)

🌐 [Français](README.md) · **English** · [Nederlands](README.nl.md) · [Deutsch](README.de.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## What is PropTax Engine?

PropTax Engine is a standalone REST API that calculates Belgian real-estate taxes and fees. Built to be integrated into real-estate CRMs (Whise, Zoho), agency portals, or any system that needs Belgian property-tax calculations.

**3 API layers**:
- **Calcul** — 7 tax calculators (stateless, no dependencies)
- **Documents** — DOCX/PDF generation from JSON
- **Dossiers** — MongoDB CRUD for real-estate files (optional)

**Degraded mode**: without `MONGODB_URI`, only the Calcul and Documents layers start. Perfect for a lightweight deployment.

## Available calculators

| Calculator | Endpoint | Description |
|------------|----------|-------------|
| Registration duties | `POST /api/v1/calcul/registration-fees` | 3 regions (Wallonia 12.5%/6%, Flanders 12%/3%, Brussels 12.5%) |
| Rent indexation | `POST /api/v1/calcul/indexation` | Art. 1728bis — rent × (new_index / start_index) |
| Lease notice period | `POST /api/v1/calcul/notice-period` | 9-year lease, short-term, student |
| Real-estate capital gains | `POST /api/v1/calcul/capital-gains` | Speculative < 5 years (16.5%), primary-residence exemption |
| Indexed cadastral income | `POST /api/v1/calcul/cadastral-income` | Cadastral income (1975) × annual coefficient |
| Rental guarantee | `POST /api/v1/calcul/rental-guarantee` | Legal caps (2–3 months depending on type) |
| Property tax (précompte) | `POST /api/v1/calcul/property-tax` | Indexed cadastral income × regional rate + additional surcharges |

## Quick start

### Without Docker

```bash
npm install
npm run dev    # Development mode (tsx watch)
```

### With Docker

```bash
docker compose up -d
```

The API is available at `http://localhost:3400`.
Swagger documentation: `http://localhost:3400/docs`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3400` | Listening port |
| `HOST` | `0.0.0.0` | Listening address |
| `MONGODB_URI` | — | MongoDB URI (optional — enables the Dossiers layer) |
| `API_KEYS` | — | SHA-256 hashed API keys, comma-separated |
| `RATE_LIMIT_MAX` | `100` | Max requests per minute per API key |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |

### Authentication

If `API_KEYS` is not set, auth is disabled (dev mode).

To enable auth:

```bash
# Generate the SHA-256 hash of a key
echo -n "my-secret-key" | shasum -a 256 | cut -d' ' -f1

# Configure
export API_KEYS="hash1,hash2"
```

Include `X-API-Key: my-secret-key` in every request.

## Examples

### Registration duties (Brussels)

```bash
curl -X POST http://localhost:3400/api/v1/calcul/registration-fees \
  -H "Content-Type: application/json" \
  -d '{
    "purchasePrice": 350000,
    "region": "bruxelles",
    "isOnlyHome": true
  }'
```

### Property tax (précompte)

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

### Rent indexation

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

### Generate a DOCX document

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

## Tech stack

- **Runtime**: Node.js 22, TypeScript strict, ESM
- **Framework**: Fastify 5
- **Validation**: Zod
- **Database**: MongoDB 7 + Mongoose 8 (optional)
- **Documents**: docx (DOCX), pdfkit (PDF)
- **Tests**: Vitest

## Tests

```bash
npm test              # Run the tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## License

MIT © IT-Transform
