/**
 * Cloudflare Worker that runs in front of our static assets to make the
 * website easier to consume for AI agents. It serves the Markdown version of
 * our documentation pages via content negotiation, provides an MCP server,
 * and adds discovery headers to our HTML pages.
 *
 * https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
 */
import { DOCS_PATH_REGEX } from './docs';
import { setHeader, withHeaders } from './headers';
import { prefersMarkdown, serveMarkdown } from './markdown';
import { handleMcpRequest } from './mcp';

// Discovery links of the homepage for AI agents (RFC 8288). The first two
// mirror the `/` rule of our `_headers` file, which is documented to apply
// to static asset responses but not to responses of Worker code. Setting
// them here as well guarantees them in both cases, as duplicate values are
// skipped when the headers are merged.
const HOMEPAGE_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</llms.txt>; rel="service-doc"; type="text/markdown"',
  '</llms.txt>; rel="alternate"; type="text/markdown"',
];

export interface Env {
  ASSETS: { fetch: typeof fetch };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve MCP server with tools to search and read our documentation
    if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
      return handleMcpRequest(request, env);
    }

    // Serve our llms.txt file as the Markdown version of the homepage to
    // negotiating agents, and add discovery links to the HTML homepage
    if (url.pathname === '/') {
      if (prefersMarkdown(request)) {
        const markdownResponse = await serveMarkdown(env, request, '/llms.txt');
        if (markdownResponse) {
          return markdownResponse;
        }
      }
      const response = withHeaders(await env.ASSETS.fetch(request), {
        Vary: 'Accept',
      });
      for (const link of HOMEPAGE_LINKS) {
        setHeader(response.headers, 'Link', link);
      }
      return response;
    }

    // Serve API catalog with its official media type (RFC 9727)
    if (url.pathname === '/.well-known/api-catalog') {
      const response = await env.ASSETS.fetch(
        new URL('/.well-known/api-catalog.json', request.url).href,
        { method: request.method, headers: request.headers }
      );
      if (response.ok) {
        return withHeaders(response, {
          'Content-Type': 'application/linkset+json',
          // Required for HEAD requests by RFC 9727
          Link: '</.well-known/api-catalog>; rel="api-catalog"',
        });
      }
      return response;
    }

    // Detect requests to documentation pages and their Markdown version
    const docsMatch = DOCS_PATH_REGEX.exec(url.pathname);
    if (docsMatch) {
      const markdownPath = `/${docsMatch[1]}/${docsMatch[2]}.md`;
      const isMarkdownRequest = Boolean(docsMatch[3]);

      // Redirect lenient Markdown URLs (e.g. with a "/.md" suffix or a
      // trailing slash) to their canonical ".md" URL
      if (isMarkdownRequest && url.pathname !== markdownPath) {
        return Response.redirect(new URL(markdownPath, request.url).href, 301);
      }

      // Serve Markdown to Markdown file requests and negotiating agents
      if (isMarkdownRequest || prefersMarkdown(request)) {
        const response = await serveMarkdown(env, request, markdownPath);
        if (response) {
          return response;
        }
      }

      // Serve missing Markdown files directly from our static assets
      if (isMarkdownRequest) {
        return env.ASSETS.fetch(request);
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
