export async function onRequestGet(context: {
  request: Request
  env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }
}): Promise<Response> {
  const url = new URL(context.request.url)
  url.pathname = '/'
  url.search = ''

  return context.env.ASSETS.fetch(new Request(url, context.request))
}
