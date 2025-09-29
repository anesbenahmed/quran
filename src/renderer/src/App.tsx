"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "./components/ui/button"
// Use split components
import HizbSelectionComp from "./components/navigation/HizbSelection"
import QuarterSelectionComp from "./components/navigation/QuarterSelection"
import ReadingViewComp from "./components/reading/ReadingView"

// Main App Component
function App(): React.ReactNode {
  const [view, setView] = useState("hizb") // 'hizb', 'quarter', 'reading'
  const [selectedHizb, setSelectedHizb] = useState<number | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null)
  const [pendingScrollRowId, setPendingScrollRowId] = useState<number | null>(null)

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

  const handleRequestNavigate = (h: number, q: number, rowId?: number) => {
    setSelectedHizb(h)
    setSelectedQuarter(q)
    setView("reading")
    if (rowId != null) setPendingScrollRowId(rowId)
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
          {view === "hizb" && <HizbSelectionComp onSelectHizb={handleSelectHizb} />}
          {view === "quarter" && selectedHizb !== null && (
            <QuarterSelectionComp hizb={selectedHizb} onSelectQuarter={handleSelectQuarter} />
          )}
          {view === "reading" && selectedHizb && selectedQuarter && (
            <ReadingViewComp
              hizb={selectedHizb}
              quarter={selectedQuarter}
              onRequestNavigate={handleRequestNavigate}
              pendingScrollRowId={pendingScrollRowId}
              onPendingScrollConsumed={() => setPendingScrollRowId(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
export default App
