export interface DbmlRenderResult {
  svg: string | null
  error: string | null
}

export async function renderDbml(source: string): Promise<DbmlRenderResult> {
  return window.api.renderDbml(source)
}
