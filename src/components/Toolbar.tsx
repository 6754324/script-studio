import { useScriptStore } from '../store/scriptStore'

export function Toolbar({ onOpenPreview }: { onOpenPreview: () => void }) {
  const loadDemo = useScriptStore((s) => s.loadDemo)
  const clearAll = useScriptStore((s) => s.clearAll)
  const hasContent = useScriptStore(
    (s) => s.scenes.length > 0 || s.characters.length > 0 || s.title.trim() !== '',
  )

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4">
      <div className="flex items-baseline gap-2.5">
        <h1 className="font-display text-lg font-semibold tracking-tight text-white">Script Studio</h1>
        <span className="text-xs text-zinc-500">影视脚本 · 分镜工作台</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={loadDemo}
          className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          载入示例
        </button>
        <button
          onClick={clearAll}
          disabled={!hasContent}
          className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-400 transition hover:text-white disabled:opacity-40"
        >
          清空
        </button>
        <button
          onClick={onOpenPreview}
          className="rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-500"
        >
          剧本预览
        </button>
      </div>
    </header>
  )
}
