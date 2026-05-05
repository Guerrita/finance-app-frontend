"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AmountInput } from "@/components/shared/AmountInput"
import { SinkingFundRecurrence } from "@/types/api"

const sinkingFundSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  expected_amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  expected_date: z.string().min(1, "La fecha es requerida"),
  current_saved: z.number().default(0),
  monthly_contribution: z.number().optional(),
  currency: z.string().default("COP"),
  recurrence: z.enum(["one-time", "monthly", "quarterly", "yearly"]),
})

export type SinkingFundFormValues = z.infer<typeof sinkingFundSchema>

interface SinkingFundFormProps {
  onSubmit: (values: SinkingFundFormValues) => void
  isSubmitting?: boolean
  initialValues?: Partial<SinkingFundFormValues>
}

const RECURRENCE_OPTIONS: { value: SinkingFundRecurrence; label: string }[] = [
  { value: "one-time", label: "Único" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
]

export function SinkingFundForm({
  onSubmit,
  isSubmitting,
  initialValues,
}: SinkingFundFormProps) {
  const form = useForm<SinkingFundFormValues>({
    resolver: zodResolver(sinkingFundSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      expected_amount: initialValues?.expected_amount || 0,
      expected_date: initialValues?.expected_date || format(addMonths(new Date(), 6), "yyyy-MM-dd"),
      current_saved: initialValues?.current_saved || 0,
      monthly_contribution: initialValues?.monthly_contribution,
      currency: initialValues?.currency || "COP",
      recurrence: initialValues?.recurrence || "one-time",
    },
  })

  const currency = form.watch("currency")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del fondo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Reparaciones del hogar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Para imprevistos de la casa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="COP" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expected_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto objetivo</FormLabel>
              <FormControl>
                <AmountInput
                  currency={currency}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expected_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha estimada</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="current_saved"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ya tengo ahorrado</FormLabel>
              <FormControl>
                <AmountInput
                  currency={currency}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthly_contribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contribución mensual (opcional)</FormLabel>
              <FormControl>
                <AmountInput
                  currency={currency}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <p className="text-[10px] text-muted-foreground">
                Si lo dejas vacío, el sistema lo calculará automáticamente.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : initialValues ? "Actualizar fondo" : "Crear fondo"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
