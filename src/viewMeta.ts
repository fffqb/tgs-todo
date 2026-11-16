import type { ComponentType } from 'react'
import {
  BoxIcon,
  CalendarIcon,
  InboxIcon,
  LayersIcon,
  LogbookIcon,
  StarIcon,
  type IconProps,
} from './components/Icons'
import type { ViewId } from './types'

export const VIEW_META: Record<ViewId, { Icon: ComponentType<IconProps>; color: string }> = {
  inbox: { Icon: InboxIcon, color: 'var(--c-inbox)' },
  today: { Icon: StarIcon, color: 'var(--c-today)' },
  upcoming: { Icon: CalendarIcon, color: 'var(--c-upcoming)' },
  anytime: { Icon: LayersIcon, color: 'var(--c-anytime)' },
  someday: { Icon: BoxIcon, color: 'var(--c-someday)' },
  logbook: { Icon: LogbookIcon, color: 'var(--c-logbook)' },
}

export const VIEW_GROUPS: ViewId[][] = [
  ['inbox'],
  ['today', 'upcoming', 'anytime', 'someday'],
  ['logbook'],
]
