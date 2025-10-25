import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { useAppContext } from "../context/AppContext"

interface AnnotationRec {
  id: string
  type: "note" | "mistake" | "mutashabih"
  hizb: number
  quarter: number
  start_row_id: number
  start_offset?: number
  end_row_id?: number
  end_offset?: number
  color?: string | null
  note?: string | null
  excerpt?: string | null
  created_at?: number
  group_id?: string | null
}

type Filter = "all" | "note" | "mistake" | "mutashabih"

export default function MarksSection() {
  const { goToReading } = useAppContext()
  const [filter, setFilter] = useState<Filter>("all")
  const [loading, setLoading] = useState(true)
  const [marks, setMarks] = useState<AnnotationRec[]>([])
  const [groups, setGroups] = useState<{ id: string; color: string; label?: string | null }[]>([])
  const [newGroupColor, setNewGroupColor] = useState<string>("#f59e0b")
  const [newGroupLabel, setNewGroupLabel] = useState<string>("")
  const [groupModalOpen, setGroupModalOpen] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const rows = await window.api.marks.list()
        setMarks(rows as any)
        const gs = await window.api.groups.list()
        setGroups(gs)
      } catch (e) {
        console.error("Failed to load marks:", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const refreshMarks = async () => {
    try {
      const rows = await window.api.marks.list()
      setMarks(rows as any)
    } catch (e) {
      console.error("Failed to refresh marks:", e)
    }
  }

  const refreshGroups = async () => {
    try {
      const gs = await window.api.groups.list()
      setGroups(gs)
    } catch (e) {
      console.error("Failed to refresh groups:", e)
    }
  }

  const handleCreateGroup = async () => {
    try {
      const res = await window.api.groups.create({ color: newGroupColor, label: newGroupLabel || null })
      setGroups((prev) => [...prev, { id: res.id, color: newGroupColor, label: newGroupLabel || null }])
      setNewGroupLabel("")
    } catch (e) {
      console.error("Failed to create group:", e)
    }
  }

  const handleUpdateGroup = async (id: string, patch: { color?: string; label?: string | null }) => {
    try {
      await window.api.groups.update(id, patch)
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
    } catch (e) {
      console.error("Failed to update group:", e)
    }
  }

  const handleApplyGroupColor = async (id: string) => {
    try {
      await window.api.groups.applyColor(id)
      await refreshMarks()
    } catch (e) {
      console.error("Failed to apply group color:", e)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    try {
      if (!confirm("هل تريد حذف هذه المجموعة؟")) return
      await window.api.groups.delete(id)
      await refreshGroups()
      await refreshMarks()
    } catch (e) {
      console.error("Failed to delete group:", e)
    }
  }

  const handleDeleteMark = async (id: string) => {
    try {
      if (!confirm("هل تريد حذف هذه العلامة؟")) return
      await window.api.marks.delete(id)
      setMarks((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      console.error("Failed to delete mark:", e)
    }
  }

  const visible = useMemo(() => {
    if (filter === "all") return marks
    return marks.filter((m) => m.type === filter)
  }, [marks, filter])

  return (
    <div className="h-full w-full" dir="rtl">
      <div className="h-full max-w-4xl mx-auto px-4 py-6 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold arabic-ui">العلامات</h2>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              جميع
            </Button>
            <Button variant={filter === "note" ? "default" : "outline"} onClick={() => setFilter("note")}>
              ملاحظات
            </Button>
            <Button variant={filter === "mistake" ? "default" : "outline"} onClick={() => setFilter("mistake")}>
              أخطاء
            </Button>
            <Button variant={filter === "mutashabih" ? "default" : "outline"} onClick={() => setFilter("mutashabih")}>
              متشابهات
            </Button>
            {filter === "mutashabih" && (
              <Button variant="outline" onClick={() => setGroupModalOpen(true)}>
                إدارة المجموعات
              </Button>
            )}
          </div>
        </div>

        {/* Groups management modal (only opened from Mutashabihat tab) */}
        <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
          <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إدارة مجموعات المتشابهات</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">لون المجموعة</span>
                <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} className="h-8 w-12 cursor-pointer" />
              </div>
              <div className="min-w-[200px] flex-1">
                <Input placeholder="اسم المجموعة (اختياري)" value={newGroupLabel} onChange={(e) => setNewGroupLabel(e.target.value)} />
              </div>
              <div>
                <Button onClick={handleCreateGroup}>إنشاء مجموعة جديدة</Button>
              </div>
            </div>
            {groups.length > 0 && (
              <div className="mt-4 space-y-3">
                {groups.map((g) => (
                  <div key={g.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">اللون</span>
                      <input
                        type="color"
                        value={g.color}
                        onChange={(e) => handleUpdateGroup(g.id, { color: e.target.value })}
                        className="h-8 w-12 cursor-pointer"
                      />
                    </div>
                    <div className="min-w-[200px] flex-1">
                      <Input
                        placeholder={`مجموعة ${g.id.slice(-4)}`}
                        value={g.label ?? ""}
                        onChange={(e) => handleUpdateGroup(g.id, { label: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleApplyGroupColor(g.id)}>تطبيق اللون على جميع المتشابهات</Button>
                      <Button variant="destructive" onClick={() => handleDeleteGroup(g.id)}>حذف</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="flex-1 overflow-auto space-y-3">
          {loading && <p className="arabic-ui text-muted-foreground">جارٍ التحميل...</p>}
          {!loading && visible.length === 0 && (
            <p className="arabic-ui text-muted-foreground">لا توجد عناصر.</p>
          )}
          {!loading && visible.map((m) => (
            <Card key={m.id} className="hover:shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground arabic-ui mb-1">
                    الحزب {m.hizb} • الربع {m.quarter} • {labelOf(m.type)}
                  </div>
                  <div className="truncate arabic-ui">
                    {m.type === "note" && m.note ? m.note : (m.excerpt || "—")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.type === "mutashabih" && m.color && (
                    <span className="inline-block w-3 h-3 rounded" title={m.color} style={{ backgroundColor: m.color }} />
                  )}
                  <Button
                    variant="outline"
                    onClick={() => goToReading(m.hizb, m.quarter, m.start_row_id)}
                    className="arabic-ui"
                  >
                    فتح
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMark(m.id)}
                    className="arabic-ui"
                  >
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function labelOf(t: AnnotationRec["type"]): string {
  switch (t) {
    case "note":
      return "ملاحظة"
    case "mistake":
      return "خطأ"
    case "mutashabih":
      return "متشابهات"
    default:
      return t
  }
}
