import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import * as SettingsService from "../services/settings"

type Section = "reading" | "marks" | "settings"

type Theme = "light" | "dark" | "system"
type Accent = "default" | "blue" | "indigo" | "emerald"

export interface AppSettings {
  theme: Theme
  accent: Accent
}

interface AppContextValue {
  section: Section
  setSection: (s: Section) => void
  settings: AppSettings
  setTheme: (t: Theme) => Promise<void>
  setAccent: (a: Accent) => Promise<void>
  goToReading: (hizb: number, quarter: number, rowId?: number) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<Section>("reading")
  const [settings, setSettings] = useState<AppSettings>({ theme: "system", accent: "default" })

  // Apply theme to <html> element
  const applyTheme = useCallback((t: Theme) => {
    const html = document.documentElement
    if (t === "system") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      html.classList.toggle("dark", prefersDark)
    } else {
      html.classList.toggle("dark", t === "dark")
    }
  }, [])

  useEffect(() => {
    let remove: (() => void) | undefined
    if (settings.theme === "system") {
      const mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => applyTheme("system")
      mql?.addEventListener?.("change", handler)
      remove = () => mql?.removeEventListener?.("change", handler)
    }
    applyTheme(settings.theme)
    return () => remove && remove()
  }, [settings.theme, applyTheme])

  // Apply accent class on <html>
  useEffect(() => {
    const html = document.documentElement
    const classes = ["theme-blue", "theme-indigo", "theme-emerald"]
    classes.forEach((c) => html.classList.remove(c))
    if (settings.accent && settings.accent !== "default") {
      html.classList.add(`theme-${settings.accent}`)
    }
  }, [settings.accent])

  // Load settings from DB
  useEffect(() => {
    (async () => {
      try {
        await SettingsService.initialize()
        const theme = (await SettingsService.get("theme")) as Theme | null
        const accent = (await SettingsService.get("accent")) as Accent | null
        setSettings((s) => ({
          ...s,
          theme: theme ?? s.theme,
          accent: accent ?? s.accent,
        }))
      } catch (e) {
        console.error("Failed to init/load settings:", e)
      }
    })()
  }, [])

  const setTheme = useCallback(async (t: Theme) => {
    setSettings((s) => ({ ...s, theme: t }))
    try {
      await SettingsService.set("theme", t)
    } catch (e) {
      console.error("Failed to persist theme:", e)
    }
  }, [])

  const setAccent = useCallback(async (a: Accent) => {
    setSettings((s) => ({ ...s, accent: a }))
    try {
      await SettingsService.set("accent", a)
    } catch (e) {
      console.error("Failed to persist accent:", e)
    }
  }, [])

  const goToReading = useCallback((hizb: number, quarter: number, rowId?: number) => {
    setSection("reading")
    window.dispatchEvent(
      new CustomEvent("app:navigate-reading", { detail: { hizb, quarter, rowId } }) as any,
    )
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({ section, setSection, settings, setTheme, setAccent, goToReading }),
    [section, settings, setTheme, setAccent, goToReading],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppContext must be used within AppProvider")
  return ctx
}
