import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ExternalLink, Globe, Play, Loader2, AlertCircle, ShieldCheck, Terminal, Cpu, Info } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/page-header'
import { CopyButton } from '@/components/copy-button'
import { AgentIcon } from '@/components/agent-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import toolCatalog from '@/data/agent-tools.json'

interface ClientAnalytics {
  clientAgent: string
  requests: number
  lastSeenAt: string | null
}

interface KeyResponse {
  apiKey: string
}

interface ToolTestResult {
  success: boolean
  reason?: 'success' | 'no_keys' | 'no_tool_calls' | 'timeout' | 'provider_error'
  toolCallsValid: boolean
  model?: string
  latencyMs: number
  toolCall?: { name: string; arguments: any }
  rawText?: string
  error?: string
  fallbackNotice?: string
}

const analyticsIds: Record<string, string> = {
  claude: 'claude-code',
  codex: 'codex',
  cline: 'cline',
  continue: 'continue',
  aider: 'aider',
  opencode: 'opencode',
  goose: 'goose',
  qwen: 'qwen-code',
  roo: 'roo',
  kilo: 'kilo-code',
  crush: 'crush',
  dsh: 'deepseek-harness',
  mimo: 'mimo-code',
  atomcode: 'atomcode',
  openclaw: 'openclaw',
  hermes: 'hermes-agent',
  pi: 'pi',
  reasonix: 'reasonix',
  zcode: 'zcode',
  cursor: 'cursor',
}

const WEB_SEARCH_TOOL_KEYS: Record<string, string> = {
  claude: 'search.agentsBadgeClaude',
  codex: 'search.agentsBadgeCodex',
}

function masked(value: string): string {
  if (value.length < 12) return '••••••••'
  return `${value.slice(0, 8)}${'•'.repeat(12)}${value.slice(-4)}`
}

export default function AgentsPage() {
  const { t } = useI18n()
  const [revealKey, setRevealKey] = useState(false)
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'cline'>('claude')
  const [testingTools, setTestingTools] = useState(false)
  const [testResult, setTestResult] = useState<ToolTestResult | null>(null)

  const { data: keyData } = useQuery<KeyResponse>({
    queryKey: ['api-key'],
    queryFn: () => apiFetch('/api/settings/api-key'),
  })
  const { data: byClient = [] } = useQuery<ClientAnalytics[]>({
    queryKey: ['analytics', 'by-client', '30d'],
    queryFn: () => apiFetch('/api/analytics/by-client?range=30d'),
  })

  const seenCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const seen = new Map(byClient
    .filter(row => row.lastSeenAt && Date.parse(row.lastSeenAt) >= seenCutoff)
    .map(row => [row.clientAgent, row]))
  const origin = import.meta.env.DEV
    ? `http://${window.location.hostname}:${__SERVER_PORT__}`
    : window.location.origin
  const rawKey = keyData?.apiKey ?? 'anix-key'
  const shownKey = keyData?.apiKey
    ? (revealKey ? keyData.apiKey : masked(keyData.apiKey))
    : '…'

  async function handleTestToolCalling() {
    setTestingTools(true)
    setTestResult(null)
    try {
      const res = await apiFetch<ToolTestResult>('/api/models/test-agent-chain', {
        method: 'POST',
        body: JSON.stringify({ model: 'auto:coding' }),
      })
      setTestResult(res)
    } catch (err: unknown) {
      setTestResult({
        success: false,
        reason: 'provider_error',
        toolCallsValid: false,
        latencyMs: 0,
        error: err instanceof Error ? err.message : 'Ошибка соединения при тесте',
      })
    } finally {
      setTestingTools(false)
    }
  }

  const claudeSnippet = `export ANTHROPIC_BASE_URL="${origin}"\nexport ANTHROPIC_API_KEY="${rawKey}"\nclaude`
  const cursorSnippet = `OpenAI Base URL: ${origin}/v1\nAPI Key: ${rawKey}\nModel: auto:coding`
  const clineSnippet = `Provider: OpenAI Compatible\nBase URL: ${origin}/v1\nAPI Key: ${rawKey}\nModel ID: auto:coding`

  const getFailureDetails = (result: ToolTestResult) => {
    switch (result.reason) {
      case 'no_keys':
        return {
          title: 'Нет доступных ключей или моделей с поддержкой Tool Calling',
          hint: 'В пуле нет активных ключей с поддержкой вызова функций. Подключите Gemini, Groq, Mistral, Zhipu или Coarena во вкладке «Раздачи».',
        }
      case 'no_tool_calls':
        return {
          title: 'Модель ответила текстом вместо вызова tool_calls',
          hint: 'Модель проигнорировала JSON Schema инструментов и сгенерировала обычный текстовый ответ. Попробуйте модель с более высоким баллом для агентов.',
        }
      case 'timeout':
        return {
          title: 'Превышено время ожидания ответа провайдера (таймаут)',
          hint: 'Сервер провайдера не ответил за отведенный лимит времени. Попробуйте повторить запрос или проверьте сетевой доступ.',
        }
      case 'provider_error':
        return {
          title: 'Ошибка удаленного провайдера инференса',
          hint: 'Апстрим API вернул ошибку при выполнении генерации (исчерпан лимит, rate limit или неверная авторизация).',
        }
      default:
        return {
          title: 'Ошибка при выполнении агентского теста',
          hint: 'Проверьте статус шлюза и наличие рабочих моделей в профиле auto:coding.',
        }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Агенты и интеграции"
        description="Подключение Claude Code, Cursor, Cline, Roo Code к пулу бесплатных моделей через цепочку auto:coding"
        actions={
          <Button variant="outline" size="sm" onClick={() => setRevealKey(value => !value)} className="font-mono text-xs">
            {revealKey ? t('common.hide') : t('common.show')} {t('agents.apiKey')}
          </Button>
        }
      />

      {/* Tool Calling Diagnostics */}
      <section className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-foreground/80" />
              <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                Диагностика Tool Calling (auto:coding)
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Проверка реального вызова функций JSON Schema на активных моделях цепочки кодинга
            </p>
          </div>
          <Button
            variant="default"
            size="lg"
            onClick={handleTestToolCalling}
            disabled={testingTools}
            className="text-xs font-mono"
          >
            {testingTools ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Тестирование...
              </>
            ) : (
              <>
                <Play className="mr-1.5 size-3.5 fill-current" />
                Проверить Tool Calling
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className="mt-4 pt-4 border-t border-border">
            {testResult.toolCallsValid ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-3.5 text-xs">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Function Calling работает корректно</span>
                    <span className="font-mono text-[11px] text-muted-foreground">({testResult.latencyMs} ms)</span>
                    {testResult.model && (
                      <span className="rounded bg-emerald-500/20 dark:bg-emerald-900/40 border border-emerald-500/40 px-1.5 py-0.2 font-mono text-[10px] text-emerald-800 dark:text-emerald-300">
                        {testResult.model}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground/90 font-mono text-[11px]">
                    Вызов функции: <span className="font-semibold text-foreground">{testResult.toolCall?.name}</span> с аргументами{' '}
                    <span className="text-emerald-700 dark:text-emerald-300">{JSON.stringify(testResult.toolCall?.arguments)}</span>
                  </p>
                  {testResult.fallbackNotice && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
                      <Info className="size-3" />
                      {testResult.fallbackNotice}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              (() => {
                const details = getFailureDetails(testResult);
                return (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-3.5 text-xs">
                    <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">{details.title}</span>
                      {testResult.error && (
                        <p className="text-muted-foreground font-mono text-[11px]">{testResult.error}</p>
                      )}
                      <p className="text-muted-foreground text-[11px] mt-1">
                        {details.hint}
                      </p>
                      {testResult.rawText && (
                        <div className="mt-2 p-2 rounded bg-muted font-mono text-[10px] text-muted-foreground max-h-20 overflow-y-auto">
                          Ответ модели: {testResult.rawText}
                        </div>
                      )}
                      {testResult.fallbackNotice && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
                          <Info className="size-3" />
                          {testResult.fallbackNotice}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </section>

      {/* 1-Click Agent Setup */}
      <section className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-foreground/80" />
            <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Быстрый старт для агентов
            </h2>
          </div>
          {/* SegmentedControl для табов */}
          <SegmentedControl
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'claude' | 'cursor' | 'cline')}
            options={[
              { value: 'claude', label: 'Claude Code' },
              { value: 'cursor', label: 'Cursor IDE' },
              { value: 'cline', label: 'Cline / Roo Code' },
            ]}
          />
        </div>

        <div className="mt-4">
          {activeTab === 'claude' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Запустите в терминале перед стартом Claude Code. Запросы будут автоматически перенаправляться в проверенную цепочку <span className="font-mono text-foreground font-semibold">auto:coding</span>:
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3.5 py-2.5">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono text-xs text-foreground">
                  {claudeSnippet}
                </code>
                <CopyButton text={claudeSnippet} className="size-7 shrink-0 text-muted-foreground hover:text-foreground" label={t('common.copy')} />
              </div>
            </div>
          )}

          {activeTab === 'cursor' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                В настройках Cursor (Settings → Models → OpenAI API Key / Base URL):
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3.5 py-2.5">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono text-xs text-foreground">
                  {cursorSnippet}
                </code>
                <CopyButton text={cursorSnippet} className="size-7 shrink-0 text-muted-foreground hover:text-foreground" label={t('common.copy')} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                * Примечание: для облачных инференсов Cursor используйте локальный туннель при удаленном сервере.
              </p>
            </div>
          )}

          {activeTab === 'cline' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                В расширении Cline или Roo Code (VS Code):
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3.5 py-2.5">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono text-xs text-foreground">
                  {clineSnippet}
                </code>
                <CopyButton text={clineSnippet} className="size-7 shrink-0 text-muted-foreground hover:text-foreground" label={t('common.copy')} />
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>Единый API ключ ANIX:</span>
            <code className="font-mono text-foreground break-all">{shownKey}</code>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {toolCatalog.map(tool => {
          const traffic = seen.get(analyticsIds[tool.id] ?? tool.id)
          const endpoint = tool.baseUrlSupport === 'root' ? origin : `${origin}/v1`
          const realConnection = `BASE_URL=${endpoint}\nAPI_KEY=${rawKey}\nMODEL=auto:coding`
          const shownConnection = `BASE_URL=${endpoint}\nAPI_KEY=${shownKey}\nMODEL=auto:coding`
          const descriptionKey = `agents.descriptions.${tool.id}`
          const description = t(descriptionKey)

          return (
            <Card key={tool.id} size="sm" className="border-border bg-card text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30">
              <CardHeader>
                <AgentIcon id={tool.id} name={tool.name} className="mb-1.5" />
                <CardTitle className="text-sm text-foreground">{tool.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {description === descriptionKey
                    ? `${tool.protocol} · ${tool.baseUrlSupport}`
                    : description}
                </CardDescription>
                <CardAction>
                  {traffic && (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                      <CheckCircle2 className="size-3 mr-1" />
                      Активен
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                {WEB_SEARCH_TOOL_KEYS[tool.id] && (
                  <Badge
                    variant="outline"
                    className="h-auto w-fit whitespace-normal border-border py-0.5 text-[11px] text-muted-foreground"
                  >
                    <Globe className="size-3 mr-1" />
                    {t(WEB_SEARCH_TOOL_KEYS[tool.id])}
                  </Badge>
                )}
                <div>
                  <p className="text-xs font-medium text-foreground">{t('agents.manualLabel')}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t('agents.manualHint')}</p>
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
                    <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-[11px] text-foreground">
                      {shownConnection}
                    </code>
                    <CopyButton
                      text={realConnection}
                      className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                      label={t('common.copy')}
                    />
                  </div>
                </div>
                <a
                  href={tool.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('agents.documentation')} <ExternalLink className="size-3" />
                </a>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
