import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Store } from '@price-tracker/shared-types';

dotenv.config({ path: '.env' });

const dbUrl = process.env.DBURL;
const dbName = process.env.DB_NAME || 'smart-price-tracker';

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  urls: [{ store: String, url: String }],
}, { timestamps: true });

const ProductModel = mongoose.model('Product', productSchema);

async function seed() {
  if (!dbUrl) {
    console.error('DBURL not set');
    process.exit(1);
  }

  await mongoose.connect(dbUrl, { dbName });
  console.log('Connected to DB');

  await ProductModel.deleteMany({});

  const sampleProduct = new ProductModel({
    name: 'MacBook Air M5 (16 GB/512 GB)',
    image: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SX679_.jpg',
    urls: [
      { store: Store.RELIANCE, url: 'https://www.reliancedigital.in/product/apple-mdhe4hna-macbook-air-13-10-core-apple-m5-chip16-gb512-gb-ssdmac-osliquid-retina-3446-cm-136-inch-midnight-mmc4t9-9969451' },
      { store: Store.FLIPKART, url: 'https://www.flipkart.com/apple-macbook-air-m5-2026-m5-16-gb-512-gb-ssd-tahoe-mdha4hn-a/p/itm3fee23645bafb?pid=COMHH78YUGYGAAEQ&lid=LSTCOMHH78YUGYGAAEQPONM8B&marketplace=FLIPKART&cmpid=content_computer_8965229628_gmc' },
      { store: Store.VIJAY_SALES, url: 'https://www.vijaysales.com/p/P253997/253994/apple-macbook-air-m5-chip-16gb-ram-512gb-ssd-15-inch-liquid-retina-display-10-core-cpu-and-10-core-gpu-starlight-mdvd4hn-a' },
      { store: Store.APPLE, url: 'https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-silver-m5-chip-10-core-cpu-8-core-gpu-16gb-memory-512gb-storage?cid=aos-in-seo-pla-mac-mac' },
      { store: Store.AMAZON, url: 'https://www.amazon.in/Apple-2026-MacBook-Laptop-chip/dp/B0GR1K8S8H/ref=asc_df_B0GR1K8S8H?mcid=a87f17c6d13b35f18e17fc88f500d140&tag=googleshopdes-21&linkCode=df0&hvadid=794212938611&hvpos=&hvnetw=g&hvrand=4147166179794872890&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9061645&hvtargid=pla-2472571349476&psc=1&hvocijid=4147166179794872890-B0GR1K8S8H-&hvexpln=0&gad_source=1' }
    ]
  });

  await sampleProduct.save();
  console.log('Sample product seeded:', sampleProduct._id);

  await mongoose.disconnect();
}

seed().catch(console.error);
