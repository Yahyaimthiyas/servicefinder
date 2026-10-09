// Mock implementation of next/server for standalone Express backend usage.
export class NextResponse extends Response {
  static json(data, init = {}) {
    const bodyStr = JSON.stringify(data)
    const response = new Response(bodyStr, {
      status: init.status || 200,
      headers: {
        "content-type": "application/json",
        ...(init.headers || {})
      }
    })
    
    // Provide programmatic access to the body data inside Express adapter
    response.jsonData = data
    return response
  }
}
