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
const Schema9 = z.partial(Foo).array().min(1);
const Schema10 = z.partial(Foo).describe("some description");
const Schema11 = Schema8.max(3);
const output1 = z.parse(Foo, {});
const output2 = z.safeParse(Foo, {});
const output3 = z.parse(z.string(), "foo");
const output4 = output3.toUpperCase();
const output5 = z.safeParse(z.string(), "foo").data;

// spread arguments are left unchanged
const args = [Foo, {baz: z.boolean()}] as const;
const Schema12 = z.extend(...args);