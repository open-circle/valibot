import { z } from "zod";

const Foo = z.object({
  foo: z.string(),
});

// standalone namespace form `z.partial(schema)` (see issue #1503)
const xxx = z.partial(Foo).parse("xxx");
const Partial = z.partial(Foo);
const Inline = z.partial(z.object({ a: z.string(), b: z.number() }));
