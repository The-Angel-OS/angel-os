import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding - Angel OS',
  description: 'Complete your Angel OS onboarding',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}

