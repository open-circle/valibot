/**
 * Content negotiation and serving of the Markdown version of our
 * documentation pages.
 */
import { setHeader, withHeaders } from './headers';
import type { Env } from './index';

/**
 * Returns the quality value of a media type within an `Accept` header.
 *
 * @param accept The value of the `Accept` header.
 * @param mediaType The media type to look for.
 *
 * @returns The quality value of the media type.
 */
function getQuality(accept: string, mediaType: string): number {
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().split(';');
    if (type.trim().toLowerCase() === mediaType) {
      for (const param of params) {
        const [key, value] = param.trim().split('=');
        if (key === 'q') {
          return parseFloat(value) || 0;
        }
      }
      return 1;
    }
  }
  return 0;
}

/**
 * Checks whether a request prefers Markdown over HTML based on its `Accept`
 * header.
 *
 * @param request The request to check.
 *
 * @returns Whether the request prefers Markdown.
 */
export function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get('Accept');
  if (!accept) {
    return false;
  }
  const quality = getQuality(accept, 'text/markdown');
  return quality > 0 && quality >= getQuality(accept, 'text/html');
}

/**
 * Serves the Markdown version of a documentation page with appropriate
 * headers for AI agents.
 *
 * @param env The environment of the Worker.
 * @param request The incoming request.
 * @param path The path of the Markdown file.
 *
 * @returns The response of the Markdown file.
 */
export async function serveMarkdown(
  env: Env,
  request: Request,
  path: string
): Promise<Response | undefined> {
  // Always fetch the complete asset with GET and without a Range header, as
  // the full body is needed to compute our token count estimate
  const assetHeaders = new Headers(request.headers);
  assetHeaders.delete('Range');
  const response = await env.ASSETS.fetch(new URL(path, request.url).href, {
    headers: assetHeaders,
    redirect: 'manual',
  });

  // Pass revalidation responses through with our negotiation headers. This
  // check must come first as 304 is also matched by the redirect range.
  if (response.status === 304) {
    return withHeaders(response, {
      'Content-Location': path,
      Vary: 'Accept',
    });
  }

  // Pass redirects (e.g. from our `_redirects` file) through to the client
  // so that it can request the Markdown file at its new location. As the
  // redirect target depends on the `Accept` header, caches must vary on it.
  if (response.status >= 300 && response.status < 400) {
    return withHeaders(response, { Vary: 'Accept' });
  }

  if (response.ok) {
    // Copy headers to keep validation and caching headers (e.g. ETag) and
    // remove those that no longer apply to the new response body
    const headers = new Headers(response.headers);
    headers.delete('Content-Encoding');
    headers.delete('Content-Length');
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('Content-Location', path);
    setHeader(headers, 'Vary', 'Accept');

    // Add rough estimate of the token count of the Markdown content
    const markdown = await response.text();
    headers.set('X-Markdown-Tokens', `${Math.ceil(markdown.length / 4)}`);

    // Return response without body for HEAD requests
    if (request.method === 'HEAD') {
      return new Response(null, { headers });
    }
    return new Response(markdown, { headers });
  }
}
