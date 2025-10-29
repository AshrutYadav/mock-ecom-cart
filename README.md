# Mock E‑Com Cart (Vibe Commerce Screening)

A basic full‑stack shopping cart app that demonstrates UI, API, and DB integration. It supports browsing products, adding/removing items from the cart, calculating totals, and a mock checkout that returns a receipt (no real payment).

- Backend: Node.js + Express + SQLite (file‑based)
- Frontend: React + Vite
- APIs: REST JSON
- Currency: INR (₹) with Indian number formatting
- Hosting: Not required; local dev instructions included

## Features

- Products grid with 10 seeded items (images + INR pricing)
- Add to cart, update quantity, and remove item
- Line totals and cart total
- Checkout form (name, email) → receipt modal with order id and timestamp
- Responsive layout and modern styling
- CORS enabled, configurable API base via `VITE_API_URL`
- SQLite persistence; reseed script to refresh sample data

## Architecture Overview

- Express REST API serves products, cart operations, and a mock checkout.
- SQLite stores `products` and `cart` tables (file: `backend/data/data.sqlite`).
- React frontend consumes the REST API with Axios. State is managed via component state.
- Prices are computed on the server using authoritative product prices.

### Directory Structure

```
mock-ecom-cart/
  backend/
    package.json
    src/
      db.js           # sqlite helpers (run/get/all)
      server.js       # express app + routes
      seed.js         # one-time seed if empty
      reset-seed.js   # reseed to the latest catalog (clears cart)
    data/
      data.sqlite     # generated after seeding

  frontend/
    package.json
    vite.config.js
    index.html
    src/
      main.jsx
      App.jsx
      api.js          # Axios client
      currency.js     # INR formatter
      styles.css
      components/
        Header.jsx
        ProductGrid.jsx
        Cart.jsx
        CheckoutModal.jsx

  .gitignore
  README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (bundled with Node)

### 1) Install Dependencies

Open two terminals or run sequentially:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2) Seed the Database

```bash
cd backend
npm run seed       # creates tables and seeds only if empty
# or
npm run reseed     # clears cart and products, then reseeds (refresh catalog)
```

### 3) Run the Servers

```bash
# Terminal A – API
cd backend
npm run dev        # http://localhost:4000

# Terminal B – Frontend
cd frontend
npm run dev        # http://localhost:5173
```

Open the app at http://localhost:5173

### Environment Variables

Frontend can be pointed to a different API origin:

```
# frontend/.env
VITE_API_URL=http://localhost:4000
```

## API Reference

Base URL: `http://localhost:4000`

- GET `/api/products`
  - Response: `{ products: [{ id, name, price, image }] }`

- GET `/api/cart`
  - Response: `{ items: [{ id, name, price, image, qty, lineTotal }], total }`

- POST `/api/cart`
  - Body: `{ productId: number, qty: number>=1 }`
  - Upserts a cart row with specified quantity
  - Response: `{ ok: true }`

- DELETE `/api/cart/:id`
  - Removes product from cart
  - Response: `{ ok: true }`

- POST `/api/checkout`
  - Body: `{ name: string, email: string, cartItems?: [{ id, qty }] }`
  - Uses server prices to compute totals, clears cart on success
  - Response: `{ receipt: { customer, items:[{ id, name, price, qty, lineTotal }], total, timestamp, orderId } }`

- GET `/health`
  - Response: `{ ok: true }`

### Data Model

- `products(id INTEGER PRIMARY KEY, name TEXT, price REAL, image TEXT)`
- `cart(productId INTEGER PRIMARY KEY, qty INTEGER)`

Notes:

- Prices stored in INR (numbers). Formatting to `₹` is done client‑side via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- Checkout recomputes totals using database prices to prevent tampering.

## Frontend Overview

- `ProductGrid` lists products with images and Add to Cart.
- `Cart` shows items, prices, quantity editors, line totals, remove, and cart total.
- `CheckoutModal` collects name and email with basic validation (required name, valid email).
- `App` orchestrates API calls, error handling, and the receipt modal.

## Error Handling & Validation

- Server validates `productId`, `qty`, `name`, and `email`.
- Client shows basic error messages for failed loads and checkout errors.
- Non‑existent products are ignored during checkout computation.

## Common Tasks

- Reseed catalog and clear cart:
  ```bash
  cd backend && npm run reseed
  ```

- Change API port:
  - Set `PORT` in `backend/.env` and restart the server.

- Point frontend to a different API origin:
  ```
  # frontend/.env
  VITE_API_URL=http://localhost:4000
  ```

## Troubleshooting

- Frontend can’t load products/cart
  - Ensure API is running at `http://localhost:4000`.
  - Check terminal for API errors.

- CORS error in browser console
  - API has CORS enabled; confirm you are using the correct origin/port.

- Images not loading
  - Requires internet access; the app uses public image URLs.

- SQLite locked on Windows
  - Stop other running processes using the DB, then retry.

## Roadmap / Enhancements

- Persist carts per user (mock user id or auth).
- Integrate Fake Store API to import/sync products periodically.
- Unit tests for API routes and React components.
- Client‑side routing for multi‑page UX.
- Deploy demo (Netlify/Vercel for frontend + simple backend host).

## License

MIT