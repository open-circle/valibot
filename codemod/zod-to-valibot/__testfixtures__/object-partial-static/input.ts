import { z } from "zod";

const Foo = z.object({
  foo: z.string(),
});

// static z.partial(Schema) call
const xxx = z.partial(Foo).parse("xxx");
const yyy = z.partial(Foo);

// static z.partial with key mask
const PartialFoo = z.partial(Foo, {foo: true});
