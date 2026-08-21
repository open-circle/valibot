import { z } from "zod";

const Foo = z.object({ foo: z.string() });

// z.partial(Schema) — function-call form
const Schema1 = z.partial(Foo);
const Schema2 = z.partial(z.object({ a: z.string(), b: z.number() }));

// z.partial(Schema, keys) — function-call form with key selector
const Schema3 = z.partial(Foo, { foo: true });
