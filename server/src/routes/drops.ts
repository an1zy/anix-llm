import { Router, Request, Response } from 'express';
import { getDropsRadarState, crawlNetworkDrops, getDropById } from '../services/drops-crawler.js';

export const dropsRouter = Router();

// GET /api/drops — возвращает все активные раздачи и статус ежедневного радара
dropsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const state = getDropsRadarState();
    res.json(state);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch drops radar state';
    res.status(500).json({ error: { message: msg } });
  }
});

// POST /api/drops/refresh — принудительный запуск сканирования сети
dropsRouter.post('/refresh', async (_req: Request, res: Response) => {
  try {
    const result = await crawlNetworkDrops();
    const state = getDropsRadarState();
    res.json({ ...state, scanResult: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Radar scan failed';
    res.status(500).json({ error: { message: msg } });
  }
});

// POST /api/drops/validate-key — безопасная SSRF-защищенная проверка API-ключа
// Принимает { dropId, apiKey }, URL берет из серверного каталога раздач,
// учитывает схему авторизации провайдера и всегда возвращает HTTP 200 { valid, upstreamStatus, message }
dropsRouter.post('/validate-key', async (req: Request, res: Response) => {
  const { dropId, apiKey } = req.body as { dropId?: string; apiKey?: string };

  if (!dropId || typeof dropId !== 'string' || !apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    res.json({ valid: false, upstreamStatus: 400, message: 'dropId и apiKey обязательны' });
    return;
  }

  const trimmedKey = apiKey.trim();
  const drop = getDropById(dropId);

  if (!drop) {
    res.json({ valid: false, upstreamStatus: 404, message: `Раздача с id '${dropId}' не найдена в каталоге` });
    return;
  }

  const endpoint = drop.validationEndpoint || drop.baseUrl;
  if (!endpoint) {
    res.json({ valid: false, upstreamStatus: 400, message: 'У данной раздачи отсутствует URL для валидации' });
    return;
  }

  // Заголовки авторизации с учетом схемы провайдера
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'ANIX-Drops-Validator/2.0',
  };

  const scheme = drop.authScheme;
  const platform = drop.platform?.toLowerCase();
  const lowerId = drop.id.toLowerCase();

  if (scheme === 'x-goog-api-key' || platform === 'google' || lowerId.includes('google')) {
    headers['x-goog-api-key'] = trimmedKey;
  } else if (scheme === 'token' || platform === 'deepgram' || lowerId.includes('deepgram')) {
    headers['Authorization'] = `Token ${trimmedKey}`;
  } else if (scheme === 'x-api-key' || platform === 'anthropic' || lowerId.includes('anthropic')) {
    headers['x-api-key'] = trimmedKey;
  } else {
    // Стандартный Bearer для OpenAI-совместимых, Groq, Mistral, NVIDIA, Coarena и др.
    headers['Authorization'] = `Bearer ${trimmedKey}`;
  }

  try {
    const upstreamRes = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(6000),
      redirect: 'manual',
    });

    if (upstreamRes.ok) {
      res.json({
        valid: true,
        upstreamStatus: upstreamRes.status,
        message: 'Ключ успешно проверен',
      });
    } else {
      res.json({
        valid: false,
        upstreamStatus: upstreamRes.status,
        message: `Провайдер отклонил ключ (HTTP ${upstreamRes.status} ${upstreamRes.statusText || ''})`.trim(),
      });
    }
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    res.json({
      valid: false,
      upstreamStatus: isTimeout ? 408 : 500,
      message: isTimeout
        ? 'Превышен таймаут проверки провайдера (6 секунд)'
        : 'Ошибка соединения с удаленным сервисом провайдера',
    });
  }
});
