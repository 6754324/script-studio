import type { Beat, Scene } from '../types'
import { BEATS } from '../data/constants'

export interface Stats {
  sceneCount: number
  shotCount: number
  totalDuration: number
  /** Total duration minus target, positive = over. */
  overtime: number
}

export interface StructureIssue {
  /** 'missing' = required beat absent, 'empty' = beat present but no shots. */
  kind: 'missing' | 'empty'
  beat: Beat
  message: string
}

export interface StructureReport {
  /** Beats covered by at least one scene, in scene order. */
  covered: Beat[]
  missing: Beat[]
  issues: StructureIssue[]
  /** True when 起承转合 are all present and each has at least one shot. */
  complete: boolean
}

export function computeStats(scenes: Scene[], targetDuration: number): Stats {
  const shotCount = scenes.reduce((n, s) => n + s.shots.length, 0)
  const totalDuration = scenes.reduce((n, s) => n + s.duration, 0)
  return {
    sceneCount: scenes.length,
    shotCount,
    totalDuration,
    overtime: totalDuration - targetDuration,
  }
}

/**
 * Structural analysis over the 起承转合 spine. A mature script should cover
 * all four beats; the report flags beats that are missing entirely or that
 * have no shot list yet.
 */
export function analyzeStructure(scenes: Scene[]): StructureReport {
  const ordered = [...scenes].sort((a, b) => a.number - b.number)
  const covered: Beat[] = []
  const seen = new Set<Beat>()
  for (const scene of ordered) {
    if (!seen.has(scene.beat)) {
      seen.add(scene.beat)
      covered.push(scene.beat)
    }
  }
  const missing = BEATS.filter((b) => !seen.has(b))

  const issues: StructureIssue[] = []
  for (const beat of missing) {
    issues.push({ kind: 'missing', beat, message: `缺少「${beat}」节拍` })
  }
  const beatToScene = new Map<Beat, Scene>()
  for (const scene of ordered) {
    if (!beatToScene.has(scene.beat)) beatToScene.set(scene.beat, scene)
  }
  for (const beat of BEATS) {
    const scene = beatToScene.get(beat)
    if (scene && scene.shots.length === 0) {
      issues.push({ kind: 'empty', beat, message: `「${beat}」节拍暂无分镜` })
    }
  }

  return {
    covered,
    missing,
    issues,
    complete: missing.length === 0 && issues.length === 0,
  }
}
