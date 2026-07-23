/**
 * Stateless MCP server (Model Context Protocol) that provides tools to
 * search and read our documentation. Implements the Streamable HTTP
 * transport with plain JSON responses and validates all tool inputs with
 * Valibot itself.
 *
 * https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
 */
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';
import { DOC_AREAS, type DocArea, getDocUrls, type SearchEntry } from './docs';
import type { Env } from './index';
import {
  CAPABILITIES,
  INSTRUCTIONS,
  LATEST_VERSION,
  SERVER_INFO,
  SUPPORTED_VERSIONS,
} from './mcp-info';

// Valibot schemas of the arguments of our tools
const SearchDocsSchema = v.object({
  query: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(200)),
  area: v.optional(v.picklist(DOC_AREAS)),
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(20)),
    5
  ),
});
const GetDocSchema = v.object({
  path: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(200)),
});
const ListDocsSchema = v.object({
  area: v.optional(v.picklist(DOC_AREAS)),
});

/**
 * Converts a Valibot schema to a JSON Schema without the `$schema` key, as
 * some MCP clients are strict about the schema format of tool inputs.
 *
 * @param schema The Valibot schema to convert.
 *
 * @returns A JSON Schema object.
 */
function toInputSchema(schema: v.GenericSchema): Record<string, unknown> {
  // Ignore the `trim` transformation as it cannot be converted to JSON
  // Schema but still runs when the arguments are validated with Valibot.
  // Warn instead of throwing for other unconvertible actions so that a
  // future addition cannot crash the entire Worker at module load.
  const jsonSchema: Record<string, unknown> = {
    ...toJsonSchema(schema, { errorMode: 'warn', ignoreActions: ['trim'] }),
  };
  delete jsonSchema.$schema;
  return jsonSchema;
}

// Definitions of our tools with input schemas derived from Valibot schemas
const TOOL_DEFINITIONS = [
  {
    name: 'search_docs',
    title: 'Search documentation',
    description:
      'Searches the Valibot documentation (guides and API reference) and returns the most relevant pages with links to their Markdown version. Best for finding the right schema, method or action by name or topic.',
    inputSchema: toInputSchema(SearchDocsSchema),
  },
  {
    name: 'get_doc',
    title: 'Read documentation page',
    description:
      'Reads a documentation page and returns its full content as Markdown. Accepts paths like "api/string" and "guides/quick-start" or a bare API name like "minLength".',
    inputSchema: toInputSchema(GetDocSchema),
  },
  {
    name: 'list_docs',
    title: 'List documentation pages',
    description:
      'Lists all documentation pages grouped by area and category. Useful to get an overview of the available guides and API reference pages.',
    inputSchema: toInputSchema(ListDocsSchema),
  },
];

/**
 * A search entry with precomputed lowercase fields to avoid re-computing
 * them on every search.
 */
interface IndexedEntry extends SearchEntry {
  lower: {
    name: string;
    title: string;
    description: string;
    excerpt: string;
    headings: string[];
  };
}

// Cache search index in isolate memory to only fetch it once
let searchIndexPromise: Promise<IndexedEntry[]> | undefined;

/**
 * Returns the search index of our documentation pages.
 *
 * @param env The environment of the Worker.
 * @param requestUrl The URL of the incoming request.
 *
 * @returns The search index.
 */
function getSearchIndex(env: Env, requestUrl: string): Promise<IndexedEntry[]> {
  if (!searchIndexPromise) {
    searchIndexPromise = (async () => {
      const response = await env.ASSETS.fetch(
        new URL('/search-index.json', requestUrl).href
      );
      if (!response.ok) {
        throw new Error('Search index is not available');
      }
      const entries = (await response.json()) as SearchEntry[];
      return entries.map((entry) => ({
        ...entry,
        lower: {
          name: entry.name.toLowerCase(),
          title: entry.title.toLowerCase(),
          description: entry.description.toLowerCase(),
          excerpt: entry.excerpt.toLowerCase(),
          headings: entry.headings.map((heading) => heading.toLowerCase()),
        },
      }));
    })().catch((error) => {
      // Reset cache so that the next request can retry
      searchIndexPromise = undefined;
      throw error;
    });
  }
  return searchIndexPromise;
}

/**
 * Searches the documentation pages for the given query.
 *
 * @param index The search index.
 * @param input The validated tool input.
 *
 * @returns The scored search results.
 */
function searchDocs(
  index: IndexedEntry[],
  input: v.InferOutput<typeof SearchDocsSchema>
): { entry: IndexedEntry; score: number }[] {
  // Split query into lowercase search terms and strip the `v.` namespace
  // prefix so that queries like "v.string" match the API name "string"
  const terms = input.query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/^v\./, ''))
    .filter(Boolean);

  // Score every entry of the selected area against the search terms
  const results: { entry: IndexedEntry; score: number }[] = [];
  for (const entry of index) {
    if (input.area && entry.area !== input.area) {
      continue;
    }
    const { name, title, description, excerpt, headings } = entry.lower;
    let score = 0;
    for (const term of terms) {
      if (name === term) {
        score += 100;
      } else if (name.startsWith(term)) {
        score += 40;
      } else if (name.includes(term)) {
        score += 25;
      }
      if (title === term) {
        score += 50;
      } else if (title.includes(term)) {
        score += 20;
      }
      if (headings.some((heading) => heading.includes(term))) {
        score += 10;
      }
      // Only score one of both as the excerpt often repeats the description
      if (description.includes(term)) {
        score += 5;
      } else if (excerpt.includes(term)) {
        score += 3;
      }
    }
    if (score > 0) {
      results.push({ entry, score });
    }
  }

  // Sort results by score and limit them to the requested amount
  return results
    .sort(
      (result1, result2) =>
        result2.score - result1.score ||
        result1.entry.name.localeCompare(result2.entry.name)
    )
    .slice(0, input.limit);
}

/**
 * The result content of a tool call. Our tools intentionally return text
 * without the optional `structuredContent` field, as the text is what LLM
 * clients consume and a structured duplicate would only bloat the response.
 */
interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

/**
 * Executes the search_docs tool.
 */
async function executeSearchDocs(
  env: Env,
  requestUrl: string,
  input: v.InferOutput<typeof SearchDocsSchema>
): Promise<ToolResult> {
  const index = await getSearchIndex(env, requestUrl);
  const results = searchDocs(index, input);
  if (!results.length) {
    return {
      content: [
        {
          type: 'text',
          text: `No documentation pages found for "${input.query}". Try a different query or use list_docs for a complete overview.`,
        },
      ],
    };
  }
  const origin = new URL(requestUrl).origin;
  return {
    content: [
      {
        type: 'text',
        text: results
          .map(
            ({ entry }, index_) =>
              `${index_ + 1}. ${entry.title} (${entry.area}: ${entry.group})\n   Path: ${entry.area}/${entry.name}\n   ${entry.description}\n   ${getDocUrls(origin, entry.area, entry.name).markdownUrl}`
          )
          .join('\n'),
      },
    ],
  };
}

/**
 * Computes the Levenshtein edit distance between two strings.
 *
 * @param string1 The first string.
 * @param string2 The second string.
 *
 * @returns The edit distance.
 */
function getEditDistance(string1: string, string2: string): number {
  let prevRow = Array.from({ length: string2.length + 1 }, (_, index) => index);
  for (let index1 = 1; index1 <= string1.length; index1++) {
    const nextRow = [index1];
    for (let index2 = 1; index2 <= string2.length; index2++) {
      nextRow.push(
        Math.min(
          prevRow[index2] + 1,
          nextRow[index2 - 1] + 1,
          prevRow[index2 - 1] +
            (string1[index1 - 1] === string2[index2 - 1] ? 0 : 1)
        )
      );
    }
    prevRow = nextRow;
  }
  return prevRow[string2.length];
}

// Regex that matches a documentation page path like "api/string"
const AREA_PATH_REGEX = new RegExp(`^(${DOC_AREAS.join('|')})/([\\w.-]+)$`);

/**
 * Executes the get_doc tool.
 */
async function executeGetDoc(
  env: Env,
  requestUrl: string,
  input: v.InferOutput<typeof GetDocSchema>
): Promise<ToolResult> {
  // Normalize path by removing origin, fragment, query, `.md` extension and
  // extra slashes
  const cleanPath = input.path
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/[#?].*$/, '')
    .replace(/\.md$/, '')
    .replace(/^\/|\/$/g, '');

  // Split path into candidate areas and page name. For bare names, we try
  // the API area first as most bare lookups are API references.
  let areas: DocArea[];
  let pageName: string;
  const areaMatch = AREA_PATH_REGEX.exec(cleanPath);
  if (areaMatch) {
    areas = [areaMatch[1] as DocArea];
    pageName = areaMatch[2];
  } else if (/^[\w.-]+$/.test(cleanPath)) {
    areas = ['api', 'guides'];
    pageName = cleanPath;
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid path "${input.path}". Use a path like "api/string" or "guides/quick-start" or a bare API name like "minLength".`,
        },
      ],
      isError: true,
    };
  }

  // Strip the `v.` namespace prefix so that lookups of API symbols in their
  // documented form (e.g. "v.string") resolve to their page (e.g. "string")
  pageName = pageName.replace(/^v\./i, '');

  // Fetch the Markdown file of each candidate area in parallel and return
  // the content of the first one that exists
  const responses = await Promise.all(
    areas.map((area) =>
      env.ASSETS.fetch(new URL(`/${area}/${pageName}.md`, requestUrl).href)
    )
  );
  for (const response of responses) {
    if (response.ok) {
      return { content: [{ type: 'text', text: await response.text() }] };
    }
  }

  // Otherwise, resolve the name case-insensitively to its canonical page,
  // as the paths of our static assets are case-sensitive
  const index = await getSearchIndex(env, requestUrl);
  const name = pageName.toLowerCase();
  for (const area of areas) {
    const match = index.find(
      (entry) => entry.area === area && entry.lower.name === name
    );
    if (match) {
      const response = await env.ASSETS.fetch(
        new URL(`/${match.area}/${match.name}.md`, requestUrl).href
      );
      if (response.ok) {
        return { content: [{ type: 'text', text: await response.text() }] };
      }
    }
  }

  // Otherwise, suggest the page names closest to the requested name to
  // catch typos anywhere in the name
  const threshold = name.length > 7 ? 3 : 2;
  const suggestions = index
    .filter(
      (entry) => Math.abs(entry.lower.name.length - name.length) <= threshold
    )
    .map((entry) => ({
      entry,
      distance: getEditDistance(name, entry.lower.name),
    }))
    .filter(({ distance }) => distance <= threshold)
    .sort(
      (result1, result2) =>
        result1.distance - result2.distance ||
        result1.entry.name.localeCompare(result2.entry.name)
    )
    .slice(0, 3)
    .map(({ entry }) => `${entry.area}/${entry.name}`)
    .join('", "');
  return {
    content: [
      {
        type: 'text',
        text: `No documentation page found for "${input.path}".${suggestions ? ` Did you mean: "${suggestions}"?` : ' Use search_docs or list_docs to find available pages.'}`,
      },
    ],
    isError: true,
  };
}

/**
 * Executes the list_docs tool.
 */
async function executeListDocs(
  env: Env,
  requestUrl: string,
  input: v.InferOutput<typeof ListDocsSchema>
): Promise<ToolResult> {
  const index = await getSearchIndex(env, requestUrl);
  const entries = input.area
    ? index.filter((entry) => entry.area === input.area)
    : index;

  // Group pages by area and group while keeping their order
  let text = '';
  let prevArea: string | undefined;
  let prevGroup: string | undefined;
  for (const entry of entries) {
    if (entry.area !== prevArea) {
      text += `# ${entry.area === 'guides' ? 'Guides' : 'API reference'}\n\n`;
      prevArea = entry.area;
      prevGroup = undefined;
    }
    if (entry.group !== prevGroup) {
      text += `## ${entry.group}\n\n`;
      prevGroup = entry.group;
    }
    text += `- ${entry.area}/${entry.name} — ${entry.title}\n`;
  }

  return { content: [{ type: 'text', text: text.trim() }] };
}

/**
 * A JSON-RPC request or notification message.
 */
interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

/**
 * Creates a JSON-RPC error object.
 *
 * @param id The ID of the request.
 * @param code The error code.
 * @param message The error message.
 *
 * @returns A JSON-RPC error object.
 */
function createError(id: JsonRpcMessage['id'], code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

/**
 * Processes a single JSON-RPC message and returns its response, or
 * `undefined` for notifications.
 *
 * @param env The environment of the Worker.
 * @param requestUrl The URL of the incoming request.
 * @param message The JSON-RPC message to process.
 *
 * @returns The JSON-RPC response.
 */
async function processMessage(
  env: Env,
  requestUrl: string,
  message: JsonRpcMessage
): Promise<Record<string, unknown> | undefined> {
  // Ignore notifications (messages without an ID field) as this server is
  // stateless and does not need to react to them
  if (!('id' in message)) {
    return undefined;
  }

  // Process initialization handshake
  if (message.method === 'initialize') {
    const requestedVersion = message.params?.protocolVersion;
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion:
          typeof requestedVersion === 'string' &&
          (SUPPORTED_VERSIONS as readonly string[]).includes(requestedVersion)
            ? requestedVersion
            : LATEST_VERSION,
        capabilities: CAPABILITIES,
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      },
    };
  }

  // Process ping requests
  if (message.method === 'ping') {
    return { jsonrpc: '2.0', id: message.id, result: {} };
  }

  // Process tool listing requests
  if (message.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { tools: TOOL_DEFINITIONS },
    };
  }

  // Process tool call requests
  if (message.method === 'tools/call') {
    const toolName = message.params?.name;
    const toolArgs = message.params?.arguments ?? {};

    /**
     * Validates the tool arguments with the given Valibot schema and
     * executes the tool. Execution errors are returned as tool results so
     * that the model can see and react to them.
     */
    const runTool = async <TSchema extends v.GenericSchema>(
      schema: TSchema,
      execute: (input: v.InferOutput<TSchema>) => Promise<ToolResult>
    ): Promise<Record<string, unknown>> => {
      const result = v.safeParse(schema, toolArgs);
      if (!result.success) {
        const issues = v.flatten(result.issues);
        return createError(
          message.id,
          -32602,
          `Invalid arguments for ${toolName}: ${JSON.stringify(issues.nested ?? issues)}`
        );
      }
      try {
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: await execute(result.output),
        };
      } catch (error) {
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            content: [
              {
                type: 'text',
                text: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          },
        };
      }
    };

    if (toolName === 'search_docs') {
      return runTool(SearchDocsSchema, (input) =>
        executeSearchDocs(env, requestUrl, input)
      );
    }
    if (toolName === 'get_doc') {
      return runTool(GetDocSchema, (input) =>
        executeGetDoc(env, requestUrl, input)
      );
    }
    if (toolName === 'list_docs') {
      return runTool(ListDocsSchema, (input) =>
        executeListDocs(env, requestUrl, input)
      );
    }
    return createError(message.id, -32602, `Unknown tool: ${toolName}`);
  }

  // Return error for unknown methods
  return createError(message.id, -32601, `Method not found: ${message.method}`);
}

// CORS headers to support MCP clients running in the browser
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
  'Access-Control-Max-Age': '86400',
};

/**
 * Creates a JSON response with CORS headers.
 *
 * @param body The body to serialize.
 * @param status The status code of the response.
 *
 * @returns A JSON response.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Handles a request to our MCP endpoint.
 *
 * @param request The incoming request.
 * @param env The environment of the Worker.
 *
 * @returns The response of the MCP server.
 */
export async function handleMcpRequest(
  request: Request,
  env: Env
): Promise<Response> {
  // Answer preflight requests of browser-based clients
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Reject any other method than POST as this stateless server does not
  // support server-initiated streams
  if (request.method !== 'POST') {
    const response = jsonResponse(
      createError(null, -32600, 'Method not allowed. Use POST.'),
      405
    );
    response.headers.set('Allow', 'POST, OPTIONS');
    return response;
  }

  // Reject unsupported protocol versions as required by the specification.
  // A missing header is allowed and treated as the oldest supported version.
  const protocolVersion = request.headers.get('MCP-Protocol-Version');
  if (
    protocolVersion &&
    !(SUPPORTED_VERSIONS as readonly string[]).includes(protocolVersion)
  ) {
    return jsonResponse(
      createError(
        null,
        -32600,
        `Unsupported protocol version: ${protocolVersion}`
      ),
      400
    );
  }

  // Parse JSON body of request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(createError(null, -32700, 'Parse error'), 400);
  }

  // Reject empty batches as required by the JSON-RPC specification
  if (Array.isArray(body) && !body.length) {
    return jsonResponse(createError(null, -32600, 'Invalid request'), 400);
  }

  // Process single message or batch of messages
  const messages = Array.isArray(body) ? body : [body];
  const responses: Record<string, unknown>[] = [];
  for (const message of messages) {
    // Validate structure of message including the type of its ID
    const isObject = typeof message === 'object' && message !== null;
    const id =
      isObject && 'id' in message ? (message as JsonRpcMessage).id : undefined;
    const isValidId =
      id === undefined ||
      id === null ||
      typeof id === 'string' ||
      typeof id === 'number';
    if (
      !isObject ||
      !isValidId ||
      (message as JsonRpcMessage).jsonrpc !== '2.0' ||
      typeof (message as JsonRpcMessage).method !== 'string'
    ) {
      // Preserve valid IDs so that the client can correlate the error with
      // its request, but never echo IDs of an invalid type
      responses.push(
        createError(isValidId ? id : null, -32600, 'Invalid request')
      );
      continue;
    }
    const response = await processMessage(
      env,
      request.url,
      message as JsonRpcMessage
    );
    if (response) {
      responses.push(response);
    }
  }

  // Answer with status 202 if only notifications were sent
  if (!responses.length) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  // Otherwise, answer with single response or batch of responses
  return jsonResponse(Array.isArray(body) ? responses : responses[0]);
}
