import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'nelrich_db.json');

const DEFAULT_SHOP_INFO = {
  name: 'Nel Rich Foods',
  tagline: 'Fresh & Premium Quality Foods',
  address: 'Poyya, Kodungallur',
  cityStatePincode: 'Thrissur, Kerala',
  phone: '6235443930 / 9292493930',
  email: 'nelrichfoods@gmail.com',
  invoicePrefix: 'NRF',
  currencySymbol: '₹',
  termsAndConditions: 'Thank you for choosing Nel Rich Foods! Goods once sold can be exchanged with original invoice within 7 days.',
};

// Ensure data folder and db file exist
const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      shopInfo: DEFAULT_SHOP_INFO,
      products: [],
      invoices: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
};

initDb();

// Read Database helper
const readDb = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB file:', err);
    return { shopInfo: DEFAULT_SHOP_INFO, products: [], invoices: [] };
  }
};

// Write Database helper
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB file:', err);
    return false;
  }
};

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nel Rich Foods Backend Server Running' });
});

// Shop Info API
app.get('/api/shop', (req, res) => {
  const db = readDb();
  res.json(db.shopInfo || DEFAULT_SHOP_INFO);
});

app.post('/api/shop', (req, res) => {
  const db = readDb();
  db.shopInfo = req.body;
  writeDb(db);
  res.json({ success: true, shopInfo: db.shopInfo });
});

// Products API
app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  db.products = req.body;
  writeDb(db);
  res.json({ success: true, count: db.products.length });
});

// Invoices API
app.get('/api/invoices', (req, res) => {
  const db = readDb();
  res.json(db.invoices || []);
});

app.post('/api/invoices', (req, res) => {
  const db = readDb();
  db.invoices = req.body;
  writeDb(db);
  res.json({ success: true, count: db.invoices.length });
});

app.listen(PORT, () => {
  console.log(`✅ Nel Rich Foods Backend Database Server running at http://localhost:${PORT}`);
  console.log(`📁 Hard drive database location: ${DB_FILE}`);
});
