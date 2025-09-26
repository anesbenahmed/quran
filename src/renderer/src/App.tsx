"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"

interface WarshQuranEntry {
  id: number
  jozz: number
  page: string
  sura_no: number
  sura_name_en: string
  sura_name_ar: string
  line_start: number
  line_end: number
  aya_no: number
  aya_text: string
  hizb: number
  quarter: number
}

// Main App Component
export default function App(): React.ReactNode {
  const [view, setView] = useState("hizb") // 'hizb', 'quarter', 'reading'
  const [selectedHizb, setSelectedHizb] = useState<number | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null)

  // Navigation helpers for reading view
  const isAtStart = view === "reading" && selectedHizb === 1 && selectedQuarter === 1
  const isAtEnd = view === "reading" && selectedHizb === 60 && selectedQuarter === 4
  // Navigation helpers for quarter view (hizb level)
  const isFirstHizb = selectedHizb === 1
  const isLastHizb = selectedHizb === 60

  const goToPrevQuarter = () => {
    if (!selectedHizb || !selectedQuarter) return
    let h = selectedHizb
    let q = selectedQuarter - 1
    if (q < 1) {
      if (h > 1) {
        h = h - 1
        q = 4
      } else {
        return
      }
    }
    setSelectedHizb(h)
    setSelectedQuarter(q)
    setView("reading")
  }

  const goToNextQuarter = () => {
    if (!selectedHizb || !selectedQuarter) return
    let h = selectedHizb
    let q = selectedQuarter + 1
    if (q > 4) {
      if (h < 60) {
        h = h + 1
        q = 1
      } else {
        return
      }
    }
    setSelectedHizb(h)
    setSelectedQuarter(q)
    setView("reading")
  }

  const goToPrevHizb = () => {
    if (!selectedHizb) return
    if (selectedHizb <= 1) return
    setSelectedHizb(selectedHizb - 1)
    setView("quarter")
  }

  const goToNextHizb = () => {
    if (!selectedHizb) return
    if (selectedHizb >= 60) return
    setSelectedHizb(selectedHizb + 1)
    setView("quarter")
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view === "reading") {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          goToNextQuarter()
        } else if (e.key === "ArrowRight") {
          e.preventDefault()
          goToPrevQuarter()
        }
      } else if (view === "quarter") {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          goToNextHizb()
        } else if (e.key === "ArrowRight") {
          e.preventDefault()
          goToPrevHizb()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [view, selectedHizb, selectedQuarter])

  const handleSelectHizb = (hizb: number) => {
    setSelectedHizb(hizb)
    setView("quarter")
  }

  const handleSelectQuarter = (quarter: number) => {
    setSelectedQuarter(quarter)
    setView("reading")
  }

  const handleBack = () => {
    if (view === "reading") {
      setView("quarter")
      setSelectedQuarter(null) // Reset quarter selection
    } else if (view === "quarter") {
      setView("hizb")
      setSelectedHizb(null)
    }
  }

  const getTitle = () => {
    if (view === "reading" && selectedHizb && selectedQuarter) {
      return `الحزب ${selectedHizb}، الربع ${selectedQuarter}`
    }
    if (view === "quarter" && selectedHizb) {
      return `الحزب ${selectedHizb}: اختر ربعا`
    }
    return "قارئ القرآن الكريم"
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f2f7ff]" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b shadow-sm bg-[#f2f7ff] border-[#d7e7ff]">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold arabic-ui text-balance text-neutral-900">{getTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            {view === "quarter" && (
              <>
                <Button
                  variant="outline"
                  onClick={goToPrevHizb}
                  disabled={isFirstHizb}
                  className="arabic-ui gap-2 bg-transparent"
                >
                  <ArrowRight className="h-4 w-4" />
                  السابق
                </Button>
                <Button
                  variant="outline"
                  onClick={goToNextHizb}
                  disabled={isLastHizb}
                  className="arabic-ui gap-2 bg-transparent"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </>
            )}
            {view === "reading" && (
              <>
                <Button
                  variant="outline"
                  onClick={goToPrevQuarter}
                  disabled={isAtStart}
                  className="arabic-ui gap-2 bg-transparent"
                >
                  <ArrowRight className="h-4 w-4" />
                  السابق
                </Button>
                <Button
                  variant="outline"
                  onClick={goToNextQuarter}
                  disabled={isAtEnd}
                  className="arabic-ui gap-2 bg-transparent"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </>
            )}
            {view !== "hizb" && (
              <Button variant="outline" onClick={handleBack} className="arabic-ui gap-2 bg-transparent">
                رجوع
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-y-auto" dir="rtl">
        <div className="container w-full max-w-5xl px-4 py-8" dir="rtl">
          {view === "hizb" && <HizbSelection onSelectHizb={handleSelectHizb} />}
          {view === "quarter" && selectedHizb !== null && (
            <QuarterSelection hizb={selectedHizb} onSelectQuarter={handleSelectQuarter} />
          )}
          {view === "reading" && selectedHizb && selectedQuarter && (
            <ReadingView hizb={selectedHizb} quarter={selectedQuarter} />
          )}
        </div>
      </main>
    </div>
  )
}

// HizbSelection component
function HizbSelection({ onSelectHizb }: { onSelectHizb: (hizb: number) => void }) {
  const hizbs = Array.from({ length: 60 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold arabic-ui">اختر الحزب</h2>
        <p className="text-muted-foreground arabic-ui">اختر الحزب الذي تريد قراءته من القرآن الكريم</p>
      </div>

      <div className="mx-auto grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
        {hizbs.map((hizb) => (
          <Button
            key={hizb}
            variant="outline"
            onClick={() => onSelectHizb(hizb)}
            className="aspect-square h-auto p-4 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {hizb}
          </Button>
        ))}
      </div>
    </div>
  )
}

// QuarterSelection component
function QuarterSelection({
  hizb,
  onSelectQuarter,
}: {
  hizb: number
  onSelectQuarter: (quarter: number) => void
}) {
  const [quarters, setQuarters] = useState<{ quarter: number; preview: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQuarters = async () => {
      setLoading(true)
      setError(null)
      try {
        const previews = await Promise.all(
          [1, 2, 3, 4].map(async (quarter) => {
            const verses = await window.api.query(
              "SELECT aya_text FROM warshquran WHERE hizb = ? AND quarter = ? ORDER BY id",
              [hizb, quarter],
            )
            const preview = verses.map((row) => row.aya_text).join(" ")
            return { quarter, preview }
          }),
        )
        setQuarters(previews)
      } catch (err) {
        console.error("Failed to load quarter previews:", err)
        setError("تعذر تحميل الأرباع. حاول مرة أخرى.")
      } finally {
        setLoading(false)
      }
    }

    loadQuarters()
  }, [hizb])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="arabic-ui text-muted-foreground">جارٍ تحميل الأرباع...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive arabic-ui">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold arabic-ui">اختر الربع</h2>
        <p className="text-muted-foreground arabic-ui">اختر الربع من الحزب {hizb}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quarters.map(({ quarter, preview }) => (
          <Card
            key={quarter}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
            onClick={() => onSelectQuarter(quarter)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold arabic-ui text-primary">الربع</h3>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <span className="text-accent font-bold">{quarter}</span>
                </div>
              </div>

              <div className="quran-text text-right leading-relaxed text-foreground/80 line-clamp-4">
                {preview || "لم يتم العثور على آيات لهذا الربع."}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ReadingView component
function ReadingView({ hizb, quarter }: { hizb: number; quarter: number }) {
  const [ayat, setAyat] = useState<WarshQuranEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAyat = async () => {
      setLoading(true)
      try {
        const results = await window.api.query("SELECT * FROM warshquran WHERE hizb = ? AND quarter = ? ORDER BY id", [
          hizb,
          quarter,
        ])
        setAyat(results)
      } catch (error) {
        console.error("Failed to fetch ayat:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAyat()
  }, [hizb, quarter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="arabic-ui text-muted-foreground">جارٍ تحميل الآيات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto transition-colors">
      <Card className="shadow-none bg-transparent border-0">
        <CardContent className="p-8 md:p-12">
          <div className="space-y-6">
            <div className="text-center border-b pb-6">
              <h2 className="text-2xl font-semibold arabic-ui text-primary mb-2">
                الحزب {hizb} - الربع {quarter}
              </h2>
              <div className="w-16 h-1 bg-accent mx-auto rounded-full"></div>
            </div>

            <div className="quran-text text-right leading-loose text-2xl md:text-3xl text-neutral-900 dark:text-neutral-200 space-y-4" style={{ fontFamily: "Quran", lineHeight: "3.3rem" }}>
              {ayat.length > 0 ? (
                <p className="text-pretty">{ayat.map((aya) => aya.aya_text).join(" ")}</p>
              ) : (
                <p className="arabic-ui text-muted-foreground text-center py-8">لم يتم العثور على آيات لهذا الربع.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
