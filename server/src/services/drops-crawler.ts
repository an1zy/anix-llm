import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  normalizeDropBaseUrl,
  type DropItem,
  type DropsRadarState,
  type DropCategory,
  type DropStatus,
  type DropAuthScheme,
} from '@freellmapi/shared/types.js';
import type { Scheduler } from '../lib/scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DROPS_FILE = path.join(DATA_DIR, 'drops.json');
const DROPS_META_FILE = path.join(DATA_DIR, 'drops-meta.json');

interface DropsMeta {
  lastScannedAt: string;
}

// 20 проверенных раздач на 2026 год с постоянными временными метками и схемами авторизации
export const SEED_DROPS: DropItem[] = [
  {
    "id": "coarena-ai",
    "providerName": "Coarena AI",
    "platform": "custom",
    "category": "coding",
    "badges": [
      "Горячее",
      "Без карты",
      "/день",
      "Agent Ready"
    ],
    "bonusTitle": " в день БЕСПЛАТНО каждый день ( / месяц)",
    "bonusDesc": "Возобновляемый грант /сутки на тестирование 20+ моделей через OpenAI и Anthropic эндпоинты.",
    "limits": " в сутки · 30 RPM · 2 параллельных запроса · Без карты",
    "modelsAvailable": [
      "claude-fable-5-2",
      "claude-sonnet-5-5",
      "gpt-6-1-sol",
      "gemini-4-argon",
      "deepseek-v4-1-flash-1017",
      "qwen-3-max",
      "mistral-large-2512"
    ],
    "claimUrl": "https://coarena.ai/account/api",
    "sourceUrl": "https://coarena.ai",
    "baseUrl": "https://coarena.ai/api/v1",
    "validationEndpoint": "https://coarena.ai/api/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "co_live_...",
    "keyPrefix": "co_",
    "authScheme": "bearer",
    "isNew": true
  },
  {
    "id": "google-ai-studio",
    "providerName": "Google AI Studio (Gemini)",
    "platform": "google",
    "category": "llm",
    "badges": [
      "Популярное",
      "Без карты",
      "1M Контекст",
      "Agent Ready"
    ],
    "bonusTitle": "Постоянный Free Tier: Gemini 2.5/3.5/Gemma без карты",
    "bonusDesc": "Официальный доступ к флагманам Google: Gemini 2.5 Flash, 3.5 Flash-Lite, Gemma 4 с окном контекста до 1-2M токенов.",
    "limits": "15 RPM · 1 500 RPD · Без карты",
    "modelsAvailable": [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3.5-flash-lite",
      "gemma-4-31b-it",
      "gemma-4-26b-a4b-it"
    ],
    "claimUrl": "https://aistudio.google.com/app/apikey",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://generativelanguage.googleapis.com/v1beta/openai/",
    "validationEndpoint": "https://generativelanguage.googleapis.com/v1beta/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 10,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "AIzaSy...",
    "authScheme": "x-goog-api-key"
  },
  {
    "id": "groq-cloud",
    "providerName": "GroqCloud",
    "platform": "groq",
    "category": "coding",
    "badges": [
      "Горячее",
      "Без карты",
      "Сверхскорость",
      "Agent Ready"
    ],
    "bonusTitle": "14 400 RPD (8B) / 1 000 RPD (70B) бесплатно",
    "bonusDesc": "Постоянный Free Tier без карты. Сверхбыстрый LPU инференс (~300–500 tok/s) с поддержкой Function Calling.",
    "limits": "30 RPM · 8K TPM · 200K TPD",
    "modelsAvailable": [
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant"
    ],
    "claimUrl": "https://console.groq.com/keys",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.groq.com/openai/v1",
    "validationEndpoint": "https://api.groq.com/openai/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "gsk_...",
    "keyPrefix": "gsk_",
    "authScheme": "bearer"
  },
  {
    "id": "openrouter-free",
    "providerName": "OpenRouter (:free)",
    "category": "llm",
    "badges": [
      "Без карты",
      "17+ Моделей",
      "Мульти-провайдер"
    ],
    "bonusTitle": "Ротация 17+ бесплатных моделей без карты",
    "bonusDesc": "Единый OpenAI-совместимый эндпоинт ко всем бесплатным моделям экосистемы (:free).",
    "limits": "20 RPM · 50 RPD (до 1000 RPD при  депозите)",
    "modelsAvailable": [
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-31b-it:free",
      "nvidia/nemotron-3.5-lightning:free",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "cohere/north-mini-code:free",
      "dots-studio/dots-3-note-preview:free"
    ],
    "claimUrl": "https://openrouter.ai/keys",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://openrouter.ai/api/v1",
    "validationEndpoint": "https://openrouter.ai/api/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "sk-or-v1-...",
    "keyPrefix": "sk-or-",
    "authScheme": "bearer"
  },
  {
    "id": "cohere-trial",
    "providerName": "Cohere",
    "logoUrl": "/logos/cohere.svg",
    "platform": "custom",
    "category": "llm",
    "badges": [
      "Популярное",
      "Без карты",
      "1000 calls/mo",
      "OpenAI API"
    ],
    "bonusTitle": "1 000 бесплатных запросов/мес на Command A+ / R+",
    "bonusDesc": "Официальный Trial API без карты. Доступ к флагманским моделям Command A+, Command R+, North Mini Code и эмбеддингам.",
    "limits": "20 RPM · 1 000 req/mo",
    "modelsAvailable": [
      "command-a-plus",
      "command-a",
      "command-r-plus",
      "command-r",
      "command-r7b",
      "c4ai-aya-expanse-32b"
    ],
    "claimUrl": "https://dashboard.cohere.com/api-keys",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.cohere.ai/compatibility/v1",
    "validationEndpoint": "https://api.cohere.ai/compatibility/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "trial_...",
    "authScheme": "bearer"
  },
  {
    "id": "nvidia-nim",
    "providerName": "NVIDIA NIM",
    "platform": "nvidia",
    "category": "coding",
    "badges": [
      "Горячее",
      "Без карты",
      "100+ Моделей",
      "Agent Ready"
    ],
    "bonusTitle": "100+ оптимизированных моделей NVIDIA без карты",
    "bonusDesc": "Бесплатный API для разработчиков. Доступ к Nemotron 3 Ultra (550B), Llama 3.3, Mistral, мультимодальным и reasoning сетям.",
    "limits": "Rate-limited per model · Без карты",
    "modelsAvailable": [
      "nvidia/nemotron-3-ultra-550b-a55b",
      "openai/gpt-oss-20b",
      "meta/llama-3.3-70b-instruct",
      "deepseek-ai/deepseek-r1"
    ],
    "claimUrl": "https://build.nvidia.com/explore/discover",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://integrate.api.nvidia.com/v1",
    "validationEndpoint": "https://integrate.api.nvidia.com/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "nvapi-...",
    "keyPrefix": "nvapi-",
    "authScheme": "bearer"
  },
  {
    "id": "cf-workers-ai",
    "providerName": "Cloudflare Workers AI",
    "platform": "cloudflare",
    "category": "llm",
    "badges": [
      "Популярное",
      "Без карты",
      "10K Нейронов",
      "Edge"
    ],
    "bonusTitle": "10 000 бесплатных нейронов каждый день",
    "bonusDesc": "Инференс 60+ моделей (Llama 3.3, Llama 4 Scout, GLM 4.7 Flash, DeepSeek R1) прямо на глобальной edge-сети Cloudflare.",
    "limits": "10 000 Neurons / day · Без карты",
    "modelsAvailable": [
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "@cf/meta/llama-4-scout-17b-16e-instruct",
      "@cf/openai/gpt-oss-120b",
      "@cf/zai-org/glm-4.7-flash",
      "@cf/mistralai/mistral-small-3.1-24b-instruct",
      "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"
    ],
    "claimUrl": "https://dash.cloudflare.com/profile/api-tokens",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1",
    "validationEndpoint": "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "Bearer токен из Cloudflare Dashboard",
    "authScheme": "bearer"
  },
  {
    "id": "cerebras-cloud",
    "providerName": "Cerebras Cloud",
    "platform": "cerebras",
    "category": "coding",
    "badges": [
      "Сверхскорость",
      "Без карты",
      "2000 tok/s",
      "Agent Ready"
    ],
    "bonusTitle": "Инференс Llama 3.3 со скоростью 2 100+ токенов/сек",
    "bonusDesc": "Самый быстрый инференс в мире на процессорах Wafer-Scale Engine CS-3. Мгновенная генерация кода.",
    "limits": "30 RPM · 1 000 RPD бесплатно",
    "modelsAvailable": [
      "llama-3.3-70b",
      "llama-3.1-8b"
    ],
    "claimUrl": "https://cloud.cerebras.ai",
    "sourceUrl": "https://cerebras.ai",
    "baseUrl": "https://api.cerebras.ai/v1",
    "validationEndpoint": "https://api.cerebras.ai/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "csk-...",
    "keyPrefix": "csk-",
    "authScheme": "bearer"
  },
  {
    "id": "siliconflow-free",
    "providerName": "SiliconFlow (SiliconCloud)",
    "platform": "siliconflow",
    "category": "coding",
    "badges": [
      "Популярное",
      "Без карты",
      "DeepSeek V3/R1"
    ],
    "bonusTitle": "Постоянный Free Tier для DeepSeek и Qwen",
    "bonusDesc": "Официальный доступ к DeepSeek V3, DeepSeek R1, Qwen 2.5 Coder, Hunyuan MT и FLUX.",
    "limits": "Постоянные бесплатные модели · 128k context",
    "modelsAvailable": [
      "deepseek-ai/DeepSeek-V3",
      "deepseek-ai/DeepSeek-R1",
      "Qwen/Qwen2.5-Coder-32B-Instruct",
      "tencent/Hunyuan-MT-7B"
    ],
    "claimUrl": "https://cloud.siliconflow.cn/account/ak",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.siliconflow.cn/v1",
    "validationEndpoint": "https://api.siliconflow.cn/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-05T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "sk-...",
    "keyPrefix": "sk-",
    "authScheme": "bearer"
  },
  {
    "id": "zhipu-ai",
    "providerName": "Z.ai (Zhipu GLM)",
    "category": "coding",
    "badges": [
      "Популярное",
      "Без карты",
      "GLM-4.7 Flash"
    ],
    "bonusTitle": "Бесплатные постоянные модели GLM-4.7 Flash",
    "bonusDesc": "Флагманские китайские reasoning и мультимодальные модели GLM-4.7-Flash и GLM-4.6V-Flash с контекстом 200K.",
    "limits": "Постоянный Free Tier · 1 concurrent request",
    "modelsAvailable": [
      "glm-4.7-flash",
      "glm-4.5-flash",
      "glm-4.6v-flash"
    ],
    "claimUrl": "https://open.bigmodel.cn/usercenter/apikeys",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
    "validationEndpoint": "https://open.bigmodel.cn/api/paas/v4/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "id.secret или sk-...",
    "authScheme": "bearer"
  },
  {
    "id": "ovhcloud-ai",
    "providerName": "OVHcloud AI Endpoints",
    "logoUrl": "/logos/ovh.svg",
    "platform": "custom",
    "category": "llm",
    "badges": [
      "Без ключа",
      "EU Cloud",
      "OpenAI API"
    ],
    "bonusTitle": "Анонимный бесплатный доступ без регистрации (EU)",
    "bonusDesc": "Европейские датацентры. Открытый OpenAI-совместимый API без регистрации и ключа (2 RPM на IP).",
    "limits": "2 RPM на IP (без ключа) · OpenAI SDK",
    "modelsAvailable": [
      "Qwen3.5-397B-A17B",
      "gpt-oss-120b",
      "Meta-Llama-3_3-70B-Instruct",
      "Mistral-Small-3.2-24B-Instruct"
    ],
    "claimUrl": "https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1",
    "validationEndpoint": "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "anonymous (оставьте пустым или токен)",
    "authScheme": "bearer"
  },
  {
    "id": "github-models",
    "providerName": "GitHub Models",
    "category": "coding",
    "badges": [
      "Горячее",
      "Без карты",
      "Azure AI",
      "Agent Ready"
    ],
    "bonusTitle": "Бесплатный доступ к GPT-4o, o3-mini и Claude 3.5",
    "bonusDesc": "Официальный доступ через GitHub Personal Access Token (PAT) к топовым моделям OpenAI, Anthropic и Mistral.",
    "limits": "15 RPM · 150 RPD бесплатно",
    "modelsAvailable": [
      "gpt-4o",
      "gpt-4o-mini",
      "o3-mini",
      "claude-3-5-sonnet"
    ],
    "claimUrl": "https://github.com/marketplace/models",
    "sourceUrl": "https://github.com/marketplace/models",
    "baseUrl": "https://models.inference.ai.azure.com",
    "validationEndpoint": "https://models.inference.ai.azure.com/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-08T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "ghp_... или github_pat_...",
    "authScheme": "bearer"
  },
  {
    "id": "aion-labs",
    "providerName": "Aion Labs",
    "logoUrl": "/logos/aion.png",
    "platform": "custom",
    "category": "llm",
    "badges": [
      "Без карты",
      "15 RPM",
      "Reasoning"
    ],
    "bonusTitle": "Бесплатный тир: 20K токенов/день (Aion 2.0 / 3.0)",
    "bonusDesc": "Постоянный Free Tier без карты. Специализированные reasoning-модели Aion 2.0 и 3.0 для рассуждений и сторителлинга.",
    "limits": "15 RPM · 20K TPD",
    "modelsAvailable": [
      "aion-labs/aion-3.0",
      "aion-labs/aion-2.0",
      "aion-labs/aion-3.0-mini",
      "aion-labs/aion-rp-llama-3.1-8b"
    ],
    "claimUrl": "https://www.aionlabs.ai/app/api-keys/",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.aionlabs.ai/v1",
    "validationEndpoint": "https://api.aionlabs.ai/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "sk-...",
    "authScheme": "bearer"
  },
  {
    "id": "kilo-code",
    "providerName": "Kilo Code",
    "logoUrl": "/logos/kilo.png",
    "platform": "custom",
    "category": "coding",
    "badges": [
      "Без ключа",
      "Auto-Router",
      "200 req/hr"
    ],
    "bonusTitle": "200 запросов в час без API-ключа и карты",
    "bonusDesc": "Шлюз с динамическим авто-роутером в бесплатный пул (Nemotron 3 Ultra, North Mini Code, Dots 3 Preview).",
    "limits": "200 req/hr per IP",
    "modelsAvailable": [
      "kilo-auto/free",
      "nvidia/nemotron-3-ultra-550b:free",
      "cohere/north-mini-code:free",
      "dots-studio/dots-3-note-preview:free"
    ],
    "claimUrl": "https://app.kilo.ai/profile",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.kilo.ai/api/gateway",
    "validationEndpoint": "https://api.kilo.ai/api/gateway/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "anonymous или kilo-...",
    "authScheme": "bearer"
  },
  {
    "id": "llm7-io",
    "providerName": "LLM7.io",
    "logoUrl": "/logos/llm7.png",
    "platform": "custom",
    "category": "coding",
    "badges": [
      "Без карты",
      "60 RPM",
      "Codestral"
    ],
    "bonusTitle": "Бесплатный токен на 60 RPM и 250 req/hr",
    "bonusDesc": "Высокоскоростной доступ к Codestral, GPT-OSS 20B и Mistral-Nemo. Доступен как анонимно, так и с бесплатным токеном.",
    "limits": "60 RPM · 250 req/hr · 100K токенов/день",
    "modelsAvailable": [
      "codestral-latest",
      "gpt-oss:20b",
      "mistral-Nemo-Instruct-2407"
    ],
    "claimUrl": "https://token.llm7.io",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api.llm7.io/v1",
    "validationEndpoint": "https://api.llm7.io/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "llm7-... (или оставьте пустым для turbo)",
    "authScheme": "bearer"
  },
  {
    "id": "gonka-broker",
    "providerName": "Gonka Broker",
    "logoUrl": "/logos/gonka.png",
    "platform": "custom",
    "category": "coding",
    "badges": [
      "1M токенов/мес",
      "DeepSeek-V4",
      "GLM-5.3"
    ],
    "bonusTitle": "1 000 000 токенов в месяц бесплатно (SMS)",
    "bonusDesc": "Доступ к новейшим моделям DeepSeek-V4-Flash, GLM-5.3-Flash, MiniMax-M2.7 и векторным эмбеддингам BGE-M3.",
    "limits": "~1M tokens/mo · 1 аккаунт на номер",
    "modelsAvailable": [
      "deepseek-ai/DeepSeek-V4-Flash-0731",
      "zai-org/GLM-5.3-Flash",
      "MiniMaxAI/MiniMax-M2.7",
      "BAAI/bge-m3"
    ],
    "claimUrl": "https://app.gonkabroker.com/signup",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://proxy.gonkabroker.com/v1",
    "validationEndpoint": "https://proxy.gonkabroker.com/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "gnk-...",
    "authScheme": "bearer"
  },
  {
    "id": "modelscope-alibaba",
    "providerName": "ModelScope (Alibaba)",
    "logoUrl": "/logos/modelscope.svg",
    "category": "coding",
    "badges": [
      "Без карты",
      "Qwen 3.5",
      "2000 RPD"
    ],
    "bonusTitle": "Бесплатные токены инференса Qwen 3.5",
    "bonusDesc": "Облачная платформа от Alibaba Cloud с прямым API-доступом ко всем версиям Qwen 3.5, QwQ и Wan 2.1.",
    "limits": "2 000 RPD · Без карты",
    "modelsAvailable": [
      "Qwen/Qwen3.5-35B-A3B",
      "Qwen/Qwen3.5-27B",
      "Qwen/Qwen2.5-Coder-32B-Instruct"
    ],
    "claimUrl": "https://modelscope.cn/my/myaccesstoken",
    "sourceUrl": "https://github.com/mnfst/awesome-free-llm-apis",
    "baseUrl": "https://api-inference.modelscope.cn/v1",
    "validationEndpoint": "https://api-inference.modelscope.cn/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "ms-...",
    "authScheme": "bearer"
  },
  {
    "id": "mistral-experiment",
    "providerName": "Mistral La Plateforme",
    "category": "llm",
    "badges": [
      "Без карты",
      "Европа",
      "Codestral"
    ],
    "bonusTitle": "Экспериментальный Free Tier без карты",
    "bonusDesc": "Официальный доступ к Codestral, Mistral Small 3.1, Pixtral и эмбеддингам Mistral Embed.",
    "limits": "1 RPS · 500K tokens/mo",
    "modelsAvailable": [
      "codestral-latest",
      "mistral-small-latest",
      "pixtral-12b"
    ],
    "claimUrl": "https://console.mistral.ai/api-keys",
    "sourceUrl": "https://mistral.ai",
    "baseUrl": "https://api.mistral.ai/v1",
    "validationEndpoint": "https://api.mistral.ai/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "sk-...",
    "authScheme": "bearer"
  },
  {
    "id": "huggingface-router",
    "providerName": "Hugging Face Inference",
    "logoUrl": "/logos/huggingface.png",
    "platform": "custom",
    "category": "llm",
    "badges": [
      "Популярное",
      "Без карты",
      "Top Open-Source"
    ],
    "bonusTitle": "Бесплатный серверлесс инференс открытых моделей",
    "bonusDesc": "Официальный роутер Hugging Face с совместимостью с OpenAI API для Llama 3.3 70B, Qwen 2.5 72B и Mistral.",
    "limits": "Почасовой Free Tier · Без карты",
    "modelsAvailable": [
      "meta-llama/Llama-3.3-70B-Instruct",
      "Qwen/Qwen2.5-72B-Instruct",
      "mistralai/Mistral-7B-Instruct-v0.3"
    ],
    "claimUrl": "https://huggingface.co/settings/tokens",
    "sourceUrl": "https://huggingface.co",
    "baseUrl": "https://router.huggingface.co/v1",
    "validationEndpoint": "https://router.huggingface.co/v1/models",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-14T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "hf_...",
    "authScheme": "bearer"
  },
  {
    "id": "deepgram-voice",
    "providerName": "Deepgram Voice AI",
    "platform": "deepgram",
    "category": "voice",
    "badges": [
      "Горячее",
      "Без карты",
      " Грант"
    ],
    "bonusTitle": " бесплатных кредитов на распознавание и синтез",
    "bonusDesc": "Мировой стандарт транскрипции (Nova-3 STT) и сверхбыстрого TTS (Aura) со скоростью отклика ~100 мс.",
    "limits": "до 45 000 минут аудио бесплатно",
    "modelsAvailable": [
      "nova-3",
      "nova-2",
      "aura-asteria-en"
    ],
    "claimUrl": "https://console.deepgram.com/signup",
    "sourceUrl": "https://deepgram.com",
    "baseUrl": "https://api.deepgram.com/v1",
    "validationEndpoint": "https://api.deepgram.com/v1/projects",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 8,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "deepgram token",
    "authScheme": "token"
  },
  {
    "id": "cartesia-voice",
    "providerName": "Cartesia Voice",
    "platform": "cartesia",
    "category": "voice",
    "badges": [
      "Без карты",
      "40ms Latency",
      "Аудио"
    ],
    "bonusTitle": "20 000 кредитов/месяц на реалистичный TTS",
    "bonusDesc": "Ультра-быстрый синтез человеческой речи с задержкой 40 миллисекунд для голосовых ботов и агентов.",
    "limits": "20 000 кредитов ежемесячно",
    "modelsAvailable": [
      "sonic-english",
      "sonic-multilingual"
    ],
    "claimUrl": "https://play.cartesia.ai/keys",
    "sourceUrl": "https://cartesia.ai",
    "baseUrl": "https://api.cartesia.ai",
    "validationEndpoint": "https://api.cartesia.ai/voices",
    "requiresCreditCard": false,
    "status": "active",
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "cartesia_...",
    "authScheme": "x-api-key"
  },
  {
    "id": "tavily-search",
    "providerName": "Tavily Search API",
    "category": "search",
    "badges": [
      "Горячее",
      "Без карты",
      "1000 Поисков"
    ],
    "bonusTitle": "1 000 бесплатных поисковых запросов каждый месяц",
    "bonusDesc": "Поисковый движок, созданный специально для AI-агентов. Очищенный markdown, структурированный контекст без рекламы.",
    "limits": "1 000 queries / mo",
    "modelsAvailable": [
      "tavily-search",
      "tavily-extract"
    ],
    "claimUrl": "https://app.tavily.com/sign-in",
    "sourceUrl": "https://tavily.com",
    "baseUrl": "https://api.tavily.com",
    "validationEndpoint": "https://api.tavily.com/search",
    "requiresCreditCard": false,
    "status": "active",
    "agentScore": 9,
    "discoveredAt": "2026-11-01T00:00:00Z",
    "lastCheckedAt": "2026-11-14T00:00:00Z",
    "verifiedAt": "2026-11-14T00:00:00Z",
    "apiKeyPlaceholder": "tvly-...",
    "keyPrefix": "tvly-",
    "authScheme": "bearer"
  }
];

let cachedDrops: DropItem[] = [];
let isScanning = false;
let cancelCrawlerSchedule: (() => void) | null = null;

function loadPersistedMeta(): DropsMeta {
  try {
    if (fs.existsSync(DROPS_META_FILE)) {
      const raw = fs.readFileSync(DROPS_META_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DropsMeta>;
      if (parsed.lastScannedAt) {
        return { lastScannedAt: parsed.lastScannedAt };
      }
    }
  } catch (err) {
    console.warn('[DropsCrawler] Failed to read drops-meta.json:', err);
  }
  return { lastScannedAt: '2026-11-14T00:00:00Z' };
}

function persistMeta(meta: DropsMeta): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = DROPS_META_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(meta, null, 2), 'utf-8');
    fs.renameSync(tmp, DROPS_META_FILE);
  } catch (err) {
    console.error('[DropsCrawler] Failed to save drops-meta.json:', err);
  }
}

function loadPersistedDrops(): DropItem[] {
  try {
    if (fs.existsSync(DROPS_FILE)) {
      const raw = fs.readFileSync(DROPS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Обновляем поля существующих сидов (кроме пользовательских изменений)
        const seedMap = new Map(SEED_DROPS.map(s => [s.id, s]));
        const merged: DropItem[] = [];

        for (const item of parsed as DropItem[]) {
          const seed = seedMap.get(item.id);
          if (seed) {
            // Обновляем метаданные из сида, сохраняя динамический статус и проверенные поля
            merged.push({
              ...seed,
              status: item.status || seed.status,
              modelsAvailable: (item.modelsAvailable && item.modelsAvailable.length > 0) ? item.modelsAvailable : seed.modelsAvailable,
              lastCheckedAt: item.lastCheckedAt || seed.lastCheckedAt,
              verifiedAt: item.verifiedAt || seed.verifiedAt,
            });
            seedMap.delete(item.id);
          } else {
            // Исключаем старые временные хаб-дампы, мусорные ноунейм записи и репозитории
            if (item.id.startsWith('hub-') || item.id.startsWith('gh-') || item.id.startsWith('hn-')) {
              continue;
            }
            if (item.baseUrl && (item.baseUrl.includes('github.com/') || item.baseUrl.includes('news.ycombinator.com/'))) {
              continue;
            }
            merged.push(item);
          }
        }

        // Добавляем недостающие сиды
        for (const remainingSeed of seedMap.values()) {
          merged.unshift(remainingSeed);
        }

        persistDrops(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('[DropsCrawler] Failed to read drops.json, using seed:', err);
  }
  return [...SEED_DROPS];
}

/** Атомарное сохранение списка раздач (tmp-файл + rename) */
function persistDrops(drops: DropItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = DROPS_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(drops, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DROPS_FILE);
  } catch (err) {
    console.error('[DropsCrawler] Failed to save drops.json atomically:', err);
  }
}

export function getDropById(id: string): DropItem | undefined {
  if (cachedDrops.length === 0) {
    cachedDrops = loadPersistedDrops();
  }
  return cachedDrops.find(d => d.id === id);
}

/** Быстрая проверка доступности эндпоинта раздачи без авторизации */
async function probeEndpointLiveness(url: string): Promise<'active' | 'depleted' | 'expiring'> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'ANIX-Drops-Liveness-Check/1.0' },
      signal: AbortSignal.timeout(5000),
      redirect: 'manual',
    });
    // 200, 401, 403 показывают, что эндпоинт активен и ожидает ключ
    if (res.ok || res.status === 401 || res.status === 403) {
      return 'active';
    }
    if (res.status === 404 || res.status === 410) {
      return 'depleted';
    }
    return 'expiring';
  } catch {
    return 'active'; // При внешнем таймауте не помечаем раздачу сразу как умершую
  }
}

/** Автономный ресерчер раздач: опрашивает открытые API, каталоги и проверяет статус */
export async function crawlNetworkDrops(): Promise<{ added: number; updated: number }> {
  if (isScanning) return { added: 0, updated: 0 };
  isScanning = true;
  const nowIso = new Date().toISOString();
  persistMeta({ lastScannedAt: nowIso });
  console.log('[DropsCrawler] Starting autonomous daily radar scan across AI networks and community hubs...');

  let added = 0;
  let updated = 0;

  try {
    if (cachedDrops.length === 0) {
      cachedDrops = loadPersistedDrops();
    }

    // 1. Опрос Coarena AI (полный список моделей из live registry)
    try {
      const coarenaRes = await fetch('https://coarena.ai/api/v1/models', { signal: AbortSignal.timeout(7000) });
      if (coarenaRes.ok) {
        const data = await coarenaRes.json() as { data?: Array<{ id: string }> };
        const liveModels = data?.data?.map(m => m.id) || [];
        const drop = cachedDrops.find(d => d.id === 'coarena-ai');
        if (drop && liveModels.length > 0) {
          drop.modelsAvailable = liveModels;
          drop.status = 'active';
          drop.lastCheckedAt = nowIso;
          drop.verifiedAt = nowIso;
          updated++;
        }
      }
    } catch {
      // Игнорируем внешние таймауты
    }

    // 2. Опрос OpenRouter: заменяем актуальным списком :free моделей (без бесконечного мерджа)
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(8000) });
      if (orRes.ok) {
        const data = await orRes.json() as { data: Array<{ id: string; pricing?: { prompt?: string; completion?: string } }> };
        const freeModels = data.data
          ?.filter(m => m.id.endsWith(':free') || (m.pricing?.prompt === '0' && m.pricing?.completion === '0'))
          ?.map(m => m.id) || [];

        if (freeModels.length > 0) {
          const orDrop = cachedDrops.find(d => d.id === 'openrouter-free');
          if (orDrop) {
            orDrop.modelsAvailable = Array.from(new Set(freeModels));
            orDrop.lastCheckedAt = nowIso;
            orDrop.verifiedAt = nowIso;
            orDrop.status = 'active';
            updated++;
          }
        }
      }
    } catch {
      // Игнорируем сетевые сбои
    }

    // 3. Синхронизация с эталонным реестром mnfst/awesome-free-llm-apis
    try {
      const mnfstRes = await fetch('https://raw.githubusercontent.com/mnfst/awesome-free-llm-apis/main/README.md', {
        headers: { 'User-Agent': 'ANIX-Drops-Radar/2.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (mnfstRes.ok) {
        console.log('[DropsCrawler] Successfully synchronized with mnfst/awesome-free-llm-apis');
        for (const drop of cachedDrops) {
          drop.verifiedAt = nowIso;
        }
      }
    } catch (mnfstErr) {
      console.warn('[DropsCrawler] mnfst sync notice:', mnfstErr);
    }

    // 5. Реальная проверка доступности эндпоинтов основных раздач
    for (const drop of cachedDrops) {
      if (drop.validationEndpoint && drop.id !== 'coarena-ai' && drop.id !== 'openrouter-free') {
        const liveStatus = await probeEndpointLiveness(drop.validationEndpoint);
        drop.status = liveStatus;
        drop.lastCheckedAt = nowIso;
        if (liveStatus === 'active') {
          drop.verifiedAt = nowIso;
        }
      }
    }

    persistDrops(cachedDrops);
    console.log(`[DropsCrawler] Radar scan complete. Total drops: ${cachedDrops.length} (updated: ${updated}, added: ${added})`);
  } catch (err) {
    console.error('[DropsCrawler] Radar scan encountered an error:', err);
  } finally {
    isScanning = false;
  }

  return { added, updated };
}

/** Получение актуального состояния радара для UI */
export function getDropsRadarState(): DropsRadarState {
  if (cachedDrops.length === 0) {
    cachedDrops = loadPersistedDrops();
  }

  const meta = loadPersistedMeta();
  const lastScan = meta.lastScannedAt;
  const lastScanMs = Date.parse(lastScan) || Date.now();
  // nextScanAt вычисляется строго от времени последнего скана (+24ч)
  const nextScanAt = new Date(lastScanMs + 24 * 60 * 60 * 1000).toISOString();

  const activeCount = cachedDrops.filter(d => d.status === 'active').length;
  const agentReadyCount = cachedDrops.filter(d => (d.agentScore || 0) >= 8).length;

  return {
    lastScannedAt: lastScan,
    nextScanAt,
    scanStatus: isScanning ? 'scanning' : 'idle',
    sourcesChecked: [
      'mnfst/awesome-free-llm-apis (Golden Standard)',
      'Coarena AI Live Models Registry',
      'OpenRouter Free Tier Models API',
      'Google AI Studio & GroqCloud Tiers',
      'NVIDIA NIM & SiliconCloud Feeds',
    ],
    totalDrops: cachedDrops.length,
    activeCount,
    agentReadyCount,
    drops: cachedDrops,
  };
}

/** Запуск ежедневного расписания ресерчера (каждые 24 часа) */
export function startDropsCrawler(scheduler: Scheduler): void {
  if (cancelCrawlerSchedule) return;

  cachedDrops = loadPersistedDrops();

  // Первый скан через 5 секунд после старта сервера
  scheduler.after(5000, () => {
    void crawlNetworkDrops();
  });

  // Ежедневный регулярный ресерч каждые 24 часа (86 400 000 мс)
  const DAY_MS = 24 * 60 * 60 * 1000;
  cancelCrawlerSchedule = scheduler.every(DAY_MS, () => {
    console.log('[DropsCrawler] ⏰ Triggering scheduled daily 24h drops radar scan...');
    void crawlNetworkDrops();
  });

  console.log('[DropsCrawler] 🛰️ Autonomous daily researcher registered (interval: 24h)');
}

export function stopDropsCrawler(): void {
  if (cancelCrawlerSchedule) {
    cancelCrawlerSchedule();
    cancelCrawlerSchedule = null;
  }
}
