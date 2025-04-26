import { supabase } from "@/lib/supabase-client"
import React, { useEffect, useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { BsThreeDots } from "react-icons/bs"
import { IoMdClose } from "react-icons/io"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EditMessage from "./EditMessage"
import { Paperclip } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import EmojiPicker, { Theme } from "emoji-picker-react"
import Image from "next/image"
import { useTheme } from "next-themes"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageText, setEditingMessageText] = useState<string>("")
  const [messageImage, setMessageImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEmojiPickerOpen, setIsEmohiPickerOpen] = useState<boolean>(false)
  const theme = useTheme()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setMessageImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Add this before the form return
  const clearImagePreview = () => {
    setImagePreview(null)
    setMessageImage(null)
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

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

  const uploadImage = async (image: File) => {
    const extenstion = image.name.split(".").pop()
    const fileName = `${Date.now()}-${uuidv4()}.${extenstion}`
    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, image)

    if (error) {
      console.error("Error uploading image:", error)
      return null
    }

    // Get the public URL directly from the storage path
    const { data } = await supabase.storage
      .from("images")
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !messageImage) return

    let imageUrl: string | null = null
    if (messageImage) {
      imageUrl = await uploadImage(messageImage)
    }

    const { error } = await supabase
      .from("messages")
      .insert({
        text: message,
        image_url: imageUrl || "",
        is_edited: false,
        sender_id: senderId,
        reciever_id: recieverId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error while sending message:", error)
      return
    }
    clearImagePreview()
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

  const deleteMessage = async (messageId: number) => {
    const messageToDelete = messages.find((msg) => msg.id === messageId)

    if (messageToDelete?.image_url) {
      const tempUrl = messageToDelete.image_url.split("/")
      const imageName = tempUrl.pop()
      const folder = tempUrl.pop()
      console.log(folder)
      if (!imageName) return
      console.log(decodeURI(imageName))
      const { error } = await supabase.storage
        .from("images")
        .remove([`${folder}/${decodeURI(imageName)}`])

      if (error) {
        console.error("Error deleting image:", error)
      }
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)

    if (error) {
      console.error("Error deleting message:", error)
      return
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

  const editMessage = async (messageId: number, newText: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ text: newText, is_edited: true })
      .eq("id", messageId)

    if (error) {
      console.error("Error editing message:", error)
      return
    }
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleEditMessage = (messageId: number, currentText: string) => {
    setEditingMessageId(messageId)
    setEditingMessageText(currentText)
  }

  const handleSaveEdit = async (newText: string) => {
    if (editingMessageId && newText.trim()) {
      await editMessage(editingMessageId, newText)
      setEditingMessageId(null)
      setEditingMessageText("")
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingMessageText("")
  }

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
              {editingMessageId === msg.id ? (
                <EditMessage
                  initialText={msg.text}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <>
                  <p className="break-words max-w-[300px]">{msg.text}</p>
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      className="max-w-[600px] rounded-md"
                    />
                  )}
                  <div className="flex flex-row items-center justify-between gap-5">
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                    {msg.is_edited && (
                      <p className="text-sm font-medium">edited</p>
                    )}
                    {msg.sender_id === senderId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <BsThreeDots />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditMessage(msg.id, msg.text)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMessage(msg.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input form */}

      <form
        onSubmit={sendMessage}
        className="border-t dark:border-neutral-800 p-4 flex items-center justify-center gap-2"
      >
        <label htmlFor="file-upload" className="cursor-pointer p-2">
          <Paperclip className="h-5 w-5" />
          <Input
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            id="file-upload"
            type="file"
          />
        </label>
        <Button
          type="button"
          onClick={() => setIsEmohiPickerOpen((prev) => !prev)}
          className="text-2xl"
          variant={"secondary"}
        >
          😇
        </Button>
        <div className="absolute left-100 bottom-20">
          <EmojiPicker
            lazyLoadEmojis={true}
            open={isEmojiPickerOpen}
            onEmojiClick={(e) =>
              setMessage((prev) => {
                setIsEmohiPickerOpen(false)
                return prev + e.emoji
              })
            }
            theme={theme.theme as Theme}
          />
        </div>
        {imagePreview && (
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={clearImagePreview}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            >
              <IoMdClose className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
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
