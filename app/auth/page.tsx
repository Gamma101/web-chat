"use client"

import LoginWindow from "@/components/LoginWindow"
import SignUpWindow from "@/components/SignUpWindow"
import { useSearchParams } from "next/navigation"
import React, { useState, useEffect } from "react"

export default function Auth() {
  const searchParams = useSearchParams()
  const authType = searchParams.get("authType")
  const [isSignUp, setIsSignUp] = useState(authType === "signup")

  useEffect(() => {
    setIsSignUp(authType === "signup")
  }, [authType])

  return (
    <div className="flex h-screen justify-center items-center">
      {isSignUp ? <SignUpWindow /> : <LoginWindow />}
    </div>
  )
}
