import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true
})

export function renderMarkdown(source: string): string {
  return marked.parse(source) as string
}
