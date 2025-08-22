import { VAPIPhoneManagement } from '@/components/VAPIPhoneManagement'

export default function VAPIManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <VAPIPhoneManagement />
    </div>
  )
}

export const metadata = {
  title: 'VAPI Phone Management - Spaces Commerce',
  description: 'Manage voice AI phone numbers and business agents'
}
