export const caseStudyCategories = [
  { label: 'Publishing', value: 'publishing' },
  { label: 'Localization', value: 'localization' },
  { label: 'eLearning', value: 'elearning' },
  { label: 'Accessibility', value: 'accessibility' },
]
export const resourceTypes = [
  { label: 'Guide', value: 'guide' },
  { label: 'eBook', value: 'ebook' },
  { label: 'Whitepaper', value: 'whitepaper' },
  { label: 'Report', value: 'report' },
]
export const resourceGroups = {
  'guides-ebooks': { title: 'Guides & eBooks', types: ['guide', 'ebook'] },
  'whitepapers-reports': { title: 'Whitepapers & Reports', types: ['whitepaper', 'report'] },
} as const
export function getResourceGroup(value: unknown) {
  return typeof value === 'string' && Object.hasOwn(resourceGroups, value)
    ? resourceGroups[value as keyof typeof resourceGroups]
    : undefined
}
