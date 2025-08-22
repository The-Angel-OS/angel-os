import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Angel OS Spaces | Dashboard',
  description: 'Collaborative workspace and AI-powered business intelligence',
}

export default async function SpacesPage() {
  // Always redirect to default dashboard - this is the main entry point
  redirect('/spaces/default/dashboard')
}