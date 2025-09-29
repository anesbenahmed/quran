import { Button } from "../ui/button"

export default function HizbSelection({ onSelectHizb }: { onSelectHizb: (hizb: number) => void }) {
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
