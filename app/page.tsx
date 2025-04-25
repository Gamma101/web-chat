import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"

export default function page() {
  return (
    <div>
      <Header />
      <div className="flex justify-center items-center h-[90vh]">
        <div className="flex flex-col max-w-[600px] gap-5">
          <h1 className="text-5xl">
            Simple chat app, based on{" "}
            <span className="text-primary">Supabase</span>
          </h1>
          <Link href="/chat">
            <Button className="max-w-40">
              <h2 className="">Try It!</h2>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
