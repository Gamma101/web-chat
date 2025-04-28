import { supabase } from "@/lib/supabase-client"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import ProfileImages from "./ProfileImages"
import { Button } from "./ui/button"
import { MdMail } from "react-icons/md"
import Link from "next/link"

interface User {
  id: string
  email: string
  username: string
  uid: string
  avatar_url: string | null
}

interface Message {
  id: string
  sender_id: string
  reciever_id: string
  message: string
  created_at: string
  image_url: string
}

export default function Profile({
  userId,
  messages,
}: {
  userId: string
  messages: Message[]
}) {
  const [user, setUser] = useState<User | null>(null)
  const fetchUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userId)
      .single()

    if (error) {
      console.error("Error in ProfileFetch,", error)
      return
    }

    if (data) {
      setUser(data)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div className="flex flex-col items-center bg-secondary px-10 pt-5 rounded-xl w-[80%] overflow-auto h-screen">
      {user?.avatar_url ? (
        <img
          className="w-[250px] h-[250px] rounded-full"
          src={`${user?.avatar_url}`}
          alt=""
        />
      ) : (
        <Avatar className="w-[200px] h-[200px] text-7xl">
          <AvatarFallback className="text-primary">
            {user?.username?.slice(0, 2).toUpperCase() ||
              user?.email?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <h1 className="text-3xl">
        Username: <span className="text-primary">{user?.username}</span>
      </h1>
      <h1 className="text-3xl">
        Email: <span className="text-primary">{user?.email}</span>
      </h1>
      <Link href={`/chat/?user=${user?.uid}`}>
        <Button className="mt-5">
          <MdMail className="text-2xl" />
          <span className="ml-2">Send Message</span>
        </Button>
      </Link>
      <h1 className="text-3xl my-5">Chat Images</h1>
      <ProfileImages messages={messages} />
    </div>
  )
}
