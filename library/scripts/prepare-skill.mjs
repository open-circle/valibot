import { cp, rm } from 'node:fs/promises';
import { URL } from 'node:url';

const target = new URL('../skills/valibot/', import.meta.url);

await rm(target, { recursive: true, force: true });
await cp(
  new URL(
    '../../website/public/.well-known/agent-skills/valibot/',
    import.meta.url
  ),
  target,
  { recursive: true }
);
