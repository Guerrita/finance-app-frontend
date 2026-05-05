"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useCategories } from "@/lib/api/endpoints/categories"
import { useIncomes } from "@/lib/api/endpoints/income"
import { useExpensesFixed, useExpensesVariable } from "@/lib/api/endpoints/expenses"
import { useMonthContext } from "@/lib/context/month.context"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AmountInput } from "@/components/shared/AmountInput"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Transaction } from "@/types/api"

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  category: z.string().min(1, "La categoría es requerida"),
  currency: z.string().min(1, "La moneda es requerida"),
  income_id: z.string().optional().nullable(),
  expense_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  initialData?: Transaction | null
  onSubmit: (values: TransactionFormValues) => void
  isLoading?: boolean
}

export function TransactionForm({ initialData, onSubmit, isLoading }: TransactionFormProps) {
  const { user } = useAuthStore()
  const { month } = useMonthContext()
  const { data: categories } = useCategories()
  const { data: incomes } = useIncomes()
  const { data: fixedExpenses } = useExpensesFixed()
  const { data: variableExpenses } = useExpensesVariable(month)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || "expense",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      category: initialData?.category || "",
      currency: initialData?.currency || user?.preferred_currency || "COP",
      income_id: initialData?.income_id || null,
      expense_id: initialData?.expense_id || null,
      notes: initialData?.notes || "",
    },
  })

  const type = form.watch("type")

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        amount: initialData.amount,
        description: initialData.description,
        date: initialData.date,
        category: initialData.category,
        currency: initialData.currency,
        income_id: initialData.income_id || null,
        expense_id: initialData.expense_id || null,
        notes: initialData.notes || "",
      })
    }
  }, [initialData, form])

  const currentCategories = type === "income" 
    ? categories?.income_categories 
    : categories?.expense_categories

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 pb-10">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de movimiento</FormLabel>
              <FormControl>
                <Tabs
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    // No resetear categoría si existe en el nuevo tipo (poco probable pero bueno)
                    // Por simplicidad, reseteamos selectores vinculados
                    form.setValue("category", "")
                    form.setValue("income_id", null)
                    form.setValue("expense_id", null)
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 h-11 p-1">
                    <TabsTrigger value="income" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Ingreso</TabsTrigger>
                    <TabsTrigger value="expense" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">Gasto</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <AmountInput
                    value={field.value}
                    onValueChange={field.onChange}
                    currency={form.watch("currency")}
                    error={!!form.formState.errors.amount}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    max={new Date().toISOString().split("T")[0]}
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Pago de arriendo, Salario, etc." className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currentCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name_es}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={type === "income" ? "income_id" : "expense_id"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Vincular con {type === "income" ? "ingreso" : "gasto"}
                </FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(val === "none" ? null : val)} 
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {type === "income" ? (
                      incomes?.incomes.map((inc) => (
                        <SelectItem key={inc.id} value={inc.id}>{inc.name}</SelectItem>
                      ))
                    ) : (
                      <>
                        {fixedExpenses?.expenses.length ? (
                          <>
                            <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fijos</div>
                            {fixedExpenses.expenses.map((exp) => (
                              <SelectItem key={exp.id} value={exp.id}>{exp.name}</SelectItem>
                            ))}
                          </>
                        ) : null}
                        {variableExpenses?.expenses.length ? (
                          <>
                            <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground mt-2 border-t pt-2 uppercase tracking-wider">Variables</div>
                            {variableExpenses.expenses.map((exp) => (
                              <SelectItem key={exp.id} value={exp.id}>{exp.name}</SelectItem>
                            ))}
                          </>
                        ) : null}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Añade detalles adicionales..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" disabled={isLoading}>
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {initialData ? "Actualizar transacción" : "Guardar transacción"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
