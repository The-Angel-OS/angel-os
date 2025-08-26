import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tenant Management - Angel OS',
  description: 'Manage tenant accounts and organizations on Angel OS platform.',
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
