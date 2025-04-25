"use client"
import React from "react"
import { Button } from "./ui/button"
import SwitchTheme from "./SwitchTheme"
import Link from "next/link"

export default function Header() {
  return (
    <div className="px-10 m-auto dark:bg-neutral-900 bg-secondary">
      <div className="flex justify-between items-center py-5">
        <h1 className="text-4xl">
          <span className="text-primary">web</span>-chat
        </h1>
        <div className="flex justify-center items-center gap-5">
          <Link href="/auth?authType=login">
            <Button variant={"default"}>Login</Button>
          </Link>
          <Link href="/auth?authType=signup">
            <Button variant={"default"}>Sign Up</Button>
          </Link>

          <SwitchTheme />
        </div>
      </div>
    </div>
  )
}
