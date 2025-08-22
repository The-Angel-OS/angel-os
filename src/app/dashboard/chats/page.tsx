"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, MoreHorizontal, Phone, Video } from "lucide-react"

interface ChatPreview {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
  media?: {
    type: "image" | "video"
    url: string
    count?: number
  }
}

const chats: ChatPreview[] = [
  {
    id: "1",
    name: "Jacquenetta Slowgrave",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Great! Looking forward to it. Se...",
    time: "10 minutes",
    unread: 3,
    online: true,
  },
  {
    id: "2",
    name: "Nickola Peever",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Sounds perfect! I've been wanti...",
    time: "40 minutes",
    unread: 2,
  },
  {
    id: "3",
    name: "Farand Hume",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "How about 7 PM at the new Italian...",
    time: "Yesterday",
  },
  {
    id: "4",
    name: "Ossie Peasey",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey Bonnie, yes, definitely! What tim...",
    time: "13 days",
  },
  {
    id: "5",
    name: "Hall Negri",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "No worries at all! I'll grab a table and...",
    time: "2 days",
  },
  {
    id: "6",
    name: "Elyssa Sogot",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "She just told me today.",
    time: "Yesterday",
  },
  {
    id: "7",
    name: "Gil Wilfing",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "See you in 5 minutes!",
    time: "1 day",
  },
  {
    id: "8",
    name: "Bab Cleaton",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "If it takes long you can mail",
    time: "3 hours",
  },
  {
    id: "9",
    name: "Janith Satch",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "It's amazing to see...",
    time: "1 day",
    unread: 2,
  },
]

export default function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chats</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Messages</CardTitle>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-4 pt-0">
                  {chats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === chat.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {chat.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{chat.name}</p>
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                          {chat.unread && (
                            <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Content */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">Jacquenetta Slowgrave</h3>
                      <p className="text-sm text-green-600">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {/* Sample messages */}
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                        <p className="text-sm">Hey! How are you doing today?</p>
                        <p className="text-xs text-muted-foreground mt-1">05:20 PM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[70%]">
                        <p className="text-sm">I'm doing great, thanks for asking!</p>
                        <p className="text-xs text-primary-foreground/70 mt-1">05:22 PM</p>
                      </div>
                    </div>
                    {/* File attachment */}
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">important_documents.pdf</p>
                            <p className="text-xs text-muted-foreground">(50KB)</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                            Preview
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">05:23 PM</p>
                      </div>
                    </div>
                    {/* Media grid */}
                    <div className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                              src="/placeholder.svg?height=150&width=150"
                              alt="Shared image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                            <img
                              src="/placeholder.svg?height=150&width=150"
                              alt="Shared image"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold">+2</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">05:23 PM ✓✓</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2 mt-4">
                  <Input placeholder="Enter message..." className="flex-1" />
                  <Button size="sm">Send</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[700px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">Choose a chat to start messaging</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
