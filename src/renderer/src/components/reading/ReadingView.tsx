import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import VerseContainer from "./VerseContainer"
// Tabs removed from here; panel is now its own component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import AnnotationsPanel from "../annotations/AnnotationsPanel"

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

export default function ReadingView({
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
    const openPanel = () => setPanelOpen(true)
    window.addEventListener('open-annotations-panel', openPanel as EventListener)
    return () => window.removeEventListener('open-annotations-panel', openPanel as EventListener)
  }, [])

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

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        await window.api.marks.init()
        const [anns, grps] = await Promise.all([window.api.marks.list(), window.api.groups.list()])
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
        console.error("Failed to init/load marks DB:", e)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [])

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

  const currentAnns = useMemo(
    () => globalAnnotations.filter((a) => a.hizb === hizb && a.quarter === quarter),
    [globalAnnotations, hizb, quarter],
  )

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
    if (range.start.rowId === range.end.rowId && range.start.offset === range.end.offset) return
    const selectionText = getTextForRange(range).slice(0, 120)
    setPendingRange(range)
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, range, selectionText })
  }

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
      console.error("Failed to create annotation:", e)
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
      console.error("Failed to delete annotation:", e)
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

    const segments: JSX.Element[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const s = points[i]
      const e = points[i + 1]
      const segText = text.slice(s, e)
      if (!segText) continue
      const segAnns = covering.filter((c) => c.start < e && c.end > s).map((c) => c.a)
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
    <div className="relative max-w-8xl mx-auto transition-colors h-screen mb-0" dir="rtl">
      <Card className="shadow-none bg-transparent border-0 h-full">
        <CardContent className="p-10 h-full flex flex-col">
                      {/* 
              <div className="text-center mb-4 flex flex items-center justify-center gap-6">
                      <Button variant="ghost" size="icon" onClick={onPrevQuarter} aria-label="السابق">
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <h2 className="text-xl arabic-ui text-primary">الحزب {hizb} - الربع {quarter}</h2>
                <Button variant="ghost" size="icon" onClick={onNextQuarter} aria-label="التالي">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div> */}


          {/* Scroll container with left scrollbar (flip hack) */}
          <div className="h-full overflow-y-auto px-3" style={{ transform: "scaleX(-1)" }} dir="ltr">
            {/* Inner content (flip back) */}
            <div style={{ transform: "scaleX(-1)" }} dir="rtl">
  
              {/* Verses container (selection area) */}
              <div
                className="quran-text text-right leading-loose text-2xl md:text-3xl text-foreground"
                style={{ fontFamily: "Quran", lineHeight: "3.3rem" }}
              >
                <VerseContainer
                  ayat={ayat as any}
                  containerRef={containerRef}
                  onContextMenu={handleContextMenu}
                  renderRow={(row, isLast) => renderRow(row as any, isLast)}
                />
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {contextMenu.visible && (
        <div
          className="fixed z-50 min-w-[12rem] rounded-md border border-border bg-surface p-1 text-foreground shadow-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-2 text-sm text-muted-foreground">
            تحديد: <span className="font-semibold">{contextMenu.selectionText}</span>
          </div>
          <button className="w-full text-right px-3 py-2 text-sm hover:bg-muted" onClick={handleAddNote}>
            إضافة ملاحظة
          </button>
          <button className="w-full text-right px-3 py-2 text-sm hover:bg-muted" onClick={handleAddMistake}>
            إضافة خطأ (لون النص)
          </button>
          <button className="w-full text-right px-3 py-2 text-sm hover:bg-muted" onClick={handleAddMutashabih}>
            إضافة متشابهات (لون الخلفية)
          </button>
        </div>
      )}

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
                    try {
                      const res = await window.api.groups.create({ color: colorValue })
                      gid = res.id
                      setGroups((prev) => [...prev, { id: res.id, color: colorValue, label: null }])
                    } catch (e) {
                      console.error("Failed to create group:", e)
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

      <AnnotationsPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        annotations={globalAnnotations as any}
        activeTab={activeTab as any}
        onActiveTabChange={(t) => setActiveTab(t as any)}
        currentHizb={hizb}
        currentQuarter={quarter}
        onJump={(a: any) => jumpToAnnotation(a)}
        onNavigate={(a: any) => {
          onRequestNavigate && onRequestNavigate(a.hizb, a.quarter, a.start.rowId)
        }}
        onDelete={(id) => removeAnnotation(id)}
      />
    </div>
  )
}
