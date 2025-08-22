'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ChatContextType {
  pageContext: string
  userContext: any
  spaceId?: string
  channelSlug?: string
}

const ChatContext = createContext<ChatContextType>({
  pageContext: '',
  userContext: null
})

export const useChatContext = () => useContext(ChatContext)

export const ChatContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const [pageContext, setPageContext] = useState('')
  const [userContext, setUserContext] = useState(null)
  const [spaceId, setSpaceId] = useState<string>()
  const [channelSlug, setChannelSlug] = useState<string>()

  useEffect(() => {
    // Generate page context from pathname
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean)
      
      if (segments.length === 0) {
        setPageContext('homepage')
      } else if (segments[0] === 'dashboard') {
        if (segments[1] === 'settings') {
          setPageContext('settings')
        } else if (segments[1] === 'spaces') {
          setPageContext('spaces')
          if (segments[2]) setSpaceId(segments[2])
          if (segments[3]) setChannelSlug(segments[3])
        } else if (segments[1]) {
          setPageContext(`${segments[1]} dashboard`)
        } else {
          setPageContext('dashboard')
        }
      } else if (segments[0] === 'products') {
        setPageContext('products')
      } else if (segments[0] === 'posts') {
        setPageContext('blog')
      } else if (segments[0] === 'admin') {
        setPageContext('admin')
      } else {
        setPageContext(segments[0] || '')
      }
    }
  }, [pathname])

  const value: ChatContextType = {
    pageContext,
    userContext,
    spaceId,
    channelSlug
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatContextProvider


