export type {
  DropStatus,
  DropCategory,
  DropAuthScheme,
  DropItem,
  DropsRadarState,
  DropKeyValidationRequest,
  DropKeyValidationResult,
} from '../../../shared/types';

export {
  normalizeDropBaseUrl,
  isDropConnected,
} from '../../../shared/types';

export type DropDifficulty =
  | '1-click'       // Без карты, достаточно Google/GitHub OAuth
  | 'email'         // Нужна почта
  | 'github-pat'    // Токен GitHub PAT
  | 'phone';        // Требуется SMS-верификация

export type DropBadge = 'hot' | 'no_card' | 'temporary' | 'ultra_fast' | 'agent_ready';

export interface DropsFeedPayload {
  schemaVersion?: number;
  updatedAt?: string;
  drops: import('../../../shared/types').DropItem[];
}
