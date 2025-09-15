import { ChevronLeft, Warehouse } from 'lucide-react'
import { cn } from "@renderer/lib/utils"
import { Button } from "@renderer/components/ui/button"
import { useAppContext } from "@renderer/context/AppContext"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
  const {
    activeSection,
    setActiveSection,
    isSidebarOpen,
    setIsSidebarOpen,
    navItems
  } = useAppContext()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed inset-0 z-30 md:hidden",
              "bg-black/10 backdrop-blur-md",
            )}
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed right-0 top-0 z-40 h-screen",
          "flex flex-col",
          "bg-white/80 dark:bg-gray-950/80",
          "backdrop-blur-xl",
          "shadow-[0_0_44px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_44px_-10px_rgba(0,0,0,0.3)]",
          "border-l border-white/20 dark:border-gray-800/20",
          "transition-[width] duration-200 ease-out",
          isSidebarOpen ? "w-72" : "w-20",
          "md:relative",
          "overflow-hidden"
        )}
        dir="rtl"
      >
        <div className={cn(
          "flex items-center justify-between",
          "px-6 py-5",
          "bg-white/50 dark:bg-gray-950/50",
          "backdrop-blur-md",
          "border-b border-black/[0.02] dark:border-white/[0.02]",
        )}>
          <motion.div
            initial={false}
            animate={{
              width: isSidebarOpen ? 'auto' : 0,
              opacity: isSidebarOpen ? 1 : 0,
              x: isSidebarOpen ? 0 : -20,
            }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center gap-4 overflow-hidden"
          >
            <div className={cn(
              "relative flex items-center justify-center shrink-0",
              "w-10 h-10",
              "bg-gradient-to-b from-emerald-400 to-emerald-600",
              "rounded-xl",
              "shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10",
              "overflow-hidden"
            )}>
              <Warehouse className="h-5 w-5 text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute -inset-1 bg-emerald-500/30 blur-xl" />
            </div>
            <span className={cn(
              "text-lg font-medium whitespace-nowrap",
              "bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
              "tracking-tight"
            )}>
              إدارة الدواجن
            </span>
          </motion.div>

          <motion.button
            onClick={toggleSidebar}
            className={cn(
              "rounded-xl",
              "p-2.5",
              "text-gray-500 hover:text-emerald-600 dark:text-gray-400",
              "bg-white hover:bg-emerald-50 dark:bg-gray-900 dark:hover:bg-emerald-950/50",
              "shadow-sm dark:shadow-gray-950/50",
              "border border-black/[0.02] dark:border-white/[0.02]",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              "outline-none"
            )}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            animate={{ rotate: isSidebarOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
        </div>

        <nav className="flex-1 py-6 overflow-hidden">
          <ul className="px-4 space-y-2 overflow-y-auto overflow-x-hidden h-full">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <li key={item.id} className="overflow-hidden">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-right",
                      "relative",
                      "px-4 py-3",
                      "rounded-xl",
                      "transition-all duration-150 ease-out",
                      "group",
                      isActive ? [
                        "bg-gradient-to-l from-emerald-50 to-emerald-50/20 dark:from-emerald-950/50 dark:to-emerald-950/10",
                        "text-emerald-900 dark:text-emerald-300",
                      ] : [
                        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        "text-gray-600 dark:text-gray-300",
                      ]
                    )}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <div className={cn(
                      "absolute inset-y-0 right-0 w-1 rounded-full",
                      "transition-all duration-150",
                      isActive ? "bg-emerald-500/50" : "bg-transparent"
                    )} />

                    <item.icon
                      className={cn(
                        "transition-all duration-150",
                        isSidebarOpen ? "ml-4" : "mx-auto",
                        "h-[22px] w-[22px]",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      )}
                    />

                    <span
                      className={cn(
                        "font-medium tracking-tight",
                        "transition-all duration-150",
                        isSidebarOpen ? "opacity-100" : "opacity-0 w-0",
                        isActive && "bg-gradient-to-l from-emerald-600 to-emerald-500 bg-clip-text text-transparent"
                      )}
                    >
                      {item.label}
                    </span>
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        <motion.div
          className={cn(
            "relative",
            "px-6 py-4",
            "bg-gradient-to-t from-white to-transparent dark:from-gray-950 dark:to-transparent",
          )}
          animate={{ opacity: isSidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center">
            <span className={cn(
              "inline-block",
              "px-3 py-1.5",
              "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950",
              "rounded-lg",
              "text-sm font-medium",
              "text-gray-400 dark:text-gray-500",
              "border border-black/[0.02] dark:border-white/[0.02]",
              "shadow-sm"
            )}>
 الداجن • الإصدار 1.0.0
            </span>
          </div>
        </motion.div>
      </aside>
    </>
  )
}
