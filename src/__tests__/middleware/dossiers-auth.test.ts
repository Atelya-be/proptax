import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHash } from 'node:crypto'
import Fastify, { type FastifyInstance } from 'fastify'
import { apiKeyAuth } from '../../middleware/api-key-auth.js'
import { registerDossierRoutes } from '../../routes/dossiers.js'

const KEY = 'test-key'
const KEY_HASH = createHash('sha256').update(KEY).digest('hex')

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify()
  app.addHook('onRequest', apiKeyAuth)
  app.get('/api/v1/calcul/ping', async () => ({ ok: true }))
  await app.register(registerDossierRoutes, { prefix: '/api/v1/dossiers' })
  await app.ready()
  return app
}

describe('auth couche Dossiers', () => {
  const saved = process.env.API_KEYS
  let app: FastifyInstance

  afterEach(async () => {
    await app?.close()
    if (saved === undefined) delete process.env.API_KEYS
    else process.env.API_KEYS = saved
  })

  describe('sans API_KEYS (mode dev)', () => {
    beforeEach(async () => {
      delete process.env.API_KEYS
      app = await buildApp()
    })

    it('laisse passer les routes de calcul', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/calcul/ping' })
      expect(res.statusCode).toBe(200)
    })

    it.each([
      ['GET', '/api/v1/dossiers'],
      ['GET', '/api/v1/dossiers/507f1f77bcf86cd799439011'],
      ['POST', '/api/v1/dossiers'],
      ['PATCH', '/api/v1/dossiers/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/v1/dossiers/507f1f77bcf86cd799439011'],
      ['POST', '/api/v1/dossiers/507f1f77bcf86cd799439011/calculations'],
    ] as const)('refuse %s %s (503, fail-closed)', async (method, url) => {
      const res = await app.inject({ method, url, payload: method === 'GET' || method === 'DELETE' ? undefined : {} })
      expect(res.statusCode).toBe(503)
      expect(res.json().error).toBe('AUTH_NOT_CONFIGURED')
    })
  })

  describe('avec API_KEYS', () => {
    beforeEach(async () => {
      process.env.API_KEYS = KEY_HASH
      app = await buildApp()
    })

    it('refuse sans clé (401)', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/dossiers' })
      expect(res.statusCode).toBe(401)
    })

    it('refuse une clé invalide (403)', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/dossiers/507f1f77bcf86cd799439011',
        headers: { 'x-api-key': 'wrong' },
      })
      expect(res.statusCode).toBe(403)
    })
  })
})
