import type { ViewId } from '../types'

export interface Translations {
  views: Record<ViewId, string>
  empty: Record<ViewId | 'project', string>
  newTodo: string
  newList: string
  newProject: string
  notes: string
  today: string
  tomorrow: string
  yesterday: string
  someday: string
  clear: string
  pickDate: string
  when: string
  project: string
  noProject: string
  deleteTask: string
  deleteProject: string
  confirmDeleteProject: (name: string) => string
  logCompleted: (n: number) => string
  showLogged: (n: number) => string
  hideLogged: string
  switchToLight: string
  switchToDark: string
  menu: string
  complete: string
}

const en: Translations = {
  views: {
    inbox: 'Inbox',
    today: 'Today',
    upcoming: 'Upcoming',
    anytime: 'Anytime',
    someday: 'Someday',
    logbook: 'Logbook',
  },
  empty: {
    inbox: 'Your Inbox is empty',
    today: 'Nothing planned for today',
    upcoming: 'No upcoming to-dos',
    anytime: 'No to-dos',
    someday: 'Nothing for someday',
    logbook: 'No logged to-dos yet',
    project: 'This project is empty',
  },
  newTodo: 'New To-Do',
  newList: 'New List',
  newProject: 'New Project',
  notes: 'Notes',
  today: 'Today',
  tomorrow: 'Tomorrow',
  yesterday: 'Yesterday',
  someday: 'Someday',
  clear: 'Clear',
  pickDate: 'Pick a date',
  when: 'When',
  project: 'Project',
  noProject: 'No project',
  deleteTask: 'Delete to-do',
  deleteProject: 'Delete project',
  confirmDeleteProject: (name) => `Delete “${name}” and all its to-dos?`,
  logCompleted: (n) => `Log Completed (${n})`,
  showLogged: (n) => `Show ${n} logged`,
  hideLogged: 'Hide logged',
  switchToLight: 'Light theme',
  switchToDark: 'Dark theme',
  menu: 'Menu',
  complete: 'Complete',
}

const ru: Translations = {
  views: {
    inbox: 'Входящие',
    today: 'Сегодня',
    upcoming: 'Планы',
    anytime: 'В любое время',
    someday: 'Когда-нибудь',
    logbook: 'Журнал',
  },
  empty: {
    inbox: 'Входящие пусты',
    today: 'На сегодня ничего не запланировано',
    upcoming: 'Нет запланированных задач',
    anytime: 'Задач нет',
    someday: 'Здесь пока пусто',
    logbook: 'В журнале пока нет задач',
    project: 'В проекте пока нет задач',
  },
  newTodo: 'Новая задача',
  newList: 'Новый список',
  newProject: 'Новый проект',
  notes: 'Заметки',
  today: 'Сегодня',
  tomorrow: 'Завтра',
  yesterday: 'Вчера',
  someday: 'Когда-нибудь',
  clear: 'Очистить',
  pickDate: 'Выбрать дату',
  when: 'Когда',
  project: 'Проект',
  noProject: 'Без проекта',
  deleteTask: 'Удалить задачу',
  deleteProject: 'Удалить проект',
  confirmDeleteProject: (name) => `Удалить «${name}» вместе со всеми задачами?`,
  logCompleted: (n) => `В журнал (${n})`,
  showLogged: (n) => `Показать из журнала (${n})`,
  hideLogged: 'Скрыть из журнала',
  switchToLight: 'Светлая тема',
  switchToDark: 'Тёмная тема',
  menu: 'Меню',
  complete: 'Выполнить',
}

export const translations = { en, ru }
