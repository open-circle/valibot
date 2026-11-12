import { z } from "zod";

const Foo = z.object({ foo: z.string(), bar: z.number() });
const mask = { foo: true };

// Schema.partial(mask) — method-chain form with variable mask
const Schema1 = Foo.partial(mask);
const Schema2 = z.object({ a: z.string(), b: z.number() }).partial(mask);
