import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { SettingsContext, type SettingsValue } from './SettingsContext'
import { translations } from '../i18n/translations'
import type { Lang, Theme } from '../types'

const STORAGE_KEY = 'things-lite:settings'

interface Settings {
  theme: Theme
  lang: Lang
}

function loadSettings(): Settings {
  let theme: Theme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  let lang: Lang = navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { theme?: unknown; lang?: unknown }
      if (parsed.theme === 'light' || parsed.theme === 'dark') theme = parsed.theme
      if (parsed.lang === 'en' || parsed.lang === 'ru') lang = parsed.lang
    }
  } catch {
    // ignore corrupted settings
  }

  return { theme, lang }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  // Layout effect: apply theme before the browser paints to avoid a flash.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.lang = settings.lang
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const value = useMemo<SettingsValue>(
    () => ({
      ...settings,
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setLang: (lang) => setSettings((s) => ({ ...s, lang })),
      t: translations[settings.lang],
      locale: settings.lang === 'ru' ? 'ru-RU' : 'en-US',
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
