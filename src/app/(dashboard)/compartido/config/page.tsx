import { redirect } from "next/navigation"

export default function CompartidoConfigPage() {
  redirect(`/compartido/config/${new Date().getFullYear()}`)
}
