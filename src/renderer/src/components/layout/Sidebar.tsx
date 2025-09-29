import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ArrowLeft, ArrowRight, BookOpen, ChevronsLeft, ChevronsRight, Settings, Search, Bookmark, StickyNote, PanelsTopLeft } from "lucide-react"

export type View = 'hizb' | 'quarter' | 'reading'

export default function Sidebar({
  open,
  onToggle,
  view,
  canPrevHizb,
  canNextHizb,
  canPrevQuarter,
  canNextQuarter,
  onPrevHizb,
  onNextHizb,
  onPrevQuarter,
  onNextQuarter,
  onBack,
  onOpenAnnotations,
}: {
  open: boolean
  onToggle: () => void
  view: View
  canPrevHizb: boolean
  canNextHizb: boolean
  canPrevQuarter: boolean
  canNextQuarter: boolean
  onPrevHizb: () => void
  onNextHizb: () => void
  onPrevQuarter: () => void
  onNextQuarter: () => void
  onBack: () => void
  onOpenAnnotations: () => void
}) {
  return (
    <aside
      dir="rtl"
      className={cn(
        "relative h-screen border-l bg-white dark:bg-neutral-950 dark:border-neutral-800 shadow-sm",
        open ? "w-64" : "w-16",
        "transition-all duration-200 flex flex-col"
      )}
    >
      {/* Collapse / Expand */}
      <div className="flex items-center justify-between p-3 border-b dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {open && <span className="arabic-ui font-semibold">القرآن الكريم</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {open ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation group */}
      <div className="p-3 space-y-2 border-b dark:border-neutral-800">
        {view !== 'hizb' && (
          <SidebarItem open={open} icon={<ArrowLeft className="w-4 h-4" />} label="رجوع" onClick={onBack} />
        )}

        {view === 'quarter' && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onPrevHizb} disabled={canPrevHizb}>
              <ArrowRight className="w-4 h-4" />
              {open && <span className="arabic-ui">السابق</span>}
            </Button>
            <Button variant="outline" className="flex-1" onClick={onNextHizb} disabled={canNextHizb}>
              {open && <span className="arabic-ui">التالي</span>}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        {view === 'reading' && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onPrevQuarter} disabled={canPrevQuarter}>
              <ArrowRight className="w-4 h-4" />
              {open && <span className="arabic-ui">السابق</span>}
            </Button>
            <Button variant="outline" className="flex-1" onClick={onNextQuarter} disabled={canNextQuarter}>
              {open && <span className="arabic-ui">التالي</span>}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Primary actions */}
      <nav className="p-3 space-y-2">
        <SidebarItem open={open} icon={<PanelsTopLeft className="w-4 h-4" />} label="العلامات" onClick={onOpenAnnotations} />
        <SidebarItem open={open} icon={<Search className="w-4 h-4" />} label="بحث" onClick={() => {}} />
        <SidebarItem open={open} icon={<Bookmark className="w-4 h-4" />} label="إشارات مرجعية" onClick={() => {}} />
        <SidebarItem open={open} icon={<StickyNote className="w-4 h-4" />} label="ملاحظات" onClick={() => {}} />
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="p-3 border-t dark:border-neutral-800">
        <SidebarItem open={open} icon={<Settings className="w-4 h-4" />} label="الإعدادات" onClick={() => {}} />
      </div>
    </aside>
  )
}

function SidebarItem({ open, icon, label, onClick }: { open: boolean; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800",
        !open && "justify-center"
      )}
      onClick={onClick}
    >
      {icon}
      {open && <span className="arabic-ui">{label}</span>}
    </Button>
  )
}
