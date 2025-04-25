"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

interface EditMessageProps {
  initialText: string
  onSave: (newText: string) => void
  onCancel: () => void
}

export default function EditMessage({
  initialText,
  onSave,
  onCancel,
}: EditMessageProps) {
  const [editedText, setEditedText] = useState(initialText)

  useEffect(() => {
    setEditedText(initialText)
  }, [initialText])

  const handleSave = () => {
    if (editedText.trim() !== "") {
      onSave(editedText)
    }
  }

  return (
    <div className="flex flex-col gap-2 p-2 bg-background rounded-lg">
      <Input
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSave()
          }
        }}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
