"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBudgetSetup, useUpdateBudgetSetup } from "@/lib/api/endpoints/budget"
import { useEffect } from "react"
import { toast } from "sonner"
import { AmountInput } from "@/components/shared/AmountInput"

const configSchema = z.object({
  currency: z.string().min(1),
  monthly_income_goal: z.number().min(0),
  savings_rate_target: z.array(z.number()).or(z.number()),
})

export function BudgetConfigTab() {
  const { data: setup, isLoading } = useBudgetSetup()
  const { mutateAsync: updateSetup, isPending } = useUpdateBudgetSetup()

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      currency: "COP",
      monthly_income_goal: 0,
      savings_rate_target: [10],
    },
  })

  useEffect(() => {
    if (setup) {
      form.reset({
        currency: setup.currency,
        monthly_income_goal: setup.monthly_income_goal,
        savings_rate_target: [setup.savings_rate_target * 100],
      })
    }
  }, [setup, form])

  async function onSubmit(values: z.infer<typeof configSchema>) {
    try {
      const savingsRate = Array.isArray(values.savings_rate_target) 
        ? values.savings_rate_target[0] / 100 
        : values.savings_rate_target / 100

      await updateSetup({
        currency: values.currency,
        monthly_income_goal: values.monthly_income_goal,
        savings_rate_target: savingsRate,
      })
      toast.success("Configuración guardada")
    } catch (error) {
      toast.error("Error al guardar la configuración")
    }
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Presupuesto</CardTitle>
        <CardDescription>
          Define tus metas financieras mensuales y moneda preferida.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda preferida</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona moneda" />
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

            <FormField
              control={form.control}
              name="monthly_income_goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta de ingreso mensual</FormLabel>
                  <FormControl>
                    <AmountInput
                      currency={form.watch("currency")}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val ?? 0)}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="savings_rate_target"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Meta de ahorro (%)</FormLabel>
                    <span className="text-sm font-medium">
                      {Array.isArray(field.value) ? field.value[0] : field.value}%
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={50}
                      step={1}
                      value={Array.isArray(field.value) ? field.value : [field.value]}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Guardando..." : "Guardar configuración"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
