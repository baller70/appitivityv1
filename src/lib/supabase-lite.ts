// Lightweight Supabase client that avoids importing @supabase/supabase-js
// This prevents the heavy realtime-js dependency from being included

class SupabaseLiteClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1'
    this.headers = {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }

  // Add method to bypass RLS for service role operations
  private getHeadersWithRLSBypass() {
    return {
      ...this.headers,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Role': 'service_role'
    }
  }

  // Direct method for single row selection
  async single(table: string, filters: { [key: string]: any; select?: string }) {
    const { select = '*', ...filterParams } = filters
    const filterString = Object.entries(filterParams)
      .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
      .join('&')
    
    const url = `${this.baseUrl}/${table}?${filterString}&select=${select}`
    
    const response = await fetch(url, {
      headers: this.getHeadersWithRLSBypass()
    })

    if (!response.ok) {
      let errorMessage = 'Unknown error'
      try {
        const errorText = await response.text()
        console.error('Supabase SELECT error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        })
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.detail || errorText
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      return { data: null, error: new Error(errorMessage) }
    }

    const data = await response.json()
    if (!data || data.length === 0) {
      return { data: null, error: new Error('No rows returned') }
    }
    return { data: data[0], error: null }
  }

  // Direct method for multiple row selection
  async select(table: string, filters: { [key: string]: any; select?: string }) {
    const { select = '*', ...filterParams } = filters
    const filterString = Object.entries(filterParams)
      .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
      .join('&')
    
    const url = `${this.baseUrl}/${table}?${filterString}&select=${select}`
    
    const response = await fetch(url, {
      headers: this.getHeadersWithRLSBypass()
    })

    if (!response.ok) {
      let errorMessage = 'Unknown error'
      try {
        const errorText = await response.text()
        console.error('Supabase SELECT error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        })
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.detail || errorText
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      return { data: null, error: new Error(errorMessage) }
    }

    const data = await response.json()
    return { data: data || [], error: null }
  }

  // Direct method for inserting data
  async insert(table: string, data: any) {
    const url = `${this.baseUrl}/${table}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeadersWithRLSBypass(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Supabase INSERT error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url
        })
        return { data: null, error: new Error(`${response.status}: ${errorText}`) }
      }

      const result = await response.json()
      return { data: result, error: null }
    } catch (error) {
      console.error('Insert error:', error)
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  // Execute raw SQL using Supabase's RPC function
  async executeRawSQL(sql: string) {
    const url = `${this.baseUrl}/rpc/execute_sql`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeadersWithRLSBypass(),
        body: JSON.stringify({ sql })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Supabase SQL execution error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
          sql: sql.substring(0, 200) + '...'
        })
        return { data: null, error: new Error(`${response.status}: ${errorText}`) }
      }

      const result = await response.json()
      return { data: result, error: null }
    } catch (error) {
      console.error('SQL execution error:', error)
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  from(table: string) {
    const baseUrl = `${this.baseUrl}/${table}`
    
    return {
      select: (columns: string = '*') => {
        const queryBuilder = {
          _filters: [] as string[],
          _url: baseUrl,
          _columns: columns,
          _headers: this.headers,
          
          eq: function(column: string, value: any) {
            this._filters.push(`${column}=eq.${encodeURIComponent(value)}`)
            return this
          },
          
          single: async function() {
            const filterString = this._filters.length > 0 ? '?' + this._filters.join('&') + `&select=${this._columns}` : `?select=${this._columns}`
            const url = `${this._url}${filterString}`
            
            const response = await fetch(url, {
              headers: this._headers
            })

            if (!response.ok) {
              let errorMessage = 'Unknown error'
              try {
                const errorText = await response.text()
                console.error('Supabase SELECT error:', {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  url: url
                })
                
                // Try to parse as JSON first
                try {
                  const errorJson = JSON.parse(errorText)
                  errorMessage = errorJson.message || errorJson.detail || errorText
                } catch {
                  errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
                }
              } catch (parseError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`
              }
              
              return { data: null, error: new Error(errorMessage) }
            }

            const data = await response.json()
            if (!data || data.length === 0) {
              return { data: null, error: new Error('No rows returned') }
            }
            return { data: data[0], error: null }
          },
          
          maybeSingle: async function() {
            const filterString = this._filters.length > 0 ? '?' + this._filters.join('&') + `&select=${this._columns}` : `?select=${this._columns}`
            const url = `${this._url}${filterString}`
            
            const response = await fetch(url, {
              headers: this._headers
            })

            if (!response.ok) {
              let errorMessage = 'Unknown error'
              try {
                const errorText = await response.text()
                console.error('Supabase SELECT error:', {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  url: url
                })
                
                try {
                  const errorJson = JSON.parse(errorText)
                  errorMessage = errorJson.message || errorJson.detail || errorText
                } catch {
                  errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
                }
              } catch (parseError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`
              }
              
              return { data: null, error: new Error(errorMessage) }
            }

            const data = await response.json()
            return { data: data[0] || null, error: null }
          }
        }
        
        return queryBuilder
      },
      
      insert: (data: any) => ({
        select: (columns: string = '*') => ({
          single: async () => {
            console.log('🔄 Inserting into', table, 'with data:', JSON.stringify(data, null, 2))
            
            const response = await fetch(baseUrl, {
              method: 'POST',
              headers: this.getHeadersWithRLSBypass(), // Use RLS bypass headers
              body: JSON.stringify(data)
            })

            if (!response.ok) {
              let errorMessage = 'Unknown error'
              let errorDetails = null
              
              try {
                const errorText = await response.text()
                console.error('❌ Supabase INSERT error:', {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  headers: Object.fromEntries(response.headers.entries()),
                  insertData: data,
                  table: table
                })
                
                // Try to parse as JSON first
                try {
                  const errorJson = JSON.parse(errorText)
                  errorMessage = errorJson.message || errorJson.detail || errorText
                  errorDetails = errorJson
                } catch {
                  errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
                }
              } catch (parseError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`
              }
              
              // Create a more informative error
              const error = new Error(errorMessage)
              ;(error as any).details = errorDetails
              ;(error as any).status = response.status
              ;(error as any).statusText = response.statusText
              
              return { data: null, error }
            }

            const result = await response.json()
            console.log('✅ Successfully inserted into', table, ':', result)
            return { data: result[0] || null, error: null }
          }
        })
      }),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns: string = '*') => ({
            single: async () => {
              const url = `${baseUrl}?${column}=eq.${encodeURIComponent(value)}&select=${columns}`
              const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeadersWithRLSBypass(),
                body: JSON.stringify(data)
              })

              if (!response.ok) {
                let errorMessage = 'Unknown error'
                try {
                  const errorText = await response.text()
                  console.error('Supabase UPDATE error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                    url: url
                  })
                  
                  try {
                    const errorJson = JSON.parse(errorText)
                    errorMessage = errorJson.message || errorJson.detail || errorText
                  } catch {
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
                  }
                } catch (parseError) {
                  errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                
                return { data: null, error: new Error(errorMessage) }
              }

              const result = await response.json()
              return { data: result[0] || null, error: null }
            }
          })
        })
      })
    }
  }
}

export const supabaseAdminLite = new SupabaseLiteClient()