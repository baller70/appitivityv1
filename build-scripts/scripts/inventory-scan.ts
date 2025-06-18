#!/usr/bin/env ts-node
// @ts-nocheck
import { promises as fs } from 'fs'
import path from 'path'
import fg from 'fast-glob'

interface Row {
  path: string
  status: string
  tags: string
  loc: number
}

(async () => {
  const root = path.resolve(__dirname, '../src/components')
  const entries = await fg('**/*.tsx', { cwd: root, absolute: true })
  const rows: Row[] = []
  for (const abs of entries) {
    if (abs.includes('/landing/')) continue // skip landing
    const rel = path.relative(root, abs)
    const content = await fs.readFile(abs, 'utf8')
    const loc = content.split('\n').length
    let status = '🟡 easy'
    if (content.includes("@/components/ui")) status = '✅ shad-ready'
    if (content.match(/style={{|classList|innerHTML/)) status = '🟠 custom'
    if (content.match(/react-hot-toast|headlessui/)) status = '🔴 replace'
    const tags = Array.from(new Set((content.match(/<(\w+)/g) || []).map(m => m.slice(1))))
      .slice(0, 3)
      .join(',')
    rows.push({ path: rel, status, tags, loc })
  }
  const csvLines = ['Path,Status,Primary tags,Size (LOC)', ...rows.map(r => `${r.path},${r.status},${r.tags},${r.loc}`)]
  await fs.writeFile(path.resolve(__dirname, '../migration-inventory.csv'), csvLines.join('\n'))
  console.log(`Generated migration-inventory.csv with ${rows.length} entries`)
})() 