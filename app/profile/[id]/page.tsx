"use client"
import ChatSidebar from "@/components/ChatSidebar"
import Profile from "@/components/Profile"
import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Message {
  id: string
  sender_id: string
  reciever_id: string
  message: string
  created_at: string
  image_url: string
}

export default function Page() {
  const [profileSession, setProfileSession] = useState<Session | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const [messagesWithImages, setMessagesWithImages] = useState<Message[] | []>(
    []
  )
  const params = useParams()

  const fetchMessagesWithImages = async () => {
    if (!session?.user?.id || !params.id) return

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${session.user.id},reciever_id.eq.${params.id}),and(sender_id.eq.${params.id},reciever_id.eq.${session.user.id})`
      )
      .not("image_url", "eq", "") // Check for non-empty strings
      .not("image_url", "is", null) // Check for non-null values
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages with images:", error)
      return
    }

    console.log(data)
    setMessagesWithImages(data)
  }

  const getProfileUserSession = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", params.id)
      .single()

    if (error) {
      console.error("Error fetching current session", error)
      return
    }

    if (data) {
      setProfileSession(data.uid)
      console.log(data)
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
    getProfileUserSession()
  }, [])

  useEffect(() => {
    fetchMessagesWithImages()
  }, [profileSession, session])

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
        <Profile messages={messagesWithImages} userId={params.id as string} />
      </div>
    </div>
  )
}
