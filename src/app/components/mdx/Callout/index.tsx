import {Warn, Info, Danger, Normal} from "./Icons"

type Variant = "info" | "warn" | "danger" | "normal"

export function Callout({
  type = "normal",
  children,
}: { type?: Variant; children: React.ReactNode }) {
  const icons = {
    info: Info,
    warn: Warn,
    danger: Danger,
    normal: Normal,
  } as const
  const Icon = icons[type]

  return (
    <div className="callout" data-variant={type} role="note" aria-label={`${type} callout`}>
      <div className="callout__icon flex items-center"><Icon /></div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
