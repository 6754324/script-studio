import type { Project, Scene, Shot } from '../types'
import { BEAT_LABEL, BEAT_DESC } from '../data/constants'
import { formatDuration } from './duration'

const RULE = '━━━━━━━━━━━━━━━━━━━━'

function shotLine(shot: Shot, index: number): string {
  const parts = [
    `镜${index + 1}`,
    `${shot.size}景`,
    shot.move === '固定' ? '固定' : shot.move,
  ]
  const head = parts.join(' / ')
  const body = [
    shot.subject && `画面：${shot.subject}`,
    shot.line && `台词：${shot.line}`,
    shot.audio && `音效：${shot.audio}`,
  ]
    .filter(Boolean)
    .join('　')
  return `${head}　${body}`
}

/** Industry screenplay format — 场号 / 场景 / 内·外景 / 时间 / 人物 / 梗概 / 分镜. */
export function formatScreenplay(project: Project): string {
  const lines: string[] = []
  lines.push(`《${project.title}》`)
  lines.push('')
  lines.push(`类型：${project.genre}`)
  if (project.logline) {
    lines.push('')
    lines.push('【梗概】')
    lines.push(project.logline)
  }
  if (project.characters.length > 0) {
    lines.push('')
    lines.push('【人物】')
    for (const c of project.characters) {
      const note = c.note ? `　—　${c.note}` : ''
      lines.push(`· ${c.name}（${c.role}）${note}`)
    }
  }

  const ordered = [...project.scenes].sort((a, b) => a.number - b.number)
  for (const scene of ordered) {
    lines.push('')
    lines.push(RULE)
    lines.push(
      `第${scene.number}场　${scene.slug}　${scene.interior}　${scene.time}　·　${scene.setting}`,
    )
    lines.push(`节拍：${BEAT_LABEL[scene.beat]}　时长：${formatDuration(scene.duration)}`)
    if (scene.characterIds.length > 0) {
      lines.push(`人物：${scene.characterIds.map((id) => `[${id}]`).join('、')}`)
    }
    if (scene.summary) {
      lines.push('')
      lines.push(scene.summary)
    }
    if (scene.shots.length > 0) {
      lines.push('')
      lines.push('【分镜】')
      for (let i = 0; i < scene.shots.length; i++) {
        lines.push(shotLine(scene.shots[i], i))
      }
    }
  }
  return lines.join('\n')
}

/** Standalone shot-list format for a single scene. */
export function formatShotList(scene: Scene): string {
  const lines: string[] = []
  lines.push(
    `第${scene.number}场　${scene.slug}　${scene.interior}　${scene.time}　·　${scene.setting}`,
  )
  if (scene.shots.length === 0) {
    lines.push('（暂无分镜）')
  }
  for (let i = 0; i < scene.shots.length; i++) {
    lines.push(shotLine(scene.shots[i], i))
  }
  return lines.join('\n')
}

/** Concise text describing a beat — used in the structure analyzer UI. */
export function formatBeat(beat: Scene['beat']): string {
  return `${BEAT_LABEL[beat]}：${BEAT_DESC[beat]}`
}
