import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"

export default function SignUpWindow() {
  return (
    <div>
      <h1>SignUp Window</h1>

      <Link href="/auth?authType=login" replace>
        <Button variant={"default"}>Already have an account? login</Button>
      </Link>
    </div>
  )
}
