"use client"

import { useState, useEffect } from "react"

const AUTH_KEY = "dash_auth"
const PASSWORD = "dash26"

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === PASSWORD)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === PASSWORD) {
      localStorage.setItem(AUTH_KEY, PASSWORD)
      setAuthed(true)
    } else {
      setError(true)
      setInput("")
    }
  }

  if (authed === null) return null

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito ao time interno</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false) }}
              placeholder="Senha"
              autoFocus
              className={`w-full rounded-md border px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive" : "border-input"}`}
            />
            {error && <p className="text-xs text-destructive">Senha incorreta</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
