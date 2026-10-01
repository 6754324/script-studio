import type { Beat, Genre, Interior, Scene, Shot, ShotMove, ShotSize, TimeOfDay } from '../types'
import { DEMO_GENERATED_SCENES } from '../data/demo'

export interface GenerateInput {
  title: string
  logline: string
  genre: Genre
  targetDuration: number
  characterNames: string[]
}

export interface GenerateResult {
  scenes: Scene[]
  /** 'demo' = canned fallback, 'api' = live model response. */
  source: 'demo' | 'api'
}

const SIZES: ShotSize[] = ['远', '全', '中', '近', '特']
const MOVES: ShotMove[] = ['固定', '推', '拉', '摇', '移', '跟', '升降']
const TIMES: TimeOfDay[] = ['日', '夜', '晨', '黄昏']
const BEATS: Beat[] = ['起', '承', '转', '合']

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}
function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback
}
function inList<T extends string>(v: unknown, list: readonly T[]): T | null {
  return typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : null
}

function defaultBeat(index: number, total: number): Beat {
  if (total <= 1) return '起'
  if (index === 0) return '起'
  if (index === total - 1) return '合'
  return index % 2 === 1 ? '承' : '转'
}

function normalizeShots(raw: unknown): Shot[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r) => {
    const o = (r ?? {}) as Record<string, unknown>
    return {
      id: crypto.randomUUID(),
      size: inList(o.size, SIZES) ?? '中',
      move: inList(o.move, MOVES) ?? '固定',
      subject: str(o.subject, ''),
      line: str(o.line, ''),
      audio: str(o.audio, ''),
    }
  })
}

/** Coerce arbitrary (often partial) model output into well-formed scenes. */
export function normalizeScenes(raw: unknown): Scene[] {
  if (!Array.isArray(raw)) return []
  const total = raw.length
  return raw.map((r, i) => {
    const o = (r ?? {}) as Record<string, unknown>
    return {
      id: crypto.randomUUID(),
      number: i + 1,
      slug: str(o.slug, `场景${i + 1}`),
      setting: str(o.setting, ''),
      time: inList(o.time, TIMES) ?? '日',
      interior: inList<Interior>(o.interior, ['内景', '外景']) ?? '内景',
      characterIds: [],
      summary: str(o.summary, ''),
      duration: num(o.duration, 60),
      shots: normalizeShots(o.shots),
      beat: inList(o.beat, BEATS) ?? defaultBeat(i, total),
    }
  })
}

/**
 * Generate scene suggestions from a premise. Falls back to a canned demo when
 * no API key is configured or the endpoint is unreachable — so the portfolio
 * is always runnable with zero setup.
 */
export async function generateScenes(input: GenerateInput, apiKey: string): Promise<GenerateResult> {
  if (!apiKey) {
    return { scenes: DEMO_GENERATED_SCENES, source: 'demo' }
  }
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, apiKey }),
    })
    if (!res.ok) throw new Error(`generate failed: ${res.status}`)
    const data = (await res.json()) as { scenes?: unknown }
    const scenes = normalizeScenes(data.scenes)
    if (scenes.length === 0) throw new Error('empty response')
    return { scenes, source: 'api' }
  } catch {
    return { scenes: DEMO_GENERATED_SCENES, source: 'demo' }
  }
}
