import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST TAG CREATION ENDPOINT ===')
    
    // Log all headers
    console.log('Headers:')
    for (const [key, value] of request.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    // Log request body
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Log request method and URL
    console.log('Method:', request.method)
    console.log('URL:', request.url)
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint received data successfully',
      receivedData: body
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 