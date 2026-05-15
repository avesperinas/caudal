import Image from "next/image"
import { cn } from "@/lib/utils"
import { ENTITY_ICON_MAP, isImageIcon } from "@/components/finance/EntityIcon"
import { EntityIconName } from "@/lib/products"

type EntityBadgeProps = {
  name: string
  color: string
  icon?: string | null
  className?: string
}

export function EntityBadge({ name, color, icon, className }: EntityBadgeProps) {
  const renderIcon = () => {
    if (!icon) {
      return <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    }
    if (isImageIcon(icon)) {
      return <Image src={icon} alt="" width={12} height={12} className="size-3 rounded-sm object-cover" />
    }
    const Icon = ENTITY_ICON_MAP[icon as EntityIconName]
    return Icon ? <Icon className="size-3" strokeWidth={2} style={{ color }} /> : null
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", className)}
      style={{
        backgroundColor: `${color}1A`,
        color,
        outline: `1px solid ${color}33`,
      }}
    >
      {renderIcon()}
      {name}
    </span>
  )
}
