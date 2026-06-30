# PropTax Engine 🇧🇪

> Rechen-Engine für die belgische Immobilienbesteuerung — quelloffene Headless-API (MIT)

🌐 [Français](README.md) · [English](README.en.md) · [Nederlands](README.nl.md) · **Deutsch**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> ⚠️ **Haftungsausschluss** — PropTax Engine liefert **indikative** Steuerschätzungen auf Basis öffentlicher belgischer Referenzdaten. Dies ist **keine** Steuer- oder Rechtsberatung. Sätze, Koeffizienten und Zuschlaghundertstel ändern sich: vor jeder realen Nutzung stets mit der offiziellen Quelle (FÖD Finanzen, Vlabel, SPW Fiskalität) abgleichen.

## Was ist PropTax Engine?

PropTax Engine ist eine eigenständige REST-API, die belgische Immobiliensteuern und -gebühren berechnet. Konzipiert für die Integration in Immobilien-CRMs (Whise, Zoho), Maklerportale oder jedes System, das belgische Immobiliensteuerberechnungen benötigt.

**3 API-Schichten**:
- **Calcul** — 7 Steuerrechner (zustandslos, ohne Abhängigkeiten)
- **Documents** — DOCX/PDF-Erzeugung aus JSON
- **Dossiers** — MongoDB-CRUD für Immobilienakten (optional)

**Eingeschränkter Modus**: ohne `MONGODB_URI` starten nur die Schichten Calcul und Documents. Ideal für eine schlanke Bereitstellung.

## Verfügbare Rechner

| Rechner | Endpoint | Beschreibung |
|------------|----------|-------------|
| Registrierungsgebühren | `POST /api/v1/calcul/registration-fees` | 3 Regionen (Wallonien 12,5 %/6 %, Flandern 12 %/3 %, Brüssel 12,5 %) |
| Mietindexierung | `POST /api/v1/calcul/indexation` | Art. 1728bis — Miete × (neuer_Index / Ausgangsindex) |
| Kündigungsfrist Mietvertrag | `POST /api/v1/calcul/notice-period` | 9-Jahres-Mietvertrag, Kurzzeit, Student |
| Immobilien-Veräußerungsgewinn | `POST /api/v1/calcul/capital-gains` | Spekulativ < 5 Jahre (16,5 %), Befreiung Hauptwohnsitz |
| Indexiertes Katastereinkommen | `POST /api/v1/calcul/cadastral-income` | Katastereinkommen (1975) × jährlicher Koeffizient |
| Mietkaution | `POST /api/v1/calcul/rental-guarantee` | Gesetzliche Obergrenzen (2–3 Monate je nach Art) |
| Immobilienvorabzug (précompte) | `POST /api/v1/calcul/property-tax` | Indexiertes KE × Regionalsatz + Zuschlaghundertstel |

## Schnellstart

### Ohne Docker

```bash
npm install
npm run dev    # Entwicklungsmodus (tsx watch)
```

### Mit Docker

```bash
docker compose up -d
```

Die API ist unter `http://localhost:3400` erreichbar.
Swagger-Dokumentation: `http://localhost:3400/docs`

## Konfiguration

| Variable | Standard | Beschreibung |
|----------|----------|-------------|
| `PORT` | `3400` | Lausch-Port |
| `HOST` | `0.0.0.0` | Lausch-Adresse |
| `MONGODB_URI` | — | MongoDB-URI (optional — aktiviert die Schicht Dossiers) |
| `API_KEYS` | — | SHA-256-gehashte API-Schlüssel, durch Kommas getrennt |
| `RATE_LIMIT_MAX` | `100` | Max. Anfragen pro Minute und API-Schlüssel |
| `LOG_LEVEL` | `info` | Log-Stufe (debug, info, warn, error) |

### Authentifizierung

Wenn `API_KEYS` nicht gesetzt ist, ist die Authentifizierung deaktiviert (Dev-Modus).

Authentifizierung aktivieren:

```bash
# SHA-256-Hash eines Schlüssels erzeugen
echo -n "my-secret-key" | shasum -a 256 | cut -d' ' -f1

# Konfigurieren
export API_KEYS="hash1,hash2"
```

Füge `X-API-Key: my-secret-key` in jede Anfrage ein.

## Beispiele

### Registrierungsgebühren (Brüssel)

```bash
curl -X POST http://localhost:3400/api/v1/calcul/registration-fees \
  -H "Content-Type: application/json" \
  -d '{
    "purchasePrice": 350000,
    "region": "bruxelles",
    "isOnlyHome": true
  }'
```

### Immobilienvorabzug (précompte)

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

### Mietindexierung

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

### Ein DOCX-Dokument erzeugen

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

## Technologie-Stack

- **Laufzeit**: Node.js 22, TypeScript strict, ESM
- **Framework**: Fastify 5
- **Validierung**: Zod
- **Datenbank**: MongoDB 7 + Mongoose 8 (optional)
- **Dokumente**: docx (DOCX), pdfkit (PDF)
- **Tests**: Vitest

## Tests

```bash
npm test              # Tests ausführen
npm run test:watch    # Watch-Modus
npm run test:coverage # Mit Abdeckung
```

## Lizenz

MIT © IT-Transform
