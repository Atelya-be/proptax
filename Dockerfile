# ──────────────────────────────────────────────
# PropTax Engine — Multi-stage Docker build
# Base: Chainguard hardened Node.js (free tags: latest / latest-dev)
# ──────────────────────────────────────────────

# ── Stage 1: Build (dev image = npm + shell) ──
FROM cgr.dev/chainguard/node:latest-dev AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src/ ./src/

# Compile TS puis élague les devDependencies (tsc, vitest, pino-pretty…)
RUN npx tsc && npm prune --omit=dev --no-package-lock

# ── Stage 2: Production (runtime image = pas de npm) ──
FROM cgr.dev/chainguard/node:latest

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3400
EXPOSE 3400

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3400/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"]

ENTRYPOINT ["node"]
CMD ["dist/server.js"]
