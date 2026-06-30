// ──────────────────────────────────────────────
// Helpers DOCX partagés entre générateurs de documents
// ──────────────────────────────────────────────

import {
  Paragraph, TextRun, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
} from 'docx'
import type { BelgianRegion } from '../types.js'

export const REGION_LABELS: Record<BelgianRegion, string> = {
  wallonie: 'Wallonie',
  flandre: 'Flandre',
  bruxelles: 'Bruxelles',
}

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }

/** Bordures de cellule standard (gris clair sur les 4 côtés). */
export const CELL_BORDERS = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
}

/** Marges internes de cellule standard. */
export const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 }

/** Ligne de tableau à deux colonnes (libellé / valeur). */
export function makeRow(
  label: string,
  value: string,
  fill?: string,
  bold = false,
): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        borders: CELL_BORDERS as never,
        width: { size: 5500, type: WidthType.DXA },
        margins: CELL_MARGINS,
        ...(fill ? { shading: { fill, type: ShadingType.CLEAR } } : {}),
        children: [new Paragraph({ children: [new TextRun({ text: label, bold })] })],
      }),
      new TableCell({
        borders: CELL_BORDERS as never,
        width: { size: 3526, type: WidthType.DXA },
        margins: CELL_MARGINS,
        ...(fill ? { shading: { fill, type: ShadingType.CLEAR } } : {}),
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: value, bold })],
        })],
      }),
    ],
  })
}
