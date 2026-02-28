export interface JwtClaims {
  sub: string
  email: string
  username: string
}

interface JwtPayload extends JwtClaims {
  iat: number
  exp: number
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url")
}

function signHs256(value: string, secret: string): string {
  return new Bun.CryptoHasher("sha256", secret).update(value).digest("base64url")
}

export function generateJwt(claims: JwtClaims, secret: string, expiresInSeconds: number): string {
  const nowInSeconds = Math.floor(Date.now() / 1000)

  const payload: JwtPayload = {
    ...claims,
    iat: nowInSeconds,
    exp: nowInSeconds + expiresInSeconds,
  }

  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const unsignedToken = `${header}.${encodedPayload}`
  const signature = signHs256(unsignedToken, secret)

  return `${unsignedToken}.${signature}`
}
