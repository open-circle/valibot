import * as v from "valibot";

const Foo = v.object({ foo: v.string(), bar: v.number() });
const mask = { foo: true };

// Schema.partial(mask) — method-chain form with variable mask
// variable mask cannot be statically converted; schema is preserved, mask dropped
const Schema1 = v.partial(Foo);
const Schema2 = v.partial(v.object({ a: v.string(), b: v.number() }));
