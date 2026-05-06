import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DeleteTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteTransactionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteTransactionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl">¿Eliminar esta transacción?</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Esta acción no se puede deshacer. Se eliminará permanentemente la transacción de tu historial.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="sm:order-1"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="gap-2 shadow-lg shadow-rose-500/20 sm:order-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Eliminar transacción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
