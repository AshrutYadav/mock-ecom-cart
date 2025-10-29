import { run, get } from './db.js';

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

async function reseedProducts() {
  await run('DELETE FROM cart');
  await run('DELETE FROM products');
  const items = [
    { id: 1, name: 'Urban Bomber Jacket', price: 2499, image: 'https://img.tatacliq.com/images/i14/437Wx649H/MP000000020066032_437Wx649H_202311121802571.jpeg' },
    { id: 2, name: 'Athletic Joggers', price: 899, image: 'https://athflex.com/cdn/shop/files/03_4af9578b-eccf-4d69-b65e-151c7d4e8c0a.jpg?v=1737294636' },
    { id: 3, name: 'Slim Fit Denim Jeans', price: 1299, image: 'https://www.urbanofashion.com/cdn/shop/files/epsjeanwhithrnd-lgrey-1.png?v=1727179648' },
    { id: 4, name: 'Galaxy Running Shoes', price: 1699, image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/shoe/0/k/j/-original-imahgcthgtn8muaa.jpeg?q=90' },
    { id: 5, name: 'Water Bottle', price: 799, image: 'https://www.milton.in/cdn/shop/files/gps_generated_40317d37-9cf9-4c29-a6e3-074bc1b11bf5.png?v=1740554453' },
    { id: 6, name: 'Urban Streetwear Hoodie', price: 1299, image: 'https://m.media-amazon.com/images/I/71aj0OahgeL._AC_UY1100_.jpg' },
    { id: 7, name: 'Essential Crewneck Sweatshirt', price: 699, image: 'https://assets.myntassets.com/w_412,q_30,dpr_3,fl_progressive,f_webp/assets/images/23773002/2023/8/23/d82209a4-92ef-4422-8de7-088fcacec1e61692790932069-ADIDAS-Originals-Trefoil-Essential-Crewneck-Sweatshirt-36816-1.jpg' },
    { id: 8, name: 'Vintage Graphic Tee', price: 2499, image: 'https://m.media-amazon.com/images/I/81RwXiihn2L._AC_UY1100_.jpg' },
    { id: 9, name: 'Galaxy Watch', price: 13499, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzRDh8zvNNHIu676SSOpZja75LSVT9G7TGjw&s' },
    { id: 10, name: 'Sunglasses', price: 899, image: 'https://www.alainopticalpk.com/cdn/shop/files/rn-image_picker_lib_temp_6a8f7ad2-1c40-4576-89b9-b3e783b8bd70.jpg?v=1744497813' }
  ];
  for (const p of items) {
    await run('INSERT INTO products (id, name, price, image) VALUES (?, ?, ?, ?)', [p.id, p.name, p.price, p.image]);
  }
}

async function main() {
  await ensureSchema();
  await reseedProducts();
  console.log('DB reseeded with INR prices and images.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
