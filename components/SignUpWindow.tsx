import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { Input } from "./ui/input"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"

export default function SignUpWindow() {
  return (
    <div className="flex flex-col dark:bg-neutral-900 bg-secondary p-10 rounded-lg">
      <h1 className="text-2xl text-primary font-bold pb-5">Sign Up</h1>
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
        <Button className="text-white font-semibold cursor-pointer">
          Sign Up
        </Button>
      </div>

      <p className="pt-5">
        Already have an account?{" "}
        <Link className="text-primary" href="/auth?authType=login" replace>
          Login
        </Link>
      </p>
      <div className="flex flex-col gap-3 pt-5">
        <Button
          className="dark:bg-secondary bg-white text-black dark:text-white cursor-pointer"
          variant={"secondary"}
        >
          <FaGithub className="w-8 h-8" />
          <p>sign Up with Github</p>
        </Button>
        <Button
          className="dark:bg-secondary bg-white text-black dark:text-white cursor-pointer"
          variant={"secondary"}
        >
          <FcGoogle className="w-8 h-8" />
          <p>sign Up with Google</p>
        </Button>
      </div>
    </div>
  )
}
