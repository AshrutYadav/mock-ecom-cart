import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const api = axios.create({ baseURL: API_BASE })

export async function getProducts() {
  const { data } = await api.get('/api/products')
  return data
}

export async function getCart() {
  const { data } = await api.get('/api/cart')
  return data
}

export async function addToCart(productId, qty) {
  const { data } = await api.post('/api/cart', { productId, qty })
  return data
}

export async function removeFromCart(id) {
  const { data } = await api.delete(`/api/cart/${id}`)
  return data
}

export async function checkout(name, email) {
  const { data } = await api.post('/api/checkout', { name, email })
  return data
}
