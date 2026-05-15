import { redirect } from "next/navigation"

export default function RegistroPersonalPage() {
  redirect(`/registro/personal/${new Date().getFullYear()}`)
}
