import React from "react"
import { Button } from "./ui/button"
import { supabase } from "@/lib/supabase-client"

export default function TestDelete() {
  const handleDelete = async () => {
    const { error } = await supabase.storage
      .from("images")
      .remove(["1745683942444-65582f24-b3c3-4ce6-aeca-e22e141091b3.gif"])

    if (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Button onClick={handleDelete}>Deelte smth</Button>
    </div>
  )
}
