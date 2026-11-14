import { NavLink } from 'react-router-dom'
import { useI18n } from '@/i18n'

// Segmented modality switcher shared by the Models pages.
// Industry-standard layout: one "Models" section, modality as a tab — chat
// routing (cross-model fallback), embeddings routing (same-model,
// cross-provider fallback), and fusion (multi-model synthesis) are different
// machines behind one roof.
export function ModelsTabs() {
  const { t } = useI18n()
  const tab = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 ${
      isActive ? 'btn-volumetric-primary font-semibold' : 'btn-volumetric text-neutral-300 hover:text-white'
    }`
  return (
    <div className="inline-flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-neutral-950 p-1.5 shadow-inner [&>a]:shrink-0">
      <NavLink to="/models/chat" className={({ isActive }) => tab(isActive)}>{t('models.chatModelsTab')}</NavLink>
      <NavLink to="/models/image" className={({ isActive }) => tab(isActive)}>{t('models.imageTab')}</NavLink>
      <NavLink to="/models/video" className={({ isActive }) => tab(isActive)}>{t('models.videoTab')}</NavLink>
      <NavLink to="/models/audio" className={({ isActive }) => tab(isActive)}>{t('models.audioTab')}</NavLink>
      <NavLink to="/models/embeddings" className={({ isActive }) => tab(isActive)}>{t('models.embeddingsTab')}</NavLink>
      <NavLink to="/models/decision" className={({ isActive }) => tab(isActive)}>{t('decision.tab')}</NavLink>
      <NavLink to="/models/search" className={({ isActive }) => tab(isActive)}>{t('search.tab')}</NavLink>
      <NavLink to="/models/fusion" className={({ isActive }) => tab(isActive)}>{t('models.fusionTab')}</NavLink>
    </div>
  )
}
