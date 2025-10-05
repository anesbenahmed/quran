import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { BookOpen, ChevronsLeft, ChevronsRight, Settings, Search, Bookmark, StickyNote, PanelsTopLeft } from "lucide-react"
import { useAppContext } from "../../context/AppContext"

export default function Sidebar({
  open,
  onToggle,
  side = "left",
}: {
  open: boolean
  onToggle: () => void
  side?: "left" | "right"
}) {
  const { setSection } = useAppContext()
  const borderSide = side === "left" ? "border-r" : "border-l"
  return (
    <aside
      dir="rtl"
      className={cn(
        "sticky top-0 h-screen z-10 bg-white dark:bg-neutral-950 dark:border-neutral-800 shadow-sm flex-none",
        borderSide,
        open ? "w-64" : "w-16",
        "transition-all duration-200 flex flex-col"
      )}
    >
      {/* Collapse / Expand */}
      <div className="flex items-center justify-between p-3 border-b dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {open && (
            <>
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="arabic-ui font-semibold">القرآن الكريم</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {open ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Primary actions */}
      <div className="p-3 space-y-2 border-b dark:border-neutral-800" />

      {/* Primary actions */}
      <nav className="p-3 space-y-2">
        <SidebarItem open={open} icon={<BookOpen className="w-4 h-4" />} label="القراءة" onClick={() => setSection("reading")} />
        <SidebarItem open={open} icon={<PanelsTopLeft className="w-4 h-4" />} label="العلامات" onClick={() => setSection("marks")} />
        <SidebarItem open={open} icon={<Search className="w-4 h-4" />} label="بحث" onClick={() => {}} />
        <SidebarItem open={open} icon={<Bookmark className="w-4 h-4" />} label="إشارات مرجعية" onClick={() => {}} />
        <SidebarItem open={open} icon={<StickyNote className="w-4 h-4" />} label="ملاحظات" onClick={() => {}} />
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="p-3 border-t dark:border-neutral-800">
        <SidebarItem open={open} icon={<Settings className="w-4 h-4" />} label="الإعدادات" onClick={() => setSection("settings")} />
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
