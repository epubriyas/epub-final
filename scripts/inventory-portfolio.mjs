import { JSDOM } from 'jsdom'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.argv[2]
if (!root || !/^[\w-]+$/.test(root)) throw new Error('Pass the source Drive folder ID.')
const destination = path.resolve('private-uploads/portfolio-source')
await mkdir(destination, { recursive: true })
const entries = []
const visited = new Set()
async function inspect(id, folder) {
  if (visited.has(id)) return
  visited.add(id)
  const response = await fetch(`https://drive.google.com/drive/folders/${id}`)
  if (!response.ok) throw new Error(`Folder request failed: ${response.status}`)
  const html = await response.text()
  const document = new JSDOM(html).window.document
  const rows = [...document.querySelectorAll('[role=row][data-id]')]
  await writeFile(path.join(destination, `${id}.html`), html)
  for (const row of rows) {
    const cells = row.querySelectorAll('td')
    const entry = {
      folder,
      id: row.getAttribute('data-id'),
      name: cells[0]?.querySelector('[data-tooltip]')?.textContent,
      kind: cells[0]?.querySelector('[aria-label]')?.getAttribute('aria-label'),
      size: cells[2]?.textContent,
    }
    if (!entry.id || !entry.name) continue
    entries.push(entry)
    if (entry.kind?.endsWith('Shared folder')) await inspect(entry.id, `${folder}/${entry.name}`)
  }
}
await inspect(root, 'Portfolio')
await writeFile(path.join(destination, 'inventory.json'), JSON.stringify(entries, null, 2))
console.log(JSON.stringify(entries, null, 2))
