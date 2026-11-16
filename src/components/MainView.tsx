import { useState, type ReactNode } from 'react'
import type { Store } from '../store/useStore'
import type { Task, View } from '../types'
import { useSettings } from '../settings/SettingsContext'
import { VIEW_META } from '../viewMeta'
import { addDays, formatRelative, parseDate } from '../utils/date'
import { projectProgress, tasksForView } from '../utils/views'
import { TaskItem } from './TaskItem'
import { LogbookIcon, MenuIcon, PlusIcon, ProjectPie, TrashIcon } from './Icons'

interface Props {
  view: View
  store: Store
  today: string
  onNavigate: (view: View) => void
  onOpenMenu: () => void
}

export function MainView({ view, store, today, onNavigate, onOpenMenu }: Props) {
  const { t, locale } = useSettings()
  const [openId, setOpenId] = useState<string | null>(null)
  const [showLogged, setShowLogged] = useState(false)

  const project = view.type === 'project' ? store.projects.find((p) => p.id === view.id) : undefined
  const tasks = tasksForView(store.tasks, view, today)
  const unloggedCompleted =
    view.type === 'logbook' ? [] : tasks.filter((x) => x.completed && !x.logged)

  const closeTask = (id: string) => {
    const task = store.tasks.find((x) => x.id === id)
    // Like Things: an empty to-do disappears when you close it
    if (task && !task.title.trim() && !task.notes.trim()) store.deleteTask(id)
    setOpenId((cur) => (cur === id ? null : cur))
  }

  const handleLogCompleted = () => {
    if (unloggedCompleted.length === 0) return
    store.logTasks(unloggedCompleted.map((x) => x.id))
  }

  const addNew = () => {
    const defaults: Partial<Task> = (() => {
      switch (view.type) {
        case 'today':
          return { date: today, when: 'anytime' }
        case 'upcoming':
          return { date: addDays(today, 1), when: 'anytime' }
        case 'anytime':
          return { when: 'anytime' }
        case 'someday':
          return { when: 'someday' }
        case 'project':
          return { projectId: view.id, when: 'anytime' }
        default:
          return {}
      }
    })()
    setOpenId(store.addTask(defaults))
  }

  const handleDeleteProject = () => {
    if (!project) return
    if (window.confirm(t.confirmDeleteProject(project.title || t.newProject))) {
      store.deleteProject(project.id)
      onNavigate({ type: 'inbox' })
    }
  }

  const renderList = (items: Task[]) => (
    <ul className="task-list">
      {items.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          tasks={store.tasks}
          projects={store.projects}
          view={view.type}
          today={today}
          isOpen={openId === task.id}
          onOpen={setOpenId}
          onClose={closeTask}
          onToggle={store.toggleTask}
          onUpdate={store.updateTask}
          onDelete={store.deleteTask}
        />
      ))}
    </ul>
  )

  const logCompletedBtn = unloggedCompleted.length > 0 && (
    <button className="log-completed-btn" onClick={handleLogCompleted}>
      <LogbookIcon size={15} />
      <span>{t.logCompleted(unloggedCompleted.length)}</span>
    </button>
  )

  // ---------- Header ----------
  let header: ReactNode
  if (view.type === 'project') {
    header = (
      <div className="view-header">
        <span className="view-icon c-project">
          <ProjectPie progress={projectProgress(store.tasks, view.id)} size={26} />
        </span>
        <input
          className="project-title-input"
          value={project?.title ?? ''}
          placeholder={t.newProject}
          onChange={(e) => store.updateProject(view.id, { title: e.target.value })}
          autoFocus={!project?.title}
          maxLength={100}
        />
        {logCompletedBtn}
        <button
          className="icon-btn danger"
          onClick={handleDeleteProject}
          title={t.deleteProject}
          aria-label={t.deleteProject}
        >
          <TrashIcon size={17} />
        </button>
      </div>
    )
  } else {
    const { Icon, color } = VIEW_META[view.type]
    header = (
      <div className="view-header">
        <Icon size={28} className="view-icon" style={{ color }} />
        <h1 className="view-title">{t.views[view.type]}</h1>
        {logCompletedBtn}
      </div>
    )
  }

  // ---------- Body ----------
  let body: ReactNode
  if (view.type === 'upcoming') {
    const groups = new Map<string, Task[]>()
    for (const task of tasks) {
      const key = task.date ?? ''
      groups.set(key, [...(groups.get(key) ?? []), task])
    }
    body = [...groups.entries()].map(([date, items]) => (
      <section className="group" key={date}>
        <div className="date-header">
          <span className="date-num">{parseDate(date).getDate()}</span>
          <span className="date-name">{formatRelative(date, today, t, locale)}</span>
        </div>
        {renderList(items)}
      </section>
    ))
  } else if (view.type === 'anytime') {
    const loose = tasks.filter((x) => !x.projectId)
    const byProject = store.projects
      .map((p) => ({ p, items: tasks.filter((x) => x.projectId === p.id) }))
      .filter((g) => g.items.length > 0)
    body = (
      <>
        {loose.length > 0 && renderList(loose)}
        {byProject.map(({ p, items }) => (
          <section className="group" key={p.id}>
            <button
              className="group-header"
              onClick={() => onNavigate({ type: 'project', id: p.id })}
            >
              <span className="c-project">
                <ProjectPie progress={projectProgress(store.tasks, p.id)} />
              </span>
              {p.title || t.newProject}
            </button>
            {renderList(items)}
          </section>
        ))}
      </>
    )
  } else {
    body = renderList(tasks)
  }

  const loggedInProject =
    view.type === 'project'
      ? store.tasks
          .filter((x) => x.completed && x.logged && x.projectId === view.id)
          .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      : []

  const isEmpty = tasks.length === 0
  const EmptyIcon = view.type === 'project' ? null : VIEW_META[view.type].Icon

  return (
    <main className="main">
      <div className="topbar">
        <button className="icon-btn" onClick={onOpenMenu} aria-label={t.menu}>
          <MenuIcon size={20} />
        </button>
      </div>

      <div className="main-scroll">
        <div className="content">
          {header}

          {isEmpty ? (
            <div className="empty">
              {EmptyIcon ? (
                <EmptyIcon size={64} strokeWidth={1.2} />
              ) : (
                <ProjectPie progress={0} size={64} />
              )}
              <p>{t.empty[view.type]}</p>
            </div>
          ) : (
            body
          )}

          {loggedInProject.length > 0 && (
            <div className="completed-block">
              <button className="link-btn" onClick={() => setShowLogged((s) => !s)}>
                {showLogged ? t.hideLogged : t.showLogged(loggedInProject.length)}
              </button>
              {showLogged && renderList(loggedInProject)}
            </div>
          )}
        </div>
      </div>

      {view.type !== 'logbook' && (
        <button className="fab" onClick={addNew} title={t.newTodo} aria-label={t.newTodo}>
          <PlusIcon size={24} strokeWidth={2.5} />
        </button>
      )}
    </main>
  )
}
