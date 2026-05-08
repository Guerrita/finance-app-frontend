"use client"

import { useState } from "react"
import { Receipt, Plus } from "lucide-react"
import { useMonthContext } from "@/lib/context/month.context"
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/lib/api/endpoints/transactions"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { TransactionSummary } from "@/components/transactions/TransactionSummary"
import { TransactionFilters } from "@/components/transactions/TransactionFilters"
import { TransactionList } from "@/components/transactions/TransactionList"
import { TransactionForm, TransactionFormValues } from "@/components/transactions/TransactionForm"
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/types/api"
import { toast } from "sonner"

export default function TransactionsPage() {
  const { month } = useMonthContext()
  const [type, setType] = useState("all")
  const [category, setCategory] = useState("all")

  // State for Sheet (Create/Edit)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  const filters = {
    month,
    type: type === "all" ? undefined : (type as "income" | "expense"),
    category: category === "all" ? undefined : category,
    limit: 20,
  }

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions(filters)

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const handleCreate = async (values: TransactionFormValues) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        income_id: values.income_id || undefined,
        expense_id: values.expense_id || undefined,
        notes: values.notes || undefined,
      } as any)
      setIsSheetOpen(false)
      toast.success("Transacción creada correctamente")
    } catch (error: any) {
      toast.error(error.message || "Error al crear la transacción")
    }
  }

  const handleUpdate = async (values: TransactionFormValues) => {
    if (!editingTransaction) return
    try {
      await updateMutation.mutateAsync({
        id: editingTransaction.id,
        payload: {
          ...values,
          income_id: values.income_id || undefined,
          expense_id: values.expense_id || undefined,
          notes: values.notes || undefined,
        } as any,
      })
      setIsSheetOpen(false)
      setEditingTransaction(null)
      toast.success("Transacción actualizada correctamente")
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la transacción")
    }
  }

  const handleDelete = async () => {
    if (!deletingTransaction) return
    try {
      await deleteMutation.mutateAsync(deletingTransaction.id)
      setIsDeleteDialogOpen(false)
      setDeletingTransaction(null)
      toast.success("Transacción eliminada correctamente")
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la transacción")
    }
  }

  const allTransactions = data?.pages.flatMap((page) => page.transactions) || []
  const summary = data?.pages[0]?.summary || { total_income: 0, total_expenses: 0, balance: 0 }

  const openCreate = () => {
    setEditingTransaction(null)
    setIsSheetOpen(true)
  }

  return (
    <PageWrapper
      title="Transacciones"
      action={
        <Button onClick={openCreate} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Nueva transacción
        </Button>
      }
    >
      <div className="space-y-6 pb-safe">
        <TransactionSummary
          income={summary.total_income}
          expenses={summary.total_expenses}
          balance={summary.balance}
        />

        <TransactionFilters
          type={type}
          setType={setType}
          category={category}
          setCategory={setCategory}
        />

        <div className="space-y-4">
          {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard className="h-24 w-full rounded-2xl" />
            <SkeletonCard className="h-24 w-full rounded-2xl" />
            <SkeletonCard className="h-24 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <ErrorState />
        ) : allTransactions.length === 0 ? (
          <div className="pt-10">
            <EmptyState
              icon={Receipt}
              title="No hay transacciones en este período"
              description="Comienza registrando tus movimientos reales de dinero para tener un control total de tus finanzas."
              action={
                <Button onClick={() => setIsSheetOpen(true)}>
                  Crear mi primera transacción
                </Button>
              }
            />
          </div>
        ) : (
          <TransactionList
            transactions={allTransactions}
            onEdit={(tx) => {
              setEditingTransaction(tx)
              setIsSheetOpen(true)
            }}
            onDelete={(tx) => {
              setDeletingTransaction(tx)
              setIsDeleteDialogOpen(true)
            }}
            onLoadMore={() => fetchNextPage()}
            hasMore={hasNextPage}
            isLoadingMore={isFetchingNextPage}
          />
        )}
      </div>

      {/* Sheet for Create/Edit */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open)
        if (!open) setEditingTransaction(null)
      }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto border-l-0 sm:border-l shadow-2xl">
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-2xl font-bold">
              {editingTransaction ? "Editar transacción" : "Nueva transacción"}
            </SheetTitle>
            <SheetDescription className="text-base">
              {editingTransaction
                ? "Modifica los detalles del movimiento registrado."
                : "Registra un nuevo ingreso o gasto real."}
            </SheetDescription>
          </SheetHeader>
          <TransactionForm
            initialData={editingTransaction}
            onSubmit={editingTransaction ? handleUpdate : handleCreate}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
      </div>
    </PageWrapper>
  )
}
