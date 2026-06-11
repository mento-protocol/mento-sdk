import { createHmac } from 'crypto'
import { generateDataStreamsAuthHeaders } from '../../../../src/services/dataStreams/auth'

const EMPTY_BODY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

describe('generateDataStreamsAuthHeaders', () => {
  it('returns Authorization equal to apiKey', () => {
    const headers = generateDataStreamsAuthHeaders(
      'my-api-key',
      'my-secret',
      'GET',
      'https://api.dataengine.chain.link/api/v1/reports/latest?feedID=0xabc'
    )
    expect(headers['Authorization']).toBe('my-api-key')
  })

  it('returns X-Authorization-Timestamp as a numeric string', () => {
    const before = Date.now()
    const headers = generateDataStreamsAuthHeaders(
      'my-api-key',
      'my-secret',
      'GET',
      'https://api.dataengine.chain.link/api/v1/reports/latest?feedID=0xabc'
    )
    const after = Date.now()
    const ts = parseInt(headers['X-Authorization-Timestamp'], 10)
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
    expect(headers['X-Authorization-Timestamp']).toMatch(/^\d+$/)
  })

  it('returns X-Authorization-Signature-SHA256 as a 64-char hex string', () => {
    const headers = generateDataStreamsAuthHeaders(
      'my-api-key',
      'my-secret',
      'GET',
      'https://api.dataengine.chain.link/api/v1/reports/latest?feedID=0xabc'
    )
    expect(headers['X-Authorization-Signature-SHA256']).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces the correct HMAC for a known test vector', () => {
    const apiKey = 'test-key'
    const userSecret = 'test-secret'
    const method = 'GET'
    const fullUrl = 'https://api.dataengine.chain.link/api/v1/reports/latest?feedID=0xabc'
    const fixedTimestamp = 1700000000000

    jest.spyOn(Date, 'now').mockReturnValueOnce(fixedTimestamp)

    const headers = generateDataStreamsAuthHeaders(apiKey, userSecret, method, fullUrl)

    const pathWithQuery = '/api/v1/reports/latest?feedID=0xabc'
    const stringToSign = `${method} ${pathWithQuery} ${EMPTY_BODY_HASH} ${apiKey} ${fixedTimestamp}`
    const expectedHmac = createHmac('sha256', userSecret).update(stringToSign).digest('hex')

    expect(headers['X-Authorization-Signature-SHA256']).toBe(expectedHmac)
    expect(expectedHmac).toBe('a10394e26b58d2ca51ccea4ea53cb9a7052794266c357f5f57874cd3407234c5')

    jest.restoreAllMocks()
  })
})
