// Validated categorical/status/sequential palette from the dataviz skill's
// reference instance (references/palette.md), exposed as CSS custom property
// names defined in tokens.css so components stay theme-reactive without any
// light/dark branching in JS. Fixed order - never cycled or re-themed by the
// user's accent choice, so series identity and CVD-safety stay validated
// regardless of which accent is active.

export const CATEGORICAL_VARS = [
  'var(--cat-1)',
  'var(--cat-2)',
  'var(--cat-3)',
  'var(--cat-4)',
  'var(--cat-5)',
  'var(--cat-6)',
  'var(--cat-7)',
  'var(--cat-8)'
]

// Donuts compare every segment against every other (all-pairs), not just
// neighbors - the palette only validates all-pairs CVD separation for the
// first three slots, so all-pairs charts (our donuts) cap there and fold
// the remainder into a neutral "Other" bucket.
export const ALL_PAIRS_SAFE_CATEGORICAL_VARS = CATEGORICAL_VARS.slice(0, 3)

export const OTHER_BUCKET_VAR = 'var(--other-bucket)'

export const STATUS_VARS = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  serious: 'var(--status-serious)',
  critical: 'var(--status-critical)'
} as const

export const SEQUENTIAL_BLUE_VARS = [
  'var(--seq-blue-100)',
  'var(--seq-blue-250)',
  'var(--seq-blue-400)',
  'var(--seq-blue-550)',
  'var(--seq-blue-700)'
]

/** Deterministic, stable color assignment for an open-ended set of labels
 * (e.g. programming languages) shown in a bar where only adjacent segments
 * are compared - safe to use the full 8-slot adjacent-safe order. */
export function colorForLabel(label: string): string {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0
  }
  return CATEGORICAL_VARS[hash % CATEGORICAL_VARS.length]
}
