import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = process.env.REACT_APP_STRIPE_KEY
let stripePromise = null

function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController()
  const { signal } = controller
  const timer = setTimeout(() => controller.abort(), timeout)

  return fetch(url, { ...options, signal }).finally(() => {
    clearTimeout(timer)
  })
}

export function initStripe() {
  if (!STRIPE_KEY) {
    throw new Error(
      'Missing Stripe key. Set REACT_APP_STRIPE_KEY in environment variables.'
    )
  }
  if (!stripePromise) {
    stripePromise = (async () => {
      try {
        const stripe = await loadStripe(STRIPE_KEY)
        if (!stripe) {
          throw new Error('Failed to initialize Stripe: loadStripe returned null.')
        }
        return stripe
      } catch (err) {
        stripePromise = null
        throw err
      }
    })()
  }
  return stripePromise
}

export async function createSession(amount, metadata = {}) {
  const stripe = await initStripe()

  const response = await fetchWithTimeout(
    '/api/create-checkout-session',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount, metadata }),
    },
    15000
  )

  if (!response.ok) {
    let message
    try {
      message = await response.text()
    } catch {
      message = 'Failed to create checkout session'
    }
    throw new Error(message || 'Failed to create checkout session')
  }

  const data = await response.json()
  const sessionId = data.sessionId
  if (!sessionId) {
    throw new Error('Missing sessionId in create-checkout-session response')
  }

  const { error } = await stripe.redirectToCheckout({ sessionId })
  if (error) {
    throw error
  }
}