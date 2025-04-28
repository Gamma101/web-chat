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
import { useTheme } from "next-themes"
import { MdDelete, MdModeEditOutline } from "react-icons/md"
import { FaReply } from "react-icons/fa"
import { IoSend } from "react-icons/io5"
import Link from "next/link"
interface Message {
  id: number
  created_at: string
  text: string
  image_url: string
  is_edited: boolean
  sender_id: string
  reciever_id: string
  reply_id: number
}

interface User {
  id: string
  email: string
  username: string
  uid: string
  avatar_url: string | null
}

export default function Chat({
  senderId,
  recieverId,
}: {
  senderId: string
  recieverId: string
  setIsAvatarLoading: React.Dispatch<React.SetStateAction<boolean>>
  isAvatarLoading: boolean
}) {
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>()
  const [receiverInfo, setReceiverInfo] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageText, setEditingMessageText] = useState<string>("")
  const [messageImage, setMessageImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEmojiPickerOpen, setIsEmohiPickerOpen] = useState<boolean>(false)
  const [replyMessage, setReplyMessage] = useState<Message | null>(null)
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
    const replyMessageId = replyMessage ? replyMessage.id : null

    const { error } = await supabase
      .from("messages")
      .insert({
        text: message,
        image_url: imageUrl || "",
        is_edited: false,
        sender_id: senderId,
        reciever_id: recieverId,
        reply_id: replyMessageId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error while sending message:", error)
      return
    }
    clearImagePreview()
    setMessage("")
    setReplyMessage(null)
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
  const [replyCache, setReplyCache] = useState<Record<number, Message>>({})

  const fetchReplyMessage = async (id: number) => {
    if (replyCache[id]) return

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error in getMessageInfoById:", error)
      return
    }

    setReplyCache((prev) => ({ ...prev, [id]: data }))
  }

  // Modify the renderReply function
  const renderReply = (id: number) => {
    const reply = replyCache[id]
    return reply ? (
      <h1 className="bg-secondary p-2 rounded-lg mb-2 text-primary cursor-pointer hover:bg-secondary/80 transition-colors">
        {reply.text}
      </h1>
    ) : null
  }

  // Update the useEffect to fetch replies
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.reply_id && !replyCache[msg.reply_id]) {
        fetchReplyMessage(msg.reply_id)
      }
    })
  }, [messages])

  const deleteMessage = async (messageId: number) => {
    const messageToDelete = messages.find((msg) => msg.id === messageId)

    if (messageToDelete?.image_url) {
      const urlSplitted = messageToDelete.image_url.split("/")
      const fileName = urlSplitted[urlSplitted.length - 1]
      const { error } = await supabase.storage
        .from("images")
        .remove([`${fileName}`])

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

  const fetchCurrentUser = async () => {
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", session.session.user.id)
      .single()

    if (error) {
      console.log(error)
      return
    }

    setCurrentUser(data)
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Chat header */}
      <div className="border-b dark:border-neutral-800 p-4 flex items-center gap-3">
        {receiverInfo && (
          <Link
            className="flex flex-row items-center gap-3"
            href={`/profile/${receiverInfo.uid}`}
          >
            {receiverInfo.avatar_url ? (
              <img
                src={receiverInfo.avatar_url}
                width={35}
                height={35}
                className="bg-secondary w-[35px] h-[35px] rounded-full"
                alt="user avatar"
              />
            ) : (
              <Avatar>
                <AvatarFallback className="text-primary">
                  {receiverInfo.username?.slice(0, 2).toUpperCase() ||
                    receiverInfo.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {receiverInfo.username || "Anonymous"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {receiverInfo.email}
              </p>
            </div>
          </Link>
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
            <Link href={`/profile/${receiverInfo?.uid}`}>
              {receiverInfo?.uid !== msg.reciever_id &&
                receiverInfo?.avatar_url && (
                  <img
                    src={receiverInfo?.avatar_url}
                    alt="user avatar"
                    className="w-[35px] h-[35px] mr-2"
                  />
                )}
              {receiverInfo?.uid !== msg.reciever_id &&
                !receiverInfo?.avatar_url && (
                  <Avatar className="mr-2">
                    <AvatarFallback className="text-primary">
                      {receiverInfo?.username?.slice(0, 2).toUpperCase() ||
                        receiverInfo?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
            </Link>
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
                  {msg.reply_id && renderReply(msg.reply_id)}
                  <p className="break-words max-w-[300px]">{msg.text}</p>
                  {msg.image_url && (
                    <img src={msg.image_url} className=" rounded-md" />
                  )}
                  <div className="flex flex-row items-center justify-between gap-5">
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                    {msg.is_edited && (
                      <p className="text-sm font-medium">edited</p>
                    )}

                    {msg.sender_id === senderId ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <BsThreeDots />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="flex items-center justify-between"
                            onClick={() => handleEditMessage(msg.id, msg.text)}
                          >
                            Edit
                            <MdModeEditOutline />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex flex-row items-center justify-between text-red-400"
                            onClick={() => deleteMessage(msg.id)}
                          >
                            Delete
                            <MdDelete className="text-red-400" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button onClick={() => setReplyMessage(msg)}>
                        <FaReply className="text-primary" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <Link href={`/profile/${currentUser?.uid}`}>
              {receiverInfo?.uid === msg.reciever_id &&
                currentUser?.avatar_url && (
                  <img
                    src={currentUser?.avatar_url}
                    alt="user avatar"
                    className="w-[35px] rounded-full h-[35px] ml-2"
                  />
                )}
              {receiverInfo?.uid === msg.reciever_id &&
                !currentUser?.avatar_url && (
                  <Avatar className="ml-2 w-[35px] h-[35px]">
                    <AvatarFallback className="text-primary">
                      {currentUser?.username?.slice(0, 2).toUpperCase() ||
                        currentUser?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
            </Link>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input form */}
      {replyMessage && (
        <div className="flex flex-row items-ceter justify-between bg-secondary p-5 rounded-t-4xl">
          <div className="overflow-">
            <p>{replyMessage.text}</p>
          </div>
          <button onClick={() => setReplyMessage(null)}>
            <IoMdClose size={24} className="text-red-400" />
          </button>
        </div>
      )}
      <form
        onSubmit={sendMessage}
        className="border-t dark:border-neutral-800 p-4 flex items-center justify-center gap-2"
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button
            variant={"secondary"}
            type="button"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
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
            <img
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

        <Button className="" type="submit">
          <IoSend color="black" />
        </Button>
      </form>
    </div>
  )
}
