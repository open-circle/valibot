import { z } from "zod";

const Foo = z.object({
  foo: z.string(),
});

// static z.extend(Schema, additions) call
const Bar = z.extend(Foo, {
  bar: z.number(),
});
