/**
 * Duration parsing/formatting. Accepts plain seconds ("90"), MM:SS ("1:30")
 * or HH:MM:SS ("0:01:30"); returns null on unparseable input.
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed)
    return Number.isFinite(seconds) ? seconds : null
  }
  const parts = trimmed.split(':').map((p) => p.trim())
  if (parts.some((p) => !/^\d+$/.test(p))) return null
  const nums = parts.map(Number)
  if (nums.length === 2) {
    const [m, s] = nums
    if (s >= 60) return null
    return m * 60 + s
  }
  if (nums.length === 3) {
    const [h, m, s] = nums
    if (m >= 60 || s >= 60) return null
    return h * 3600 + m * 60 + s
  }
  return null
}

/** Format seconds as HH:MM:SS when >= 1h, otherwise MM:SS. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}
