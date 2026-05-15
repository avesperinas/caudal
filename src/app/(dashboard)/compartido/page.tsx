import { redirect } from "next/navigation"

export default function CompartidoPage() {
  const now = new Date()
  redirect(`/compartido/${now.getFullYear()}`)
}
