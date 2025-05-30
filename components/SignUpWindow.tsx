import React, { useState } from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { Input } from "./ui/input"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { supabase } from "@/lib/supabase-client"

export default function SignUpWindow() {
  const [signUpFields, setSignUpFields] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  })

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      !signUpFields.email ||
      !signUpFields.password ||
      !signUpFields.username
    ) {
      alert("Please fill in all fields")
      return
    }
    if (signUpFields.password !== signUpFields.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    const { error } = await supabase.auth.signUp({
      email: signUpFields.email,
      password: signUpFields.password,
    })

    if (error) {
      console.error("Error in handleSignUp in SignupWindow.tsx:", error.message)
      return
    } else {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { error: insertError } = await supabase.from("users").insert({
          uid: session.user.id,
          email: session.user.email,
          username: signUpFields.username,
        })

        if (insertError) {
          console.error("Error creating user profile:", insertError.message)
          return
        }
      }
      setSignUpFields({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
      })
    }
  }

  return (
    <div className="flex flex-col dark:bg-neutral-900 bg-secondary p-10 rounded-lg min-w-[400px]">
      <Link href="/" className="mb-5">
        <h2 className="text-4xl text-center font-bold">
          <span className="text-primary">web</span>-chat
        </h2>
      </Link>
      <h1 className="text-2xl text-primary font-bold pb-5">Sign Up</h1>
      <div className="flex flex-col gap-5">
        <form className="flex flex-col gap-5" onSubmit={handleSignUp}>
          <div className="">
            <p>Email</p>
            <Input
              value={signUpFields.email}
              onChange={(e) =>
                setSignUpFields((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
              type="text"
            />
          </div>
          <div className="">
            <p>Username</p>
            <Input
              value={signUpFields.username}
              onChange={(e) =>
                setSignUpFields((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              placeholder="Username"
              type="text"
            />
          </div>
          <div className="">
            <p>Password</p>
            <Input
              value={signUpFields.password}
              onChange={(e) =>
                setSignUpFields((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder="Password"
              type="password"
            />
          </div>
          <div className="">
            <p>Confirm Password</p>
            <Input
              value={signUpFields.confirmPassword}
              onChange={(e) =>
                setSignUpFields((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm Password"
              type="password"
            />
          </div>
          <Button
            type="submit"
            className="text-white font-semibold cursor-pointer"
          >
            Sign Up
          </Button>
        </form>
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
