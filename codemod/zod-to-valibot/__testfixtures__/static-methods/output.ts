import * as v from "valibot";

const Foo = v.object({
  foo: v.string(),
  bar: v.number(),
});

const Schema1 = v.pick(Foo, ["foo"]);
const Schema2 = v.omit(Foo, ["foo"]);
const Schema3 = v.required(Foo);
const Schema4 = v.keyof(Foo);
const Schema5 = v.partial(v.object({key: v.string()}));
const Schema6 = v.optional(v.partial(Foo));
const Schema7 = v.nullable(v.pick(Foo, ["foo"]));
const Schema8 = v.array(v.required(Foo));
const output1 = v.parse(Foo, {});
const output2 = v.safeParse(Foo, {});

// spread arguments are left unchanged
const args = [Foo, {baz: v.boolean()}] as const;
const Schema9 = v.extend(...args);