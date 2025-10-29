import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { all, get, run } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

async function ensureSchema() {
  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS cart (
    productId INTEGER PRIMARY KEY,
    qty INTEGER NOT NULL,
    FOREIGN KEY(productId) REFERENCES products(id)
  )`);
}

function isEmail(str) {
  return /\S+@\S+\.\S+/.test(str);
}

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await all('SELECT id, name, price, image FROM products');
    res.json({ products });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Cart
app.get('/api/cart', async (req, res) => {
  try {
    const rows = await all(`SELECT c.productId as id, p.name, p.price, p.image, c.qty
                            FROM cart c JOIN products p ON p.id = c.productId`);
    const items = rows.map(r => ({ id: r.id, name: r.name, price: r.price, image: r.image, qty: r.qty, lineTotal: +(r.price * r.qty).toFixed(2) }));
    const total = +items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);
    res.json({ items, total });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, qty } = req.body || {};
    if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'Invalid productId or qty' });
    }
    const product = await get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Upsert behavior
    const existing = await get('SELECT productId, qty FROM cart WHERE productId = ?', [productId]);
    if (existing) {
      await run('UPDATE cart SET qty = ? WHERE productId = ?', [qty, productId]);
    } else {
      await run('INSERT INTO cart (productId, qty) VALUES (?, ?)', [productId, qty]);
    }
    return res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    await run('DELETE FROM cart WHERE productId = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { name, email, cartItems } = req.body || {};
    if (!name || !isEmail(email)) return res.status(400).json({ error: 'Invalid name or email' });

    // Use provided cartItems or current DB cart
    let items = cartItems;
    if (!Array.isArray(items)) {
      const rows = await all(`SELECT c.productId as id, p.name, p.price, c.qty
                              FROM cart c JOIN products p ON p.id = c.productId`);
      items = rows.map(r => ({ id: r.id, name: r.name, price: r.price, qty: r.qty }));
    }

    // Validate items
    for (const it of items) {
      if (!Number.isInteger(it.id) || !Number.isInteger(it.qty) || it.qty < 1) {
        return res.status(400).json({ error: 'Invalid cart items' });
      }
    }

    // Compute total with authoritative prices
    const ids = items.map(i => i.id);
    const placeholders = ids.map(() => '?').join(',');
    const dbProducts = await all(`SELECT id, name, price FROM products WHERE id IN (${placeholders || 'NULL'})`, ids);
    const map = new Map(dbProducts.map(p => [p.id, p]));
    const normalized = items
      .filter(i => map.has(i.id))
      .map(i => ({ id: i.id, name: map.get(i.id).name, price: map.get(i.id).price, qty: i.qty }));

    const lineItems = normalized.map(n => ({ ...n, lineTotal: +(n.price * n.qty).toFixed(2) }));
    const total = +lineItems.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);

    // Clear cart after checkout
    await run('DELETE FROM cart');

    const receipt = {
      customer: { name, email },
      items: lineItems,
      total,
      timestamp: new Date().toISOString(),
      orderId: 'ORDER-' + Math.random().toString(36).slice(2, 9).toUpperCase()
    };
    res.json({ receipt });
  } catch (e) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

ensureSchema().then(() => {
  app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
}).catch((e) => {
  console.error('Failed to init schema', e);
  process.exit(1);
});
