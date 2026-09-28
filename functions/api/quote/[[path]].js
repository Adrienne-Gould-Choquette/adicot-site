// Forwards /api/quote/* to the Flask quote API, so the form posts same-origin.
export function onRequest({ request, env }) {
  const url = new URL(request.url);
  // A Request built from the new URL keeps method, headers and body; the
  // upstream Host comes from that URL, not from the incoming request.
  return fetch(new Request(env.QUOTE_API_ORIGIN + url.pathname + url.search, request));
}
