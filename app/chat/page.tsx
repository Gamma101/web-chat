"use client"

import Chat from "@/components/Chat"
import ChatSidebar from "@/components/ChatSidebar"
import TestDelete from "@/components/TestDelete"
import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

export default function ChatPage() {
  const [session, setSession] = React.useState<Session | null>(null)
  const searchParams = useSearchParams()
  const recieverId = searchParams.get("user")

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
      <TestDelete />
      <div className="w-full">
        {session && recieverId ? (
          <Chat senderId={session?.user.id} recieverId={recieverId} />
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
