import { useState } from 'react'
import { Toolbar } from './components/Toolbar'
import { ProjectPanel } from './components/ProjectPanel'
import { SceneList } from './components/SceneList'
import { SceneEditor } from './components/SceneEditor'
import { ScreenplayModal } from './components/ScreenplayModal'

export default function App() {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-ink-950 text-zinc-300">
      <Toolbar onOpenPreview={() => setPreviewOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <aside className="w-80 shrink-0 overflow-auto border-r border-white/10 p-4">
          <ProjectPanel />
        </aside>
        <main className="min-w-0 flex-1 overflow-hidden border-r border-white/10">
          <SceneList />
        </main>
        <aside className="w-[26rem] shrink-0 overflow-hidden">
          <SceneEditor />
        </aside>
      </div>
      {previewOpen && <ScreenplayModal onClose={() => setPreviewOpen(false)} />}
    </div>
  )
}
