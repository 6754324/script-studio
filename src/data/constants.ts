import type { Beat, Genre, Interior, ShotMove, ShotSize, TimeOfDay } from '../types'

export const GENRES: Genre[] = ['剧情短片', '新闻专题', '纪录片', '综艺', '广告', '访谈']

export const BEATS: Beat[] = ['起', '承', '转', '合']

export const BEAT_LABEL: Record<Beat, string> = {
  起: '起 · 开端',
  承: '承 · 发展',
  转: '转 · 冲突',
  合: '合 · 收束',
}

export const BEAT_DESC: Record<Beat, string> = {
  起: '建立人物与情境',
  承: '推进情节、铺垫矛盾',
  转: '矛盾爆发、转折',
  合: '解决矛盾、收束',
}

export const BEAT_CHIP: Record<Beat, string> = {
  起: 'bg-emerald-500/15 text-emerald-700',
  承: 'bg-sky-500/15 text-sky-700',
  转: 'bg-amber-500/15 text-amber-700',
  合: 'bg-brand-500/15 text-brand-700',
}

export const INTERIORS: Interior[] = ['内景', '外景']
export const TIMES: TimeOfDay[] = ['日', '夜', '晨', '黄昏']

export const SHOT_SIZES: ShotSize[] = ['远', '全', '中', '近', '特']
export const SHOT_MOVES: ShotMove[] = ['固定', '推', '拉', '摇', '移', '跟', '升降']

export const CHARACTER_ROLES = ['主角', '配角', '主持人', '旁白', '受访者', '群演']
