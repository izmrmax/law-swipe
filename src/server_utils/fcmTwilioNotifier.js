const admin = require('firebase-admin')
const twilio = require('twilio')

let serviceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  } catch (err) {
    throw new Error('Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY: ' + err.message)
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
} else {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH must be defined')
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be defined')
}
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

async function sendPushNotification({ tokens, title, body, data = {} }) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error('sendPushNotification requires a non-empty tokens array')
  }
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('sendPushNotification requires a non-empty string "title"')
  }
  if (typeof body !== 'string' || !body.trim()) {
    throw new Error('sendPushNotification requires a non-empty string "body"')
  }

  const message = {
    tokens,
    notification: { title, body },
    data: Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {}),
  }

  const response = await admin.messaging().sendMulticast(message)
  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    responses: response.responses.map(r => ({
      success: r.success,
      error: r.error ? r.error.message : null,
    })),
  }
}

async function sendSMSNotification({ to, body, from = process.env.TWILIO_PHONE_NUMBER }) {
  if (typeof to !== 'string' || !to.trim()) {
    throw new Error('sendSMSNotification requires a non-empty string "to"')
  }
  if (typeof body !== 'string' || !body.trim()) {
    throw new Error('sendSMSNotification requires a non-empty string "body"')
  }
  const message = await twilioClient.messages.create({ to, from, body })
  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
    body: message.body,
  }
}

module.exports = {
  sendPushNotification,
  sendSMSNotification,
}