import React, { useState } from 'react'
import { formatINR } from '../currency'

export default function CheckoutModal({ onClose, onSubmit, cart }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid name and email')
      return
    }
    onSubmit({ name: name.trim(), email: email.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Checkout</h3>
        <p>Items: {cart.items.length} | Total: {formatINR(cart.total)}</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <div className="actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
