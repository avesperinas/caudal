import { Separator } from "@/components/ui/separator"
import { ThemeSelector } from "@/components/layout/ThemeSelector"
import { tx, layout } from "@/lib/styles"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  return (
    <div className={cn(layout.page, layout.pageSections)}>
      <div>
        <h1 className={tx.pageTitle}>Ajustes</h1>
        <p className={tx.secondary}>Preferencias de la aplicación</p>
      </div>

      <Separator />

      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Apariencia</h2>
        <ThemeSelector />
      </section>
    </div>
  )
}
