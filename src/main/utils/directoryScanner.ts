import { readdir } from 'fs/promises'
import { join } from 'path'

export interface ProjectFile {
  prefix: number
  name: string
  fileName: string
  filePath: string
  extension: 'md' | 'csv' | 'dbml'
}

const FILE_PATTERN = /^(\d+)-(.+)\.(md|csv|dbml)$/

export async function scanDirectory(dirPath: string): Promise<ProjectFile[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const files: ProjectFile[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    const match = entry.name.match(FILE_PATTERN)
    if (!match) continue

    const [, prefixStr, rawName, ext] = match
    files.push({
      prefix: parseInt(prefixStr, 10),
      name: rawName.replace(/-/g, ' '),
      fileName: entry.name,
      filePath: join(dirPath, entry.name),
      extension: ext as ProjectFile['extension']
    })
  }

  return files.sort((a, b) => a.prefix - b.prefix)
}
