import { readFile as fsRead, writeFile as fsWrite } from 'fs/promises'

export async function readFile(filePath: string): Promise<string> {
  return fsRead(filePath, 'utf-8')
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fsWrite(filePath, content, 'utf-8')
}
