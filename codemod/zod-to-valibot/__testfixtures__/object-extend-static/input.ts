import { z } from "zod";

const Foo = z.object({
  foo: z.string(),
});

// static z.extend(Schema, { ... }) — schema reference as base
const Bar = z.extend(Foo, {
  bar: z.number(),
});

// static z.extend with inline object as base
const Baz = z.extend(z.object({ foo: z.string() }), {
  bar: z.number(),
});
