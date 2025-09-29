import { useEffect, useState } from "react"
import { Card, CardContent } from "../ui/card"

export default function QuarterSelection({
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
            const preview = verses.map((row: any) => row.aya_text).join(" ")
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
