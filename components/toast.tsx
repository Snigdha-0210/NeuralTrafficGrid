'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastContextValue = (msg: string) => void

const ToastContext = createContext<ToastContextValue>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((message: string) => {
    setMsg(message)
    setShow(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 2500)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[999] max-w-[280px] rounded-[10px] px-[18px] py-3 text-[13px] transition-all duration-300"
        style={{
          background: 'var(--bg2)',
          border: '1px solid rgba(0,229,255,0.3)',
          color: 'var(--t1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          transform: show ? 'translateY(0)' : 'translateY(80px)',
          opacity: show ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        {msg}
      </div>
    </ToastContext.Provider>
  )
}
