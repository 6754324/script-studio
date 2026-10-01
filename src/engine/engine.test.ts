import { describe, expect, it } from 'vitest'
import { parseDuration, formatDuration } from './duration'
import { formatScreenplay, formatShotList } from './format'
import { computeStats, analyzeStructure } from './stats'
import type { Project, Scene } from '../types'

function scene(partial: Partial<Scene> & { id: string; number: number }): Scene {
  return {
    slug: '演播室',
    setting: '一号演播厅',
    time: '日',
    interior: '内景',
    characterIds: [],
    summary: '',
    duration: 60,
    shots: [],
    beat: '起',
    ...partial,
  }
}

const project: Project = {
  title: '测试片',
  logline: '一段梗概',
  genre: '剧情短片',
  targetDuration: 300,
  characters: [{ id: 'c1', name: '张三', role: '主角', note: '主持人' }],
  scenes: [
    scene({ id: 's1', number: 1, beat: '起', duration: 90 }),
    scene({ id: 's2', number: 2, beat: '承', duration: 90 }),
    scene({ id: 's3', number: 3, beat: '转', duration: 90 }),
    scene({ id: 's4', number: 4, beat: '合', duration: 90 }),
  ],
}

describe('parseDuration', () => {
  it('parses plain seconds', () => {
    expect(parseDuration('90')).toBe(90)
  })
  it('parses MM:SS', () => {
    expect(parseDuration('1:30')).toBe(90)
  })
  it('parses HH:MM:SS', () => {
    expect(parseDuration('0:01:30')).toBe(90)
  })
  it('rejects invalid seconds', () => {
    expect(parseDuration('1:60')).toBeNull()
    expect(parseDuration('abc')).toBeNull()
    expect(parseDuration('')).toBeNull()
  })
})

describe('formatDuration', () => {
  it('formats under an hour as MM:SS', () => {
    expect(formatDuration(90)).toBe('1:30')
  })
  it('formats over an hour as HH:MM:SS', () => {
    expect(formatDuration(3725)).toBe('1:02:05')
  })
})

describe('formatScreenplay', () => {
  it('renders title, logline and characters', () => {
    const out = formatScreenplay(project)
    expect(out).toContain('《测试片》')
    expect(out).toContain('一段梗概')
    expect(out).toContain('张三')
  })
  it('orders scenes by number', () => {
    const out = formatScreenplay(project)
    const i1 = out.indexOf('第1场')
    const i4 = out.indexOf('第4场')
    expect(i1).toBeGreaterThanOrEqual(0)
    expect(i4).toBeGreaterThan(i1)
  })
  it('renders shot list entries', () => {
    const withShots: Project = {
      ...project,
      scenes: [
        scene({
          id: 's1',
          number: 1,
          shots: [
            { id: 'sh1', size: '中', move: '固定', subject: '主持人出镜', line: '大家好', audio: '' },
          ],
        }),
      ],
    }
    const out = formatScreenplay(withShots)
    expect(out).toContain('镜1')
    expect(out).toContain('画面：主持人出镜')
    expect(out).toContain('台词：大家好')
  })
})

describe('formatShotList', () => {
  it('renders scene header and shots', () => {
    const s = scene({
      id: 's1',
      number: 1,
      shots: [{ id: 'sh1', size: '全', move: '摇', subject: '街道', line: '', audio: '车流声' }],
    })
    const out = formatShotList(s)
    expect(out).toContain('第1场')
    expect(out).toContain('镜1')
    expect(out).toContain('音效：车流声')
  })
})

describe('computeStats', () => {
  it('sums scenes and shots', () => {
    const stats = computeStats(project.scenes, 300)
    expect(stats.sceneCount).toBe(4)
    expect(stats.shotCount).toBe(0)
    expect(stats.totalDuration).toBe(360)
    expect(stats.overtime).toBe(60)
  })
})

describe('analyzeStructure', () => {
  it('reports a complete spine as complete', () => {
    const report = analyzeStructure(project.scenes)
    expect(report.missing).toEqual([])
    expect(report.complete).toBe(false) // scenes have no shots yet
  })
  it('flags missing beats', () => {
    const scenes = [scene({ id: 's1', number: 1, beat: '起' })]
    const report = analyzeStructure(scenes)
    expect(report.missing).toEqual(['承', '转', '合'])
    expect(report.issues.some((i) => i.kind === 'missing')).toBe(true)
  })
  it('flags a beat with no shots', () => {
    const scenes = [
      scene({ id: 's1', number: 1, beat: '起', shots: [{ id: 'x', size: '中', move: '固定', subject: 'a', line: '', audio: '' }] }),
      scene({ id: 's2', number: 2, beat: '承' }),
      scene({ id: 's3', number: 3, beat: '转' }),
      scene({ id: 's4', number: 4, beat: '合' }),
    ]
    const report = analyzeStructure(scenes)
    expect(report.missing).toEqual([])
    expect(report.complete).toBe(false)
    expect(report.issues.every((i) => i.kind === 'empty')).toBe(true)
  })
})
