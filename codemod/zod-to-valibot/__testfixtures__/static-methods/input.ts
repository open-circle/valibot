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
const Schema6 = z.partial(Foo).optional();
const Schema7 = z.pick(Foo, {foo: true}).nullable();
const Schema8 = z.required(Foo).array();
const output1 = z.parse(Foo, {});
const output2 = z.safeParse(Foo, {});

// spread arguments are left unchanged
const args = [Foo, {baz: z.boolean()}] as const;
const Schema9 = z.extend(...args);