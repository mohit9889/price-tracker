import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const dbUrl = process.env.DBURL;
const dbName = process.env.DB_NAME || 'smart-price-tracker';

async function migrate() {
  if (!dbUrl) {
    console.error('DBURL not set');
    process.exit(1);
  }

  await mongoose.connect(dbUrl, { dbName });
  console.log('Connected to DB for migrations');

  console.log('Migrations completed (placeholder).');
  await mongoose.disconnect();
}

migrate().catch(console.error);
