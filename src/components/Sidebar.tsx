import type { Store } from '../store/useStore'
import type { View, ViewId } from '../types'
import { useSettings } from '../settings/SettingsContext'
import { VIEW_GROUPS, VIEW_META } from '../viewMeta'
import { activeCountForView, projectProgress } from '../utils/views'
import { MoonIcon, PlusIcon, ProjectPie, SunIcon } from './Icons'

interface Props {
  view: View
  store: Store
  today: string
  open: boolean
  onNavigate: (view: View) => void
}

const COUNTED: ViewId[] = ['inbox', 'today']

export function Sidebar({ view, store, today, open, onNavigate }: Props) {
  const { t, theme, setTheme, lang, setLang } = useSettings()

  const isActive = (v: View) =>
    v.type === view.type && (v.type !== 'project' || (view.type === 'project' && v.id === view.id))

  const handleNewList = () => {
    const id = store.addProject()
    onNavigate({ type: 'project', id })
  }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <nav className="sidebar-nav">
        {VIEW_GROUPS.map((group, i) => (
          <ul className="nav-group" key={i}>
            {group.map((id) => {
              const { Icon, color } = VIEW_META[id]
              const count = COUNTED.includes(id)
                ? activeCountForView(store.tasks, { type: id }, today)
                : 0
              return (
                <li key={id}>
                  <button
                    className={`nav-item${isActive({ type: id }) ? ' active' : ''}`}
                    onClick={() => onNavigate({ type: id })}
                  >
                    <Icon size={17} style={{ color }} />
                    <span className="nav-label">{t.views[id]}</span>
                    {count > 0 && <span className="nav-count">{count}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        ))}

        {store.projects.length > 0 && (
          <ul className="nav-group">
            {store.projects.map((p) => (
              <li key={p.id}>
                <button
                  className={`nav-item${isActive({ type: 'project', id: p.id }) ? ' active' : ''}`}
                  onClick={() => onNavigate({ type: 'project', id: p.id })}
                >
                  <span className="c-project">
                    <ProjectPie progress={projectProgress(store.tasks, p.id)} />
                  </span>
                  <span className="nav-label">{p.title || t.newProject}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="new-list-btn" onClick={handleNewList}>
          <PlusIcon size={16} />
          {t.newList}
        </button>

        <div className="sidebar-controls">
          <div className="lang-switch" role="group" aria-label="Language">
            {(['en', 'ru'] as const).map((l) => (
              <button
                key={l}
                className={lang === l ? 'active' : ''}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t.switchToLight : t.switchToDark}
            aria-label={theme === 'dark' ? t.switchToLight : t.switchToDark}
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
