import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

dotenv.config()

let database: ReturnType<typeof drizzle<typeof schema>> | null = null
let postgresClient: postgres.Sql | null = null

export function hasDb() {
  return Boolean(process.env.POSTGRES_URL)
}

export function getDb() {
  if (!database) {
    const connectionString = process.env.POSTGRES_URL

    if (!connectionString) {
      return null
    }

    postgresClient = postgres(connectionString)
    database = drizzle(postgresClient, { schema })
  }

  return database
}

export function getClient() {
  const db = getDb()

  if (!db || !postgresClient) {
    return null
  }

  return postgresClient
}
