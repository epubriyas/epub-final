export const quoteUploadLimit = 1024 * 1024
export const quoteUploadCount = 3
export const quoteUploadAccept = '.pdf,.docx,.txt'
export function validateQuoteFiles(files: { name: string; size: number }[]) {
  if (files.length > quoteUploadCount) return 'Choose up to 3 files.'
  for (const file of files) {
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) return 'Use PDF, DOCX or TXT files.'
    if (!file.size) return 'Empty files cannot be uploaded.'
    if (file.size > quoteUploadLimit) return 'Each file must be 1 MB or smaller.'
  }
  return ''
}
