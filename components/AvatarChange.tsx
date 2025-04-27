import { supabase } from "@/lib/supabase-client"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { FaFileImage } from "react-icons/fa6"
import { Button } from "./ui/button"
import { v4 as uuidv4 } from "uuid"

interface User {
  id: string
  email: string
  username: string
  uid: string
  avatar_url: string | null
}

export default function AvatarChange({
  setIsAvatarLoading,
}: {
  setIsAvatarLoading: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const handleRemoveAvatar = () => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, avatar_url: null } : null))
      setSelectedAvatar(null)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedAvatar(file)
    }
  }

  const handleAvatarUpload = async () => {
    setIsAvatarLoading(true)

    const { data } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("uid", currentUser?.uid)
      .single()
    if (data?.avatar_url) {
      const filePath = data.avatar_url.split("/").pop()
      if (filePath) {
        const { error } = await supabase.storage
          .from("images")
          .remove([filePath])
        if (error) {
          console.log(error)
          return
        }
      }
    }

    if (selectedAvatar) {
      const fileName = `${Date.now()}-${uuidv4()}`
      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, selectedAvatar)

      if (error) {
        console.log(error)
        return
      }

      const { data: avatarData } = await supabase.storage
        .from("images")
        .getPublicUrl(fileName)

      const { error: userError } = await supabase
        .from("users")
        .update({ avatar_url: avatarData.publicUrl })
        .eq("uid", currentUser?.uid)
      if (userError) {
        console.log(userError)
        return
      }
    } else {
      const { data } = await supabase
        .from("users")
        .select("avatar_url")
        .eq("uid", currentUser?.uid)
        .single()
      if (data?.avatar_url) {
        const filePath = data.avatar_url.split("/").pop()
        if (filePath) {
          const { error } = await supabase.storage
            .from("images")
            .remove([filePath])
          if (error) {
            console.log(error)
            return
          }
        }
      }

      const { error } = await supabase
        .from("users")
        .update(currentUser)
        .eq("uid", currentUser?.uid)

      if (error) {
        console.log(error)
        return
      }
    }
    setIsAvatarLoading(false)
  }

  useEffect(() => {
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
    fetchCurrentUser()
  }, [])

  return (
    <div className="flex flex-col gap-5 mt-5">
      <h3>Avatar</h3>
      <div className="flex flex-row gap-10">
        {currentUser?.avatar_url || selectedAvatar ? (
          <img
            className="bg-secondary rounded-full w-[200px] h-[200px]"
            src={
              selectedAvatar
                ? (URL.createObjectURL(selectedAvatar) as string)
                : (currentUser?.avatar_url as string)
            }
            alt="avatar"
          />
        ) : (
          <Avatar className="w-[200px] h-[200px]">
            <AvatarFallback className="text-primary text-7xl font-bold">
              {currentUser?.username?.slice(0, 2).toUpperCase() ||
                currentUser?.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <label className="absolute">
          <FaFileImage className="w-10 h-10 text-primary" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>
      <Button
        className="text-red-400"
        onClick={handleRemoveAvatar}
        variant={"secondary"}
      >
        Remove Avatar
      </Button>
      <Button className="text-white" onClick={handleAvatarUpload}>
        Save Avatar
      </Button>
    </div>
  )
}
