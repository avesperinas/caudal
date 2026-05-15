import { redirect } from "next/navigation"

export default async function PersonalPage() {
  redirect(`/personal/${new Date().getFullYear()}`)
}
