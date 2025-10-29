import React from 'react'
import { formatINR } from '../currency'

export default function ProductGrid({ products, onAdd }) {
  return (
    <section className="products">
      <h2>Products</h2>
      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <div className="card-body">
              <div className="title">{p.name}</div>
              <div className="price">{formatINR(p.price)}</div>
              <button onClick={() => onAdd(p.id)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
