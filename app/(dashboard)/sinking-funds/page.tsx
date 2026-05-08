import { redirect } from "next/navigation"

export default function SinkingFundsRedirect() {
  redirect("/goals?tab=funds")
}
