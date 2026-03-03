import { readdir } from 'fs/promises'
import { extname, join } from 'path'
import type { ProjectFile } from '@shared/types/project'
import { SUPPORTED_EXTENSIONS } from '@shared/types/project'

const PREFIXED_PATTERN = /^(\d+)-(.+)\.(\w+)$/

/** Sort rank: 0 = prefixed, 1 = unprefixed+supported, 2 = unprefixed+unsupported */
function sortRank(f: ProjectFile): number {
  if (f.prefix !== null) return 0
  return SUPPORTED_EXTENSIONS.has(f.extension) ? 1 : 2
}

export async function scanDirectory(dirPath: string): Promise<ProjectFile[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const files: ProjectFile[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (entry.name.startsWith('.')) continue

    const prefixed = entry.name.match(PREFIXED_PATTERN)
    if (prefixed) {
      const [, prefixStr, rawName, ext] = prefixed
      files.push({
        prefix: parseInt(prefixStr, 10),
        name: rawName.replace(/-/g, ' '),
        fileName: entry.name,
        filePath: join(dirPath, entry.name),
        extension: ext
      })
      continue
    }

    const rawExt = extname(entry.name)
    if (rawExt) {
      const ext = rawExt.slice(1) // remove leading dot
      const name = entry.name.slice(0, -(ext.length + 1))
      files.push({
        prefix: null,
        name: name.replace(/-/g, ' '),
        fileName: entry.name,
        filePath: join(dirPath, entry.name),
        extension: ext
      })
    }
  }

  return files.sort((a, b) => {
    const aRank = sortRank(a)
    const bRank = sortRank(b)
    if (aRank !== bRank) return aRank - bRank
    if (a.prefix !== null && b.prefix !== null) return a.prefix - b.prefix
    return a.name.localeCompare(b.name)
  })
}
