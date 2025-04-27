"use client"

import Chat from "@/components/Chat"
import ChatSidebar from "@/components/ChatSidebar"
import TestDelete from "@/components/TestDelete"
import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"

export default function ChatPage() {
  const [session, setSession] = React.useState<Session | null>(null)
  const searchParams = useSearchParams()
  const recieverId = searchParams.get("user")
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)

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
        <ChatSidebar
          isAvatarLoading={isAvatarLoading}
          setIsAvatarLoading={setIsAvatarLoading}
          session={session}
        />
      </div>
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
