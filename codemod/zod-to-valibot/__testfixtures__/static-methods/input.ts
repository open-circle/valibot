import { z } from "zod";

const Foo = z.object({
  foo: z.string(),
  bar: z.number(),
});

const Schema1 = z.pick(Foo, {foo: true});
const Schema2 = z.omit(Foo, {foo: true});
const Schema3 = z.required(Foo);
const Schema4 = z.keyof(Foo);
const Schema5 = z.partial(z.object({key: z.string()}));
const output1 = z.parse(Foo, {});
const output2 = z.safeParse(Foo, {});