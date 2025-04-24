"use client"

import ChatSidebar from "@/components/ChatSidebar"
import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import React, { useEffect } from "react"

export default function ChatPage() {
  const [session, setSession] = React.useState<Session | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        return
      } else {
        setSession(data.session)
      }
    }

    fetchSession()
  }, [])
  return (
    <div className="flex flex-row">
      <div className="">
        <ChatSidebar session={session} />
      </div>
      <div className=""></div>
    </div>
  )
}
