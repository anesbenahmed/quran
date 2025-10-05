import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"

export type Boundary = { rowId: number; offset: number }
export type AnnotationType = "note" | "mistake" | "mutashabih"
export type Annotation = {
  id: string
  type: AnnotationType
  start: Boundary
  hizb: number
  quarter: number
  excerpt?: string
  color?: string
  note?: string
}

export default function AnnotationsPanel({
  open,
  onOpenChange,
  annotations,
  activeTab,
  onActiveTabChange,
  currentHizb,
  currentQuarter,
  onJump,
  onNavigate,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  annotations: Annotation[]
  activeTab: "all" | AnnotationType
  onActiveTabChange: (tab: "all" | AnnotationType) => void
  currentHizb: number
  currentQuarter: number
  onJump: (a: Annotation) => void
  onNavigate: (a: Annotation) => void
  onDelete: (id: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>العلامات</DialogTitle>
          <DialogDescription>عرض كل الملاحظات والأخطاء والمتشابهات عبر جميع الأحزاب</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as any)}>
            <TabsList className="gap-2">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="note">الملاحظات</TabsTrigger>
              <TabsTrigger value="mistake">الأخطاء</TabsTrigger>
              <TabsTrigger value="mutashabih">المتشابهات</TabsTrigger>
            </TabsList>
          </Tabs>
          {annotations.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد عناصر بعد.</p>
          ) : (
            <ul className="space-y-3">
              {annotations
                .filter((a) => activeTab === "all" || a.type === activeTab)
                .slice()
                .sort((a, b) => (a as any).createdAt - (b as any).createdAt)
                .map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 border-b border-border pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-border">
                          {a.type === "note" ? "ملاحظة" : a.type === "mistake" ? "خطأ" : "متشابهات"}
                        </span>
                        {a.color && (
                          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: a.color }} aria-label="color" />
                        )}
                        <span className="text-xs text-muted-foreground">الحزب {a.hizb} - الربع {a.quarter}</span>
                      </div>
                      <div className="text-sm">
                        {a.excerpt && a.excerpt.length > 0 ? (a.excerpt.length > 120 ? a.excerpt.slice(0, 120) + "…" : a.excerpt) : ""}
                      </div>
                      {a.type === "note" && a.note && (
                        <div className="text-xs text-muted-foreground">"{a.note}"</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (a.hizb === currentHizb && a.quarter === currentQuarter) {
                            onJump(a)
                          } else {
                            onNavigate(a)
                            onOpenChange(false)
                          }
                        }}
                      >
                        انتقال
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(a.id)}>
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
  )
}
