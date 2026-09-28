// Forwards every /api/* request to the Flask app, so the forms post same-origin.
export function onRequest({ request, env }) {
  const url = new URL(request.url);
  // A Request built from the new URL keeps method, headers and body, and unlike
  // the incoming one its headers are mutable. The upstream Host comes from the URL.
  const req = new Request(env.API_ORIGIN + url.pathname + url.search, request);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) req.headers.set('X-Adicot-Client-IP', ip);
  req.headers.set('X-Proxy-Token', env.PROXY_TOKEN);
  return fetch(req);
}
