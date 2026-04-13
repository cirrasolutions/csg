import crypto from 'crypto'

interface NetSuiteConfig {
  accountId: string
  consumerKey: string
  consumerSecret: string
  tokenId: string
  tokenSecret: string
  baseUrl?: string
}

interface OAuthHeader {
  oauth_consumer_key: string
  oauth_nonce: string
  oauth_signature_method: string
  oauth_timestamp: string
  oauth_token: string
  oauth_version: string
  oauth_signature?: string
}

export class NetSuiteClient {
  private config: NetSuiteConfig
  private baseUrl: string

  constructor(config: NetSuiteConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 
      `https://${config.accountId.toLowerCase().replace('_', '-')}.suitetalk.api.netsuite.com`
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  private generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
  }

  private generateSignature(
    method: string,
    url: string,
    oauthParams: OAuthHeader
  ): string {
    const params = Object.entries(oauthParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')

    const baseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(params),
    ].join('&')

    const signingKey = [
      encodeURIComponent(this.config.consumerSecret),
      encodeURIComponent(this.config.tokenSecret),
    ].join('&')

    return crypto
      .createHmac('sha256', signingKey)
      .update(baseString)
      .digest('base64')
  }

  private generateAuthHeader(method: string, url: string): string {
    const oauthParams: OAuthHeader = {
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: this.generateTimestamp(),
      oauth_token: this.config.tokenId,
      oauth_version: '1.0',
    }

    oauthParams.oauth_signature = this.generateSignature(method, url, oauthParams)

    const authHeader = Object.entries(oauthParams)
      .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
      .join(', ')

    return `OAuth realm="${this.config.accountId}", ${authHeader}`
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ data?: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': this.generateAuthHeader(method, url),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: `NetSuite API Error: ${response.status} - ${errorText}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: `NetSuite Request Failed: ${(error as Error).message}` }
    }
  }

  // Record operations
  async getRecord(recordType: string, id: string) {
    return this.request('GET', `/services/rest/record/v1/${recordType}/${id}`)
  }

  async createRecord(recordType: string, data: Record<string, unknown>) {
    return this.request('POST', `/services/rest/record/v1/${recordType}`, data)
  }

  async updateRecord(recordType: string, id: string, data: Record<string, unknown>) {
    return this.request('PATCH', `/services/rest/record/v1/${recordType}/${id}`, data)
  }

  async deleteRecord(recordType: string, id: string) {
    return this.request('DELETE', `/services/rest/record/v1/${recordType}/${id}`)
  }

  async searchRecords(recordType: string, query: string) {
    return this.request('GET', `/services/rest/record/v1/${recordType}?q=${encodeURIComponent(query)}`)
  }
}

// Singleton instance
let netsuiteClient: NetSuiteClient | null = null

export function getNetSuiteClient(): NetSuiteClient {
  if (!netsuiteClient) {
    const config: NetSuiteConfig = {
      accountId: process.env.NETSUITE_ACCOUNT_ID || '',
      consumerKey: process.env.NETSUITE_CONSUMER_KEY || '',
      consumerSecret: process.env.NETSUITE_CONSUMER_SECRET || '',
      tokenId: process.env.NETSUITE_TOKEN_ID || '',
      tokenSecret: process.env.NETSUITE_TOKEN_SECRET || '',
    }

    if (!config.accountId || !config.consumerKey) {
      throw new Error('NetSuite configuration is incomplete. Please set all required environment variables.')
    }

    netsuiteClient = new NetSuiteClient(config)
  }

  return netsuiteClient
}
