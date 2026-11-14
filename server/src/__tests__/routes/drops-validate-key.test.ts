import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import type { Express } from 'express';
import { createApp } from '../../app.js';
import { initDb } from '../../db/index.js';
import { mintDashboardToken } from '../helpers/auth.js';

let dashToken = '';
const originalFetch = globalThis.fetch;

async function postValidate(app: Express, body: unknown) {
  const server = app.listen(0, '127.0.0.1');
  if (!server.listening) await new Promise<void>(resolve => server.once('listening', () => resolve()));
  const addr = server.address() as { port: number };

  const res = await originalFetch(`http://127.0.0.1:${addr.port}/api/drops/validate-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dashToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  server.close();
  return { status: res.status, body: data };
}

describe('POST /api/drops/validate-key', () => {
  let app: Express;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0'.repeat(64);
    initDb(':memory:');
    app = createApp();
    dashToken = mintDashboardToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects missing dropId or apiKey with HTTP 200 and upstreamStatus 400', async () => {
    const res = await postValidate(app, { dropId: '', apiKey: '' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      valid: false,
      upstreamStatus: 400,
      message: 'dropId и apiKey обязательны',
    });
  });

  it('rejects arbitrary attacker dropId (SSRF protection) with HTTP 200 and 404', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await postValidate(app, {
      dropId: 'malicious-evil-drop-id',
      apiKey: 'sk-secret-token',
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);
    expect(res.body.upstreamStatus).toBe(404);
    expect(res.body.message).toContain('не найдена в каталоге');

    // Убеждаемся, что никаких внешних запросов отправлено не было
    const outboundCalls = fetchSpy.mock.calls.filter(call => {
      const url = String(call[0]);
      return !url.includes('127.0.0.1');
    });
    expect(outboundCalls.length).toBe(0);
  });

  it('uses x-goog-api-key header for Google drop and returns valid: true on 200', async () => {
    let capturedHeaders: HeadersInit | undefined;
    let targetUrl = '';

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('127.0.0.1')) {
        return originalFetch(input, init);
      }
      targetUrl = url;
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ models: [] }), { status: 200, statusText: 'OK' });
    });

    const res = await postValidate(app, {
      dropId: 'google-ai-studio',
      apiKey: 'AIzaSyFakeGoogleApiKey123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      valid: true,
      upstreamStatus: 200,
      message: 'Ключ успешно проверен',
    });
    expect(targetUrl).toBe('https://generativelanguage.googleapis.com/v1beta/models');
    expect((capturedHeaders as Record<string, string>)?.['x-goog-api-key']).toBe('AIzaSyFakeGoogleApiKey123');
    expect((capturedHeaders as Record<string, string>)?.['Authorization']).toBeUndefined();
  });

  it('uses Authorization: Token for Deepgram drop', async () => {
    let capturedHeaders: HeadersInit | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('127.0.0.1')) {
        return originalFetch(input, init);
      }
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ projects: [] }), { status: 200 });
    });

    const res = await postValidate(app, {
      dropId: 'deepgram-voice',
      apiKey: 'deepgram-token-xyz',
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect((capturedHeaders as Record<string, string>)?.['Authorization']).toBe('Token deepgram-token-xyz');
  });

  it('uses x-api-key for Anthropic / Cartesia drop', async () => {
    let capturedHeaders: HeadersInit | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('127.0.0.1')) {
        return originalFetch(input, init);
      }
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ voices: [] }), { status: 200 });
    });

    const res = await postValidate(app, {
      dropId: 'cartesia-voice',
      apiKey: 'cartesia_test_key_456',
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect((capturedHeaders as Record<string, string>)?.['x-api-key']).toBe('cartesia_test_key_456');
    expect((capturedHeaders as Record<string, string>)?.['Authorization']).toBeUndefined();
  });

  it('uses Authorization: Bearer for standard/Coarena drop', async () => {
    let capturedHeaders: HeadersInit | undefined;
    let targetUrl = '';

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('127.0.0.1')) {
        return originalFetch(input, init);
      }
      targetUrl = url;
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    });

    const res = await postValidate(app, {
      dropId: 'coarena-ai',
      apiKey: 'sk-coarena-test-key',
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(targetUrl).toBe('https://coarena.ai/api/v1/models');
    expect((capturedHeaders as Record<string, string>)?.['Authorization']).toBe('Bearer sk-coarena-test-key');
  });

  it('does NOT return HTTP 401 when upstream rejects key, preventing session teardown', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('127.0.0.1')) {
        return originalFetch(input, init);
      }
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    const res = await postValidate(app, {
      dropId: 'groq-cloud',
      apiKey: 'gsk_invalid_or_expired_key',
    });

    // Критично: HTTP статус ответа роута должен быть 200, а не 401!
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      valid: false,
      upstreamStatus: 401,
      message: 'Провайдер отклонил ключ (HTTP 401 Unauthorized)',
    });
  });

  it('handles provider timeout gracefully with HTTP 200 and upstreamStatus 408', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('127.0.0.1')) {
        return originalFetch(input, init);
      }
      const err = new Error('The operation was aborted');
      err.name = 'TimeoutError';
      throw err;
    });

    const res = await postValidate(app, {
      dropId: 'groq-cloud',
      apiKey: 'gsk_timeout_test',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      valid: false,
      upstreamStatus: 408,
      message: 'Превышен таймаут проверки провайдера (6 секунд)',
    });
  });
});
