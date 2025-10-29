import React, { useEffect, useMemo, useState } from 'react'
import { getProducts, getCart, addToCart, removeFromCart, checkout } from './api'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import Header from './components/Header'
import { formatINR } from './currency'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const refresh = async () => {
    try {
      setLoading(true)
      const [p, c] = await Promise.all([getProducts(), getCart()])
      setProducts(p.products)
      setCart(c)
    } catch (e) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const onAdd = async (id) => {
    const existing = cart.items.find(i => i.id === id)
    const qty = (existing?.qty || 0) + 1
    await addToCart(id, qty)
    await refresh()
  }

  const onUpdateQty = async (id, qty) => {
    if (qty < 1) return
    await addToCart(id, qty)
    await refresh()
  }

  const onRemove = async (id) => {
    await removeFromCart(id)
    await refresh()
  }

  const onCheckout = async (form) => {
    try {
      const res = await checkout(form.name, form.email)
      setReceipt(res.receipt)
      setShowCheckout(false)
      await refresh()
    } catch (e) {
      setError(e?.response?.data?.error || 'Checkout failed')
    }
  }

  const content = useMemo(() => {
    if (loading) return <div className="center">Loading...</div>
    if (error) return <div className="error">{error}</div>
    return (
      <div className="container">
        <ProductGrid products={products} onAdd={onAdd} />
        <Cart cart={cart} onUpdateQty={onUpdateQty} onRemove={onRemove} onCheckout={() => setShowCheckout(true)} />
      </div>
    )
  }, [loading, error, products, cart])

  return (
    <div>
      <Header />
      {content}
      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} onSubmit={onCheckout} cart={cart} />
      )}
      {receipt && (
        <div className="modal-backdrop" onClick={() => setReceipt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Receipt</h3>
            <p>Order: {receipt.orderId}</p>
            <p>Date: {new Date(receipt.timestamp).toLocaleString()}</p>
            <ul>
              {receipt.items.map(it => (
                <li key={it.id}>{it.name} x {it.qty} = {formatINR(it.lineTotal)}</li>
              ))}
            </ul>
            <h4>Total: {formatINR(receipt.total)}</h4>
            <button onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
