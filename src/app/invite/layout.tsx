import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invitation - Angel OS',
  description: 'Accept your invitation to join Angel OS',
}

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {children}
        </main>
      </body>
    </html>
  )
}

