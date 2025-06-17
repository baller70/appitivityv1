// Lightweight fetch-based API helper providing axios-like interface
// This avoids adding heavy axios dependency and matches older code that expected `api.post(...)` etc.

class LightweightApi {
  private baseUrl: string

  constructor() {
    if (typeof window !== 'undefined') {
      this.baseUrl = '' // Relative paths in browser
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  }

  private buildUrl(endpoint: string) {
    // Ensure we always hit the Next.js API routes under /api when caller omits it
    if (!endpoint.startsWith('/api')) {
      return `${this.baseUrl}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
    }
    return `${this.baseUrl}${endpoint}`
  }

  private async _request<T = any>(method: string, endpoint: string, body?: unknown, init?: RequestInit) {
    const url = this.buildUrl(endpoint)
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...init
    })

    const contentType = response.headers.get('content-type') || ''
    let data: any = null
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const error = new Error((data && data.error) || response.statusText)
      // @ts-ignore augment
      error.response = { status: response.status, data }
      throw error
    }

    return { status: response.status, data } as { status: number; data: T }
  }

  get<T = any>(endpoint: string, init?: RequestInit) {
    return this._request<T>('GET', endpoint, undefined, init)
  }

  post<T = any>(endpoint: string, body?: unknown, init?: RequestInit) {
    return this._request<T>('POST', endpoint, body, init)
  }

  put<T = any>(endpoint: string, body?: unknown, init?: RequestInit) {
    return this._request<T>('PUT', endpoint, body, init)
  }

  delete<T = any>(endpoint: string, body?: unknown, init?: RequestInit) {
    return this._request<T>('DELETE', endpoint, body, init)
  }
}

export const api = new LightweightApi() 