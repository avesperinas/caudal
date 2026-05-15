import { redirect } from "next/navigation"

export default function GastosConfigPage() {
  redirect(`/gastos/config/${new Date().getFullYear()}`)
}
