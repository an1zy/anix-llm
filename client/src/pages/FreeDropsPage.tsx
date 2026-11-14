import { useMemo, useState } from 'react';
import {
  ExternalLink,
  Plus,
  Check,
  Copy,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Dialog, DialogPopup, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { ProviderLogo } from '@/components/provider-logo';
import { apiFetch } from '@/lib/api';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { invalidateSearchQueries } from '@/lib/search';
import {
  type ApiKey,
  type DropItem,
  type DropsRadarState,
  type DropKeyValidationResult,
  isDropConnected,
} from '../../../shared/types';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const time = Date.parse(dateStr);
  if (isNaN(time)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSec < 60) return 'только что';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} дн назад`;
}

export default function FreeDropsPage() {
  const queryClient = useQueryClient();

  // 1. Текущие подключенные ключи в локальном хранилище
  const { data: keys = [] } = useQuery<ApiKey[]>({
    queryKey: ['keys'],
    queryFn: () => apiFetch('/api/keys'),
  });

  // 2. Данные раздач из бэкенд-сервиса
  const { data: radarState, refetch: refetchRadar } = useQuery<DropsRadarState>({
    queryKey: ['drops-radar'],
    queryFn: () => apiFetch('/api/drops'),
    staleTime: 60_000,
  });

  const drops: DropItem[] = radarState?.drops || [];

  const [isSyncing, setIsSyncing] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [onlyNoCard, setOnlyNoCard] = useState(false);
  const [onlyAgents, setOnlyAgents] = useState(false);
  const [showDepleted, setShowDepleted] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Модальное окно подключения
  const [activeDrop, setActiveDrop] = useState<DropItem | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [cloudflareAccountId, setCloudflareAccountId] = useState('');
  const [connectState, setConnectState] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Связка ключа с раздачей по dropId, baseUrl или нативной платформе
  const checkDropConnected = (drop: DropItem): boolean => isDropConnected(drop, keys);

  const triggerRefresh = async () => {
    setIsSyncing(true);
    try {
      await apiFetch('/api/drops/refresh', { method: 'POST' });
      await refetchRadar();
      toast.success('Список раздач обновлен');
    } catch {
      toast.info('Используется локальная база');
    } finally {
      setIsSyncing(false);
    }
  };

  // Подсчет счетчиков по реальным данным
  const activeCount = drops.filter(d => d.status === 'active').length;
  const agentReadyCount = drops.filter(d => (d.agentScore || 0) >= 8).length;
  const codingCount = drops.filter(d => d.category === 'coding' || (d.agentScore || 0) >= 8).length;
  const llmCount = drops.filter(d => d.category === 'llm').length;
  const voiceCount = drops.filter(d => d.category === 'voice').length;
  const searchCount = drops.filter(d => d.category === 'search').length;
  const infraCount = drops.filter(d => d.category === 'infra').length;

  const filteredDrops = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drops.filter((item) => {
      // Скрытие исчерпанных по умолчанию
      if (!showDepleted && item.status === 'depleted') return false;

      if (category !== 'all') {
        if (category === 'coding' && (item.category !== 'coding' && (item.agentScore || 0) < 8)) return false;
        if (category !== 'coding' && item.category !== category) return false;
      }
      if (onlyNoCard && (item.requiresCreditCard || item.noCreditCardRequired === false)) return false;
      if (onlyAgents && (item.agentScore || 0) < 8) return false;
      if (!q) return true;

      const title = item.bonusTitle || item.reward || '';
      const desc = item.bonusDesc || item.expiresNote || '';
      const limits = item.limits || item.rateLimits || '';
      return (
        item.providerName.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        limits.toLowerCase().includes(q) ||
        item.modelsAvailable.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [drops, category, onlyNoCard, onlyAgents, showDepleted, search]);

  const handleOpenConnect = (drop: DropItem) => {
    setActiveDrop(drop);
    setApiKeyInput('');
    setCloudflareAccountId('');
    setConnectState('idle');
    setErrorMsg('');
  };

  const handleCopyBaseUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrlId(id);
      toast.success('Base URL скопирован');
      setTimeout(() => setCopiedUrlId(null), 1500);
    } catch {
      toast.error('Не удалось скопировать Base URL в буфер обмена');
    }
  };

  const saveKeyToPool = async (isUnverified = false) => {
    if (!activeDrop || !apiKeyInput.trim()) return;

    let finalBaseUrl = activeDrop.baseUrl;
    if (finalBaseUrl.includes('{account_id}')) {
      const accId = cloudflareAccountId.trim();
      if (!accId) {
        setErrorMsg('Укажите Cloudflare Account ID');
        setConnectState('error');
        return;
      }
      finalBaseUrl = finalBaseUrl.replace('{account_id}', accId);
    }

    const keyLabel = isUnverified
      ? `[unverified] [drop:${activeDrop.id}] ${activeDrop.providerName}`
      : `[drop:${activeDrop.id}] ${activeDrop.providerName}`;

    // Если платформа нативная (например groq, mistral, zhipu) и НЕ custom
    if (activeDrop.platform && activeDrop.platform !== 'custom') {
      await apiFetch('/api/keys', {
        method: 'POST',
        body: JSON.stringify({
          platform: activeDrop.platform,
          key: apiKeyInput.trim(),
          label: keyLabel,
        }),
      });
    } else {
      // Для кастомных раздач (Coarena AI и др.) всегда используем /api/keys/custom с baseUrl и моделями
      await apiFetch('/api/keys/custom', {
        method: 'POST',
        body: JSON.stringify({
          baseUrl: finalBaseUrl,
          apiKey: apiKeyInput.trim(),
          label: keyLabel,
          models: activeDrop.modelsAvailable,
        }),
      });
    }

    setConnectState('success');
    queryClient.invalidateQueries({ queryKey: ['keys'] });
    queryClient.invalidateQueries({ queryKey: ['models'] });
    queryClient.invalidateQueries({ queryKey: ['status'] });
    invalidateSearchQueries(queryClient);

    toast.success(`${activeDrop.providerName} добавлен в пул`);
    setTimeout(() => setActiveDrop(null), 900);
  };

  const handleConfirmConnect = async () => {
    if (!activeDrop || !apiKeyInput.trim()) return;

    setConnectState('validating');
    setErrorMsg('');

    try {
      // Валидация через серверный эндпоинт по dropId
      const testRes = await apiFetch<DropKeyValidationResult>('/api/drops/validate-key', {
        method: 'POST',
        body: JSON.stringify({
          dropId: activeDrop.id,
          apiKey: apiKeyInput.trim(),
        }),
      });

      if (!testRes.valid) {
        setConnectState('error');
        setErrorMsg(testRes.message || 'Ключ отклонен провайдером');
        return; // КРИТИЧНО: не сохраняем отклоненный ключ!
      }

      await saveKeyToPool(false);
    } catch (err: unknown) {
      setConnectState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Ошибка при проверке ключа');
    }
  };

  const handleSaveWithoutVerification = async () => {
    try {
      setConnectState('validating');
      await saveKeyToPool(true);
    } catch (err: unknown) {
      setConnectState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Ошибка сохранения ключа');
    }
  };

  return (
    <div className="space-y-6">
      {/* Строгий монохромный заголовок */}
      <PageHeader
        title="Раздачи"
        description="Гранты, бесплатные квоты и эндпоинты"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={onlyAgents ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setOnlyAgents((v) => !v)}
              className="text-xs font-mono"
            >
              Для агентов ({agentReadyCount})
            </Button>
            <Button
              variant={onlyNoCard ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setOnlyNoCard((v) => !v)}
              className="text-xs font-mono"
            >
              Без карты
            </Button>
            <Button
              variant={showDepleted ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setShowDepleted((v) => !v)}
              className="text-xs font-mono"
            >
              {showDepleted ? 'Скрыть исчерпанные' : 'Показать исчерпанные'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerRefresh}
              disabled={isSyncing}
              aria-label="Обновить список раздач"
              className="text-xs font-mono"
            >
              <RefreshCw className={cn('mr-1.5 size-3.5', isSyncing && 'animate-spin')} />
              Обновить
            </Button>
          </div>
        }
      />

      {/* Панель фильтров и поиска */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={category}
          onValueChange={(v) => setCategory(v)}
          options={[
            { value: 'all', label: `Все (${activeCount})` },
            { value: 'coding', label: `Для агентов (${codingCount})` },
            { value: 'llm', label: `Текстовые (${llmCount})` },
            { value: 'voice', label: `Аудио (${voiceCount})` },
            { value: 'search', label: `Поиск (${searchCount})` },
            { value: 'infra', label: `GPU (${infraCount})` },
          ]}
        />

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Поиск по модели или провайдеру..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 h-9 font-mono text-xs border-input bg-background text-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Очистить поиск"
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Сетка карточек */}
      {filteredDrops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="font-mono text-xs">Раздачи не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDrops.map((drop) => {
            const isConnected = checkDropConnected(drop);
            const isDepleted = drop.status === 'depleted';
            const title = drop.bonusTitle || drop.reward || '';
            const desc = drop.bonusDesc || drop.expiresNote || '';
            const limits = drop.limits || drop.rateLimits || '';
            const isAgentReady = (drop.agentScore || 0) >= 8;
            const checkedTime = formatRelativeTime(drop.verifiedAt || drop.lastCheckedAt);

            return (
              <Card
                key={drop.id}
                className={cn(
                  'group flex flex-col justify-between transition-all duration-200 ease-out border-border bg-card text-card-foreground p-0 overflow-hidden hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg',
                  isConnected && 'border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-950/10 hover:border-emerald-500/60',
                  isDepleted && 'opacity-50 grayscale-[0.3]'
                )}
              >
                <div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ProviderLogo id={drop.id} name={drop.providerName} logoUrl={drop.logoUrl} className="size-9" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-xs text-foreground tracking-tight">{drop.providerName}</h3>
                            {isAgentReady && (
                              <span className="font-mono text-[9px] uppercase px-1 py-0.2 rounded border border-border bg-muted text-muted-foreground">
                                Agent
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{limits}</p>
                        </div>
                      </div>

                      {/* Индикатор статуса */}
                      <div className="flex flex-col items-end gap-1">
                        {isConnected ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
                            <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span>В пуле</span>
                          </div>
                        ) : drop.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            Активна
                          </span>
                        ) : drop.status === 'expiring' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                            Заканчивается
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted border border-border">
                            Исчерпана
                          </span>
                        )}

                        {checkedTime && (
                          <span className="text-[9px] font-mono text-muted-foreground/80 flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {checkedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Строгие бейджи */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {drop.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-block rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                        >
                          {b.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
                        </span>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 py-2 space-y-2.5 text-xs">
                    {/* Квота / Описание */}
                    <div className="rounded border border-border bg-muted/30 p-2.5 space-y-0.5">
                      <div className="font-medium text-foreground text-xs leading-snug line-clamp-1">
                        {title}
                      </div>
                      {desc && (
                        <p className="text-muted-foreground text-[11px] leading-relaxed pt-0.5 line-clamp-2">
                          {desc}
                        </p>
                      )}
                    </div>

                    {/* Модели */}
                    {drop.modelsAvailable.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5 max-h-16 overflow-y-auto">
                        {drop.modelsAvailable.map((m) => (
                          <span
                            key={m}
                            className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Base URL & Источник */}
                    <div className="space-y-1.5">
                      <div className="rounded border border-border bg-muted/20 px-2.5 py-1.5 flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground truncate select-all">
                          {drop.baseUrl}
                        </span>
                        <button
                          onClick={() => handleCopyBaseUrl(drop.id, drop.baseUrl)}
                          aria-label="Скопировать Base URL"
                          className="text-muted-foreground hover:text-foreground shrink-0 transition-colors p-0.5"
                          title="Скопировать Base URL"
                        >
                          {copiedUrlId === drop.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>

                      {drop.sourceUrl && (
                        <div className="flex justify-end pr-1">
                          <a
                            href={drop.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline"
                          >
                            <span>Источник раздачи</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-4 pt-2 border-t border-border gap-2">
                  <a
                    href={drop.claimUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'flex-1 h-8 text-xs font-mono gap-1'
                    )}
                  >
                    <span>Получить ключ</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>

                  {isConnected ? (
                    <Button
                      variant="emerald"
                      size="sm"
                      className="flex-1 h-8 text-xs font-mono cursor-default"
                      disabled
                    >
                      <CheckCircle2 className="size-3 mr-1" />
                      Активен
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenConnect(drop)}
                      disabled={isDepleted}
                      className="flex-1 h-8 text-xs font-mono gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Подключить</span>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Модальное окно подключения ключа */}
      <Dialog open={!!activeDrop} onOpenChange={(open) => !open && setActiveDrop(null)}>
        {activeDrop && (
          <DialogPopup className="max-w-md p-5 bg-card border border-border text-foreground rounded-xl shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <ProviderLogo id={activeDrop.id} name={activeDrop.providerName} logoUrl={activeDrop.logoUrl} className="size-8" />
                <div>
                  <DialogTitle className="text-sm font-semibold text-foreground">
                    {activeDrop.providerName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Подключение API ключа в роутер
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrop(null)}
                aria-label="Закрыть окно"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3.5 py-4">
              <div className="rounded border border-border bg-muted/40 p-2.5 text-xs space-y-1">
                <span className="text-muted-foreground">1. Получите ключ в консоли сервиса:</span>
                <div>
                  <a
                    href={activeDrop.claimUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-foreground hover:underline font-mono text-[11px]"
                  >
                    {activeDrop.claimUrl}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Если требуется Cloudflare Account ID */}
              {activeDrop.baseUrl.includes('{account_id}') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">
                    Cloudflare Account ID:
                  </label>
                  <Input
                    type="text"
                    placeholder="Например: a1b2c3d4e5f6..."
                    value={cloudflareAccountId}
                    onChange={(e) => setCloudflareAccountId(e.target.value)}
                    className="font-mono text-xs h-9 border-input bg-background text-foreground"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">
                  2. Вставьте API ключ:
                </label>
                <Input
                  type="password"
                  placeholder={
                    activeDrop.apiKeyPlaceholder ||
                    (activeDrop.keyPrefix ? `${activeDrop.keyPrefix}...` : 'Вставьте ваш токен...')
                  }
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="font-mono text-xs h-9 border-input bg-background text-foreground"
                  autoFocus
                />
              </div>

              {connectState === 'error' && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold">Проверка не пройдена</span>
                    <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              {connectState === 'success' && (
                <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Ключ проверен и успешно добавлен в пул</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
              <div>
                {connectState === 'error' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveWithoutVerification}
                    className="h-8 text-xs font-mono text-muted-foreground hover:text-foreground"
                  >
                    Сохранить без проверки
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveDrop(null)}
                  disabled={connectState === 'validating'}
                  className="h-8 text-xs font-mono"
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmConnect}
                  disabled={!apiKeyInput.trim() || connectState === 'validating' || connectState === 'success'}
                  className="h-8 text-xs font-mono"
                >
                  {connectState === 'validating' ? (
                    <>
                      <RefreshCw className="size-3 animate-spin mr-1.5" />
                      <span>Проверка...</span>
                    </>
                  ) : (
                    <span>Проверить и сохранить</span>
                  )}
                </Button>
              </div>
            </div>
          </DialogPopup>
        )}
      </Dialog>
    </div>
  );
}
