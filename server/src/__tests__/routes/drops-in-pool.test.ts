import { describe, it, expect } from 'vitest';
import { isDropConnected, normalizeDropBaseUrl, type DropItem } from '../../../../shared/types.js';

describe('Drops "В пуле / Активен" status logic (isDropConnected)', () => {
  const coarenaDrop: DropItem = {
    id: 'coarena-free',
    providerName: 'Coarena AI',
    platform: 'custom',
    category: 'coding',
    badges: ['hot'],
    bonusTitle: '$5 / день бесплатно',
    bonusDesc: '30 RPM',
    limits: '$5/день',
    modelsAvailable: ['anthropic/claude-3-5-sonnet', 'openai/gpt-4o'],
    claimUrl: 'https://coarena.ai',
    baseUrl: 'https://coarena.ai/api/v1',
    requiresCreditCard: false,
    status: 'active',
    discoveredAt: '2026-11-14T00:00:00Z',
    lastCheckedAt: '2026-11-14T00:00:00Z',
  };

  const groqDrop: DropItem = {
    id: 'groq-cloud',
    providerName: 'Groq Cloud',
    platform: 'groq',
    category: 'llm',
    badges: ['ultra_fast'],
    bonusTitle: 'Free tier',
    bonusDesc: 'High speed',
    limits: '30 RPM',
    modelsAvailable: ['llama-3.3-70b-versatile'],
    claimUrl: 'https://console.groq.com',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresCreditCard: false,
    status: 'active',
    discoveredAt: '2026-11-14T00:00:00Z',
    lastCheckedAt: '2026-11-14T00:00:00Z',
  };

  const noPlatformDrop: DropItem = {
    id: 'open-webui-community',
    providerName: 'Community WebUI',
    category: 'llm',
    badges: ['no_card'],
    bonusTitle: 'Community proxy',
    bonusDesc: 'Shared endpoints',
    limits: '10 RPM',
    modelsAvailable: ['qwen-2.5-coder'],
    claimUrl: 'https://community.example.com',
    baseUrl: 'https://proxy.example.com/v1',
    requiresCreditCard: false,
    status: 'active',
    discoveredAt: '2026-11-14T00:00:00Z',
    lastCheckedAt: '2026-11-14T00:00:00Z',
  };

  it('does NOT mark Coarena connected when an unrelated custom key is present', () => {
    const keys = [
      {
        id: 'key-1',
        label: 'My Private vLLM Server',
        provider: 'custom',
        platform: 'custom',
        baseUrl: 'http://192.168.1.100:8000/v1',
      },
      {
        id: 'key-2',
        label: 'Ollama local',
        provider: 'custom',
        platform: 'custom',
        baseUrl: 'http://localhost:11434/v1',
      },
    ];

    expect(isDropConnected(coarenaDrop, keys)).toBe(false);
  });

  it('marks Coarena connected when key label contains [drop:coarena-free]', () => {
    const keys = [
      {
        id: 'key-coarena',
        label: 'Coarena Daily Free Key [drop:coarena-free]',
        provider: 'custom',
        platform: 'custom',
        baseUrl: 'https://custom-proxy.internal/v1',
      },
    ];

    expect(isDropConnected(coarenaDrop, keys)).toBe(true);
  });

  it('marks Coarena connected when key has matching baseUrl even without drop label', () => {
    const keys = [
      {
        id: 'key-coarena-url',
        label: 'My Custom Key without tag',
        provider: 'custom',
        platform: 'custom',
        baseUrl: 'https://coarena.ai/api/v1',
      },
    ];

    expect(isDropConnected(coarenaDrop, keys)).toBe(true);
  });

  it('normalizes baseUrl properly (stripping /v1 and trailing slashes)', () => {
    expect(normalizeDropBaseUrl('https://coarena.ai/api/v1/')).toBe('https://coarena.ai/api');
    expect(normalizeDropBaseUrl('https://coarena.ai/api/')).toBe('https://coarena.ai/api');

    const keys = [
      {
        id: 'key-coarena-slash',
        label: 'Coarena Endpoint',
        provider: 'custom',
        platform: 'custom',
        baseUrl: 'https://coarena.ai/api/',
      },
    ];

    expect(isDropConnected(coarenaDrop, keys)).toBe(true);
  });

  it('correctly marks native provider connected by platform name', () => {
    const keys = [
      {
        id: 'key-groq',
        label: 'Production Groq Key',
        provider: 'groq',
        platform: 'groq',
        baseUrl: undefined,
      },
    ];

    expect(isDropConnected(groqDrop, keys)).toBe(true);
  });

  it('marks drops without platform connected when tagged with [drop:id]', () => {
    const keysWithoutTag = [
      {
        id: 'key-generic',
        label: 'Random key',
        provider: 'custom',
        baseUrl: 'https://other-service.com/v1',
      },
    ];
    expect(isDropConnected(noPlatformDrop, keysWithoutTag)).toBe(false);

    const keysWithTag = [
      {
        id: 'key-tagged',
        label: 'Saved [drop:open-webui-community]',
        provider: 'custom',
        baseUrl: 'https://other-service.com/v1',
      },
    ];
    expect(isDropConnected(noPlatformDrop, keysWithTag)).toBe(true);
  });

  it('returns false for empty keys array or undefined drop', () => {
    expect(isDropConnected(coarenaDrop, [])).toBe(false);
  });
});
