import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient({ log: ['error'] })

interface RawRow {
  college_name: string
  type: string
  year: string | number
  branch: string
  opening_rank: string
  closing_rank: string
  annual_fees: string
  placement_rating: string | number | null
  location: string
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'eapcet_data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: data/eapcet_data.json not found. Run: npm run convert:data first.')
    process.exit(1)
  }

  const raw: RawRow[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`Total input rows: ${raw.length}`)

  const valid = []
  let skipped = 0

  for (const row of raw) {
    if (!row.college_name || !row.type || !row.year || !row.branch || !row.location) {
      skipped++
      continue
    }
    const yearNum = Number(row.year)
    if (isNaN(yearNum)) { skipped++; continue }

    let rating: number | null = null
    if (row.placement_rating !== null && row.placement_rating !== undefined) {
      const r = parseFloat(String(row.placement_rating))
      if (!isNaN(r)) rating = r
    }

    valid.push({
      college_name:     String(row.college_name).trim(),
      type:             String(row.type).trim(),
      year:             yearNum,
      branch:           String(row.branch).trim(),
      opening_rank:     row.opening_rank ? String(row.opening_rank).trim() : '-',
      closing_rank:     row.closing_rank ? String(row.closing_rank).trim() : '-',
      annual_fees:      row.annual_fees ? String(row.annual_fees).trim() : '-',
      placement_rating: rating,
      location:         String(row.location).trim(),
    })
  }

  console.log(`Valid: ${valid.length} | Skipped: ${skipped}`)

  // Upsert in batches of 500
  const BATCH = 500
  let imported = 0
  for (let i = 0; i < valid.length; i += BATCH) {
    const batch = valid.slice(i, i + BATCH)
    await prisma.$transaction(
      batch.map(row =>
        prisma.eapcetCutoff.upsert({
          where: {
            // composite unique — add @@unique in schema if needed; for now createMany
            id: 0,  // force create path via createMany below
          },
          create: row,
          update: row,
        })
      )
    )
    imported += batch.length
    process.stdout.write(`\rImported ${imported}/${valid.length}...`)
  }

  // Simpler: use createMany (faster, no upsert overhead)
  await prisma.eapcetCutoff.deleteMany({})
  for (let i = 0; i < valid.length; i += BATCH) {
    await prisma.eapcetCutoff.createMany({ data: valid.slice(i, i + BATCH), skipDuplicates: true })
    process.stdout.write(`\rImported ${Math.min(i + BATCH, valid.length)}/${valid.length}...`)
  }

  console.log(`\nDone. Imported ${valid.length} records. Skipped ${skipped} invalid rows.`)
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
