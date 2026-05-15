import { redirect } from "next/navigation"

export default function IngresosPage() {
  redirect(`/ingresos/${new Date().getFullYear()}`)
}
