const compactFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

export function formatCompactNumber(n: number): string {
  return compactFormatter.format(n)
}
