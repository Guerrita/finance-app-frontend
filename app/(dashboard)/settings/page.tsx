"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, User, Mail, DollarSign, Lock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { useMe, useUpdateMe, useDeleteAccount } from "@/lib/api/endpoints/users"
import { useAuthStore } from "@/store/auth.store"
import { ROUTES } from "@/lib/utils/constants"

const CURRENCIES = [
  { code: "USD", label: "USD — Dólar estadounidense" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "MXN", label: "MXN — Peso mexicano" },
  { code: "COP", label: "COP — Peso colombiano" },
  { code: "ARS", label: "ARS — Peso argentino" },
  { code: "BRL", label: "BRL — Real brasileño" },
  { code: "PEN", label: "PEN — Sol peruano" },
  { code: "CLP", label: "CLP — Peso chileno" },
]

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(80, "Máximo 80 caracteres"),
  preferred_currency: z.string().min(1, "Selecciona una moneda"),
})

type ProfileValues = z.infer<typeof profileSchema>

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export default function SettingsPage() {
  const router = useRouter()
  const storeUser = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const { data: user, isLoading } = useMe()
  const updateMe = useUpdateMe()
  const deleteAccount = useDeleteAccount()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: storeUser?.name ?? "",
      preferred_currency: storeUser?.preferred_currency ?? "COP",
    },
  })

  useEffect(() => {
    if (user) {
      reset({ name: user.name, preferred_currency: user.preferred_currency })
    }
  }, [user, reset])

  const onSave = async (values: ProfileValues) => {
    try {
      await updateMe.mutateAsync(values)
      toast.success("Perfil actualizado correctamente")
      reset(values)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message || "Error al actualizar el perfil")
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINAR") return
    try {
      await deleteAccount.mutateAsync()
      logout()
      router.replace(ROUTES.login)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message || "Error al eliminar la cuenta")
      setIsDeleteDialogOpen(false)
    }
  }

  const handleChangePassword = () => {
    const email = user?.email ?? storeUser?.email ?? ""
    router.push(`${ROUTES.forgotPassword}?email=${encodeURIComponent(email)}`)
  }

  const displayUser = user ?? storeUser
  const initials = displayUser?.name ? getInitials(displayUser.name) : "?"

  if (isLoading) {
    return (
      <PageWrapper title="Configuración de perfil">
        <div className="max-w-2xl space-y-6">
          <SkeletonCard className="h-48 rounded-xl" />
          <SkeletonCard className="h-32 rounded-xl" />
          <SkeletonCard className="h-32 rounded-xl" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Configuración de perfil">
      <div className="max-w-2xl space-y-6">
        {/* Personal info */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="h-16 w-16 rounded-full bg-brand-600 flex items-center justify-center shrink-0"
              >
                <span className="text-xl font-bold text-white select-none">{initials}</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {displayUser?.name ?? "—"}
                </h2>
                <p className="text-sm text-muted-foreground">{displayUser?.email ?? "—"}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Nombre
                </Label>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  placeholder="Tu nombre completo"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={displayUser?.email ?? ""}
                  readOnly
                  disabled
                  className="cursor-not-allowed opacity-60"
                />
                <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-currency" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Moneda preferida
                </Label>
                <Select
                  value={watch("preferred_currency")}
                  onValueChange={(val) =>
                    setValue("preferred_currency", val, { shouldDirty: true })
                  }
                >
                  <SelectTrigger id="profile-currency">
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.preferred_currency && (
                  <p className="text-xs text-destructive">
                    {errors.preferred_currency.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Guardar cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Seguridad
            </h3>
            <p className="text-sm text-muted-foreground">
              Cambia tu contraseña siguiendo el proceso de recuperación.
            </p>
            <Button variant="outline" onClick={handleChangePassword}>
              Cambiar contraseña
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/40">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Zona de peligro
            </h3>
            <p className="text-sm text-muted-foreground">
              Eliminar tu cuenta es irreversible. Todos tus datos serán borrados permanentemente.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmText("")
                setIsDeleteDialogOpen(true)
              }}
            >
              Eliminar cuenta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete account dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">¿Eliminar tu cuenta?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="delete-confirm">
              Escribe{" "}
              <span className="font-mono font-bold text-foreground">ELIMINAR</span> para
              confirmar
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "ELIMINAR" || deleteAccount.isPending}
              onClick={handleDeleteAccount}
            >
              {deleteAccount.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Eliminando...
                </>
              ) : (
                "Eliminar mi cuenta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
