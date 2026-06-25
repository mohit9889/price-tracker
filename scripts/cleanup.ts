import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const dbUrl = process.env.DBURL;
const dbName = process.env.DB_NAME || 'smart-price-tracker';

const priceHistorySchema = new mongoose.Schema({
  timestamp: String
});

const PriceHistoryModel = mongoose.model('PriceHistory', priceHistorySchema);

async function cleanup() {
  if (!dbUrl) {
    console.error('DBURL not set');
    process.exit(1);
  }

  await mongoose.connect(dbUrl, { dbName });
  console.log('Connected to DB for cleanup');

  // Delete records older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await PriceHistoryModel.deleteMany({
    timestamp: { $lt: thirtyDaysAgo.toISOString() }
  });

  console.log(`Deleted ${result.deletedCount} old price history records.`);
  
  await mongoose.disconnect();
}

cleanup().catch(console.error);
