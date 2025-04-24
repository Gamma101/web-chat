import { supabase } from "@/lib/supabase-client"
import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback } from "./ui/avatar"

interface Message {
  id: number
  created_at: string
  text: string
  image_url: string
  is_edited: boolean
  sender_id: string
  reciever_id: string
}

interface User {
  id: string
  email: string
  username: string
  uid: string
}

export default function Chat({
  senderId,
  recieverId,
}: {
  senderId: string
  recieverId: string
}) {
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [receiverInfo, setReceiverInfo] = useState<User | null>(null)

  const fetchReceiverInfo = async () => {
    if (!recieverId) return
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", recieverId)
      .single()

    if (error) {
      console.error("Error fetching receiver info:", error)
      return
    }

    if (data) {
      setReceiverInfo(data)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const { error } = await supabase.from("messages").insert({
      text: message,
      image_url: "",
      is_edited: false,
      sender_id: senderId,
      reciever_id: recieverId,
    })

    if (error) {
      console.error("Error while sending message:", error)
      return
    }

    setMessage("")
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${senderId},reciever_id.eq.${recieverId}),and(sender_id.eq.${recieverId},reciever_id.eq.${senderId})`
      )
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return
    }

    if (data) {
      setMessages(data)
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchReceiverInfo()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [senderId, recieverId])

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Chat header */}
      <div className="border-b dark:border-neutral-800 p-4 flex items-center gap-3">
        {receiverInfo && (
          <>
            <Avatar>
              <AvatarFallback className="text-primary">
                {receiverInfo.username?.slice(0, 2).toUpperCase() ||
                  receiverInfo.email?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {receiverInfo.username || "Anonymous"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {receiverInfo.email}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === senderId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_id === senderId
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              <p className="break-words">{msg.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message input form */}
      <form
        onSubmit={sendMessage}
        className="border-t dark:border-neutral-800 p-4 flex gap-2"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}
