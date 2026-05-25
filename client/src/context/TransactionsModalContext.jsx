import { createContext, useContext, useState } from 'react'
import { AddTransactionModal } from '../components/AddTransactionModal.jsx'

const Ctx = createContext(null)

export function TransactionModalProvider({ children, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)  // ADD

  return (
    <Ctx.Provider value={{ openAddTransaction: () => setOpen(true), refreshKey }}>
      {children}
      {open && (
        <AddTransactionModal
          onClose={() => setOpen(false)}
          onSuccess={async (data) => {
            await onSuccess?.(data)
            setRefreshKey(k => k + 1)
            setOpen(false)
          }}
        />
      )}
    </Ctx.Provider>
  )
}

export function useTransactionModal() {
  return useContext(Ctx)
}