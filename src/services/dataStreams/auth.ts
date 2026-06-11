import { createHash, createHmac } from 'crypto'

const EMPTY_BODY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

export function generateDataStreamsAuthHeaders(
  apiKey: string,
  userSecret: string,
  method: string,
  fullUrl: string,
  body?: string
): Record<string, string> {
  const timestamp = Date.now()
  const url = new URL(fullUrl)
  const pathWithQuery = url.pathname + url.search

  const bodyHash = body !== undefined ? createHash('sha256').update(body).digest('hex') : EMPTY_BODY_HASH

  const stringToSign = `${method} ${pathWithQuery} ${bodyHash} ${apiKey} ${timestamp}`
  const hmacHex = createHmac('sha256', userSecret).update(stringToSign).digest('hex')

  return {
    Authorization: apiKey,
    'X-Authorization-Timestamp': timestamp.toString(),
    'X-Authorization-Signature-SHA256': hmacHex,
  }
}
