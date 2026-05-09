"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
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
import { ContributionType } from "@/types/api"

const goalContributionSchema = z.object({
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  contribution_type: z.string().min(1, "Selecciona un tipo"),
  date: z.string().min(1, "Selecciona una fecha"),
  notes: z.string().optional(),
})

const sinkingFundContributionSchema = z.object({
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  date: z.string().min(1, "Selecciona una fecha"),
  notes: z.string().optional(),
})

export type GoalContributionFormValues = z.infer<typeof goalContributionSchema>
export type SinkingFundContributionFormValues = z.infer<typeof sinkingFundContributionSchema>

export type ContributionFormValues = GoalContributionFormValues | SinkingFundContributionFormValues

interface ContributionFormProps {
  onSubmit: (values: ContributionFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  defaultCurrency?: string
  variant?: "goal" | "sinking-fund"
  initialValues?: {
    amount: number
    contribution_type?: string
    date: string
    notes?: string
  }
}

const CONTRIBUTION_TYPES: { value: ContributionType; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "extra", label: "Extra" },
  { value: "initial", label: "Inicial" },
  { value: "bonus", label: "Bono" },
  { value: "gift", label: "Regalo" },
  { value: "adjustment", label: "Ajuste" },
  { value: "other", label: "Otro" },
]

export function ContributionForm({
  onSubmit,
  onCancel,
  isSubmitting,
  defaultCurrency = "COP",
  variant = "goal",
  initialValues,
}: ContributionFormProps) {
  const isEdit = !!initialValues
  const schema = variant === "goal" ? goalContributionSchema : sinkingFundContributionSchema

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      amount: 0,
      ...(variant === "goal" ? { contribution_type: "regular" } : {}),
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <AmountInput
                  currency={defaultCurrency}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {variant === "goal" && (
          <FormField
            control={form.control}
            name="contribution_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de contribución</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONTRIBUTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ahorro de bono trimestral" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEdit ? "Actualizar" : "Añadir contribución"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
