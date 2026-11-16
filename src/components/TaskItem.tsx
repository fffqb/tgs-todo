import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { Project, Task, ViewKind } from '../types'
import { useSettings } from '../settings/SettingsContext'
import { addDays, formatRelative, formatShort, toDateStr } from '../utils/date'
import { projectProgress } from '../utils/views'
import { Checkbox } from './Checkbox'
import { Dropdown } from './Dropdown'
import {
  BoxIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  InboxIcon,
  MoveIcon,
  NotesIcon,
  ProjectPie,
  StarIcon,
  TrashIcon,
} from './Icons'

interface Props {
  task: Task
  tasks: Task[]
  projects: Project[]
  view: ViewKind
  today: string
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: (id: string) => void
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function TaskItem({
  task,
  tasks,
  projects,
  view,
  today,
  isOpen,
  onOpen,
  onClose,
  onToggle,
  onUpdate,
  onDelete,
}: Props) {
  const { t, locale } = useSettings()
  const cardRef = useRef<HTMLLIElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Close the expanded card on outside click / Escape
  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose(task.id)
    }
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose(task.id)
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, task.id])

  // Auto-grow notes textarea
  useEffect(() => {
    const el = notesRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [task.notes, isOpen])

  const handleCheck = () => {
    onToggle(task.id)
  }

  const checked = task.completed
  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : undefined
  const isTodayTask = task.date !== null && task.date <= today
  const isOverdue = task.date !== null && task.date < today

  const update = (patch: Partial<Task>) => onUpdate(task.id, patch)

  const setProject = (projectId: string | null) => {
    update({
      projectId,
      when: projectId && task.when === 'inbox' ? 'anytime' : task.when,
    })
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onClose(task.id)
  }

  // ---------- Expanded card ----------
  if (isOpen) {
    return (
      <li className="task-card" ref={cardRef}>
        <div>
          <div className="task-card-row">
            <Checkbox checked={checked} onChange={handleCheck} label={t.complete} />
            <input
              className="task-title-input"
              value={task.title}
              placeholder={t.newTodo}
              onChange={(e) => update({ title: e.target.value })}
              onKeyDown={handleTitleKeyDown}
              maxLength={300}
              autoFocus
            />
          </div>

          <textarea
            ref={notesRef}
            className="task-notes"
            value={task.notes}
            placeholder={t.notes}
            onChange={(e) => update({ notes: e.target.value })}
            rows={1}
          />

          <div className="task-card-footer">
            <div className="chips">
              {task.date && (
                <span className={`chip${isOverdue ? ' overdue' : ''}`}>
                  {isTodayTask ? (
                    <StarIcon size={13} className="c-today" />
                  ) : (
                    <CalendarIcon size={13} className="c-upcoming" />
                  )}
                  {formatRelative(task.date, today, t, locale)}
                  <button
                    className="chip-clear"
                    onClick={() => update({ date: null, when: 'anytime' })}
                    aria-label={t.clear}
                  >
                    <CloseIcon size={11} />
                  </button>
                </span>
              )}
              {!task.date && task.when === 'someday' && (
                <span className="chip">
                  <BoxIcon size={13} className="c-someday" />
                  {t.someday}
                  <button
                    className="chip-clear"
                    onClick={() => update({ when: 'anytime' })}
                    aria-label={t.clear}
                  >
                    <CloseIcon size={11} />
                  </button>
                </span>
              )}
              {project && (
                <span className="chip">
                  <ProjectPie progress={projectProgress(tasks, project.id)} size={12} />
                  {project.title || t.newProject}
                </span>
              )}
            </div>

            <div className="card-actions">
              <Dropdown
                align="right"
                renderTrigger={({ open, toggle }) => (
                  <button
                    className={`icon-btn${open ? ' active' : ''}`}
                    onClick={toggle}
                    title={t.when}
                    aria-label={t.when}
                  >
                    <CalendarIcon size={16} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="menu">
                    <div className="menu-title">{t.when}</div>
                    <button
                      className="menu-item"
                      onClick={() => {
                        update({ date: today, when: 'anytime' })
                        close()
                      }}
                    >
                      <StarIcon size={15} className="c-today" />
                      {t.today}
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        update({ date: addDays(today, 1), when: 'anytime' })
                        close()
                      }}
                    >
                      <CalendarIcon size={15} className="c-upcoming" />
                      {t.tomorrow}
                    </button>
                    <label className="menu-item menu-date">
                      <CalendarIcon size={15} />
                      <input
                        type="date"
                        value={task.date ?? ''}
                        aria-label={t.pickDate}
                        onChange={(e) => {
                          if (e.target.value) update({ date: e.target.value, when: 'anytime' })
                        }}
                      />
                    </label>
                    <button
                      className="menu-item"
                      onClick={() => {
                        update({ date: null, when: 'someday' })
                        close()
                      }}
                    >
                      <BoxIcon size={15} className="c-someday" />
                      {t.someday}
                    </button>
                    {(task.date || task.when === 'someday') && (
                      <>
                        <div className="menu-sep" />
                        <button
                          className="menu-item"
                          onClick={() => {
                            update({ date: null, when: 'anytime' })
                            close()
                          }}
                        >
                          <CloseIcon size={15} />
                          {t.clear}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Dropdown>

              <Dropdown
                align="right"
                renderTrigger={({ open, toggle }) => (
                  <button
                    className={`icon-btn${open ? ' active' : ''}`}
                    onClick={toggle}
                    title={t.project}
                    aria-label={t.project}
                  >
                    <MoveIcon size={16} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="menu">
                    <div className="menu-title">{t.project}</div>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setProject(null)
                        close()
                      }}
                    >
                      <InboxIcon size={15} />
                      {t.noProject}
                      {!task.projectId && <CheckIcon size={14} className="menu-check" />}
                    </button>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        className="menu-item"
                        onClick={() => {
                          setProject(p.id)
                          close()
                        }}
                      >
                        <ProjectPie progress={projectProgress(tasks, p.id)} size={14} />
                        <span className="menu-item-text">{p.title || t.newProject}</span>
                        {task.projectId === p.id && <CheckIcon size={14} className="menu-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              <button
                className="icon-btn danger"
                onClick={() => onDelete(task.id)}
                title={t.deleteTask}
                aria-label={t.deleteTask}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </li>
    )
  }

  // ---------- Collapsed row ----------
  const showStar = !task.completed && isTodayTask && view !== 'today'
  const showProject = !!project && ['today', 'upcoming', 'someday', 'logbook'].includes(view)
  const showFutureDate =
    !task.completed && task.date !== null && task.date > today && view !== 'upcoming'

  return (
    <li
      className={`task-row${checked ? ' checked' : ''}`}
      onClick={() => onOpen(task.id)}
    >
      <Checkbox checked={checked} onChange={handleCheck} label={t.complete} />

      <div className="task-main">
        <div className="task-line">
          {showStar && <StarIcon size={13} className="c-today task-star" />}
          <span className={`task-title${task.title ? '' : ' placeholder'}`}>
            {task.title || t.newTodo}
          </span>
          {task.notes && <NotesIcon size={13} className="task-notes-icon" />}
        </div>
        {showProject && <div className="task-sub">{project.title || t.newProject}</div>}
      </div>

      {showFutureDate && task.date && (
        <span className="task-date">{formatRelative(task.date, today, t, locale)}</span>
      )}
      {!task.completed && isOverdue && (
        <span className="task-date overdue">{formatShort(task.date ?? today, locale)}</span>
      )}
      {task.completed && task.completedAt && (
        <span className="task-date">{formatShort(toDateStr(new Date(task.completedAt)), locale)}</span>
      )}

      <button
        className="row-delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
        title={t.deleteTask}
        aria-label={t.deleteTask}
      >
        <TrashIcon size={15} />
      </button>
    </li>
  )
}
