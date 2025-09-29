"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import type React from "react"

import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog"
import { Textarea } from "./components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"

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
          {view === "hizb" && <HizbSelection onSelectHizb={handleSelectHizb} />}
          {view === "quarter" && selectedHizb !== null && (
            <QuarterSelection hizb={selectedHizb} onSelectQuarter={handleSelectQuarter} />
          )}
          {view === "reading" && selectedHizb && selectedQuarter && (
            <ReadingView
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
function ReadingView({
  hizb,
  quarter,
  onRequestNavigate,
  pendingScrollRowId,
  onPendingScrollConsumed,
}: {
  hizb: number
  quarter: number
  onRequestNavigate?: (h: number, q: number, rowId?: number) => void
  pendingScrollRowId?: number | null
  onPendingScrollConsumed?: () => void
}) {
  const [ayat, setAyat] = useState<WarshQuranEntry[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Annotation types and state (mock persistence via localStorage)
  type Boundary = { rowId: number; offset: number }
  type AnnotationType = "note" | "mistake" | "mutashabih"
  interface Annotation {
    id: string
    type: AnnotationType
    start: Boundary
    end: Boundary
    color?: string
    note?: string
    createdAt: number
    hizb: number
    quarter: number
    excerpt: string
    groupId?: string
  }
  const [globalAnnotations, setGlobalAnnotations] = useState<Annotation[]>([])
  const [groups, setGroups] = useState<{ id: string; color: string; label?: string | null }[]>([])

  const [panelOpen, setPanelOpen] = useState(false)
  const [flashRowId, setFlashRowId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "note" | "mistake" | "mutashabih">("all")
  const didMigrateRef = useRef(false)

  // Context menu and dialogs
  const [contextMenu, setContextMenu] = useState<
    | { visible: true; x: number; y: number; range: { start: Boundary; end: Boundary }; selectionText: string }
    | { visible: false }
  >({ visible: false })

  const [pendingType, setPendingType] = useState<AnnotationType | null>(null)
  const [pendingRange, setPendingRange] = useState<{ start: Boundary; end: Boundary } | null>(null)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [colorDialogOpen, setColorDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [colorValue, setColorValue] = useState<string>("#ff0000")
  const [selectedGroupId, setSelectedGroupId] = useState<"new" | string>("new")

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

  // Initialize marks DB and load data
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        await window.api.marks.init()
        const [anns, grps] = await Promise.all([
          window.api.marks.list(),
          window.api.groups.list(),
        ])
        if (!mounted) return
        const mapped: Annotation[] = anns.map((r: any) => ({
          id: r.id,
          type: r.type,
          start: { rowId: r.start_row_id, offset: r.start_offset },
          end: { rowId: r.end_row_id, offset: r.end_offset },
          color: r.color ?? undefined,
          note: r.note ?? undefined,
          createdAt: r.created_at,
          hizb: r.hizb,
          quarter: r.quarter,
          excerpt: r.excerpt ?? "",
          groupId: r.group_id ?? undefined,
        }))
        setGlobalAnnotations(mapped)
        setGroups(grps.map((g: any) => ({ id: g.id, color: g.color, label: g.label ?? null })))
      } catch (e) {
        console.error('Failed to init/load marks DB:', e)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [])

  // Mark migration flag as done (no localStorage migration now)
  useEffect(() => {
    didMigrateRef.current = true
  }, [])

  // When current hizb+quarter is loaded, fill missing excerpts for items in this context and persist
  useEffect(() => {
    if (!ayat || ayat.length === 0) return
    setGlobalAnnotations((prev) => {
      let changed = false
      const updated = prev.map((a) => {
        if (a.hizb === hizb && a.quarter === quarter && (!a.excerpt || a.excerpt.length === 0)) {
          try {
            const ex = getTextForRange({ start: a.start, end: a.end }).slice(0, 200)
            if (ex && ex !== a.excerpt) {
              changed = true
              // Persist to DB
              window.api.marks.update(a.id, { excerpt: ex }).catch(() => {})
              return { ...a, excerpt: ex }
            }
          } catch {}
        }
        return a
      })
      return changed ? updated : prev
    })
  }, [ayat, hizb, quarter])

  const rowIndexById = useMemo(() => {
    const map = new Map<number, number>()
    ayat.forEach((a, i) => map.set(a.id, i))
    return map
  }, [ayat])

  // Only annotations for current hizb+quarter are rendered in the text
  const currentAnns = useMemo(
    () => globalAnnotations.filter((a) => a.hizb === hizb && a.quarter === quarter),
    [globalAnnotations, hizb, quarter],
  )

  // Mutashabihat groups derived from all annotations
  const mutaGroups = useMemo(() => {
    const map = new Map<string, { id: string; color: string; sample: string; count: number }>()
    for (const g of groups) {
      map.set(g.id, { id: g.id, color: g.color, sample: "", count: 0 })
    }
    for (const a of globalAnnotations) {
      if (a.type !== "mutashabih" || !a.groupId) continue
      const ex = a.excerpt || ""
      if (!map.has(a.groupId)) {
        map.set(a.groupId, { id: a.groupId, color: a.color || "#fde68a", sample: ex, count: 1 })
      } else {
        const g = map.get(a.groupId)!
        g.count += 1
        if (!g.sample && ex) g.sample = ex
      }
    }
    return Array.from(map.values())
  }, [globalAnnotations, groups])

  // Helpers to compute boundaries
  const getRowSpanAncestor = (node: Node | null): HTMLElement | null => {
    let el = node instanceof HTMLElement ? node : node?.parentElement || null
    while (el) {
      if (el instanceof HTMLElement && el.dataset && el.dataset.rowid) return el
      el = el.parentElement
    }
    return null
  }

  const getBoundaryFromPoint = (node: Node, offset: number): Boundary | null => {
    const rowSpan = getRowSpanAncestor(node)
    if (!rowSpan) return null
    const rowId = Number(rowSpan.dataset.rowid)
    try {
      const r = document.createRange()
      r.setStart(rowSpan, 0)
      r.setEnd(node, offset)
      const charOffset = r.toString().length
      return { rowId, offset: charOffset }
    } catch (e) {
      console.warn("Failed to compute boundary from point:", e)
      return null
    }
  }

  const isNodeInsideContainer = (node: Node | null) => {
    if (!containerRef.current || !node) return false
    const container = containerRef.current
    return container.contains(node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement)
  }

  const normalizeRange = (a: Boundary, b: Boundary): { start: Boundary; end: Boundary } => {
    const ai = rowIndexById.get(a.rowId) ?? -1
    const bi = rowIndexById.get(b.rowId) ?? -1
    if (ai < bi) return { start: a, end: b }
    if (ai > bi) return { start: b, end: a }
    // same row
    return a.offset <= b.offset ? { start: a, end: b } : { start: b, end: a }
  }

  const getTextForRange = (range: { start: Boundary; end: Boundary }): string => {
    const startIdx = rowIndexById.get(range.start.rowId)
    const endIdx = rowIndexById.get(range.end.rowId)
    if (startIdx == null || endIdx == null) return ""
    const parts: string[] = []
    for (let i = startIdx; i <= endIdx; i++) {
      const row = ayat[i]
      if (i === startIdx && i === endIdx) {
        parts.push(row.aya_text.slice(range.start.offset, range.end.offset))
      } else if (i === startIdx) {
        parts.push(row.aya_text.slice(range.start.offset))
      } else if (i === endIdx) {
        parts.push(row.aya_text.slice(0, range.end.offset))
      } else {
        parts.push(row.aya_text)
      }
    }
    return parts.join(" ")
  }

  const handleContextMenu: React.MouseEventHandler = (e) => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    if (!isNodeInsideContainer(sel.anchorNode) || !isNodeInsideContainer(sel.focusNode)) return
    e.preventDefault()
    const a = getBoundaryFromPoint(sel.anchorNode!, sel.anchorOffset)
    const b = getBoundaryFromPoint(sel.focusNode!, sel.focusOffset)
    if (!a || !b) return
    const range = normalizeRange(a, b)
    // prevent zero-length
    if (range.start.rowId === range.end.rowId && range.start.offset === range.end.offset) return
    const selectionText = getTextForRange(range).slice(0, 120)
    setPendingRange(range)
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, range, selectionText })
  }

  // Hide context menu on click/scroll/escape
  useEffect(() => {
    if (!contextMenu.visible) return
    const onDocClick = () => setContextMenu({ visible: false })
    const onScroll = () => setContextMenu({ visible: false })
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setContextMenu({ visible: false })
    }
    document.addEventListener("click", onDocClick)
    document.addEventListener("scroll", onScroll, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("click", onDocClick)
      document.removeEventListener("scroll", onScroll, true)
      document.removeEventListener("keydown", onKey)
    }
  }, [contextMenu.visible])

  const addAnnotation = async (payload: { type: AnnotationType; note?: string; color?: string; groupId?: string }) => {
    if (!pendingRange) return
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const excerpt = getTextForRange({ start: pendingRange.start, end: pendingRange.end }).slice(0, 200)
    const newAnn: Annotation = {
      id,
      type: payload.type,
      start: pendingRange.start,
      end: pendingRange.end,
      note: payload.note,
      color: payload.color,
      createdAt: Date.now(),
      hizb,
      quarter,
      excerpt,
      groupId: payload.groupId,
    }
    try {
      await window.api.marks.create({
        id: newAnn.id,
        type: newAnn.type as any,
        hizb: newAnn.hizb,
        quarter: newAnn.quarter,
        start: { rowId: newAnn.start.rowId, offset: newAnn.start.offset },
        end: { rowId: newAnn.end.rowId, offset: newAnn.end.offset },
        color: newAnn.color ?? null,
        note: newAnn.note ?? null,
        groupId: newAnn.groupId ?? null,
        excerpt: newAnn.excerpt ?? null,
      })
      setGlobalAnnotations((prev) => [...prev, newAnn])
    } catch (e) {
      console.error('Failed to create annotation:', e)
    }
    setPendingRange(null)
  }

  const handleAddNote = () => {
    if (!contextMenu.visible) return
    setPendingType("note")
    setNoteDialogOpen(true)
    setContextMenu({ visible: false })
  }
  const handleAddMistake = () => {
    if (!contextMenu.visible) return
    setPendingType("mistake")
    setColorDialogOpen(true)
    setContextMenu({ visible: false })
  }
  const handleAddMutashabih = () => {
    if (!contextMenu.visible) return
    setPendingType("mutashabih")
    setSelectedGroupId("new")
    setColorDialogOpen(true)
    setContextMenu({ visible: false })
  }

  const removeAnnotation = async (id: string) => {
    try {
      await window.api.marks.delete(id)
      setGlobalAnnotations((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      console.error('Failed to delete annotation:', e)
    }
  }

  const jumpToAnnotation = (a: Annotation) => {
    const el = document.getElementById(`row-${a.start.rowId}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setFlashRowId(a.start.rowId)
      setTimeout(() => setFlashRowId(null), 1500)
    }
  }

  // If parent requested a pending scroll to a row (after navigation), perform it
  useEffect(() => {
    if (!loading && pendingScrollRowId) {
      const id = pendingScrollRowId
      setTimeout(() => {
        const el = document.getElementById(`row-${id}`)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          setFlashRowId(id)
          setTimeout(() => setFlashRowId(null), 1500)
        }
        onPendingScrollConsumed && onPendingScrollConsumed()
      }, 60)
    }
  }, [loading, pendingScrollRowId])

  const renderRow = (row: WarshQuranEntry, isLast: boolean) => {
    const text = row.aya_text
    // Collect intervals for this row
    const covering = currentAnns
      .map((a) => {
        const si = rowIndexById.get(a.start.rowId) ?? -1
        const ei = rowIndexById.get(a.end.rowId) ?? -1
        const ri = rowIndexById.get(row.id) ?? -1
        if (ri < 0 || si < 0 || ei < 0) return null
        if (ri < si || ri > ei) return null
        const startOffset = ri === si ? a.start.offset : 0
        const endOffset = ri === ei ? a.end.offset : text.length
        if (startOffset >= endOffset) return null
        return { a, start: startOffset, end: endOffset }
      })
      .filter(Boolean) as { a: Annotation; start: number; end: number }[]

    const cuts = new Set<number>([0, text.length])
    covering.forEach((c) => {
      cuts.add(Math.max(0, Math.min(text.length, c.start)))
      cuts.add(Math.max(0, Math.min(text.length, c.end)))
    })
    const points = Array.from(cuts).sort((x, y) => x - y)

    const segments: React.ReactNode[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const s = points[i]
      const e = points[i + 1]
      const segText = text.slice(s, e)
      if (!segText) continue
      const segAnns = covering.filter((c) => c.start < e && c.end > s).map((c) => c.a)
      // Determine styles by last-wins
      let color: string | undefined
      let backgroundColor: string | undefined
      for (const a of segAnns) {
        if (a.type === "mistake" && a.color) color = a.color
        if (a.type === "mutashabih" && a.color) backgroundColor = a.color
      }
      const hasNote = segAnns.some((a) => a.type === "note")

      segments.push(
        <span
          key={`${row.id}-${s}-${e}`}
          style={{
            color,
            backgroundColor,
            textDecoration: hasNote ? "underline" : undefined,
          }}
          title={hasNote ? segAnns.find((a) => a.type === "note")?.note || "ملاحظة" : undefined}
        >
          {segText}
        </span>,
      )
    }

    return (
      <span
        id={`row-${row.id}`}
        data-rowid={row.id}
        key={row.id}
        className={`inline ${flashRowId === row.id ? "outline outline-2 outline-yellow-400 rounded-sm" : ""}`}
      >
        {segments.length > 0 ? segments : text}
        {!isLast && <span> </span>}
      </span>
    )
  }

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
            <div className="flex items-center justify-between border-b pb-6">
              <div className="text-center mx-auto">
                <h2 className="text-2xl font-semibold arabic-ui text-primary mb-2">
                  الحزب {hizb} - الربع {quarter}
                </h2>
                <div className="w-16 h-1 bg-accent mx-auto rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="arabic-ui bg-transparent" onClick={() => setPanelOpen(true)}>
                  عرض العلامات
                </Button>
              </div>
            </div>

            <div
              ref={containerRef}
              onContextMenu={handleContextMenu}
              className="quran-text text-right leading-loose text-2xl md:text-3xl text-neutral-900 dark:text-neutral-200"
              style={{ fontFamily: "Quran", lineHeight: "3.3rem" }}
            >
              {ayat.length > 0 ? (
                <p className="text-pretty" dir="rtl">
                  {ayat.map((row, idx) => renderRow(row, idx === ayat.length - 1))}
                </p>
              ) : (
                <p className="arabic-ui text-muted-foreground text-center py-8">لم يتم العثور على آيات لهذا الربع.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 min-w-[12rem] rounded-md border border-neutral-200 bg-white p-1 text-neutral-950 shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
            تحديد: <span className="font-semibold">{contextMenu.selectionText}</span>
          </div>
          <button className="w-full text-right px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={handleAddNote}>
            إضافة ملاحظة
          </button>
          <button className="w-full text-right px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={handleAddMistake}>
            إضافة خطأ (لون النص)
          </button>
          <button className="w-full text-right px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={handleAddMutashabih}>
            إضافة متشابهات (لون الخلفية)
          </button>
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة</DialogTitle>
            <DialogDescription>أدخل ملاحظتك على المقطع المحدد</DialogDescription>
          </DialogHeader>
          <div>
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="أكتب ملاحظتك هنا..." />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addAnnotation({ type: "note", note: noteText })
                setNoteText("")
                setNoteDialogOpen(false)
              }}
              disabled={!pendingRange || noteText.trim().length === 0}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Dialog (Mistake / Mutashabih) */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {pendingType === "mistake" ? "تحديد لون النص للخطأ" : "تحديد لون الخلفية للمتشابهات"}
            </DialogTitle>
            <DialogDescription>اختر لونًا من منتقي الألوان</DialogDescription>
          </DialogHeader>
          {pendingType === "mutashabih" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm">اختر مجموعة متشابهات</label>
                <Select value={selectedGroupId} onValueChange={(v) => setSelectedGroupId(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="مجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">مجموعة جديدة</SelectItem>
                    {mutaGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: g.color }} />
                          {g.sample ? (g.sample.length > 24 ? g.sample.slice(0, 24) + "…" : g.sample) : `مجموعة ${g.id.slice(-4)}`} ({g.count})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {(pendingType === "mistake" || selectedGroupId === "new") && (
            <div className="flex items-center gap-3 mt-3">
              <input
                type="color"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="h-10 w-16 cursor-pointer"
                aria-label="Color picker"
              />
              <span className="text-sm">{colorValue}</span>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!pendingType) return
                if (pendingType === "mutashabih") {
                  let gid: string | undefined
                  let finalColor = colorValue
                  if (selectedGroupId !== "new") {
                    gid = selectedGroupId
                    const g = groups.find((gg) => gg.id === selectedGroupId)
                    if (g?.color) finalColor = g.color
                  } else {
                    // create a new group in DB
                    try {
                      const res = await window.api.groups.create({ color: colorValue })
                      gid = res.id
                      setGroups((prev) => [...prev, { id: res.id, color: colorValue, label: null }])
                    } catch (e) {
                      console.error('Failed to create group:', e)
                      gid = `g_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
                    }
                  }
                  await addAnnotation({ type: pendingType, color: finalColor, groupId: gid })
                } else {
                  await addAnnotation({ type: pendingType, color: colorValue })
                }
                setColorDialogOpen(false)
              }}
              disabled={!pendingRange || !pendingType}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annotations Panel (Global + Categories) */}
      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent dir="rtl" className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>العلامات</DialogTitle>
            <DialogDescription>عرض كل الملاحظات والأخطاء والمتشابهات عبر جميع الأحزاب</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="gap-2">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="note">الملاحظات</TabsTrigger>
                <TabsTrigger value="mistake">الأخطاء</TabsTrigger>
                <TabsTrigger value="mutashabih">المتشابهات</TabsTrigger>
              </TabsList>
            </Tabs>
            {globalAnnotations.length === 0 ? (
              <p className="text-sm text-neutral-500">لا توجد عناصر بعد.</p>
            ) : (
              <ul className="space-y-3">
                {globalAnnotations
                  .filter((a) => activeTab === "all" || a.type === activeTab)
                  .slice()
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3 border-b pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border">
                            {a.type === "note" ? "ملاحظة" : a.type === "mistake" ? "خطأ" : "متشابهات"}
                          </span>
                          {a.color && (
                            <span
                              className="inline-block w-3 h-3 rounded"
                              style={{ backgroundColor: a.color }}
                              aria-label="color"
                            />
                          )}
                          <span className="text-xs text-neutral-500">الحزب {a.hizb} - الربع {a.quarter}</span>
                        </div>
                        <div className="text-sm">
                          {a.excerpt?.length > 0 ? (a.excerpt.length > 120 ? a.excerpt.slice(0, 120) + "…" : a.excerpt) : ""}
                        </div>
                        {a.type === "note" && a.note && (
                          <div className="text-xs text-neutral-600">"{a.note}"</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (a.hizb === hizb && a.quarter === quarter) {
                              jumpToAnnotation(a)
                            } else {
                              onRequestNavigate && onRequestNavigate(a.hizb, a.quarter, a.start.rowId)
                              setPanelOpen(false)
                            }
                          }}
                        >
                          انتقال
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeAnnotation(a.id)}>
                          حذف
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
