const { Client } = require('pg')

const host = process.env.DATABASE_HOST || 'localhost'
const port = Number(process.env.DATABASE_PORT || 5432)
const database = process.env.DATABASE_NAME || 'municipal_platform'
const user = process.env.DATABASE_USER || 'postgres'
const password = process.env.DATABASE_PASSWORD || 'postgres'
const maxAttempts = 30
const delayMs = 2000

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const client = new Client({
      host,
      port,
      database,
      user,
      password,
    })

    try {
      await client.connect()
      await client.query('SELECT 1')
      await client.end()
      console.log('Database is ready.')
      return
    } catch (error) {
      await client.end().catch(() => undefined)

      if (attempt === maxAttempts) {
        console.error('Database did not become ready in time.')
        throw error
      }

      console.log(`Waiting for database (${attempt}/${maxAttempts})...`)
      await sleep(delayMs)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
