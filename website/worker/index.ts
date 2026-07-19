/**
 * Cloudflare Worker that runs in front of our static assets to make the
 * website easier to consume for AI agents. It serves the Markdown version of
 * our documentation pages via content negotiation and adds discovery headers
 * to our HTML pages.
 *
 * https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
 */

interface Env {
  ASSETS: { fetch: typeof fetch };
}

// Path of documentation pages with an available Markdown version
const DOCS_PATH_REGEX = /^\/(guides|api)\/([\w.-]+?)\/?$/;

// Path of the Markdown version of documentation pages. Also matches the
// naive "/.md" suffix that agents produce by appending ".md" to a page URL
// that ends with a trailing slash.
const MD_FILE_REGEX = /^\/(guides|api)\/([\w.-]+?)(?:\.md|\/\.md)$/;

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
function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get('Accept');
  if (!accept) {
    return false;
  }
  const quality = getQuality(accept, 'text/markdown');
  return quality > 0 && quality >= getQuality(accept, 'text/html');
}

/**
 * Fetches a static asset with the method and headers of the given request.
 *
 * @param env The environment of the Worker.
 * @param request The incoming request.
 * @param path The path of the static asset.
 *
 * @returns The response of the static asset.
 */
function fetchAsset(
  env: Env,
  request: Request,
  path: string
): Promise<Response> {
  return env.ASSETS.fetch(new URL(path, request.url).href, {
    method: request.method,
    headers: request.headers,
  });
}

/**
 * Copies a response and adds the given headers to it.
 *
 * @param response The response to copy.
 * @param headers The headers to add.
 *
 * @returns The new response.
 */
function withHeaders(
  response: Response,
  headers: Record<string, string>
): Response {
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) {
    newResponse.headers.set(key, value);
  }
  return newResponse;
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
async function serveMarkdown(
  env: Env,
  request: Request,
  path: string
): Promise<Response | undefined> {
  // Fetch asset with GET so that the response of HEAD requests contains the
  // body needed to compute our token count estimate
  const response = await env.ASSETS.fetch(new URL(path, request.url).href, {
    headers: request.headers,
  });

  // Pass revalidation responses through with our negotiation headers
  if (response.status === 304) {
    return withHeaders(response, {
      'Content-Location': path,
      Vary: 'Accept',
    });
  }

  if (response.ok) {
    // Copy headers to keep validation and caching headers (e.g. ETag) and
    // remove those that no longer apply to the new response body
    const headers = new Headers(response.headers);
    headers.delete('Content-Encoding');
    headers.delete('Content-Length');
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('Content-Location', path);
    headers.set('Vary', 'Accept');

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve API catalog with its official media type (RFC 9727)
    if (url.pathname === '/.well-known/api-catalog') {
      const response = await fetchAsset(
        env,
        request,
        '/.well-known/api-catalog.json'
      );
      if (response.ok) {
        return withHeaders(response, {
          'Content-Type': 'application/linkset+json',
        });
      }
      return response;
    }

    // Serve Markdown files with appropriate headers for AI agents. Return
    // early on failures to not process the path as a documentation page.
    const mdFileMatch = MD_FILE_REGEX.exec(url.pathname);
    if (mdFileMatch) {
      const response = await serveMarkdown(
        env,
        request,
        `/${mdFileMatch[1]}/${mdFileMatch[2]}.md`
      );
      return response ?? env.ASSETS.fetch(request);
    }

    // Detect requests to documentation pages with a Markdown version
    const docsMatch = DOCS_PATH_REGEX.exec(url.pathname);
    if (docsMatch) {
      const markdownPath = `/${docsMatch[1]}/${docsMatch[2]}.md`;

      // Serve its Markdown version if the request prefers it
      if (prefersMarkdown(request)) {
        const response = await serveMarkdown(env, request, markdownPath);
        if (response) {
          return response;
        }
      }

      // Otherwise, serve HTML page with a link to its Markdown version
      const response = await env.ASSETS.fetch(request);
      return withHeaders(response, {
        Link: `<${markdownPath}>; rel="alternate"; type="text/markdown"`,
        Vary: 'Accept',
      });
    }

    // Serve all other requests directly from our static assets
    return env.ASSETS.fetch(request);
  },
};
