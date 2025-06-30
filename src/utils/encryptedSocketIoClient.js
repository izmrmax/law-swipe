import { io } from 'socket.io-client';

class EncryptedSocketIoClient {
  constructor() {
    this.socket = null;
    this.key = null;
    this.onMessage = null;
    this.onError = null;
  }

  async deriveKey(token) {
    const encoder = new TextEncoder();
    const tokenData = encoder.encode(token);
    const hash = await crypto.subtle.digest("SHA-256", tokenData);
    return crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async init(socketUrl, token, { onMessage, onError } = {}) {
    if (!socketUrl || !token) {
      throw new Error("socketUrl and token are required for init().");
    }
    this.onMessage = onMessage;
    this.onError = onError;
    this.key = await this.deriveKey(token);
    this.socket = io(socketUrl, { auth: { token } });
    this.socket.on("message", async (packet) => {
      try {
        const { from, data } = packet;
        if (!data) {
          throw new Error("Missing data in incoming packet.");
        }
        const buffer = base64ToArrayBuffer(data);
        const iv = buffer.slice(0, 12);
        const ciphertext = buffer.slice(12);
        const plainBuffer = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: new Uint8Array(iv) },
          this.key,
          ciphertext
        );
        const decoder = new TextDecoder();
        const text = decoder.decode(plainBuffer);
        if (!text) {
          throw new Error("Decryption returned empty string.");
        }
        const payload = JSON.parse(text);
        if (this.onMessage) {
          this.onMessage({ from, payload });
        }
      } catch (err) {
        if (this.onError) {
          this.onError(err);
        } else {
          console.error("Failed to decrypt or parse incoming message:", err);
        }
      }
    });
  }

  async sendMessage(to, payload) {
    if (!this.socket) {
      throw new Error("Socket not initialized. Call init() first.");
    }
    try {
      const text = JSON.stringify(payload);
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        this.key,
        data
      );
      const combined = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherBuffer), iv.byteLength);
      const base64Data = arrayBufferToBase64(combined.buffer);
      this.socket.emit("message", { to, data: base64Data });
    } catch (err) {
      if (this.onError) {
        this.onError(err);
      } else {
        throw err;
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.key = null;
      this.onMessage = null;
      this.onError = null;
    }
  }
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export default new EncryptedSocketIoClient();