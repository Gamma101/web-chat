"use client"

import { supabase } from "@/lib/supabase-client"
import { Session } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import Link from "next/link"
import { Button } from "./ui/button"
import { Settings, LogOut } from "lucide-react"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Input } from "./ui/input"
import { IoMdClose } from "react-icons/io"
import { Moon, Sun, Laptop } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AvatarChange from "./AvatarChange"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  email: string
  username: string
  uid: string
  avatar_url: string | null
}

export default function ChatSidebar({
  session,
  setIsAvatarLoading,
  isAvatarLoading,
}: {
  session: Session | null
  setIsAvatarLoading: React.Dispatch<React.SetStateAction<boolean>>
  isAvatarLoading: boolean
}) {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchString, setSearchString] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const fetchCurrentUser = async () => {
    if (!session?.user?.id) return

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", session.user.id)
      .single()

    if (error) {
      console.error("Error fetching current user:", error)
      return
    }

    if (data) {
      setCurrentUser(data)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [session])

  const fetchUsers = async () => {
    if (!session?.user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
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
        setFilteredUsers(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
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

  useEffect(() => {
    fetchCurrentUser()
  }, [isAvatarLoading])

  return (
    <div className="w-[300px] h-screen border-r dark:border-neutral-800 p-4 flex flex-col">
      <h2 className="text-3xl font-semibold mb-4 text-center">
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
        {isLoading ? (
          <div className="flex justify-center items-center mt-5">
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Link
              href={`/chat?user=${user.uid}`}
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url as string}
                  width={35}
                  height={35}
                  className="bg-secondary rounded-full"
                  alt="user avatar"
                />
              ) : (
                <Avatar>
                  <AvatarFallback className="text-primary">
                    {user.username?.slice(0, 2).toUpperCase() ||
                      user.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium">{user.username || "Anonymous"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex justify-center items-center mt-5">
            <p>No users found</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t dark:border-neutral-800 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  width={35}
                  height={35}
                  className="bg-secondary w-[35px] h-[35px] rounded-full cursor-pointer"
                  alt="user avatar"
                />
              ) : (
                <Avatar className="cursor-pointer">
                  <AvatarFallback className="text-primary">
                    {currentUser?.username?.slice(0, 2).toUpperCase() ||
                      currentUser?.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <div className="">
                <p>
                  Email:{" "}
                  <span className="text-primary">{currentUser?.email}</span>
                </p>
                <p>
                  Username:{" "}
                  <span className="text-primary">{currentUser?.username}</span>
                </p>
                <p>Avatar:</p>
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser?.avatar_url}
                    className="bg-secondary p-2 m-5 w-[200px] h-[200px] rounded-full"
                    alt="user avatar"
                    width={100}
                    height={100}
                  />
                ) : (
                  <Avatar className="w-[200px] m-5 h-[200px] text-7xl mx-auto p-2 bg-secondary/80">
                    <AvatarFallback className="text-primary">
                      {currentUser?.username?.slice(0, 2).toUpperCase() ||
                        currentUser?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="flex justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-[49%] bg-secondary"
                        variant="ghost"
                        size="icon"
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Settings</AlertDialogTitle>
                        <AlertDialogDescription>
                          Customize your chat experience
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <h3 className="text-sm font-medium mb-2">Theme</h3>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setTheme("light")}
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setTheme("dark")}
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Button>
                          <Button
                            variant={theme === "system" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setTheme("system")}
                          >
                            <Laptop className="h-4 w-4 mr-2" />
                            System
                          </Button>
                          <AvatarChange
                            setIsAvatarLoading={setIsAvatarLoading}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    className="w-[49%] bg-secondary"
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5 text-red-400 " />
                    <p className="text-red-400">Log Out</p>
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="">
          <p className="text-primary">{currentUser?.username}</p>

          <p className="text-primary">{currentUser?.email}</p>
        </div>
      </div>
    </div>
  )
}
