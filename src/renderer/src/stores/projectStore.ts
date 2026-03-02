import { create } from 'zustand'
import type { ProjectFile } from '@shared/types/project'

interface ProjectState {
  projectPath: string | null
  files: ProjectFile[]
  activeTabIndex: number
  dirtyFiles: Set<string>

  openProject: (path: string) => Promise<void>
  closeProject: () => void
  setActiveTab: (index: number) => void
  markDirty: (filePath: string) => void
  markClean: (filePath: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectPath: null,
  files: [],
  activeTabIndex: 0,
  dirtyFiles: new Set(),

  openProject: async (path: string) => {
    const files = await window.api.scanDirectory(path)
    set({ projectPath: path, files, activeTabIndex: 0, dirtyFiles: new Set() })
    document.title = `Sequentia PM - ${path.split('/').slice(-2).join('/')}`
    window.api.addRecentProject(path)
  },

  closeProject: () => {
    set({ projectPath: null, files: [], activeTabIndex: 0, dirtyFiles: new Set() })
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
  }
}))
