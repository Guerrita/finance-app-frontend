"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCategoryName } from "@/lib/utils/categories"
import { useCategories } from "@/lib/api/endpoints/categories"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  category: z.string().min(1, "La categoría es requerida"),
  currency: z.string().min(1, "La moneda es requerida"),
  recurrence_day: z.number().int().min(1).max(31).optional().nullable(),
  start_month: z.string().optional(),
  end_month: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface BudgetFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "income" | "income-variable" | "fixed" | "variable"
  item?: {
    id: string
    name: string
    amount: number
    category: string
    currency: string
    recurrence_day?: number | null
    start_month?: string
    end_month?: string | null
  }
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

export function BudgetFormSheet({
  open,
  onOpenChange,
  type,
  item,
  onSubmit,
  isSubmitting,
}: BudgetFormSheetProps) {
  const { data: categoriesData } = useCategories()

  const isIncomeType = type === "income" || type === "income-variable"
  const categories = isIncomeType
    ? categoriesData?.income_categories
    : categoriesData?.expense_categories

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "",
      currency: "COP",
      recurrence_day: null,
      start_month: "",
      end_month: null,
    },
  })

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        amount: item.amount,
        category: item.category,
        currency: item.currency,
        recurrence_day: item.recurrence_day ?? null,
        start_month: item.start_month ?? "",
        end_month: item.end_month ?? null,
      })
    } else {
      form.reset({
        name: "",
        amount: 0,
        category: "",
        currency: "COP",
        recurrence_day: null,
        start_month: "",
        end_month: null,
      })
    }
  }, [item, form, open])

  const typeLabel = {
    "income": "Ingreso Fijo",
    "income-variable": "Ingreso Variable",
    "fixed": "Gasto Fijo",
    "variable": "Gasto Variable",
  }[type]

  const title = item ? `Editar ${isIncomeType ? "Ingreso" : "Gasto"}` : `Añadir ${typeLabel}`

  const showRecurrenceFields = type === "income" || type === "fixed"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Configura los detalles de tu {isIncomeType ? "ingreso" : "gasto"} planificado.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Salario, Renta, Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {getCategoryName(cat.id) || cat.name_es}
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
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="COP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["COP", "USD", "EUR", "MXN", "ARS", "BRL", "CLP", "PEN"].map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRecurrenceFields && (
              <>
                <FormField
                  control={form.control}
                  name="recurrence_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día del mes (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="Ej. 30 (día en que llega o vence)"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desde (opcional)</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hasta (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="month"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <SheetFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
