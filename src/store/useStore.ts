import { useEffect, useState } from 'react'
import type { Project, Task } from '../types'

const STORAGE_KEY = 'things-lite:data'
const LEGACY_KEY = 'todos'

interface Data {
  tasks: Task[]
  projects: Project[]
}

function uid(): string {
  // crypto.randomUUID is only available in secure contexts (https / localhost)
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function createTask(init: Partial<Task> = {}): Task {
  return {
    id: uid(),
    title: '',
    notes: '',
    completed: false,
    completedAt: null,
    logged: false,
    createdAt: Date.now(),
    when: 'inbox',
    date: null,
    projectId: null,
    ...init,
  }
}

function loadData(): Data {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Data>
      return {
        tasks: Array.isArray(parsed.tasks)
          ? parsed.tasks.map((t) => ({ ...t, logged: Boolean(t.logged) }))
          : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      }
    }

    // Migrate tasks from the first (simple) version of the app
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const items = JSON.parse(legacy) as { text?: string; completed?: boolean; createdAt?: number }[]
      if (Array.isArray(items)) {
        return {
          projects: [],
          tasks: items.map((item) =>
            createTask({
              title: item.text ?? '',
              completed: Boolean(item.completed),
              completedAt: item.completed ? Date.now() : null,
              logged: false,
              createdAt: item.createdAt ?? Date.now(),
            }),
          ),
        }
      }
    }
  } catch {
    // ignore corrupted storage
  }
  return { tasks: [], projects: [] }
}

export function useStore() {
  const [data, setData] = useState<Data>(loadData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const addTask = (init: Partial<Task> = {}): string => {
    const task = createTask(init)
    setData((d) => ({ ...d, tasks: [...d.tasks, task] }))
    return task.id
  }

  const updateTask = (id: string, patch: Partial<Task>) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }

  const toggleTask = (id: string) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => {
        if (t.id !== id) return t
        const nextCompleted = !t.completed
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : null,
          logged: nextCompleted ? t.logged : false,
        }
      }),
    }))
  }

  const logTasks = (ids: string[]) => {
    const idSet = new Set(ids)
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (idSet.has(t.id) ? { ...t, logged: true } : t)),
    }))
  }

  const deleteTask = (id: string) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }))
  }

  const addProject = (title = ''): string => {
    const project: Project = { id: uid(), title, createdAt: Date.now() }
    setData((d) => ({ ...d, projects: [...d.projects, project] }))
    return project.id
  }

  const updateProject = (id: string, patch: Partial<Project>) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }

  const deleteProject = (id: string) => {
    setData((d) => ({
      projects: d.projects.filter((p) => p.id !== id),
      tasks: d.tasks.filter((t) => t.projectId !== id),
    }))
  }

  return {
    tasks: data.tasks,
    projects: data.projects,
    addTask,
    updateTask,
    toggleTask,
    logTasks,
    deleteTask,
    addProject,
    updateProject,
    deleteProject,
  }
}

export type Store = ReturnType<typeof useStore>
