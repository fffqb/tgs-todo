import { createContext, useContext } from 'react'
import type { Lang, Theme } from '../types'
import type { Translations } from '../i18n/translations'

export interface SettingsValue {
  theme: Theme
  lang: Lang
  setTheme: (theme: Theme) => void
  setLang: (lang: Lang) => void
  t: Translations
  locale: string
}

export const SettingsContext = createContext<SettingsValue | null>(null)

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside <SettingsProvider>')
  return value
}
