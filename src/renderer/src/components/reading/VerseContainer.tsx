import React from "react"

// Minimal row shape we need here. Keep in sync with DB schema fields used below.
export type VerseRow = {
  id: number
  sura_no: number
  sura_name_ar?: string
  aya_no: number
  aya_text: string
  line_start?: number
  line_end?: number
}

const BASMALA = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"

export default function VerseContainer({
  ayat,
  containerRef,
  onContextMenu,
  renderRow,
}: {
  ayat: VerseRow[]
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  onContextMenu: React.MouseEventHandler<HTMLDivElement>
  renderRow: (row: VerseRow, isLast: boolean) => React.ReactNode
  // future: when true, use line_start/line_end to split verse across visual lines
  lined?: boolean
}) {
  // For now we keep the simple rendering to preserve selection offsets used by annotations.
  // We'll inject Basmala blocks before sura starts (aya_no === 1 and sura_no !== 9) as decorative lines,
  // outside of the selectable verse span so they don't affect offsets.

  const content: React.ReactNode[] = []
  for (let i = 0; i < ayat.length; i++) {
    const row = ayat[i]

    // Insert Basmala before each new sura (except sura 9). Avoid duplicating if verse already starts with Basmala.
    const isSuraStart = row.aya_no === 1 && row.sura_no !== 9
    const startsWithBasmala = row.aya_text.trim().startsWith("بِسْم")

    if (isSuraStart && !startsWithBasmala) {
      content.push(
        <div key={`bsm-${row.id}`} className="text-center my-3 select-none" aria-hidden="true">
          <div className="arabic-ui text-xl text-muted-foreground">{BASMALA}</div>
        </div>,
      )
    }

    // Simple mode: do not split the verse into visual lines yet; keep selection integrity.
    content.push(<React.Fragment key={row.id}>{renderRow(row, i === ayat.length - 1)}</React.Fragment>)

    // Placeholder for future lined mode (splitting across lines)
    // if (lined && row.line_start != null && row.line_end != null) {
    //   const count = Math.max(1, row.line_end - row.line_start + 1)
    //   const segs = splitTextByLines(row.aya_text, count)
    //   content.push(
    //     <span id={`row-${row.id}`} data-rowid={row.id} key={row.id}>
    //       {segs.map((seg, idx) => (
    //         <span key={`${row.id}-ln-${idx}`} className="block">{seg}</span>
    //       ))}
    //     </span>
    //   )
    // } else {
    //   content.push(<React.Fragment key={row.id}>{renderRow(row, i === ayat.length - 1)}</React.Fragment>)
    // }
  }

  return (
    <div
      ref={(el) => {
        containerRef.current = el
      }}
      onContextMenu={onContextMenu}
    >
      {content.length > 0 ? (
        <p className="text-pretty" dir="rtl">
          {content}
        </p>
      ) : (
        <p className="arabic-ui text-muted-foreground text-center py-8">لم يتم العثور على آيات لهذا الربع.</p>
      )}
    </div>
  )
}

