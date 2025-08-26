import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${slug} - Tenant Management`,
    description: `Manage ${slug} tenant account and settings.`,
  }
}

export default function TenantSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
