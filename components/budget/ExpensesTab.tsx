"use client"

import { useState } from "react"
import { useExpensesFixed, useExpensesVariable, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/lib/api/endpoints/expenses"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, ChevronDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { getCategoryIcon, getCategoryLabel } from "@/lib/utils/categories"
import { BudgetFormSheet } from "./BudgetFormSheet"
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

import { useMonthContext } from "@/lib/context/month.context"

export function ExpensesTab() {
  const { month } = useMonthContext()
  const { data: fixedData, isLoading: loadingFixed } = useExpensesFixed()
  const { data: variableData, isLoading: loadingVariable } = useExpensesVariable(month)
  
  const { mutateAsync: createExpense } = useCreateExpense()
  const { mutateAsync: updateExpense } = useUpdateExpense()
  const { mutateAsync: deleteExpense } = useDeleteExpense()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editingType, setEditingType] = useState<"fixed" | "variable">("fixed")
  const [deletingItem, setDeletingItem] = useState<{id: string, type: "fixed" | "variable"} | null>(null)

  const fixedExpenses = fixedData?.expenses || []
  const variableExpenses = variableData?.expenses || []
  
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0)
  const totalVariable = variableExpenses.reduce((acc, curr) => acc + curr.amount, 0)

  const handleAdd = (type: "fixed" | "variable") => {
    setEditingType(type)
    setEditingItem(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (item: any, type: "fixed" | "variable") => {
    setEditingType(type)
    setEditingItem(item)
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      await deleteExpense({ type: deletingItem.type, id: deletingItem.id })
      toast.success("Gasto eliminado")
    } catch (error) {
      toast.error("Error al eliminar")
    } finally {
      setDeletingItem(null)
    }
  }

  const onSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await updateExpense({ type: editingType, id: editingItem.id, dto: values })
      } else {
        await createExpense({ type: editingType, dto: values, month }) 
      }
      setIsSheetOpen(false)
      toast.success(editingItem ? "Gasto actualizado" : "Gasto creado")
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  if (loadingFixed || loadingVariable) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["fixed", "variable"]} className="space-y-4">
        {/* Gastos Fijos */}
        <AccordionItem value="fixed" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex justify-between w-full pr-4 items-center">
              <div className="text-left">
                <h3 className="text-lg font-bold">Gastos Fijos</h3>
                <p className="text-sm text-muted-foreground">Recurrentes (renta, servicios)</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalFixed)}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleAdd("fixed")} className="gap-2">
                <Plus size={16} />
                Añadir gasto fijo
              </Button>
            </div>
            <div className="grid gap-2">
              {fixedExpenses.map(item => (
                <ExpenseItem 
                  key={item.id} 
                  item={item} 
                  onEdit={() => handleEdit(item, "fixed")} 
                  onDelete={() => setDeletingItem({id: item.id, type: "fixed"})} 
                />
              ))}
              {fixedExpenses.length === 0 && <EmptyState />}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gastos Variables */}
        <AccordionItem value="variable" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex justify-between w-full pr-4 items-center">
              <div className="text-left">
                <h3 className="text-lg font-bold">Gastos Variables</h3>
                <p className="text-sm text-muted-foreground">Ocasionales (comida, cine)</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalVariable)}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleAdd("variable")} className="gap-2">
                <Plus size={16} />
                Añadir gasto variable
              </Button>
            </div>
            <div className="grid gap-2">
              {variableExpenses.map(item => (
                <ExpenseItem 
                  key={item.id} 
                  item={item} 
                  onEdit={() => handleEdit(item, "variable")} 
                  onDelete={() => setDeletingItem({id: item.id, type: "variable"})} 
                />
              ))}
              {variableExpenses.length === 0 && <EmptyState />}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <BudgetFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        type={editingType}
        item={editingItem}
        onSubmit={onSubmit}
        isSubmitting={false}
      />

      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el gasto planificado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExpenseItem({ item, onEdit, onDelete }: { item: any, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-lg">{getCategoryIcon(item.category)}</span>
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{getCategoryLabel(item.category)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-semibold">{formatCurrency(item.amount, item.currency)}</p>
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
  return <p className="text-center py-6 text-sm text-muted-foreground">Sin gastos en esta sección.</p>
}
