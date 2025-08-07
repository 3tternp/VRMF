import { secret } from "encore.dev/config";

const mfaSecret = secret("MfaSecret");

export function generateMfaSecret(): string {
  // Generate a random 32-character base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function generateQrCodeUrl(email: string, secret: string): string {
  const issuer = 'RiskGuard';
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
  });
  
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export async function verifyMfaCode(secret: string, code: string): Promise<boolean> {
  // Simple TOTP verification (in production, use a proper TOTP library)
  const crypto = await import('crypto');
  const time = Math.floor(Date.now() / 30000); // 30-second window
  
  // Check current time window and previous/next windows for clock drift
  for (let i = -1; i <= 1; i++) {
    const timeCounter = time + i;
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base32'));
    hmac.update(Buffer.from(timeCounter.toString(16).padStart(16, '0'), 'hex'));
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0xf;
    const truncated = ((hash[offset] & 0x7f) << 24) |
                     ((hash[offset + 1] & 0xff) << 16) |
                     ((hash[offset + 2] & 0xff) << 8) |
                     (hash[offset + 3] & 0xff);
    
    const otp = (truncated % 1000000).toString().padStart(6, '0');
    
    if (otp === code) {
      return true;
    }
  }
  
  return false;
}
