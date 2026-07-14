"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Hook de confirmación de borrado.
 *
 * Uso:
 *   const { confirmDelete, confirmDialog } = useConfirmDelete()
 *   ...
 *   <button onClick={() => confirmDelete(() => doDelete(id))} />
 *   ...
 *   {confirmDialog}   // renderizar una vez en el JSX de la vista
 */
export function useConfirmDelete(options?: { title?: string; description?: string }) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  function confirmDelete(action: () => void) {
    setPendingAction(() => action)
  }

  const confirmDialog = (
    <Dialog
      open={pendingAction !== null}
      onOpenChange={open => { if (!open) setPendingAction(null) }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{options?.title ?? "¿Eliminar este registro?"}</DialogTitle>
          <DialogDescription>
            {options?.description ?? "Esta acción no se puede deshacer."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPendingAction(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => { pendingAction?.(); setPendingAction(null) }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirmDelete, confirmDialog }
}
