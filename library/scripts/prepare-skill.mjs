import { cp } from 'node:fs/promises';
import { URL } from 'node:url';

await cp(
  new URL(
    '../../website/public/.well-known/agent-skills/valibot/',
    import.meta.url
  ),
  new URL('../skills/valibot/', import.meta.url),
  { recursive: true }
);
