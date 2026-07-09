import * as v from "valibot";

const Foo = v.object({
  foo: v.string(),
});

// static z.extend(Schema, { ... }) — schema reference as base
const Bar = v.object({
  .../*@valibot-migrate we can't detect if Foo has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Foo.entries,

  bar: v.number()
});

// static z.extend with inline object as base
const Baz = v.object({
  foo: v.string(),
  bar: v.number()
});
