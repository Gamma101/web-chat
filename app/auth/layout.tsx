"use client"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/chat")
      }
    }
    checkAuth()
  })

  return <div>{children}</div>
}
