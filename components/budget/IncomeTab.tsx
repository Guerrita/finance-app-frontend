"use client"

import { useState } from "react"
import {
  useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome,
  useIncomeVariable, useCreateIncomeVariable, useUpdateIncomeVariable, useDeleteIncomeVariable,
} from "@/lib/api/endpoints/income"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { getCategoryIcon, getCategoryName } from "@/lib/utils/categories"
import { BudgetFormSheet } from "./BudgetFormSheet"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SheetSection = "income" | "income-variable"

export function IncomeTab({ currency = "COP" }: { currency?: string }) {
  const { items: fixedIncomes, isLoading: loadingFixed, hasMore: hasMoreFixed, onLoadMore: loadMoreFixed, isFetching: fetchingFixed } = useIncomes()
  const { items: variableIncomes, isLoading: loadingVariable, hasMore: hasMoreVariable, onLoadMore: loadMoreVariable, isFetching: fetchingVariable } = useIncomeVariable()

  const { mutateAsync: createIncome } = useCreateIncome()
  const { mutateAsync: updateIncome } = useUpdateIncome()
  const { mutateAsync: deleteIncome } = useDeleteIncome()
  const { mutateAsync: createIncomeVariable } = useCreateIncomeVariable()
  const { mutateAsync: updateIncomeVariable } = useUpdateIncomeVariable()
  const { mutateAsync: deleteIncomeVariable } = useDeleteIncomeVariable()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [sheetSection, setSheetSection] = useState<SheetSection>("income")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; section: SheetSection } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalFixed = fixedIncomes.reduce((acc, curr) => acc + curr.amount, 0)
  const totalVariable = variableIncomes.reduce((acc, curr) => acc + curr.amount, 0)

  const handleAdd = (section: SheetSection) => {
    setSheetSection(section)
    setEditingItem(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (item: any, section: SheetSection) => {
    setSheetSection(section)
    setEditingItem(item)
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      if (deletingItem.section === "income") {
        await deleteIncome(deletingItem.id)
      } else {
        await deleteIncomeVariable(deletingItem.id)
      }
      toast.success("Ingreso eliminado")
    } catch {
      toast.error("Error al eliminar")
    } finally {
      setIsDeleting(false)
      setDeletingItem(null)
    }
  }

  const onSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      if (sheetSection === "income") {
        if (editingItem) {
          await updateIncome({ id: editingItem.id, dto: values })
        } else {
          await createIncome({ ...values, is_recurring: true })
        }
      } else {
        if (editingItem) {
          await updateIncomeVariable({ id: editingItem.id, dto: values })
        } else {
          await createIncomeVariable(values)
        }
      }
      setIsSheetOpen(false)
      toast.success(editingItem ? "Ingreso actualizado" : "Ingreso creado")
    } catch {
      toast.error("Error al guardar")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingFixed || loadingVariable) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["fixed", "variable"]} className="space-y-4">
        {/* Ingresos Fijos */}
        <AccordionItem value="fixed" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex justify-between w-full pr-4 items-center">
              <div className="text-left">
                <h3 className="text-lg font-bold">Ingresos Fijos</h3>
                <p className="text-sm text-muted-foreground">Recurrentes (salario, arriendo)</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalFixed, currency)}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleAdd("income")} className="gap-2">
                <Plus size={16} />
                Añadir ingreso fijo
              </Button>
            </div>
            <div className="grid gap-2">
              {fixedIncomes.map((income) => (
                <IncomeItem
                  key={income.id}
                  item={income}
                  currency={currency}
                  showDay
                  onEdit={() => handleEdit(income, "income")}
                  onDelete={() => setDeletingItem({ id: income.id, section: "income" })}
                />
              ))}
              {fixedIncomes.length === 0 && <EmptyState />}
            </div>
            <PaginationControls
              hasMore={hasMoreFixed}
              isLoading={fetchingFixed}
              onLoadMore={loadMoreFixed}
              count={fixedIncomes.length}
              label="ingresos fijos"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Ingresos Variables */}
        <AccordionItem value="variable" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex justify-between w-full pr-4 items-center">
              <div className="text-left">
                <h3 className="text-lg font-bold">Ingresos Variables</h3>
                <p className="text-sm text-muted-foreground">Ocasionales (freelance, ventas)</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalVariable, currency)}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleAdd("income-variable")} className="gap-2">
                <Plus size={16} />
                Añadir ingreso variable
              </Button>
            </div>
            <div className="grid gap-2">
              {variableIncomes.map((income) => (
                <IncomeItem
                  key={income.id}
                  item={income}
                  currency={currency}
                  onEdit={() => handleEdit(income, "income-variable")}
                  onDelete={() => setDeletingItem({ id: income.id, section: "income-variable" })}
                />
              ))}
              {variableIncomes.length === 0 && <EmptyState />}
            </div>
            <PaginationControls
              hasMore={hasMoreVariable}
              isLoading={fetchingVariable}
              onLoadMore={loadMoreVariable}
              count={variableIncomes.length}
              label="ingresos variables"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <BudgetFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        type={sheetSection}
        item={editingItem}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />

      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el ingreso planificado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IncomeItem({
  item,
  currency,
  showDay,
  onEdit,
  onDelete,
}: {
  item: any
  currency: string
  showDay?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-lg">{getCategoryIcon(item.category)}</span>
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase">
            {getCategoryName(item.category)}
            {showDay && item.recurrence_day ? ` · Día ${item.recurrence_day}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-semibold">{formatCurrency(item.amount, item.currency ?? currency)}</p>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return <p className="text-center py-6 text-sm text-muted-foreground">Sin ingresos en esta sección.</p>
}
