import React from "react"
interface Message {
  id: string
  sender_id: string
  reciever_id: string
  message: string
  created_at: string
  image_url: string
}

export default function ProfileImages({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-row flex-wrap gap-5 justify-center bg-background w-[90%] rounded-2xl p-10">
      {messages.map((message) => {
        return (
          <div key={message.id} className="rounded-2xl">
            <img
              className="h-[150px] p-5 bg-secondary rounded-lg"
              src={message.image_url}
              alt="Message Image"
            />
          </div>
        )
      })}
    </div>
  )
}
