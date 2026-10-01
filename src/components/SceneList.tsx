import { useScriptStore } from '../store/scriptStore'
import { formatDuration } from '../engine/duration'
import { BEAT_CHIP, BEAT_LABEL } from '../data/constants'

export function SceneList() {
  const scenes = useScriptStore((s) => s.scenes)
  const selectedSceneId = useScriptStore((s) => s.selectedSceneId)
  const selectScene = useScriptStore((s) => s.selectScene)
  const addScene = useScriptStore((s) => s.addScene)
  const moveScene = useScriptStore((s) => s.moveScene)
  const removeScene = useScriptStore((s) => s.removeScene)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">分场列表</h2>
        <span className="text-xs text-zinc-600">{scenes.length} 场</span>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto px-4 py-4">
        {scenes.map((scene, idx) => (
          <div
            key={scene.id}
            onClick={() => selectScene(scene.id)}
            className={`cursor-pointer rounded-lg border p-3 transition ${
              scene.id === selectedSceneId
                ? 'border-brand-500/50 bg-brand-500/5'
                : 'border-white/10 bg-ink-800/40 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500">第{scene.number}场</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] ${BEAT_CHIP[scene.beat]}`}>
                {BEAT_LABEL[scene.beat]}
              </span>
              <span className="ml-auto font-mono text-[11px] text-zinc-500">
                {formatDuration(scene.duration)}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-sm font-medium text-zinc-100">{scene.slug || '未命名场景'}</span>
              <span className="text-[11px] text-zinc-500">
                {scene.interior} · {scene.time}
              </span>
            </div>
            {scene.summary && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{scene.summary}</p>
            )}
            <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-600">
              <span>{scene.shots.length} 镜头</span>
              <div className="ml-auto flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => moveScene(scene.id, -1)}
                  disabled={idx === 0}
                  className="rounded px-1.5 py-0.5 text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveScene(scene.id, 1)}
                  disabled={idx === scenes.length - 1}
                  className="rounded px-1.5 py-0.5 text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeScene(scene.id)}
                  className="rounded px-1.5 py-0.5 text-zinc-600 transition hover:text-rose-400"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addScene}
          className="w-full rounded-md border border-dashed border-white/15 px-3 py-2.5 text-sm text-zinc-500 transition hover:border-white/30 hover:text-zinc-300"
        >
          + 添加场景
        </button>
      </div>
    </div>
  )
}
