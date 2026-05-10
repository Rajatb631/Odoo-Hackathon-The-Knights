import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/login")

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your details and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              city: user.city,
              country: user.country,
              bio: user.bio,
              photoId: user.photoId,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
