import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { Input } from "./ui/input"

export default function SignUpWindow() {
  return (
    <div className="flex flex-col dark:bg-neutral-900 bg-secondary p-10 rounded-lg">
      <h1 className="text-2xl text-primary font-bold">Sign Up</h1>
      <div className="flex flex-col gap-5">
        <div className="">
          <p>Email</p>
          <Input placeholder="Email" type="text" />
        </div>

        <div className="">
          <p>Password</p>
          <Input placeholder="Password" type="password" />
        </div>
        <div className="">
          <p>Confirm Password</p>
          <Input placeholder="Confirm Password" type="password" />
        </div>
        <Button className="text-white font-semibold">Sign Up</Button>
      </div>

      <p className="pt-5">
        Already have an account?
        <Link className="text-primary" href="/auth?authType=login" replace>
          Login
        </Link>
      </p>
      <div className="flex flex-col gap-3 py-5">
        <Button
          className="dark:bg-secondary bg-white text-black dark:text-white"
          variant={"secondary"}
        >
          use Github
        </Button>
        <Button
          className="dark:bg-secondary bg-white text-black dark:text-white"
          variant={"secondary"}
        >
          use Google
        </Button>
      </div>
    </div>
  )
}
