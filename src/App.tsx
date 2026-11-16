import { useEffect, useState } from 'react'
import { SettingsProvider } from './settings/SettingsProvider'
import { useStore } from './store/useStore'
import { Sidebar } from './components/Sidebar'
import { MainView } from './components/MainView'
import { todayStr } from './utils/date'
import type { View } from './types'
import './App.css'

const VIEW_KEY = 'things-lite:view'

function loadView(): View {
  try {
    const raw = localStorage.getItem(VIEW_KEY)
    if (raw) return JSON.parse(raw) as View
  } catch {
    // ignore
  }
  return { type: 'today' }
}

function Layout() {
  const store = useStore()
  const [rawView, setView] = useState<View>(loadView)
  const [today, setToday] = useState(todayStr)
  const [menuOpen, setMenuOpen] = useState(false)

  // Fall back to Inbox if the saved project no longer exists
  const view: View =
    rawView.type === 'project' && !store.projects.some((p) => p.id === rawView.id)
      ? { type: 'inbox' }
      : rawView

  const viewJson = JSON.stringify(view)
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewJson)
  }, [viewJson])

  // Keep "today" fresh if the app stays open past midnight
  useEffect(() => {
    const id = window.setInterval(() => setToday(todayStr()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const navigate = (v: View) => {
    setView(v)
    setMenuOpen(false)
  }

  const viewKey = view.type === 'project' ? `project:${view.id}` : view.type

  return (
    <div className="layout">
      <Sidebar view={view} store={store} today={today} open={menuOpen} onNavigate={navigate} />
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <MainView
        key={viewKey}
        view={view}
        store={store}
        today={today}
        onNavigate={navigate}
        onOpenMenu={() => setMenuOpen(true)}
      />
    </div>
  )
}

function App() {
  return (
    <SettingsProvider>
      <Layout />
    </SettingsProvider>
  )
}

export default App
