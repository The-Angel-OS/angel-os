'use client'

import React, { useState, useRef, useCallback } from 'react'
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, HashtagIcon, MicrophoneIcon, VideoCameraIcon, CogIcon, UserGroupIcon, BellIcon, PaperClipIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline'

// Types for the Discord-style interface
interface User {
  id: number
  name: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  role?: string
}

interface Channel {
  id: number
  name: string
  type: 'text' | 'voice' | 'video' | 'announcement'
  unreadCount?: number
  isPrivate?: boolean
}

interface Message {
  id: number
  author: User
  content: string
  timestamp: Date
  attachments?: FileAttachment[]
  mentions?: User[]
  reactions?: { emoji: string; count: number; users: User[] }[]
}

interface FileAttachment {
  id: number
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  size: number
}

interface Space {
  id: number
  name: string
  description?: string
  avatar?: string
  channels: Channel[]
  members: User[]
  roles: string[]
  alerts: { id: number; message: string; type: 'info' | 'warning' | 'error'; read: boolean }[]
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

export default function SpacesDashboard() {
  // Mock data for demonstration
  const mockSpaces: Space[] = [
    {
      id: 1,
      name: "Hays Cactus Farm",
      description: "Business operations and customer engagement",
      channels: [
        { id: 1, name: "general", type: "text", unreadCount: 3 },
        { id: 2, name: "customer-support", type: "text", unreadCount: 12 },
        { id: 3, name: "orders", type: "text", unreadCount: 5 },
        { id: 4, name: "team-voice", type: "voice" },
        { id: 5, name: "announcements", type: "announcement", unreadCount: 1 }
      ],
      members: [
        { id: 1, name: "John Doe", status: "online", role: "Owner" },
        { id: 2, name: "Jane Smith", status: "away", role: "Manager" },
        { id: 3, name: "Mike Johnson", status: "offline", role: "Staff" }
      ],
      roles: ["Owner", "Manager", "Staff", "Customer"],
      alerts: [
        { id: 1, message: "New order requires attention", type: "warning", read: false },
        { id: 2, message: "System maintenance scheduled", type: "info", read: true }
      ]
    },
    {
      id: 2,
      name: "Content Creator Hub",
      description: "Creative collaboration space",
      channels: [
        { id: 6, name: "content-planning", type: "text" },
        { id: 7, name: "feedback", type: "text", unreadCount: 2 },
        { id: 8, name: "live-stream", type: "video" }
      ],
      members: [
        { id: 4, name: "Alex Creator", status: "online", role: "Creator" },
        { id: 5, name: "Sam Editor", status: "busy", role: "Editor" }
      ],
      roles: ["Creator", "Editor", "Subscriber"],
      alerts: []
    }
  ]

  const mockMessages: Message[] = [
    {
      id: 1,
      author: { id: 1, name: "John Doe", status: "online" },
      content: "Welcome to the Hays Cactus Farm space! This is where we coordinate our business operations.",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      author: { id: 2, name: "Jane Smith", status: "away" },
      content: "I've updated the inventory for the Golden Barrel cacti. We're running low on 6-inch pots.",
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: 3,
      author: { id: 1, name: "John Doe", status: "online" },
      content: "Thanks Jane! I'll place an order for more pots today. Also, we have 3 new customer inquiries about shipping.",
      timestamp: new Date(Date.now() - 900000)
    }
  ]

  // State management
  const [activeSpace, setActiveSpace] = useState<Space | null>(null)
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSpaceExpanded, setIsSpaceExpanded] = useState<Record<number, boolean>>({})
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [showMemberList, setShowMemberList] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with first space and channel
  React.useEffect(() => {
    if (mockSpaces.length > 0 && mockSpaces[0]) {
      setActiveSpace(mockSpaces[0])
      if (mockSpaces[0].channels && mockSpaces[0].channels[0]) {
        setActiveChannel(mockSpaces[0].channels[0])
      }
    }
  }, [])

  // Auto-scroll to bottom of messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Toggle space expansion
  const toggleSpaceExpansion = (spaceId: number) => {
    setIsSpaceExpanded(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }))
  }

  // Handle channel selection
  const selectChannel = (space: Space, channel: Channel) => {
    setActiveSpace(space)
    setActiveChannel(channel)
    // TODO: Load messages for this channel
  }

  // Handle message sending
  const sendMessage = () => {
    if (!newMessage.trim() || !activeChannel) return

    const message: Message = {
      id: messages.length + 1,
      author: { id: 1, name: "You", status: "online" },
      content: newMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file) return

      const uploadItem: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      }

      setUploadProgress(prev => [...prev, uploadItem])

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev =>
          prev.map(item =>
            item.file === file && item.status === 'uploading'
              ? { ...item, progress: Math.min(item.progress + 10, 100) }
              : item
          )
        )
      }, 200)

      // Complete upload after progress reaches 100%
      setTimeout(() => {
        clearInterval(interval)
        setUploadProgress(prev =>
          prev.map(item =>
            item.file === file
              ? { ...item, status: 'completed', progress: 100 }
              : item
          )
        )

        // Add file as message
        const fileMessage: Message = {
          id: messages.length + Date.now(),
          author: { id: 1, name: "You", status: "online" },
          content: `Uploaded ${file.name}`,
          timestamp: new Date(),
          attachments: [{
            id: Date.now(),
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' :
                  file.type.startsWith('video/') ? 'video' :
                  file.type.startsWith('audio/') ? 'audio' : 'document',
            url: URL.createObjectURL(file),
            size: file.size,
          }]
        }

        setMessages(prev => [...prev, fileMessage])

        // Remove from upload progress after 2 seconds
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(item => item.file !== file))
        }, 2000)
      }, 2000)
    })
  }, [messages.length])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar - Spaces and Channels */}
      <div className="w-80 bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Spaces Dashboard</h1>
          <p className="text-sm text-gray-400">Multi-tenant collaboration</p>
        </div>

        {/* Spaces List */}
        <div className="flex-1 overflow-y-auto">
          {mockSpaces.map((space) => (
            <div key={space.id} className="mb-2">
              {/* Space Header */}
              <div
                className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleSpaceExpansion(space.id)}
              >
                <div className="flex items-center space-x-2">
                  {isSpaceExpanded[space.id] ?
                    <ChevronDownIcon className="w-4 h-4" /> :
                    <ChevronRightIcon className="w-4 h-4" />
                  }
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {space.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{space.name}</div>
                    <div className="text-xs text-gray-400">{space.members.length} members</div>
                  </div>
                </div>
                {activeSpace && activeSpace.alerts.filter(a => !a.read).length > 0 && (
                  <div className="flex items-center space-x-1">
                    <BellIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs bg-red-500 text-white rounded-full px-2 py-1">
                      {activeSpace.alerts.filter(a => !a.read).length} alerts
                    </span>
                  </div>
                )}
              </div>

              {/* Channels */}
              {isSpaceExpanded[space.id] && (
                <div className="ml-6 space-y-1">
                  {space.channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        activeChannel?.id === channel.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                      }`}
                      onClick={() => selectChannel(space, channel)}
                    >
                      <div className="flex items-center space-x-2">
                        {channel.type === 'text' && <HashtagIcon className="w-4 h-4" />}
                        {channel.type === 'voice' && <MicrophoneIcon className="w-4 h-4" />}
                        {channel.type === 'video' && <VideoCameraIcon className="w-4 h-4" />}
                        {channel.type === 'announcement' && <BellIcon className="w-4 h-4" />}
                        <span className="text-sm">{channel.name}</span>
                      </div>
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Space Button */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-600 hover:bg-blue-700 rounded">
            <PlusIcon className="w-4 h-4" />
            <span>Add Space</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        {activeChannel && (
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {activeChannel.type === 'text' && <HashtagIcon className="w-5 h-5" />}
                {activeChannel.type === 'voice' && <MicrophoneIcon className="w-5 h-5" />}
                {activeChannel.type === 'video' && <VideoCameraIcon className="w-5 h-5" />}
                {activeChannel.type === 'announcement' && <BellIcon className="w-5 h-5" />}
                <div>
                  <h2 className="text-lg font-semibold">{activeChannel.name}</h2>
                  <p className="text-sm text-gray-400">
                    {activeSpace?.name} • {activeSpace?.members.length} members
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {activeChannel.type === 'video' && (
                                  <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`p-2 rounded ${videoEnabled ? 'bg-green-600' : 'bg-gray-600'} hover:opacity-80`}
                  aria-label={videoEnabled ? "Turn off video" : "Turn on video"}
                  title={videoEnabled ? "Turn off video" : "Turn on video"}
                >
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
                )}
                <button
                  onClick={() => setShowMemberList(!showMemberList)}
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded"
                  aria-label={showMemberList ? "Hide member list" : "Show member list"}
                  title={showMemberList ? "Hide member list" : "Show member list"}
                >
                  <UserGroupIcon className="w-5 h-5" />
                </button>
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded"
                  aria-label="Channel settings"
                  title="Channel settings"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 flex">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {message.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{message.author.name}</span>
                      <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <div className="text-gray-300">{message.content}</div>
                    {message.attachments && message.attachments.map((attachment) => (
                      <div key={attachment.id} className="mt-2 p-2 bg-gray-700 rounded flex items-center space-x-2">
                        {attachment.type === 'image' && <PhotoIcon className="w-4 h-4" />}
                        {attachment.type === 'document' && <DocumentIcon className="w-4 h-4" />}
                        <span className="text-sm">{attachment.name}</span>
                        <span className="text-xs text-gray-400">({formatFileSize(attachment.size)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                {uploadProgress.map((upload, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{upload.file.name}</span>
                      <span>{upload.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          upload.status === 'completed' ? 'bg-green-500' :
                          upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            {activeChannel && (
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    title="Attach file"
                    placeholder="Attach file"
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    multiple
                    className="hidden"
                  />
                  <button

                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                    aria-label="Attach file"
                    title="Attach file"
                  >
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`Message #${activeChannel.name}`}
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                    aria-label={`Type a message in ${activeChannel.name}`}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Member List Sidebar */}
          {showMemberList && activeSpace && (
            <div className="w-64 bg-gray-800 border-l border-gray-700">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Members ({activeSpace.members.length})</h3>
                <div className="space-y-2">
                  {activeSpace.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' :
                        member.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{member.name}</div>
                        {member.role && <div className="text-xs text-gray-400">{member.role}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
