import * as v from "valibot";

const Foo = v.object({
  foo: v.string(),
});

// static z.partial(Schema) call
const xxx = v.parse(v.partial(Foo), "xxx");
const yyy = v.partial(Foo);

// static z.partial with key mask
const PartialFoo = v.partial(Foo, ["foo"]);
