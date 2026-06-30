# Security Policy

## Supported versions

PropTax Engine is pre-1.0. Only the latest `main` receives security fixes.

| Version | Supported |
|---------|-----------|
| `main`  | ✅        |
| < 0.1   | ❌        |

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Use GitHub's **[Private Vulnerability Reporting](https://github.com/Atelya-be/proptax/security/advisories/new)**
(Security → Advisories → Report a vulnerability). This keeps the report
confidential until a fix is released.

Please include:
- a description of the vulnerability and its impact,
- steps to reproduce (or a proof of concept),
- affected version / commit.

We aim to acknowledge reports within **5 business days** and to ship a fix
or mitigation before public disclosure, coordinated with you.

## Scope

In scope: the engine code (`src/`), the published API surface, the Docker image.

Out of scope: third-party deployments, the optional Dossiers layer when run
without authentication (`API_KEYS` unset is documented dev-mode behaviour),
and dev-only dependencies (test tooling not shipped in the runtime image).

## Disclaimer

PropTax Engine produces **indicative** tax estimates from public Belgian
reference data. It is **not** fiscal or legal advice. Regulatory figures
(rates, coefficients, surcharges) change and must be verified against the
official source before any real-world use.
