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

const contributionSchema = z.object({
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  type: z.string().min(1, "Selecciona un tipo"),
  date: z.string().min(1, "Selecciona una fecha"),
  notes: z.string().optional(),
})

type ContributionFormValues = z.infer<typeof contributionSchema>

interface ContributionFormProps {
  onSubmit: (values: ContributionFormValues) => void
  isSubmitting?: boolean
  defaultCurrency?: string
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
  isSubmitting,
  defaultCurrency = "COP",
}: ContributionFormProps) {
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 0,
      type: "regular",
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

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de contribución</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Añadir contribución"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
