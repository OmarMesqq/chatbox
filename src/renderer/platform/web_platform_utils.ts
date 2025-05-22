import { isTextFilePath } from 'src/shared/file-extensions'

export async function parseTextFileLocally(file: File): Promise<{ text: string; isSupported: boolean }> {
  if (!isTextFilePath(file.name)) {
    // 只在桌面端有 attachment.path，网页版本只有 attachment.name
    return { text: '', isSupported: false }
  }
  const text = await file.text()
  return { text, isSupported: true }
}
