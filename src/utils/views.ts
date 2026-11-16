import type { Task, View } from '../types'

export function isInboxTask(t: Task): boolean {
  return !t.projectId && !t.date && t.when === 'inbox'
}

export function tasksForView(tasks: Task[], view: View, today: string): Task[] {
  switch (view.type) {
    case 'inbox':
      return tasks.filter((t) => !t.logged && isInboxTask(t))
    case 'today':
      return tasks.filter((t) => !t.logged && t.date !== null && t.date <= today)
    case 'upcoming':
      return tasks
        .filter((t) => !t.logged && t.date !== null && t.date > today)
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    case 'anytime':
      return tasks.filter(
        (t) =>
          !t.logged &&
          t.when !== 'someday' &&
          !isInboxTask(t) &&
          !(t.date !== null && t.date > today),
      )
    case 'someday':
      return tasks.filter((t) => !t.logged && t.when === 'someday' && !t.date)
    case 'logbook':
      return tasks
        .filter((t) => t.completed && t.logged)
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    case 'project':
      return tasks.filter((t) => !t.logged && t.projectId === view.id)
  }
}

export function activeCountForView(tasks: Task[], view: View, today: string): number {
  return tasksForView(tasks, view, today).filter((t) => !t.completed).length
}

export function projectProgress(tasks: Task[], projectId: string): number {
  const own = tasks.filter((t) => t.projectId === projectId)
  if (own.length === 0) return 0
  return own.filter((t) => t.completed).length / own.length
}
