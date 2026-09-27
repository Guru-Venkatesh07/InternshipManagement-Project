import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres.qharkfmuvpbajwxmtmrl:Itsguruvenkt%4007@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
