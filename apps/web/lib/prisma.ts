import { PrismaClient } from '@prisma/client'
// import { config } from 'dotenv';

// import path from 'path';
// config({ path: path.resolve(__dirname, '../.env.local') });

// TODO: consider configuration - not prod safe yet
// const { NODE_ENV } = process.env;

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

globalForPrisma.prisma = prisma

export default prisma