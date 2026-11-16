export type When = 'inbox' | 'anytime' | 'someday'

export interface Task {
  id: string
  title: string
  notes: string
  completed: boolean
  completedAt: number | null
  logged: boolean
  createdAt: number
  when: When
  /** YYYY-MM-DD in local time */
  date: string | null
  projectId: string | null
}

export interface Project {
  id: string
  title: string
  createdAt: number
}

export type ViewId = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook'

export type View = { type: ViewId } | { type: 'project'; id: string }

export type ViewKind = View['type']

export type Theme = 'light' | 'dark'

export type Lang = 'en' | 'ru'
