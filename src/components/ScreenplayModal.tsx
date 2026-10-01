import { useState } from 'react'
import { useScriptStore } from '../store/scriptStore'
import { formatScreenplay } from '../engine/format'

export function ScreenplayModal({ onClose }: { onClose: () => void }) {
  const title = useScriptStore((s) => s.title)
  const logline = useScriptStore((s) => s.logline)
  const genre = useScriptStore((s) => s.genre)
  const targetDuration = useScriptStore((s) => s.targetDuration)
  const characters = useScriptStore((s) => s.characters)
  const scenes = useScriptStore((s) => s.scenes)
  const [copied, setCopied] = useState(false)

  const text = formatScreenplay({ title, logline, genre, targetDuration, characters, scenes })

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || '剧本'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[82vh] w-full max-w-2xl flex-col rounded-xl border border-white/10 bg-ink-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">剧本预览</h2>
          <span className="text-xs text-zinc-600">行业格式 · 可直接用于拍摄</span>
          <button onClick={onClose} className="ml-auto text-zinc-500 transition hover:text-white">
            ✕
          </button>
        </header>
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-xs leading-relaxed text-zinc-300">
          {text}
        </pre>
        <footer className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
          <button
            onClick={copy}
            className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:text-white"
          >
            {copied ? '已复制 ✓' : '复制文本'}
          </button>
          <button
            onClick={download}
            className="rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-500"
          >
            导出 .txt
          </button>
        </footer>
      </div>
    </div>
  )
}
