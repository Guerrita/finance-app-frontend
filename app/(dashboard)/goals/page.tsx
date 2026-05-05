"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { 
  useGoals, 
  useCreateGoal, 
  useUpdateGoal, 
  useDeleteGoal, 
  useAddGoalContribution 
} from "@/lib/api/endpoints/goals"
import { GoalCard } from "@/components/goals/GoalCard"
import { GoalForm, GoalFormValues } from "@/components/goals/GoalForm"
import { ContributionForm } from "@/components/shared/ContributionForm"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Target, Plus, TrendingUp, Wallet, Target as TargetIcon } from "lucide-react"
import { Goal } from "@/types/api"
import { formatCurrency } from "@/lib/utils/format"
import { toast } from "sonner"

export default function GoalsPage() {
  const { data, isLoading, error } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const addContribution = useAddGoalContribution()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isContributionOpen, setIsContributionOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error.message} />

  const goals = data?.goals || []
  const totalGoals = goals.length
  const totalSaved = goals.reduce((acc, g) => acc + g.current_saved, 0)
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0)
  const averageProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const handleCreateOrUpdate = async (values: GoalFormValues) => {
    try {
      if (selectedGoal) {
        await updateGoal.mutateAsync({ id: selectedGoal.id, dto: values })
        toast.success("Meta actualizada correctamente")
      } else {
        await createGoal.mutateAsync(values)
        toast.success("Meta creada correctamente")
      }
      setIsFormOpen(false)
      setSelectedGoal(null)
    } catch (e: any) {
      toast.error(e.message || "Error al procesar la meta")
    }
  }

  const handleDelete = async () => {
    if (!selectedGoal) return
    try {
      await deleteGoal.mutateAsync(selectedGoal.id)
      toast.success(`Meta "${selectedGoal.name}" eliminada`)
      setIsDeleteDialogOpen(false)
      setSelectedGoal(null)
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar la meta")
    }
  }

  const handleAddContribution = async (values: any) => {
    if (!selectedGoal) return
    try {
      await addContribution.mutateAsync({ id: selectedGoal.id, dto: values })
      toast.success("Contribución añadida correctamente")
      setIsContributionOpen(false)
      setSelectedGoal(null)
    } catch (e: any) {
      toast.error(e.message || "Error al añadir contribución")
    }
  }

  return (
    <PageWrapper title="Metas de ahorro">
      <div className="flex flex-col gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <TargetIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Metas Activas</p>
                <h4 className="text-2xl font-bold text-slate-700">{totalGoals}</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Total Ahorrado</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-slate-700">{formatCurrency(totalSaved)}</h4>
                  <span className="text-[10px] text-slate-400">/ {formatCurrency(totalTarget)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Progreso General</span>
                </div>
                <span className="text-lg font-bold text-slate-700">{averageProgress}%</span>
              </div>
              <Progress value={averageProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Action Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-700">Tus Metas</h2>
          <Button onClick={() => { setSelectedGoal(null); setIsFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Meta
          </Button>
        </div>

        {/* Goals Grid */}
        {totalGoals > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onAddContribution={(g) => { setSelectedGoal(g); setIsContributionOpen(true); }}
                onEdit={(g) => { setSelectedGoal(g); setIsFormOpen(true); }}
                onDelete={(g) => { setSelectedGoal(g); setIsDeleteDialogOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Target}
            title="Aún no tienes metas de ahorro"
            description="¡Empieza con tu fondo de emergencia!"
            action={
              <Button onClick={() => setIsFormOpen(true)}>Crear mi primera meta</Button>
            }
          />
        )}
      </div>

      {/* Goal Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedGoal ? "Editar Meta" : "Nueva Meta de Ahorro"}</SheetTitle>
            <SheetDescription>
              Define cuánto quieres ahorrar y para cuándo.
            </SheetDescription>
          </SheetHeader>
          <GoalForm 
            onSubmit={handleCreateOrUpdate} 
            isSubmitting={createGoal.isPending || updateGoal.isPending}
            initialValues={selectedGoal ? {
              name: selectedGoal.name,
              type: selectedGoal.type,
              target_amount: selectedGoal.target_amount,
              target_date: selectedGoal.target_date,
              current_saved: selectedGoal.current_saved,
              monthly_contribution: selectedGoal.monthly_contribution,
              currency: selectedGoal.currency
            } : undefined}
          />
        </SheetContent>
      </Sheet>

      {/* Contribution Form Sheet */}
      <Sheet open={isContributionOpen} onOpenChange={setIsContributionOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle>Añadir Contribución</SheetTitle>
            <SheetDescription>
              Añade un ahorro a la meta: <span className="font-bold text-slate-700">{selectedGoal?.name}</span>
            </SheetDescription>
          </SheetHeader>
          <ContributionForm 
            onSubmit={handleAddContribution}
            isSubmitting={addContribution.isPending}
            defaultCurrency={selectedGoal?.currency}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar meta?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar la meta 
              <span className="font-bold text-slate-900 mx-1">"{selectedGoal?.name}"</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteGoal.isPending}>
              {deleteGoal.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
