// ──────────────────────────────────────────────
// Middleware — API Key Authentication
// SHA-256 hashed keys stored in API_KEYS env var
// ──────────────────────────────────────────────

import { createHash } from 'node:crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Routes publiques qui ne nécessitent pas d'auth.
 * Peut aussi être configuré via route config: { skipAuth: true }
 */
const PUBLIC_PATHS = new Set(['/health', '/docs', '/docs/'])

/**
 * API keys hashées en SHA-256, séparées par virgules.
 * Format env : API_KEYS=sha256hash1,sha256hash2
 *
 * Pour générer un hash :
 *   echo -n "my-secret-key" | shasum -a 256 | cut -d' ' -f1
 *
 * Si API_KEYS n'est pas défini, l'auth est désactivée (dev mode).
 */
function loadApiKeys(): Set<string> {
  const raw = process.env.API_KEYS
  if (!raw) return new Set()
  return new Set(raw.split(',').map((k) => k.trim()).filter(Boolean))
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Skip auth for public paths
  if (PUBLIC_PATHS.has(request.url) || request.url.startsWith('/docs/')) {
    return
  }

  // Skip auth if route config says so
  const routeConfig = request.routeOptions?.config as unknown as Record<string, unknown> | undefined
  if (routeConfig?.skipAuth) {
    return
  }

  const apiKeys = loadApiKeys()

  // Dev mode: no API_KEYS configured → skip auth
  if (apiKeys.size === 0) {
    return
  }

  return checkApiKey(request, reply, apiKeys)
}

/**
 * Garde strict pour les données persistées (couche Dossiers) : pas de mode dev.
 * Sans API_KEYS configuré, l'accès est refusé (fail-closed) au lieu d'être ouvert.
 */
export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const apiKeys = loadApiKeys()

  if (apiKeys.size === 0) {
    return reply.status(503).send({
      error: 'AUTH_NOT_CONFIGURED',
      message: 'API_KEYS non configuré : la couche Dossiers exige une clé API',
      statusCode: 503,
    })
  }

  return checkApiKey(request, reply, apiKeys)
}

async function checkApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
  apiKeys: Set<string>,
): Promise<void> {
  const providedKey = request.headers['x-api-key'] as string | undefined

  if (!providedKey) {
    return reply.status(401).send({
      error: 'MISSING_API_KEY',
      message: 'En-tête X-API-Key requis',
      statusCode: 401,
    })
  }

  const hashedProvided = hashKey(providedKey)

  if (!apiKeys.has(hashedProvided)) {
    return reply.status(403).send({
      error: 'INVALID_API_KEY',
      message: 'Clé API invalide',
      statusCode: 403,
    })
  }
}
