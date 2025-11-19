// Simple TOTP implementation without external dependencies
// Based on RFC 6238 (TOTP) and RFC 4226 (HOTP)

function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  
  for (const char of base32.replace(/=/g, '')) {
    const val = alphabet.indexOf(char.toUpperCase());
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  
  return bytes;
}

async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  // Create new ArrayBuffers to satisfy Deno's strict typing
  const keyBuffer = new ArrayBuffer(key.byteLength);
  new Uint8Array(keyBuffer).set(key);
  
  const msgBuffer = new ArrayBuffer(message.byteLength);
  new Uint8Array(msgBuffer).set(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  return new Uint8Array(signature);
}

function dynamicTruncate(hmac: Uint8Array): number {
  const offset = hmac[hmac.length - 1] & 0xf;
  return (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  );
}

export async function generateTOTP(secret: string, window = 0): Promise<string> {
  const epoch = Math.floor(Date.now() / 1000);
  let time = Math.floor(epoch / 30) + window;
  
  const timeBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    timeBytes[i] = time & 0xff;
    time >>= 8;
  }
  
  const secretBytes = base32Decode(secret);
  const hmac = await hmacSha1(secretBytes, timeBytes);
  const code = dynamicTruncate(hmac) % 1000000;
  
  return code.toString().padStart(6, '0');
}

export async function verifyTOTP(secret: string, token: string, window = 1): Promise<boolean> {
  // Check current time window and adjacent windows
  for (let i = -window; i <= window; i++) {
    const expectedToken = await generateTOTP(secret, i);
    if (expectedToken === token) {
      return true;
    }
  }
  return false;
}
