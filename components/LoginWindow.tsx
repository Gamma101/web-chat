import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { Input } from "./ui/input"

export default function LoginWindow() {
  return (
    <div className="flex flex-col gap-5 dark:bg-neutral-900 bg-secondary p-10 rounded-lg">
      <h1 className="text-2xl text-primary font-bold">Login</h1>
      <div className="flex flex-col gap-5">
        <div className="">
          <p>Email</p>
          <Input placeholder="Email" type="text" />
        </div>

        <div className="">
          <p>Password</p>
          <Input placeholder="Password" type="password" />
        </div>
        <Button className="text-white font-semibold">Login</Button>
      </div>

      <p>
        Already have an account?{" "}
        <Link className="text-primary" href="/auth?authType=signup" replace>
          Login
        </Link>
      </p>
    </div>
  )
}
