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
import { CATEGORY_LABELS } from "@/lib/utils/categories"
import { useCategories } from "@/lib/api/endpoints/categories"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  category: z.string().min(1, "La categoría es requerida"),
  currency: z.string().min(1, "La moneda es requerida"),
})

type FormValues = z.infer<typeof formSchema>

interface BudgetFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "income" | "fixed" | "variable"
  item?: {
    id: string
    name: string
    amount: number
    category: string
    currency: string
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
  
  const categories = type === "income" 
    ? categoriesData?.income_categories 
    : categoriesData?.expense_categories

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "",
      currency: "COP",
    },
  })

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        amount: item.amount,
        category: item.category,
        currency: item.currency,
      })
    } else {
      form.reset({
        name: "",
        amount: 0,
        category: "",
        currency: "COP",
      })
    }
  }, [item, form, open])

  const title = item 
    ? `Editar ${type === "income" ? "Ingreso" : "Gasto"}`
    : `Añadir ${type === "income" ? "Ingreso" : type === "fixed" ? "Gasto Fijo" : "Gasto Variable"}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Configura los detalles de tu {type === "income" ? "ingreso" : "gasto"} planificado.
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
                    <Input type="number" step="any" placeholder="0.00" {...field} />
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
                          {cat.icon} {CATEGORY_LABELS[cat.id] || cat.name_es}
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
