import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    const url = process.env.DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url || !authToken) {
        console.error('DATABASE_URL and TURSO_AUTH_TOKEN must be set')
        process.exit(1)
    }

    const client = createClient({ url, authToken })

    try {
        const sqlPath = path.join(process.cwd(), 'prisma', 'schema.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        // Split by semicolon but ignore inside quotes/comments if possible
        // For simplicity, we split by ';' followed by newline or end of string
        const statements = sql
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`Executing ${statements.length} statements on Turso...`)

        // Execute in a batch
        await client.batch(statements, "write")

        console.log('✅ Schema pushed to Turso successfully!')
    } catch (error) {
        console.error('❌ Error pushing schema:', error)
    } finally {
        client.close()
    }
}

main()
