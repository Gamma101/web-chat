import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { Input } from "./ui/input"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

export default function LoginWindow() {
  const router = useRouter()

  const [loginFields, setLoginFields] = React.useState({
    email: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loginFields.email === "" || loginFields.password === "") {
      alert("Please fill in all fields")
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: loginFields.email,
      password: loginFields.password,
    })

    if (error) {
      alert(error.message)
      return
    } else {
      router.push("/chat")
    }
  }

  return (
    <div className="flex flex-col gap-5 dark:bg-neutral-900 bg-secondary p-10 rounded-lg min-w-[400px]">
      <h1 className="text-2xl text-primary font-bold">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="">
          <p>Email</p>
          <Input
            value={loginFields.email}
            onChange={(e) => {
              setLoginFields((prev) => ({ ...prev, email: e.target.value }))
            }}
            placeholder="Email"
            type="text"
          />
        </div>

        <div className="">
          <p>Password</p>
          <Input
            value={loginFields.password}
            onChange={(e) => {
              setLoginFields((prev) => ({ ...prev, password: e.target.value }))
            }}
            placeholder="Password"
            type="password"
          />
        </div>
        <Button className="text-white font-semibold">Login</Button>
      </form>

      <p>
        Don&apos;t have an account yet?{" "}
        <Link className="text-primary" href="/auth?authType=signup" replace>
          Sign Up
        </Link>
      </p>

      <div className="flex flex-col gap-3">
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
