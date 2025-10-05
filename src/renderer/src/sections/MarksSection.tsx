import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const rows = await window.api.marks.list()
        setMarks(rows as any)
      } catch (e) {
        console.error("Failed to load marks:", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

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
          </div>
        </div>

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
                  <Button
                    variant="outline"
                    onClick={() => goToReading(m.hizb, m.quarter, m.start_row_id)}
                    className="arabic-ui"
                  >
                    فتح
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
