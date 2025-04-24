import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"

export default function LoginWindow() {
  return (
    <div>
      <h1>Login Window</h1>

      <Link href="/auth?authType=signup" replace>
        <Button variant={"default"}>Dont Have account? Sign Up</Button>
      </Link>
    </div>
  )
}
