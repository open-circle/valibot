import * as v from "valibot";

const Foo = v.object({
  foo: v.string(),
});

// standalone namespace form `z.partial(schema)` (see issue #1503)
const xxx = v.parse(v.partial(Foo), "xxx");
const Partial = v.partial(Foo);
const Inline = v.partial(v.object({ a: v.string(), b: v.number() }));