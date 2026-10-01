import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Beat, Character, Genre, Scene, Shot } from '../types'
import { DEMO_PROJECT } from '../data/demo'

const BEATS: Beat[] = ['起', '承', '转', '合']

function nextDefaultBeat(scenes: Scene[]): Beat {
  const used = new Set(scenes.map((s) => s.beat))
  for (const b of BEATS) if (!used.has(b)) return b
  return '承'
}

function renumber(scenes: Scene[]): Scene[] {
  return scenes.map((s, i) => ({ ...s, number: i + 1 }))
}

interface ScriptState {
  title: string
  logline: string
  genre: Genre
  targetDuration: number
  characters: Character[]
  scenes: Scene[]
  selectedSceneId: string | null
  apiKey: string

  setTitle: (v: string) => void
  setLogline: (v: string) => void
  setGenre: (v: Genre) => void
  setTargetDuration: (seconds: number) => void
  setApiKey: (v: string) => void

  addCharacter: () => void
  updateCharacter: (id: string, patch: Partial<Character>) => void
  removeCharacter: (id: string) => void

  addScene: () => void
  updateScene: (id: string, patch: Partial<Scene>) => void
  removeScene: (id: string) => void
  moveScene: (id: string, dir: -1 | 1) => void
  selectScene: (id: string | null) => void

  addShot: (sceneId: string) => void
  updateShot: (sceneId: string, shotId: string, patch: Partial<Shot>) => void
  removeShot: (sceneId: string, shotId: string) => void
  moveShot: (sceneId: string, shotId: string, dir: -1 | 1) => void

  applyGeneratedScenes: (scenes: Scene[]) => void
  loadDemo: () => void
  clearAll: () => void
}

export const useScriptStore = create<ScriptState>()(
  persist(
    (set) => ({
      title: '',
      logline: '',
      genre: '剧情短片',
      targetDuration: 480,
      characters: [],
      scenes: [],
      selectedSceneId: null,
      apiKey: '',

      setTitle: (title) => set({ title }),
      setLogline: (logline) => set({ logline }),
      setGenre: (genre) => set({ genre }),
      setTargetDuration: (targetDuration) => set({ targetDuration }),
      setApiKey: (apiKey) => set({ apiKey }),

      addCharacter: () => {
        const c: Character = { id: crypto.randomUUID(), name: '', role: '主角', note: '' }
        set((s) => ({ characters: [...s.characters, c] }))
      },
      updateCharacter: (id, patch) =>
        set((s) => ({
          characters: s.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCharacter: (id) =>
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          scenes: s.scenes.map((sc) => ({
            ...sc,
            characterIds: sc.characterIds.filter((cid) => cid !== id),
          })),
        })),

      addScene: () => {
        const id = crypto.randomUUID()
        set((s) => {
          const scene: Scene = {
            id,
            number: s.scenes.length + 1,
            slug: `场景${s.scenes.length + 1}`,
            setting: '',
            time: '日',
            interior: '内景',
            characterIds: [],
            summary: '',
            duration: 60,
            shots: [],
            beat: nextDefaultBeat(s.scenes),
          }
          return { scenes: [...s.scenes, scene], selectedSceneId: id }
        })
      },
      updateScene: (id, patch) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
        })),
      removeScene: (id) =>
        set((s) => ({
          scenes: renumber(s.scenes.filter((sc) => sc.id !== id)),
          selectedSceneId: s.selectedSceneId === id ? null : s.selectedSceneId,
        })),
      moveScene: (id, dir) =>
        set((s) => {
          const idx = s.scenes.findIndex((sc) => sc.id === id)
          const target = idx + dir
          if (idx < 0 || target < 0 || target >= s.scenes.length) return s
          const next = [...s.scenes]
          const [item] = next.splice(idx, 1)
          next.splice(target, 0, item)
          return { scenes: renumber(next) }
        }),
      selectScene: (id) => set({ selectedSceneId: id }),

      addShot: (sceneId) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc
            const shot: Shot = {
              id: crypto.randomUUID(),
              size: '中',
              move: '固定',
              subject: '',
              line: '',
              audio: '',
            }
            return { ...sc, shots: [...sc.shots, shot] }
          }),
        })),
      updateShot: (sceneId, shotId, patch) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id !== sceneId
              ? sc
              : {
                  ...sc,
                  shots: sc.shots.map((sh) => (sh.id === shotId ? { ...sh, ...patch } : sh)),
                },
          ),
        })),
      removeShot: (sceneId, shotId) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id !== sceneId ? sc : { ...sc, shots: sc.shots.filter((sh) => sh.id !== shotId) },
          ),
        })),
      moveShot: (sceneId, shotId, dir) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc
            const idx = sc.shots.findIndex((sh) => sh.id === shotId)
            const target = idx + dir
            if (idx < 0 || target < 0 || target >= sc.shots.length) return sc
            const shots = [...sc.shots]
            const [item] = shots.splice(idx, 1)
            shots.splice(target, 0, item)
            return { ...sc, shots }
          }),
        })),

      applyGeneratedScenes: (scenes) => set({ scenes, selectedSceneId: scenes[0]?.id ?? null }),
      loadDemo: () =>
        set({
          ...DEMO_PROJECT,
          selectedSceneId: DEMO_PROJECT.scenes[0]?.id ?? null,
        }),
      clearAll: () =>
        set({ title: '', logline: '', characters: [], scenes: [], selectedSceneId: null }),
    }),
    {
      name: 'script-studio',
      partialize: (s) => ({
        title: s.title,
        logline: s.logline,
        genre: s.genre,
        targetDuration: s.targetDuration,
        characters: s.characters,
        scenes: s.scenes,
        selectedSceneId: s.selectedSceneId,
      }),
    },
  ),
)
