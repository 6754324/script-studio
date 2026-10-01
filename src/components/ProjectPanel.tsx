import { useState } from 'react'
import { useScriptStore } from '../store/scriptStore'
import { generateScenes } from '../ai/generate'
import { computeStats, analyzeStructure } from '../engine/stats'
import { formatDuration } from '../engine/duration'
import { GENRES, CHARACTER_ROLES, BEAT_CHIP, BEAT_LABEL } from '../data/constants'

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{children}</h2>
}

export function ProjectPanel() {
  const title = useScriptStore((s) => s.title)
  const logline = useScriptStore((s) => s.logline)
  const genre = useScriptStore((s) => s.genre)
  const targetDuration = useScriptStore((s) => s.targetDuration)
  const characters = useScriptStore((s) => s.characters)
  const scenes = useScriptStore((s) => s.scenes)
  const apiKey = useScriptStore((s) => s.apiKey)

  const setTitle = useScriptStore((s) => s.setTitle)
  const setLogline = useScriptStore((s) => s.setLogline)
  const setGenre = useScriptStore((s) => s.setGenre)
  const setTargetDuration = useScriptStore((s) => s.setTargetDuration)
  const setApiKey = useScriptStore((s) => s.setApiKey)
  const addCharacter = useScriptStore((s) => s.addCharacter)
  const updateCharacter = useScriptStore((s) => s.updateCharacter)
  const removeCharacter = useScriptStore((s) => s.removeCharacter)
  const applyGeneratedScenes = useScriptStore((s) => s.applyGeneratedScenes)

  const [generating, setGenerating] = useState(false)
  const [genSource, setGenSource] = useState<'demo' | 'api' | null>(null)

  const stats = computeStats(scenes, targetDuration)
  const structure = analyzeStructure(scenes)

  const onGenerate = async () => {
    setGenerating(true)
    setGenSource(null)
    const result = await generateScenes(
      {
        title,
        logline,
        genre,
        targetDuration,
        characterNames: characters.map((c) => c.name).filter(Boolean),
      },
      apiKey.trim(),
    )
    applyGeneratedScenes(result.scenes)
    setGenSource(result.source)
    setGenerating(false)
  }

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>项目信息</SectionTitle>
        <div className="space-y-2.5">
          <input
            className="w-full rounded-md border border-white/10 bg-ink-800 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500/60"
            placeholder="作品标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full resize-none rounded-md border border-white/10 bg-ink-800 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500/60"
            placeholder="一句话梗概 (logline)"
            rows={3}
            value={logline}
            onChange={(e) => setLogline(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500/60"
              value={genre}
              onChange={(e) => setGenre(e.target.value as typeof genre)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-sm text-zinc-400">
              目标
              <input
                className="w-16 rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500/60"
                value={Math.round(targetDuration / 60)}
                onChange={(e) => {
                  const m = Number(e.target.value)
                  if (Number.isFinite(m) && m > 0) setTargetDuration(m * 60)
                }}
              />
              分
            </label>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>AI 生成分场</SectionTitle>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-white/10 bg-ink-800 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500/60"
            type="password"
            placeholder="DeepSeek API Key（可选）"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            onClick={onGenerate}
            disabled={generating}
            className="w-full rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-ink-950 transition hover:bg-accent-500 disabled:opacity-50"
          >
            {generating ? '生成中…' : '✨ 根据梗概生成分场'}
          </button>
          <p className="text-[11px] leading-relaxed text-zinc-600">
            {genSource === 'api' && '已用 AI 模型生成，可继续编辑。'}
            {genSource === 'demo' && '未配置 API Key，已载入示例结构（可离线体验）。'}
            {!genSource && '未配置 Key 时使用内置示例，配置后走 DeepSeek 实时生成。'}
          </p>
        </div>
      </section>

      <section>
        <SectionTitle>人物</SectionTitle>
        <div className="space-y-2">
          {characters.map((c) => (
            <div key={c.id} className="rounded-md border border-white/10 bg-ink-800/60 p-2">
              <div className="flex items-center gap-2">
                <input
                  className="min-w-0 flex-1 rounded border border-white/10 bg-ink-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-brand-500/60"
                  placeholder="姓名"
                  value={c.name}
                  onChange={(e) => updateCharacter(c.id, { name: e.target.value })}
                />
                <select
                  className="rounded border border-white/10 bg-ink-900 px-1.5 py-1 text-xs text-zinc-300 outline-none"
                  value={c.role}
                  onChange={(e) => updateCharacter(c.id, { role: e.target.value })}
                >
                  {CHARACTER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeCharacter(c.id)}
                  className="text-zinc-600 transition hover:text-rose-400"
                  title="删除"
                >
                  ✕
                </button>
              </div>
              <input
                className="mt-1.5 w-full rounded border border-white/10 bg-ink-900 px-2 py-1 text-xs text-zinc-400 outline-none focus:border-brand-500/60"
                placeholder="备注"
                value={c.note}
                onChange={(e) => updateCharacter(c.id, { note: e.target.value })}
              />
            </div>
          ))}
          <button
            onClick={addCharacter}
            className="w-full rounded-md border border-dashed border-white/15 px-3 py-2 text-sm text-zinc-500 transition hover:border-white/30 hover:text-zinc-300"
          >
            + 添加人物
          </button>
        </div>
      </section>

      <section>
        <SectionTitle>结构分析 · 起承转合</SectionTitle>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {(['起', '承', '转', '合'] as const).map((b) => {
              const covered = structure.covered.includes(b)
              return (
                <div
                  key={b}
                  className={`rounded-md px-2 py-1.5 text-xs ${covered ? BEAT_CHIP[b] : 'bg-white/5 text-zinc-600'}`}
                >
                  {BEAT_LABEL[b]}
                  {covered ? ' ✓' : ' —'}
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="rounded-md bg-white/5 px-1 py-2">
              <div className="font-mono text-base text-white">{stats.sceneCount}</div>
              <div className="text-zinc-500">场</div>
            </div>
            <div className="rounded-md bg-white/5 px-1 py-2">
              <div className="font-mono text-base text-white">{stats.shotCount}</div>
              <div className="text-zinc-500">镜头</div>
            </div>
            <div className="rounded-md bg-white/5 px-1 py-2">
              <div className="font-mono text-base text-white">{formatDuration(stats.totalDuration)}</div>
              <div className="text-zinc-500">总长</div>
            </div>
          </div>
          {structure.issues.length > 0 && (
            <ul className="space-y-1">
              {structure.issues.map((issue, i) => (
                <li key={i} className="text-[11px] text-amber-400/90">
                  ⚠ {issue.message}
                </li>
              ))}
            </ul>
          )}
          {structure.complete && (
            <p className="text-[11px] text-emerald-400">✓ 结构完整，起承转合齐备</p>
          )}
        </div>
      </section>
    </div>
  )
}
