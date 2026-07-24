/**
 * Constants of our MCP server that are shared between the Worker runtime and
 * our build scripts (e.g. the generation of the MCP server card). This module
 * is intentionally free of imports so that build scripts can use it without
 * pulling in runtime dependencies.
 */

// Protocol versions supported by our MCP server with the latest one first
export const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26'] as const;
export const LATEST_VERSION = SUPPORTED_VERSIONS[0];

// Public URL and transport type of our MCP server endpoint
export const MCP_URL = 'https://valibot.dev/mcp';
export const TRANSPORT_TYPE = 'streamable-http';

// Capabilities of our MCP server
export const CAPABILITIES = { tools: { listChanged: false } } as const;

// Info about our MCP server shared with clients and our MCP server card
export const SERVER_INFO = {
  name: 'valibot-docs',
  title: 'Valibot Documentation',
  version: '1.0.0',
} as const;

// Instructions to help clients use our MCP server effectively
export const INSTRUCTIONS =
  'Valibot is the modular and type-safe TypeScript schema library for validating structural data. Its API is divided between schemas (data types like `string` and `object`), methods (operate on schemas like `parse` and `pipe`) and actions (validations and transformations like `email` and `minLength` that are used inside pipe). Import everything with `import * as v from \'valibot\'` and infer the TypeScript type of a schema with `v.InferInput<typeof MySchema>` and `v.InferOutput<typeof MySchema>`. Do not confuse Valibot with Zod: Valibot uses functions and pipelines instead of chained methods. Use `search_docs` to find relevant pages, `get_doc` to read a page and `list_docs` for a complete overview. For migration from Zod, read the page at path "guides/migrate-from-zod". Blog posts are included as well, but prefer the guides and API reference for how to use the library, as older posts may describe previous versions of the API.';
