"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function FilesPage() {
  useEffect(() => {
    redirect("/dashboard/file-manager")
  }, [])

  return null
}
