"use client"
import { useState, useEffect } from "react"
import type React from "react"

// Use split components
import HizbSelectionComp from "./components/navigation/HizbSelection"
import QuarterSelectionComp from "./components/navigation/QuarterSelection"
import ReadingViewComp from "./components/reading/ReadingView"
import Sidebar from "./components/layout/Sidebar"
import { Button } from "./components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

// Main App Component
function App(): React.ReactNode {
  const [view, setView] = useState("hizb") // 'hizb', 'quarter', 'reading'
  const [selectedHizb, setSelectedHizb] = useState<number | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null)
  const [pendingScrollRowId, setPendingScrollRowId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const layoutDirection = view === "reading" ? "flex-row" : "flex-row-reverse"

  return (
    <div className={`flex min-h-screen ${layoutDirection} bg-[#f2f7ff]`}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        side={view === "reading" ? "left" : "right"}
        onOpenAnnotations={() => {
          if (view !== 'reading') {
            // If we already have a hizb+quarter selected, navigate to reading first
            if (selectedHizb && selectedQuarter) {
              setView('reading')
              setTimeout(() => window.dispatchEvent(new Event('open-annotations-panel')), 50)
              return
            }
            // If we're in quarter view with a hizb selected but no quarter yet, default to quarter 1
            if (view === 'quarter' && selectedHizb && !selectedQuarter) {
              setSelectedQuarter(1)
              setView('reading')
              setTimeout(() => window.dispatchEvent(new Event('open-annotations-panel')), 80)
              return
            }
            // Otherwise, keep UI consistent; user can pick hizb/quarter then open panel
          } else {
            window.dispatchEvent(new Event('open-annotations-panel'))
          }
        }}
      />
      <main className="flex-1 overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-4 py-8" dir="rtl">
          {view !== "hizb" && (
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-30"
              onClick={handleBack}
              aria-label="رجوع"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {view === "hizb" && (
            <div className="min-h-[calc(100vh-0px)] flex items-center justify-center" dir="rtl">
              <HizbSelectionComp onSelectHizb={handleSelectHizb} />
            </div>
          )}
          {view === "quarter" && selectedHizb !== null && (
            <div>
              <QuarterSelectionComp hizb={selectedHizb} onSelectQuarter={handleSelectQuarter} />
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevHizb}
                  disabled={isFirstHizb}
                  aria-label="السابق"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextHizb}
                  disabled={isLastHizb}
                  aria-label="التالي"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
          {view === "reading" && selectedHizb && selectedQuarter && (
            <ReadingViewComp
              hizb={selectedHizb}
              quarter={selectedQuarter}
              onRequestNavigate={handleRequestNavigate}
              pendingScrollRowId={pendingScrollRowId}
              onPendingScrollConsumed={() => setPendingScrollRowId(null)}
              onPrevQuarter={goToPrevQuarter}
              onNextQuarter={goToNextQuarter}
            />
          )}
        </div>
      </main>
    </div>
  )
}
export default App
