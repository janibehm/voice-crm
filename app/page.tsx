import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PhoneClient from "./components/PhoneClient"

export default async function Home() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <PhoneClient />;
}
