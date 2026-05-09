"use client"

import { useState } from "react"
import {
  useSinkingFunds,
  useCreateSinkingFund,
  useUpdateSinkingFund,
  useDeleteSinkingFund,
  useAddSinkingFundContribution,
  useSinkingFundContributions,
  useUpdateSinkingFundContribution,
  useDeleteSinkingFundContribution,
} from "@/lib/api/endpoints/sinking-funds"
import { SinkingFundCard } from "@/components/sinking-funds/SinkingFundCard"
import { SinkingFundForm, SinkingFundFormValues } from "@/components/sinking-funds/SinkingFundForm"
import { ContributionForm, SinkingFundContributionFormValues } from "@/components/shared/ContributionForm"
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
import { Plus, TrendingUp, Wallet, Landmark } from "lucide-react"
import { SinkingFund } from "@/types/api"
import { formatCurrency, safeParseDate } from "@/lib/utils/format"
import { format } from "date-fns"
import { toast } from "sonner"

export function SinkingFundsList() {
  const { items: funds, isLoading, error, hasMore, onLoadMore, isFetching } = useSinkingFunds()
  const createFund = useCreateSinkingFund()
  const updateFund = useUpdateSinkingFund()
  const deleteFund = useDeleteSinkingFund()
  const addContribution = useAddSinkingFundContribution()
  const updateContribution = useUpdateSinkingFundContribution()
  const deleteContribution = useDeleteSinkingFundContribution()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isContributionOpen, setIsContributionOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState<SinkingFund | null>(null)
  const [editingContribId, setEditingContribId] = useState<string | null>(null)
  const [deletingContribId, setDeletingContribId] = useState<string | null>(null)

  const { data: contributionsData, isLoading: isLoadingContribs } = useSinkingFundContributions(
    selectedFund?.id ?? "",
    isContributionOpen,
  )

  const contributions: ContributionHistoryItem[] = (contributionsData?.contributions ?? []).map((c) => ({
    contrib_id: c.contrib_id,
    date: c.date,
    amount: c.amount,
    notes: c.notes,
    month: c.month,
  }))

  const editingContrib = contributions.find((c) => c.contrib_id === editingContribId)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error.message} />

  const totalFunds = funds.length
  const totalSaved = funds.reduce((acc, f) => acc + f.current_saved, 0)
  const totalTarget = funds.reduce((acc, f) => acc + f.expected_amount, 0)
  const averageProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const handleCreateOrUpdate = async (values: SinkingFundFormValues) => {
    try {
      if (selectedFund) {
        await updateFund.mutateAsync({ id: selectedFund.id, dto: values })
        toast.success("Fondo actualizado correctamente")
      } else {
        await createFund.mutateAsync(values)
        toast.success("Fondo creado correctamente")
      }
      setIsFormOpen(false)
      setSelectedFund(null)
    } catch (e: any) {
      toast.error(e.message || "Error al procesar el fondo")
    }
  }

  const handleDelete = async () => {
    if (!selectedFund) return
    try {
      await deleteFund.mutateAsync(selectedFund.id)
      toast.success(`Fondo "${selectedFund.name}" eliminado`)
      setIsDeleteDialogOpen(false)
      setSelectedFund(null)
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar el fondo")
    }
  }

  const handleAddContribution = async (values: SinkingFundContributionFormValues) => {
    if (!selectedFund) return
    try {
      await addContribution.mutateAsync({ id: selectedFund.id, dto: values })
      toast.success("Contribución añadida correctamente")
    } catch (e: any) {
      toast.error(e.message || "Error al añadir contribución")
    }
  }

  const handleUpdateContribution = async (values: SinkingFundContributionFormValues) => {
    if (!selectedFund || !editingContribId) return
    try {
      await updateContribution.mutateAsync({
        id: selectedFund.id,
        contrib_id: editingContribId,
        dto: values,
      })
      toast.success("Contribución actualizada")
      setEditingContribId(null)
    } catch (e: any) {
      toast.error(e.message || "Error al actualizar la contribución")
    }
  }

  const handleDeleteContribution = async () => {
    if (!selectedFund || !deletingContribId) return
    try {
      await deleteContribution.mutateAsync({ id: selectedFund.id, contrib_id: deletingContribId })
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
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Fondos Activos</p>
              <h4 className="text-2xl font-bold text-slate-700">{totalFunds}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Total Acumulado</p>
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
                <span className="text-sm">Cobertura General</span>
              </div>
              <span className="text-lg font-bold text-slate-700">{averageProgress}%</span>
            </div>
            <Progress value={averageProgress} className="h-2 bg-indigo-50" />
          </CardContent>
        </Card>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-700">Tus Fondos</h2>
        <Button
          onClick={() => { setSelectedFund(null); setIsFormOpen(true) }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Fondo
        </Button>
      </div>

      {/* Funds Grid */}
      {totalFunds > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map((fund) => (
            <SinkingFundCard
              key={fund.id}
              fund={fund}
              onAddContribution={(f) => { setSelectedFund(f); setIsContributionOpen(true) }}
              onEdit={(f) => { setSelectedFund(f); setIsFormOpen(true) }}
              onDelete={(f) => { setSelectedFund(f); setIsDeleteDialogOpen(true) }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Landmark}
          title="Sin fondos de reserva"
          description="Planifica gastos futuros como reparaciones o renovaciones."
          action={
            <Button onClick={() => setIsFormOpen(true)}>Crear mi primer fondo</Button>
          }
        />
      )}

      <PaginationControls
        hasMore={hasMore}
        isLoading={isFetching}
        onLoadMore={onLoadMore}
        count={funds.length}
        label="fondos"
      />

      {/* Sinking Fund Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedFund ? "Editar Fondo" : "Nuevo Fondo de Reserva"}</SheetTitle>
            <SheetDescription>
              Planifica tus gastos recurrentes o de un solo pago.
            </SheetDescription>
          </SheetHeader>
          <SinkingFundForm
            onSubmit={handleCreateOrUpdate}
            isSubmitting={createFund.isPending || updateFund.isPending}
            initialValues={selectedFund ? {
              name: selectedFund.name,
              description: selectedFund.description,
              expected_amount: selectedFund.expected_amount,
              expected_date: format(safeParseDate(selectedFund.expected_date), "yyyy-MM-dd"),
              current_saved: selectedFund.current_saved,
              monthly_contribution: selectedFund.monthly_contribution,
              currency: selectedFund.currency,
              recurrence: selectedFund.recurrence,
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
              {selectedFund?.name}
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
                  currency={selectedFund?.currency ?? "COP"}
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
                  defaultCurrency={selectedFund?.currency}
                  variant="sinking-fund"
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
              defaultCurrency={selectedFund?.currency}
              variant="sinking-fund"
              initialValues={{
                amount: editingContrib.amount,
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

      {/* Delete Fund Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar fondo?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar el fondo
              <span className="font-bold text-slate-900 mx-1">"{selectedFund?.name}"</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteFund.isPending}>
              {deleteFund.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
