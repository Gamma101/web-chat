"use client"

import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import Link from "next/link"
import { Button } from "./ui/button"
import { Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Input } from "./ui/input"
import { IoMdClose } from "react-icons/io"

interface User {
  id: string
  email: string
  username: string
  uid: string
}

export default function ChatSidebar({ session }: { session: Session | null }) {
  const { setTheme } = useTheme()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchString, setSearchString] = useState<string>("")

  const fetchUsers = async () => {
    if (!session?.user?.id) return

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .neq("uid", session.user.id)

    if (error) {
      console.error("Error fetching users:", error)
      return
    }

    if (data) {
      setUsers(data)
    }
  }

  const filterUsers = () => {
    console.log("CHOOSING")
    if (!searchString) {
      setFilteredUsers(users)
      return
    } else {
      const currentFilterUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchString.toLowerCase())
      )
      setFilteredUsers(currentFilterUsers)
      return
    }
  }

  useEffect(() => {
    filterUsers()
  }, [searchString])

  useEffect(() => {
    fetchUsers()
    // Subscribe to realtime changes
    const channel = supabase
      .channel("users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [session])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth?mode=login")
  }

  return (
    <div className="w-[300px] h-screen border-r dark:border-neutral-800 p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-center">
        <span className="text-primary">Web</span>-chat
      </h2>
      <div className="flex flex-row items-center justify-center gap-4">
        <Input
          placeholder="Search for friends"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
        />
        <button
          onClick={() => {
            setSearchString("")
          }}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="space-y-2 flex-grow">
        {filteredUsers.map((user) => (
          <Link
            href={`/chat?user=${user.uid}`}
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
          >
            <Avatar>
              <AvatarFallback className="text-primary">
                {user.username?.slice(0, 2).toUpperCase() ||
                  user.email?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.username || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t dark:border-neutral-800 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex-1 justify-start gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" className="gap-2" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
