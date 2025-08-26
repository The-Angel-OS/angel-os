import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Sign Up - ${slug}`,
    description: `Create your account for ${slug} organization.`,
  }
}

export default function TenantSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
