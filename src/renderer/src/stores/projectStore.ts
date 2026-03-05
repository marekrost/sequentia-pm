import { create } from 'zustand'
import type { ProjectFile } from '@shared/types/project'

interface ProjectState {
  projectPath: string | null
  files: ProjectFile[]
  activeTabIndex: number
  dirtyFiles: Set<string>
  buffers: Map<string, string>

  openProject: (path: string) => Promise<void>
  closeProject: () => void
  setActiveTab: (index: number) => void
  markDirty: (filePath: string) => void
  markClean: (filePath: string) => void
  setBuffer: (filePath: string, content: string) => void
  clearBuffer: (filePath: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectPath: null,
  files: [],
  activeTabIndex: 0,
  dirtyFiles: new Set(),
  buffers: new Map(),

  openProject: async (path: string) => {
    const files = await window.api.scanDirectory(path)
    set({ projectPath: path, files, activeTabIndex: 0, dirtyFiles: new Set(), buffers: new Map() })
    document.title = `Sequentia PM - ${path.split('/').slice(-2).join('/')}`
    window.api.addRecentProject(path)
  },

  closeProject: () => {
    set({ projectPath: null, files: [], activeTabIndex: 0, dirtyFiles: new Set(), buffers: new Map() })
    document.title = 'Sequentia PM'
  },

  setActiveTab: (index: number) => {
    set({ activeTabIndex: index })
  },

  markDirty: (filePath: string) => {
    set((state) => {
      const next = new Set(state.dirtyFiles)
      next.add(filePath)
      return { dirtyFiles: next }
    })
  },

  markClean: (filePath: string) => {
    set((state) => {
      const next = new Set(state.dirtyFiles)
      next.delete(filePath)
      return { dirtyFiles: next }
    })
  },

  setBuffer: (filePath: string, content: string) => {
    set((state) => {
      const next = new Map(state.buffers)
      next.set(filePath, content)
      return { buffers: next }
    })
  },

  clearBuffer: (filePath: string) => {
    set((state) => {
      const next = new Map(state.buffers)
      next.delete(filePath)
      return { buffers: next }
    })
  }
}))
