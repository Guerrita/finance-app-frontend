"use client"

import { useState } from "react"
import { useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome } from "@/lib/api/endpoints/income"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { getCategoryIcon, getCategoryLabel } from "@/lib/utils/categories"
import { BudgetFormSheet } from "./BudgetFormSheet"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function IncomeTab() {
  const { data, isLoading } = useIncomes()
  const { mutateAsync: createIncome } = useCreateIncome()
  const { mutateAsync: updateIncome } = useUpdateIncome()
  const { mutateAsync: deleteIncome } = useDeleteIncome()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const incomes = data?.incomes || []
  const total = incomes.reduce((acc, curr) => acc + curr.amount, 0)

  const handleAdd = () => {
    setEditingItem(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteIncome(deletingId)
      toast.success("Ingreso eliminado")
    } catch (error) {
      toast.error("Error al eliminar")
    } finally {
      setDeletingId(null)
    }
  }

  const onSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await updateIncome({ id: editingItem.id, dto: values }) 
      } else {
        await createIncome({ ...values, type: "fixed" })
      }
      setIsSheetOpen(false)
      toast.success(editingItem ? "Ingreso actualizado" : "Ingreso creado")
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Planificado</p>
          <h2 className="text-3xl font-bold">{formatCurrency(total)}</h2>
        </div>
        <Button onClick={handleAdd} gap={2}>
          <Plus size={18} />
          Añadir ingreso
        </Button>
      </div>

      <div className="grid gap-3">
        {incomes.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            No hay ingresos planificados.
          </p>
        ) : (
          incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {getCategoryIcon(income.category)}
                </div>
                <div>
                  <p className="font-semibold">{income.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getCategoryLabel(income.category)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-bold text-lg">{formatCurrency(income.amount, income.currency)}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(income)}>
                    <Edit2 size={16} className="text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingId(income.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BudgetFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        type="income"
        item={editingItem}
        onSubmit={onSubmit}
        isSubmitting={false}
      />

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el ingreso planificado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
