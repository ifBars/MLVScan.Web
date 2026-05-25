export async function onRequest(context: {
  request: Request
  env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }
}): Promise<Response> {
  const assetResponse = await context.env.ASSETS.fetch(context.request)
  if (assetResponse.status !== 404 || !acceptsHtml(context.request)) {
    return assetResponse
  }

  const url = new URL(context.request.url)
  url.pathname = '/'
  url.search = ''

  return context.env.ASSETS.fetch(new Request(url, context.request))
}

function acceptsHtml(request: Request): boolean {
  return request.headers.get('Accept')?.includes('text/html') ?? false
}
