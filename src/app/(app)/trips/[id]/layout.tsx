import { TripTabs } from "@/components/trip/TripTabs"

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="space-y-4">
      <TripTabs tripId={id} />
      {children}
    </div>
  )
}
