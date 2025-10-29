import React from 'react'
import { formatINR } from '../currency'

export default function Cart({ cart, onUpdateQty, onRemove, onCheckout }) {
  return (
    <section className="cart">
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <div className="empty">Cart is empty</div>
      ) : (
        <>
          <ul className="cart-list">
            {cart.items.map(it => (
              <li key={it.id} className="cart-item">
                <div className="info">
                  <div className="name">{it.name}</div>
                  <div className="price">{formatINR(it.price)}</div>
                </div>
                <div className="qty">
                  <button onClick={() => onUpdateQty(it.id, it.qty - 1)}>-</button>
                  <input type="number" min="1" value={it.qty} onChange={(e) => onUpdateQty(it.id, parseInt(e.target.value, 10) || it.qty)} />
                  <button onClick={() => onUpdateQty(it.id, it.qty + 1)}>+</button>
                </div>
                <div className="line-total">{formatINR(it.lineTotal)}</div>
                <button className="remove" onClick={() => onRemove(it.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="cart-footer">
            <div className="total">Total: {formatINR(cart.total)}</div>
            <button className="checkout" onClick={onCheckout}>Checkout</button>
          </div>
        </>
      )}
    </section>
  )
}
