"use client"

import { useState } from "react"
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useAddGoalContribution,
  useGoalContributions,
  useUpdateGoalContribution,
  useDeleteGoalContribution,
} from "@/lib/api/endpoints/goals"
import { GoalCard } from "@/components/goals/GoalCard"
import { GoalForm, GoalFormValues } from "@/components/goals/GoalForm"
import { ContributionForm, GoalContributionFormValues } from "@/components/shared/ContributionForm"
import { ContributionHistory, ContributionHistoryItem } from "@/components/shared/ContributionHistory"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import { format, addMonths } from "date-fns"
import { toast } from "sonner"

export function GoalsList() {
  const { items: goals, isLoading, error, hasMore, onLoadMore, isFetching } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const addContribution = useAddGoalContribution()
  const updateContribution = useUpdateGoalContribution()
  const deleteContribution = useDeleteGoalContribution()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isContributionOpen, setIsContributionOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [editingContribId, setEditingContribId] = useState<string | null>(null)
  const [deletingContribId, setDeletingContribId] = useState<string | null>(null)

  const { data: contributionsData, isLoading: isLoadingContribs } = useGoalContributions(
    selectedGoal?.id ?? "",
    isContributionOpen,
  )

  const contributions: ContributionHistoryItem[] = (contributionsData?.contributions ?? []).map((c) => ({
    contrib_id: c.contrib_id,
    date: c.date,
    amount: c.amount,
    notes: c.notes,
    contribution_type: c.contribution_type,
    month: c.month,
  }))

  const editingContrib = contributions.find((c) => c.contrib_id === editingContribId)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error.message} />

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

  const handleAddContribution = async (values: GoalContributionFormValues) => {
    if (!selectedGoal) return
    try {
      await addContribution.mutateAsync({
        id: selectedGoal.id,
        dto: { ...values, transaction_type: "deposit" },
      })
      toast.success("Contribución añadida correctamente")
    } catch (e: any) {
      toast.error(e.message || "Error al añadir contribución")
    }
  }

  const handleUpdateContribution = async (values: GoalContributionFormValues) => {
    if (!selectedGoal || !editingContribId) return
    try {
      await updateContribution.mutateAsync({
        id: selectedGoal.id,
        contrib_id: editingContribId,
        dto: { ...values, transaction_type: "deposit" },
      })
      toast.success("Contribución actualizada")
      setEditingContribId(null)
    } catch (e: any) {
      toast.error(e.message || "Error al actualizar la contribución")
    }
  }

  const handleDeleteContribution = async () => {
    if (!selectedGoal || !deletingContribId) return
    try {
      await deleteContribution.mutateAsync({ id: selectedGoal.id, contrib_id: deletingContribId })
      toast.success("Contribución eliminada")
      setDeletingContribId(null)
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar la contribución")
    }
  }

  const handleCloseContributionSheet = (open: boolean) => {
    setIsContributionOpen(open)
    if (!open) {
      setEditingContribId(null)
      setDeletingContribId(null)
    }
  }

  return (
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
        <Button onClick={() => { setSelectedGoal(null); setIsFormOpen(true) }} className="gap-2">
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
              onAddContribution={(g) => { setSelectedGoal(g); setIsContributionOpen(true) }}
              onEdit={(g) => { setSelectedGoal(g); setIsFormOpen(true) }}
              onDelete={(g) => { setSelectedGoal(g); setIsDeleteDialogOpen(true) }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="Aún no tienes metas de ahorro"
          description="¡Empieza con tu fondo de emergencia! Es la meta más importante."
          action={
            <Button onClick={() => setIsFormOpen(true)}>Crear mi primera meta</Button>
          }
        />
      )}

      <PaginationControls
        hasMore={hasMore}
        isLoading={isFetching}
        onLoadMore={onLoadMore}
        count={goals.length}
        label="metas"
      />

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
              target_date: selectedGoal.target_date
                ? format(new Date(selectedGoal.target_date * 1000), "yyyy-MM-dd")
                : format(addMonths(new Date(), 12), "yyyy-MM-dd"),
              current_saved: selectedGoal.current_saved,
              monthly_contribution: selectedGoal.monthly_contribution,
              currency: selectedGoal.currency,
            } : undefined}
          />
        </SheetContent>
      </Sheet>

      {/* Contribution Sheet — history + add/edit form */}
      <Sheet open={isContributionOpen} onOpenChange={handleCloseContributionSheet}>
        <SheetContent className="sm:max-w-md overflow-y-auto flex flex-col gap-6">
          <SheetHeader>
            <SheetTitle>
              {editingContribId ? "Editar Contribución" : "Contribuciones"}
            </SheetTitle>
            <SheetDescription>
              {selectedGoal?.name}
            </SheetDescription>
          </SheetHeader>

          {!editingContribId && (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Historial
                </p>
                <ContributionHistory
                  items={contributions}
                  currency={selectedGoal?.currency ?? "COP"}
                  isLoading={isLoadingContribs}
                  onEdit={(contrib_id) => setEditingContribId(contrib_id)}
                  onDelete={(contrib_id) => setDeletingContribId(contrib_id)}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Nueva contribución
                </p>
                <ContributionForm
                  key="new"
                  onSubmit={handleAddContribution as any}
                  isSubmitting={addContribution.isPending}
                  defaultCurrency={selectedGoal?.currency}
                  variant="goal"
                />
              </div>
            </>
          )}

          {editingContribId && editingContrib && (
            <ContributionForm
              key={editingContribId}
              onSubmit={handleUpdateContribution as any}
              onCancel={() => setEditingContribId(null)}
              isSubmitting={updateContribution.isPending}
              defaultCurrency={selectedGoal?.currency}
              variant="goal"
              initialValues={{
                amount: editingContrib.amount,
                contribution_type: editingContrib.contribution_type,
                date: editingContrib.date,
                notes: editingContrib.notes,
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Contribution Dialog */}
      <Dialog
        open={!!deletingContribId}
        onOpenChange={(open) => { if (!open) setDeletingContribId(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar contribución?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeletingContribId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContribution}
              disabled={deleteContribution.isPending}
            >
              {deleteContribution.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Confirmation Dialog */}
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
    </div>
  )
}
