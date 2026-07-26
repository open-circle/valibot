import graymatter from 'gray-matter';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  CAPABILITIES,
  INSTRUCTIONS,
  LATEST_VERSION,
  MCP_URL,
  SERVER_INFO,
  SUPPORTED_VERSIONS,
  TRANSPORT_TYPE,
} from '../worker/mcp-info';

// URL of the official Valibot agent skill (our single source of truth)
const skillUrl =
  'https://raw.githubusercontent.com/open-circle/agent-skills/main/skills/valibot/SKILL.md';

// Path of the vendored SKILL.md file of our Valibot agent skill
const skillPath = path.join(
  'public',
  '.well-known',
  'agent-skills',
  'valibot',
  'SKILL.md'
);

// Sync vendored SKILL.md file with its official source. If the sync fails,
// we fall back to the committed copy of the previous sync.
try {
  const response = await fetch(skillUrl, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  fs.writeFileSync(skillPath, await response.text());
} catch (error) {
  console.warn(
    `Could not sync SKILL.md from "${skillUrl}". Using committed copy instead.`,
    error
  );
}

// Read SKILL.md file of our Valibot agent skill
const skillContent = fs.readFileSync(skillPath, 'utf-8');

// Extract description from frontmatter of SKILL.md file and verify it as it
// is a required field of the agent skills discovery index
const { description } = graymatter(skillContent).data;
if (typeof description !== 'string' || !description) {
  throw new Error(`Missing description in frontmatter of ${skillPath}`);
}

// Create SHA-256 digest of SKILL.md content
const digest = crypto.createHash('sha256').update(skillContent).digest('hex');

// Write agent skills discovery index to public directory
// https://github.com/cloudflare/agent-skills-discovery-rfc
fs.writeFileSync(
  path.join('public', '.well-known', 'agent-skills', 'index.json'),
  `${JSON.stringify(
    {
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills: [
        {
          name: 'valibot',
          type: 'skill-md',
          description,
          url: '/.well-known/agent-skills/valibot/SKILL.md',
          digest: `sha256:${digest}`,
        },
      ],
    },
    null,
    2
  )}\n`
);

// Copy SKILL.md to root of public directory for better discoverability
fs.writeFileSync(path.join('public', 'skill.md'), skillContent);

// Ensure directory of MCP server card exists
const mcpDir = path.join('public', '.well-known', 'mcp');
if (!fs.existsSync(mcpDir)) {
  fs.mkdirSync(mcpDir, { recursive: true });
}

// Write MCP server card to public directory for agent discovery (SEP-1649)
// https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127
fs.writeFileSync(
  path.join(mcpDir, 'server-card.json'),
  `${JSON.stringify(
    {
      // Fields of the evolving SEP-1649 draft (Extensions track)
      name: 'dev.valibot/docs',
      title: SERVER_INFO.title,
      description:
        'Search and read the documentation of Valibot, the modular and type-safe TypeScript schema library for validating structural data.',
      version: SERVER_INFO.version,
      websiteUrl: 'https://valibot.dev/',
      repository: {
        url: 'https://github.com/open-circle/valibot',
        source: 'github',
      },
      remotes: [
        {
          type: TRANSPORT_TYPE,
          url: MCP_URL,
          supportedProtocolVersions: SUPPORTED_VERSIONS,
        },
      ],
      // Fields of the original SEP-1649 proposal for older consumers
      serverInfo: SERVER_INFO,
      protocolVersion: LATEST_VERSION,
      transport: {
        type: TRANSPORT_TYPE,
        endpoint: MCP_URL,
      },
      capabilities: CAPABILITIES,
      instructions: INSTRUCTIONS,
      documentation: 'https://valibot.dev/guides/coding-agents/',
    },
    null,
    2
  )}\n`
);
