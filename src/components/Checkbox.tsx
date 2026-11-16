import { CheckIcon } from './Icons'

interface Props {
  checked: boolean
  onChange: () => void
  label: string
}

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`checkbox${checked ? ' checked' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
    >
      {checked && <CheckIcon size={12} strokeWidth={3.5} />}
    </button>
  )
}
