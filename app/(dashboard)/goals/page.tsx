import { PageWrapper } from "@/components/layout/PageWrapper"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GoalsList } from "@/components/goals/GoalsList"
import { SinkingFundsList } from "@/components/sinking-funds/SinkingFundsList"

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const defaultTab = tab === "funds" ? "funds" : "goals"

  return (
    <PageWrapper title="Metas & Fondos">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="goals">Metas de Ahorro</TabsTrigger>
          <TabsTrigger value="funds">Fondos de Reserva</TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="mt-4">
          <GoalsList />
        </TabsContent>
        <TabsContent value="funds" className="mt-4">
          <SinkingFundsList />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
