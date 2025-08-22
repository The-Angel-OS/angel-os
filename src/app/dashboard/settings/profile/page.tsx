"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Notification } from "@/components/ui/notification"
import { Loader2, User, Upload, Camera } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from '@payloadcms/ui'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  jobTitle: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      jobTitle: (user as any)?.jobTitle || '',
      bio: (user as any)?.bio || '',
      location: (user as any)?.location || '',
      website: (user as any)?.website || '',
    },
  })

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Profile Settings"
  }, [])

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        jobTitle: (user as any)?.jobTitle || '',
        bio: (user as any)?.bio || '',
        location: (user as any)?.location || '',
        website: (user as any)?.website || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Refresh the page to show updated data
      window.location.reload()
      
      setNotification({
        type: 'success',
        message: 'Profile updated successfully',
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.',
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const media = await response.json()

      // Update user profile with new image
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: media.doc.id,
        }),
      })

      // Refresh page to show new profile picture
      window.location.reload()

      setNotification({
        type: 'success',
        message: 'Profile picture uploaded successfully',
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setNotification({
        type: 'error',
        message: 'Failed to upload profile picture. Please try again.',
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Notification
        type={notification?.type || 'info'}
        message={notification?.message || ''}
        isVisible={!!notification}
        onDismiss={() => setNotification(null)}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Update your profile information and manage your public display.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                This information will be displayed on your profile and used throughout the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      {...register("firstName")}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This is your login email and primary contact method.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle"
                    {...register("jobTitle")}
                    placeholder="e.g. Product Manager, CEO, Developer"
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-destructive">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell us about yourself, your role, and what you're working on..." 
                    className="min-h-[120px]"
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This will be displayed on your public profile and in team directories.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    {...register("location")}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website"
                    type="url"
                    {...register("website")}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving || !isDirty}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isDirty ? 'Save Changes' : 'No Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {(user as any)?.profileImage?.url ? (
                    <img
                      src={(user as any).profileImage.url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-border">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border shadow-sm">
                    <Camera className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Picture
                        </>
                      )}
                    </Button>
                    {(user as any)?.profileImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await fetch('/api/users/profile', {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                profileImage: null,
                              }),
                            })
                            // Refresh page to show removed picture
                            window.location.reload()
                            setNotification({
                              type: 'success',
                              message: 'Profile picture removed successfully',
                            })
                            setTimeout(() => setNotification(null), 3000)
                          } catch (error) {
                            setNotification({
                              type: 'error',
                              message: 'Failed to remove profile picture.',
                            })
                            setTimeout(() => setNotification(null), 3000)
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    title="Profile Image Upload"
                    placeholder="Profile Image Upload"
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB. Square images work best.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
