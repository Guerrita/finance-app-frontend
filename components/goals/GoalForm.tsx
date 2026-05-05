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
import { GoalType } from "@/types/api"
import { 
  Plane, ShieldAlert, TrendingUp, Home, Car, GraduationCap, 
  Heart, Briefcase, Palmtree, Stethoscope, Laptop, PartyPopper, 
  CreditCard, Sofa, PawPrint, Target 
} from "lucide-react"

const goalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  target_amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  target_date: z.string().min(1, "La fecha es requerida"),
  current_saved: z.number().default(0),
  monthly_contribution: z.number().optional(),
  currency: z.string().default("COP"),
})

export type GoalFormValues = z.infer<typeof goalSchema>

interface GoalFormProps {
  onSubmit: (values: GoalFormValues) => void
  isSubmitting?: boolean
  initialValues?: Partial<GoalFormValues>
}

export const GOAL_TYPES: { value: GoalType; label: string; icon: any }[] = [
  { value: "travel", label: "Viaje", icon: Plane },
  { value: "emergency", label: "Emergencia", icon: ShieldAlert },
  { value: "investment", label: "Inversión", icon: TrendingUp },
  { value: "housing", label: "Vivienda", icon: Home },
  { value: "vehicle", label: "Vehículo", icon: Car },
  { value: "education", label: "Educación", icon: GraduationCap },
  { value: "wedding", label: "Boda", icon: Heart },
  { value: "business", label: "Negocio", icon: Briefcase },
  { value: "retirement", label: "Retiro", icon: Palmtree },
  { value: "health", label: "Salud", icon: Stethoscope },
  { value: "electronics", label: "Tecnología", icon: Laptop },
  { value: "celebration", label: "Celebración", icon: PartyPopper },
  { value: "debt_payoff", label: "Pagar Deudas", icon: CreditCard },
  { value: "furniture", label: "Muebles", icon: Sofa },
  { value: "pet", label: "Mascota", icon: PawPrint },
  { value: "other", label: "Otro", icon: Target },
]

export function GoalForm({
  onSubmit,
  isSubmitting,
  initialValues,
}: GoalFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: initialValues?.name || "",
      type: initialValues?.type || "emergency",
      target_amount: initialValues?.target_amount || 0,
      target_date: initialValues?.target_date || format(addMonths(new Date(), 12), "yyyy-MM-dd"),
      current_saved: initialValues?.current_saved || 0,
      monthly_contribution: initialValues?.monthly_contribution,
      currency: initialValues?.currency || "COP",
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
              <FormLabel>Nombre de la meta</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mi primera casa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
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
          name="target_amount"
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
          name="target_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha objetivo</FormLabel>
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
            {isSubmitting ? "Guardando..." : initialValues ? "Actualizar meta" : "Crear meta"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
