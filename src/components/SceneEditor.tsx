import { useState } from 'react'
import { useScriptStore } from '../store/scriptStore'
import { formatDuration } from '../engine/duration'
import { BEATS, INTERIORS, TIMES, SHOT_SIZES, SHOT_MOVES } from '../data/constants'

const inputCls =
  'w-full rounded-md border border-ink-200 bg-paper-200 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-500/60'
const selectCls =
  'rounded-md border border-ink-200 bg-paper-200 px-2 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-500/60'

export function SceneEditor() {
  const scene = useScriptStore((s) => s.scenes.find((sc) => sc.id === s.selectedSceneId) ?? null)
  const characters = useScriptStore((s) => s.characters)
  const updateScene = useScriptStore((s) => s.updateScene)
  const addShot = useScriptStore((s) => s.addShot)
  const updateShot = useScriptStore((s) => s.updateShot)
  const removeShot = useScriptStore((s) => s.removeShot)
  const moveShot = useScriptStore((s) => s.moveShot)

  const [tab, setTab] = useState<'scene' | 'shots'>('scene')

  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-400">
        选择或新建一个场景
      </div>
    )
  }

  const toggleCharacter = (id: string) => {
    const has = scene.characterIds.includes(id)
    updateScene(scene.id, {
      characterIds: has ? scene.characterIds.filter((c) => c !== id) : [...scene.characterIds, id],
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-ink-200 p-2">
        {(
          [
            ['scene', '场次'],
            ['shots', `分镜 ${scene.shots.length}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              tab === key ? 'bg-ink-900/8 text-ink-900' : 'text-ink-400 hover:text-ink-600'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-ink-400">第{scene.number}场</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {tab === 'scene' && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-400">场景名</span>
              <input
                className={inputCls}
                value={scene.slug}
                onChange={(e) => updateScene(scene.id, { slug: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-400">地点</span>
              <input
                className={inputCls}
                placeholder="如 一号演播厅"
                value={scene.setting}
                onChange={(e) => updateScene(scene.id, { setting: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs text-ink-400">时间</span>
                <select
                  className={`${selectCls} w-full`}
                  value={scene.time}
                  onChange={(e) => updateScene(scene.id, { time: e.target.value as typeof scene.time })}
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-400">内外景</span>
                <select
                  className={`${selectCls} w-full`}
                  value={scene.interior}
                  onChange={(e) =>
                    updateScene(scene.id, { interior: e.target.value as typeof scene.interior })
                  }
                >
                  {INTERIORS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-400">节拍</span>
                <select
                  className={`${selectCls} w-full`}
                  value={scene.beat}
                  onChange={(e) => updateScene(scene.id, { beat: e.target.value as typeof scene.beat })}
                >
                  {BEATS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-400">
                预计时长（秒） · {formatDuration(scene.duration)}
              </span>
              <input
                className={inputCls}
                type="number"
                min={1}
                value={scene.duration}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (Number.isFinite(n) && n > 0) updateScene(scene.id, { duration: Math.round(n) })
                }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-400">情节梗概</span>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="本场发生了什么"
                value={scene.summary}
                onChange={(e) => updateScene(scene.id, { summary: e.target.value })}
              />
            </label>
            {characters.length > 0 && (
              <div>
                <span className="mb-1 block text-xs text-ink-400">出场人物</span>
                <div className="flex flex-wrap gap-1.5">
                  {characters.map((c) => {
                    const on = scene.characterIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCharacter(c.id)}
                        className={`rounded-full px-2.5 py-1 text-xs transition ${
                          on ? 'bg-brand-500/20 text-brand-700' : 'bg-ink-900/5 text-ink-400 hover:text-ink-600'
                        }`}
                      >
                        {c.name || '未命名'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'shots' && (
          <div className="space-y-2.5">
            {scene.shots.map((shot, idx) => (
              <div key={shot.id} className="rounded-lg border border-ink-200 bg-paper-200/50 p-2.5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-400">镜{idx + 1}</span>
                  <select
                    className={`${selectCls} !px-1.5 !py-1 text-xs`}
                    value={shot.size}
                    onChange={(e) => updateShot(scene.id, shot.id, { size: e.target.value as typeof shot.size })}
                  >
                    {SHOT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}景
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${selectCls} !px-1.5 !py-1 text-xs`}
                    value={shot.move}
                    onChange={(e) => updateShot(scene.id, shot.id, { move: e.target.value as typeof shot.move })}
                  >
                    {SHOT_MOVES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="ml-auto flex gap-0.5">
                    <button
                      onClick={() => moveShot(scene.id, shot.id, -1)}
                      disabled={idx === 0}
                      className="rounded px-1 text-ink-400 hover:text-ink-900 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveShot(scene.id, shot.id, 1)}
                      disabled={idx === scene.shots.length - 1}
                      className="rounded px-1 text-ink-400 hover:text-ink-900 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeShot(scene.id, shot.id)}
                      className="rounded px-1 text-ink-400 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <input
                    className={inputCls}
                    placeholder="画面内容"
                    value={shot.subject}
                    onChange={(e) => updateShot(scene.id, shot.id, { subject: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="台词 / 旁白"
                    value={shot.line}
                    onChange={(e) => updateShot(scene.id, shot.id, { line: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="音效 / 音乐"
                    value={shot.audio}
                    onChange={(e) => updateShot(scene.id, shot.id, { audio: e.target.value })}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addShot(scene.id)}
              className="w-full rounded-md border border-dashed border-ink-300 px-3 py-2 text-sm text-ink-400 transition hover:border-ink-400 hover:text-ink-600"
            >
              + 添加镜头
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
