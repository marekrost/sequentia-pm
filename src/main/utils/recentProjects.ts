import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const MAX_RECENT = 10
const filePath = join(app.getPath('userData'), 'recent-projects.json')

function load(): string[] {
  if (!existsSync(filePath)) return []
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function save(paths: string[]): void {
  writeFileSync(filePath, JSON.stringify(paths), 'utf-8')
}

export function getRecentProjects(): string[] {
  return load()
}

export function addRecentProject(projectPath: string): string[] {
  const recent = load().filter((p) => p !== projectPath)
  recent.unshift(projectPath)
  const trimmed = recent.slice(0, MAX_RECENT)
  save(trimmed)
  return trimmed
}
