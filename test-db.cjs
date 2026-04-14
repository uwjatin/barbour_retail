const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL successfully!')
  } catch (error) {
    console.error('❌ Connection error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
