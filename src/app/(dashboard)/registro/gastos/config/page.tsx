import { redirect } from "next/navigation"

export default function RegistroGastosConfigPage() {
  redirect(`/registro/gastos/config/${new Date().getFullYear()}`)
}
