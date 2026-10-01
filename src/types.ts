/** Film/broadcast writing domain model. */

export type Genre = '剧情短片' | '新闻专题' | '纪录片' | '综艺' | '广告' | '访谈'

export type Interior = '内景' | '外景'
export type TimeOfDay = '日' | '夜' | '晨' | '黄昏'

/** Narrative beat — the Chinese 起承转合 four-act spine. */
export type Beat = '起' | '承' | '转' | '合'

export type ShotSize = '远' | '全' | '中' | '近' | '特'
export type ShotMove = '固定' | '推' | '拉' | '摇' | '移' | '跟' | '升降'

export interface Character {
  id: string
  name: string
  /** 主角 / 配角 / 主持人 / 旁白 / 受访者 … */
  role: string
  note: string
}

export interface Shot {
  id: string
  size: ShotSize
  move: ShotMove
  /** What the camera frames. */
  subject: string
  /** Dialogue / voice-over. */
  line: string
  /** Sound effects / music. */
  audio: string
}

export interface Scene {
  id: string
  /** 1-based scene number, derived from list order. */
  number: number
  /** Scene slug, e.g. 演播室 / 街道 / 办公室. */
  slug: string
  /** Concrete location. */
  setting: string
  time: TimeOfDay
  interior: Interior
  characterIds: string[]
  /** Plot summary of the scene. */
  summary: string
  /** Estimated scene length in seconds. */
  duration: number
  shots: Shot[]
  beat: Beat
}

export interface Project {
  title: string
  logline: string
  genre: Genre
  /** Target total length in seconds. */
  targetDuration: number
  characters: Character[]
  scenes: Scene[]
}
