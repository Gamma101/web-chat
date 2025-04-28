"use client"
import ChatSidebar from "@/components/ChatSidebar"
import Profile from "@/components/Profile"
import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
  const [currentUserSession, setCurrentUserSession] = useState<Session | null>(
    null
  )
  const [session, setSession] = useState<Session | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const params = useParams()

  const fetchMessagesWithImages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserSession?.user.id},reciever_id.eq.${session?.user?.id}),and(sender_id.eq.${currentUserSession?.user.id},reciever_id.eq.${params.id})`
      )
      .order("created_at", { ascending: true })

    console.log(data)
  }

  const getCurrentUserSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error fetching current session", error)
      return
    }

    if (data) {
      setCurrentUserSession(data?.session)
    }
  }

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
    getCurrentUserSession()
  }, [])

  useEffect(() => {
    fetchMessagesWithImages()
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
      <div className="w-full flex pt-10 justify-center">
        <Profile userId={params.id as string} />
      </div>
    </div>
  )
}
