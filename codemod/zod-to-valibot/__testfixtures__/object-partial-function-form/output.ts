import * as v from "valibot";

const Foo = v.object({ foo: v.string() });

// z.partial(Schema) — function-call form
const Schema1 = v.partial(Foo);
const Schema2 = v.partial(v.object({ a: v.string(), b: v.number() }));

// z.partial(Schema, keys) — function-call form with key selector
const Schema3 = v.partial(Foo, ["foo"]);
