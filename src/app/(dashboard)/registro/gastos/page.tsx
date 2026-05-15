import { redirect } from "next/navigation"

export default function RegistroGastosPage() {
  redirect(`/registro/gastos/${new Date().getFullYear()}`)
}
